'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { loadRazorpayScript } from '@/lib/loadRazorpay';
import { 
  X, 
  Heart, 
  Crown, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  AlertCircle,
  Coffee,
  Check,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function PaymentModal() {
  const { 
    paymentModalOpen, 
    setPaymentModalOpen, 
    paymentModalData, 
    addTransaction, 
    subscribe, 
    user 
  } = useApp();

  const mode = paymentModalData?.mode || paymentModalData?.type || 'donate'; // 'donate' | 'subscribe'
  const targetAuthor = paymentModalData?.author || 'Author';
  const targetStory = paymentModalData?.story || null;

  // Currency Conversion Config (1 USD ≈ 85 INR base exchange rate)
  const USD_TO_INR_RATE = 85;

  // Tip / Donation State (in USD)
  const [selectedUsdAmount, setSelectedUsdAmount] = useState(3);
  const [customUsdAmount, setCustomUsdAmount] = useState('');
  const [donorMessage, setDonorMessage] = useState('');

  // Subscription Plan State (in USD)
  const getInitialPlan = (p) => {
    if (p === 'annual' || String(p).toLowerCase().includes('annual')) {
      return 'Annual VIP ($29.99/yr)';
    }
    return 'Monthly VIP ($3.99/mo)';
  };

  const [selectedPlan, setSelectedPlan] = useState(getInitialPlan(paymentModalData?.plan));

  useEffect(() => {
    if (paymentModalData?.plan) {
      setSelectedPlan(getInitialPlan(paymentModalData.plan));
    }
  }, [paymentModalData]);

  // UI & Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [configMissing, setConfigMissing] = useState(false);

  if (!paymentModalOpen) return null;

  // Dollar amount displayed on website
  const finalUsdAmount = mode === 'donate'
    ? (customUsdAmount ? Math.max(1, Number(customUsdAmount)) : selectedUsdAmount)
    : (selectedPlan.includes('Annual') ? 29.99 : 3.99);

  // Converted INR amount actually charged by Razorpay
  const finalInrAmount = Math.max(10, Math.round(finalUsdAmount * USD_TO_INR_RATE));

  // Author 90/10 Split in USD & INR
  const authorShareUsd = Number((finalUsdAmount * 0.90).toFixed(2));
  const platformFeeUsd = Number((finalUsdAmount * 0.10).toFixed(2));
  const authorShareInr = Math.round(finalInrAmount * 0.90);
  const platformFeeInr = Math.round(finalInrAmount * 0.10);

  /**
   * Production Razorpay Checkout Handler (Restricted to Credit & Debit Cards)
   * 1. Dynamically loads official checkout.js
   * 2. Calls /api/razorpay/create-order to create server-side order in INR (converted from USD)
   * 3. Launches official Razorpay modal strictly with Debit & Credit card options
   * 4. Cryptographically verifies HMAC signature via /api/razorpay/verify-payment
   */
  const handleRazorpayCheckout = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setConfigMissing(false);
    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Unable to connect to Razorpay payment network. Please check your internet connection.');
      }

      // 2. Request order from backend (charged in INR converted from USD)
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          plan: mode === 'subscribe' ? selectedPlan : null,
          amount: finalInrAmount,
          amountInUsd: finalUsdAmount,
          currency: 'INR',
          donorName: user?.name || 'Reader',
          donorEmail: user?.email || '',
          donorPhone: user?.phone || '',
          author: targetAuthor,
          authorUsername: paymentModalData?.authorUsername || 'author',
          storyTitle: targetStory?.title || (mode === 'subscribe' ? 'Avora VIP Membership' : 'Serialized Story'),
          donorMessage
        })
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        if (!orderData.isConfigured || res.status === 503) {
          setConfigMissing(true);
        }
        throw new Error(orderData.error || 'Failed to initialize secure payment order.');
      }

      // 3. Configure Razorpay Standard Checkout (Restricted to Credit & Debit Cards Only)
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Avora Library',
        description: mode === 'subscribe' 
          ? `VIP Membership • ${selectedPlan} (~₹${finalInrAmount.toLocaleString('en-IN')})` 
          : `Author Tip ($${finalUsdAmount.toFixed(2)} USD ~₹${finalInrAmount.toLocaleString('en-IN')}) for ${targetAuthor}`,
        image: 'https://www.avoralibrary.com/tab-icon.png',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || 'Avora Reader',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          ...(orderData.notes || {}),
          amountInUsd: String(finalUsdAmount),
          amountInInr: String(finalInrAmount),
          payment_type: 'card_only'
        },
        theme: {
          color: '#f97316' // Avora brand orange
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setIsProcessing(false);
          }
        },
        // Restrict payment instruments strictly to Credit & Debit Cards
        method: {
          card: true,
          upi: false,
          netbanking: false,
          wallet: false,
          paylater: false,
          emi: false
        },
        config: {
          display: {
            blocks: {
              cards: {
                name: "Debit & Credit Cards",
                instruments: [
                  {
                    method: "card"
                  }
                ]
              }
            },
            sequence: ["block.cards"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        handler: async (response) => {
          try {
            // 4. Server-Side Cryptographic Signature Verification
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                metadata: {
                  mode,
                  plan: mode === 'subscribe' ? selectedPlan : null,
                  amount: finalInrAmount,
                  amountInUsd: finalUsdAmount,
                  donorName: user?.name || 'Reader',
                  author: targetAuthor,
                  authorUsername: paymentModalData?.authorUsername || 'author',
                  storyTitle: targetStory?.title || (mode === 'subscribe' ? 'Avora VIP Membership' : 'Serialized Story'),
                  donorMessage
                }
              })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            const verifiedTx = verifyData.transaction;

            // 5. Update local platform state
            if (mode === 'subscribe') {
              subscribe(selectedPlan, {
                brand: verifiedTx.cardBrand || verifiedTx.methodType || 'card',
                last4: verifiedTx.cardLast4 || 'Card',
                paymentMethod: verifiedTx.paymentMethod || 'Credit / Debit Card',
                razorpayPaymentId: verifiedTx.razorpayPaymentId,
                razorpayOrderId: verifiedTx.razorpayOrderId
              });
            }

            const receipt = addTransaction({
              type: mode === 'subscribe' ? 'subscription' : 'donation',
              amount: finalInrAmount,
              usdAmount: finalUsdAmount,
              currency: 'INR',
              plan: mode === 'subscribe' ? selectedPlan : null,
              cardBrand: verifiedTx.cardBrand || verifiedTx.methodType || 'card',
              cardLast4: verifiedTx.cardLast4 || 'Card',
              paymentMethod: verifiedTx.paymentMethod || 'Credit / Debit Card (Razorpay)',
              razorpayPaymentId: verifiedTx.razorpayPaymentId,
              razorpayOrderId: verifiedTx.razorpayOrderId,
              author: mode === 'subscribe' ? 'Avora Platform' : targetAuthor,
              authorUsername: mode === 'subscribe' ? 'avoralibrary' : (paymentModalData?.authorUsername || 'author'),
              storyTitle: targetStory?.title || (mode === 'subscribe' ? 'Avora VIP Membership' : 'Serialized Story'),
              donorName: user?.name || 'Reader',
              message: donorMessage
            });

            setIsProcessing(false);
            setSuccessReceipt({
              ...receipt,
              usdAmount: finalUsdAmount,
              razorpayPaymentId: verifiedTx.razorpayPaymentId,
              paymentMethod: verifiedTx.paymentMethod || 'Credit / Debit Card (Razorpay)'
            });
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            setIsProcessing(false);
            setErrorMessage(verifyErr.message || 'Payment received but verification check failed. Please contact support.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', (failResp) => {
        setIsProcessing(false);
        const reason = failResp?.error?.description || 'Payment was declined or cancelled.';
        setErrorMessage(`Payment Failed: ${reason}`);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Unable to open Razorpay payment gateway.');
    }
  };

  const handleClose = () => {
    setPaymentModalOpen(false);
    setSuccessReceipt(null);
    setIsProcessing(false);
    setErrorMessage('');
    setConfigMissing(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Decorative Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {successReceipt ? (
          /* ========================================================
             OFFICIAL SUCCESS RECEIPT VIEW WITH RAZORPAY VERIFICATION
             ======================================================== */
          <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/30">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified Payment
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === 'subscribe' ? 'Welcome to Avora VIP!' : 'Tip Sent Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'subscribe' 
                  ? 'Your VIP membership is active with ad-free reading and profile badges.'
                  : `Your contribution directly supports ${targetAuthor}.`
                }
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-xs space-y-2.5 text-left font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Razorpay Payment ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {successReceipt.razorpayPaymentId || successReceipt.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Amount Charged</span>
                <div className="text-right">
                  <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                    ${finalUsdAmount.toFixed(2)} USD
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    (₹{finalInrAmount.toLocaleString('en-IN')} INR deducted)
                  </span>
                </div>
              </div>
              
              {mode !== 'subscribe' && (
                <div className="py-2.5 my-1 border-y border-slate-200 dark:border-slate-700/60 space-y-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 rounded-xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                      Author Payout (90%)
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300">
                      ${authorShareUsd.toFixed(2)} USD <span className="font-normal text-[11px] opacity-80">(₹{authorShareInr.toLocaleString('en-IN')})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Platform Infrastructure (10%)</span>
                    <span>${platformFeeUsd.toFixed(2)} USD <span className="opacity-80">(₹{platformFeeInr.toLocaleString('en-IN')})</span></span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Gateway</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {successReceipt.paymentMethod || 'Credit / Debit Card (Razorpay)'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recipient</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {mode === 'subscribe' ? 'Avora Library Platform' : targetAuthor}
                </span>
              </div>

              {successReceipt.message && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Author Note:</span>
                  <p className="italic text-slate-600 dark:text-slate-300">"{successReceipt.message}"</p>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              Done & Return to Story
            </button>
          </div>
        ) : (
          /* ========================================================
             PRODUCTION RAZORPAY CHECKOUT CONFIGURATION & ENTRY FORM
             ======================================================== */
          <form onSubmit={handleRazorpayCheckout} className="space-y-6">
            
            {/* Header Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mb-2">
                {mode === 'subscribe' ? (
                  <><Crown className="w-3.5 h-3.5 text-amber-500" /> Avora VIP Membership</>
                ) : (
                  <><Coffee className="w-3.5 h-3.5 text-brand-500" /> Support the Author</>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === 'subscribe' ? 'Upgrade to VIP Reader' : `Tip & Support ${targetAuthor}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {mode === 'subscribe' 
                  ? 'Zero advertisements, gold profile badge, and offline PWA reading on all your devices.' 
                  : (targetStory ? `Sending an author tip for "${targetStory.title}". 90% goes directly to the author.` : 'Support serialized fiction writers with instant domestic UPI & card payouts.')
                }
              </p>
            </div>

            {/* Error / Notification Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                  {configMissing && (
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      To accept card payments, add <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">RAZORPAY_KEY_ID</code> and <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">RAZORPAY_KEY_SECRET</code> in your Vercel Project <strong>Settings &gt; Environment Variables</strong> (and in local <code className="font-mono">.env</code>).
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Mode 1: Tip Author Amount Selection (USD with INR conversion) */}
            {mode === 'donate' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Tip Amount ($ USD)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    1 USD ≈ ₹{USD_TO_INR_RATE} INR
                  </span>
                </div>
                
                {/* USD Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 10].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedUsdAmount(amt);
                        setCustomUsdAmount('');
                        if (errorMessage) setErrorMessage('');
                      }}
                      className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        selectedUsdAmount === amt && !customUsdAmount
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>${amt}</span>
                      <span className={`text-[9px] font-normal ${selectedUsdAmount === amt && !customUsdAmount ? 'text-white/80' : 'text-slate-400'}`}>
                        ~₹{amt * USD_TO_INR_RATE}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom USD Input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    placeholder="Enter custom amount in $ (e.g. 7)"
                    value={customUsdAmount}
                    onChange={(e) => {
                      setCustomUsdAmount(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl pl-8 pr-28 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {customUsdAmount && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                      ≈ ₹{Math.round(Number(customUsdAmount) * USD_TO_INR_RATE)} INR
                    </span>
                  )}
                </div>

                {/* Author Encouragement Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Note of Appreciation to Author (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The character arc in chapter 3 was brilliant! Keep going!"
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* 90/10 Fair Creator Split Transparency Card */}
                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                      Fair Creator Split (90 / 10)
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-black">
                      90% to Author
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Direct Author Earnings (90%):</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                      ${authorShareUsd.toFixed(2)} USD <span className="font-normal text-[10px] opacity-80">(₹{authorShareInr.toLocaleString('en-IN')})</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Platform Servers &amp; Processing (10%):</span>
                    <span className="font-semibold">
                      ${platformFeeUsd.toFixed(2)} USD <span className="font-normal opacity-80">(₹{platformFeeInr.toLocaleString('en-IN')})</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: VIP Membership Plans (USD with INR conversion) */}
            {mode === 'subscribe' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Monthly Pass */}
                  <div
                    onClick={() => setSelectedPlan('Monthly VIP ($3.99/mo)')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan.includes('Monthly')
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Monthly VIP</span>
                      {selectedPlan.includes('Monthly') && <Check className="w-4 h-4 text-brand-500" />}
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      $3.99<span className="text-xs text-slate-400 font-normal">/mo</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      ≈ ₹{Math.round(3.99 * USD_TO_INR_RATE)} INR charged
                    </p>
                  </div>

                  {/* Annual Pass */}
                  <div
                    onClick={() => setSelectedPlan('Annual VIP ($29.99/yr)')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      selectedPlan.includes('Annual')
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-brand-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      Save 37%
                    </span>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Annual Pass</span>
                      {selectedPlan.includes('Annual') && <Check className="w-4 h-4 text-brand-500" />}
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      $29.99<span className="text-xs text-slate-400 font-normal">/yr</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      $2.50/mo equivalent • ≈ ₹{Math.round(29.99 * USD_TO_INR_RATE)} INR
                    </p>
                  </div>
                </div>

                {/* VIP Perks */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 100% Ad-Free reading across all web and mobile pages</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Golden Crown Profile Crest badge shown across reader comments</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Offline reading and priority caching for mobile readers</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Manage or cancel easily anytime in Account Settings</div>
                </div>
              </div>
            )}

            {/* Supported Payment Channels Banner (Debit & Credit Cards Only) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  Supported Payment Options
                </span>
                <span className="text-[10px] font-mono text-slate-400">Powered by Razorpay</span>
              </div>

              {/* Debit & Credit Cards Only Banner */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      Debit &amp; Credit Cards
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      RuPay, Visa, Mastercard, American Express, Maestro
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold shrink-0 whitespace-nowrap">
                  Cards Only
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Deducted in INR (~₹{USD_TO_INR_RATE}/$1) via bank card conversion</span>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-3 h-3" /> 3D Secure OTP
                </span>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Razorpay Card Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ${finalUsdAmount.toFixed(2)} USD (~₹{finalInrAmount.toLocaleString('en-IN')}) with Card</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit TLS Bank Encryption • RBI &amp; PCI-DSS Level 1 Certified</span>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
