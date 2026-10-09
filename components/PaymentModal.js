'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  CreditCard, 
  Heart, 
  Crown, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  AlertCircle,
  Coffee,
  Check
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
  const targetAuthor = paymentModalData?.author || 'Elena Vance';
  const targetStory = paymentModalData?.story || null;

  // Donation state
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [donorMessage, setDonorMessage] = useState('');

  // Subscription state
  const getInitialPlan = (p) => {
    if (p === 'annual') return 'Annual VIP ($49.99/yr)';
    if (p === 'monthly') return 'Monthly VIP ($5.99/mo)';
    return p || 'Monthly VIP ($5.99/mo)';
  };

  const [selectedPlan, setSelectedPlan] = useState(getInitialPlan(paymentModalData?.plan));

  useEffect(() => {
    if (paymentModalData?.plan) {
      setSelectedPlan(getInitialPlan(paymentModalData.plan));
    }
  }, [paymentModalData]);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [cardError, setCardError] = useState('');

  if (!paymentModalOpen) return null;

  // Detect card brand dynamically
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  let detectedBrand = 'card';
  if (/^4/.test(cleanNumber)) {
    detectedBrand = 'visa';
  } else if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) {
    detectedBrand = 'mastercard';
  } else if (/^3[47]/.test(cleanNumber)) {
    detectedBrand = 'amex';
  }

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
    if (cardError) setCardError('');
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setExpiry(val);
  };

  const handleCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(val);
  };

  const finalAmount = mode === 'donate'
    ? (customAmount ? Number(customAmount) : selectedAmount)
    : (selectedPlan.includes('Annual') ? 49.99 : 5.99);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cleanNumber.length < 15) {
      setCardError('Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      setCardError('Please enter card expiry in MM/YY format.');
      return;
    }
    if (cvv.length < 3) {
      setCardError('Please enter a valid 3-digit security code (CVV).');
      return;
    }

    setIsProcessing(true);
    setCardError('');

    setTimeout(() => {
      const last4 = cleanNumber.slice(-4) || '4242';

      if (mode === 'subscribe') {
        subscribe(selectedPlan, { brand: detectedBrand === 'card' ? 'visa' : detectedBrand, last4 });
      }

      const receipt = addTransaction({
        type: mode === 'subscribe' ? 'subscription' : 'donation',
        amount: finalAmount,
        cardBrand: detectedBrand === 'card' ? 'visa' : detectedBrand,
        cardLast4: last4,
        donorName: cardHolder || user?.name || 'Reader',
        author: mode === 'subscribe' ? 'Avora Platform' : targetAuthor,
        authorUsername: mode === 'subscribe' ? 'avoralibrary' : (paymentModalData?.authorUsername || 'author'),
        storyTitle: targetStory?.title || (mode === 'subscribe' ? 'Avora VIP Membership' : 'Serialized Story'),
        message: donorMessage,
        plan: mode === 'subscribe' ? selectedPlan : null
      });

      setIsProcessing(false);
      setSuccessReceipt(receipt);
    }, 1400);
  };

  const handleClose = () => {
    setPaymentModalOpen(false);
    setSuccessReceipt(null);
    setIsProcessing(false);
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {successReceipt ? (
          /* SUCCESS RECEIPT VIEW */
          <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/30">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === 'subscribe' ? 'Welcome to VIP!' : 'Donation Successful!'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'subscribe' 
                  ? 'Your subscription is now active with all VIP perks.'
                  : `Thank you for supporting ${targetAuthor}!`
                }
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-xs space-y-2.5 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono font-bold">{successReceipt.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Charged</span>
                <span className="text-base font-black text-brand-600 dark:text-brand-400">${finalAmount.toFixed(2)} USD</span>
              </div>
              {mode !== 'subscribe' && (
                <div className="py-2 my-1 border-y border-slate-200 dark:border-slate-700/60 space-y-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 rounded-xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                      Author Payout (90%)
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300">
                      ${(finalAmount * 0.90).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Platform Commission (10%)</span>
                    <span>${(finalAmount * 0.10).toFixed(2)} USD</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-bold uppercase flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-black">
                    {successReceipt.cardBrand.toUpperCase()}
                  </span>
                  •••• {successReceipt.cardLast4}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recipient</span>
                <span className="font-bold">{successReceipt.author}</span>
              </div>
              {successReceipt.message && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">Author Note:</span>
                  <p className="italic text-slate-600 dark:text-slate-300">"{successReceipt.message}"</p>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Done & Return
            </button>
          </div>
        ) : (
          /* PAYMENT ENTRY FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mb-2">
                {mode === 'subscribe' ? (
                  <><Crown className="w-3.5 h-3.5 text-amber-500" /> Avora VIP Membership</>
                ) : (
                  <><Coffee className="w-3.5 h-3.5 text-brand-500" /> Reader Tip & Donation</>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === 'subscribe' ? 'Upgrade to VIP Reader' : `Support ${targetAuthor}`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'subscribe' 
                  ? 'Unlock ad-free serialized reading, exclusive badges, and offline PWA reading.' 
                  : (targetStory ? `Sending a reader tip for "${targetStory.title}"` : 'Empower creators with direct reader support')
                }
              </p>
            </div>

            {/* Donation Amount Chips */}
            {mode === 'donate' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Select Donation Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 5, 10, 25].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-xl font-black text-sm transition-all ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Custom amount (e.g. 15)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl pl-8 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Encouraging Note to Author (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Loved chapter 4! Keep writing!"
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* 90/10 Revenue Split Transparency Card */}
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                      Fair Creator Split (90 / 10)
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-black">
                      90% to Author
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-0.5">
                    <span>Direct Author Payout (90%):</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                      ${(finalAmount * 0.90).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Platform Commission &amp; Processing (10%):</span>
                    <span className="font-semibold">
                      ${(finalAmount * 0.10).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Plan Cards */}
            {mode === 'subscribe' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlan('Monthly VIP ($5.99/mo)')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan.includes('Monthly')
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">Monthly</span>
                      {selectedPlan.includes('Monthly') && <Check className="w-4 h-4 text-brand-500" />}
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">$5.99<span className="text-xs text-slate-400 font-normal">/mo</span></p>
                    <p className="text-[10px] text-slate-400 mt-1">Billed every month</p>
                  </div>

                  <div
                    onClick={() => setSelectedPlan('Annual VIP ($49.99/yr)')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      selectedPlan.includes('Annual')
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-brand-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Save 30%
                    </span>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">Annual</span>
                      {selectedPlan.includes('Annual') && <Check className="w-4 h-4 text-brand-500" />}
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">$49.99<span className="text-xs text-slate-400 font-normal">/yr</span></p>
                    <p className="text-[10px] text-slate-400 mt-1">$4.16/mo equivalent</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 100% Ad-Free reading experience</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Golden Crown Profile Crest badge</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Offline PWA priority caching</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Cancel anytime in Account Settings</div>
                </div>
              </div>
            )}

            {/* Credit / Debit Card Module */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Payment Details
                </label>
                
                {/* 1-Click Test Card Autofill */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Fill:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4242 4242 4242 4242');
                      setCardHolder(user?.name || 'Elena Vance');
                      setExpiry('12/28');
                      setCvv('123');
                      setCardError('');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold hover:bg-blue-100 cursor-pointer"
                    title="Autofill with Test Visa Card"
                  >
                    ⚡ Visa 4242
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('5454 5454 5454 5454');
                      setCardHolder(user?.name || 'Marcus Vance');
                      setExpiry('10/27');
                      setCvv('888');
                      setCardError('');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                    title="Autofill with Test Mastercard"
                  >
                    ⚡ MC 5454
                  </button>
                </div>
              </div>

              {/* Card Number Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Cardholder Name */}
              <div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  required
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="password"
                  maxLength={4}
                  placeholder="CVC / CVV"
                  value={cvv}
                  onChange={handleCvvChange}
                  required
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {cardError && (
                <div className="text-rose-500 text-xs font-bold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {cardError}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing securely...</span>
                  </div>
                ) : (
                  <span>
                    Pay ${finalAmount.toFixed(2)} USD • Confirm
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted Sandbox Gateway</span>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

