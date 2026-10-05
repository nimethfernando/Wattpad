'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Building2, 
  X, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Trash2, 
  Lock,
  ArrowRight
} from 'lucide-react';

const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', routingLabel: 'Routing Number (ABA - 9 digits)', routingPlaceholder: '021000021' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', routingLabel: 'Sort Code (6 digits)', routingPlaceholder: '20-04-15' },
  { code: 'CA', name: 'Canada', currency: 'CAD', routingLabel: 'Transit & Institution No.', routingPlaceholder: '12345-001' },
  { code: 'AU', name: 'Australia', currency: 'AUD', routingLabel: 'BSB Number (6 digits)', routingPlaceholder: '123-456' },
  { code: 'IN', name: 'India', currency: 'INR', routingLabel: 'IFSC Code (11 alphanumeric)', routingPlaceholder: 'HDFC0001234' },
  { code: 'DE', name: 'Germany (EU)', currency: 'EUR', routingLabel: 'BIC / SWIFT Code', routingPlaceholder: 'DEUTDEDDFXX' },
  { code: 'FR', name: 'France (EU)', currency: 'EUR', routingLabel: 'BIC / SWIFT Code', routingPlaceholder: 'BNPAFRPPXXX' }
];

export default function BankDetailsModal() {
  const { 
    bankDetailsModalOpen, 
    closeBankDetailsModal, 
    bankDetailsModalTarget, 
    updateBankDetails, 
    removeBankDetails, 
    user 
  } = useApp();

  const activeAuthor = bankDetailsModalTarget || user;
  const existingDetails = activeAuthor?.bankDetails;

  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD');
  const [accountType, setAccountType] = useState('checking');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');

  const [showAccountNum, setShowAccountNum] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  // Sync state whenever modal opens or target changes
  useEffect(() => {
    if (bankDetailsModalOpen) {
      setErrorMsg('');
      setSuccessMsg(false);
      if (existingDetails) {
        setAccountHolderName(existingDetails.accountHolderName || activeAuthor?.name || '');
        setBankName(existingDetails.bankName || '');
        setCountry(existingDetails.country || 'United States');
        setCurrency(existingDetails.currency || 'USD');
        setAccountType(existingDetails.accountType || 'checking');
        setRoutingNumber(existingDetails.routingNumber || '');
        setAccountNumber(existingDetails.accountNumber || '');
        setConfirmAccountNumber(existingDetails.accountNumber || '');
      } else {
        setAccountHolderName(activeAuthor?.name || '');
        setBankName('');
        setCountry('United States');
        setCurrency('USD');
        setAccountType('checking');
        setRoutingNumber('');
        setAccountNumber('');
        setConfirmAccountNumber('');
      }
    }
  }, [bankDetailsModalOpen, existingDetails, activeAuthor]);

  if (!bankDetailsModalOpen) return null;

  const activeCountryConfig = SUPPORTED_COUNTRIES.find(c => c.name === country) || SUPPORTED_COUNTRIES[0];

  const handleCountryChange = (countryName) => {
    setCountry(countryName);
    const cfg = SUPPORTED_COUNTRIES.find(c => c.name === countryName);
    if (cfg) {
      setCurrency(cfg.currency);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!accountHolderName.trim()) {
      setErrorMsg('Please enter the legal account holder name.');
      return;
    }
    if (!bankName.trim()) {
      setErrorMsg('Please enter the bank or financial institution name.');
      return;
    }
    if (!routingNumber.trim()) {
      setErrorMsg(`Please enter the ${activeCountryConfig.routingLabel}.`);
      return;
    }
    if (!accountNumber.trim()) {
      setErrorMsg('Please enter the bank account number or IBAN.');
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setErrorMsg('Account numbers do not match. Please verify and re-enter.');
      return;
    }

    setLoading(true);

    try {
      // Call server validation endpoint
      await fetch('/api/user/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName,
          bankName,
          country,
          currency,
          accountType,
          routingNumber,
          accountNumber
        })
      });

      // Update state in context
      updateBankDetails({
        accountHolderName,
        bankName,
        country,
        currency,
        accountType,
        routingNumber,
        accountNumber
      }, bankDetailsModalTarget?.id || null);

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        closeBankDetailsModal();
      }, 1500);
    } catch (err) {
      console.error('Failed to link bank details:', err);
      setErrorMsg('Failed to verify and save bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to disconnect this bank account? Direct deposit payouts will be paused until a new account is added.')) {
      removeBankDetails(bankDetailsModalTarget?.id || null);
      closeBankDetailsModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-fadeIn"
      onClick={closeBankDetailsModal}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={closeBankDetailsModal}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-slate-900 dark:text-white">
                Author Payout &amp; Bank Details
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                90% Share
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {bankDetailsModalTarget 
                ? `Managing payout account for @${bankDetailsModalTarget.username} (${bankDetailsModalTarget.name})`
                : 'Direct deposit for reader tips, serialized donations, and digital sales'}
            </p>
          </div>
        </div>

        {/* Security / Split Notice Banner */}
        <div className="p-3.5 mb-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
              Bank-Grade 256-Bit SSL Encryption
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <strong>90%</strong> of every dollar sent to your serials transfers directly to this bank account on a daily rolling settlement. The platform retains 10% for hosting and processing.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="p-4 mb-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>Bank account successfully verified and linked! Payouts activated.</span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Account Holder & Bank Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Holder Legal Name *
              </label>
              <input 
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="e.g. Elena Vance"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Must match the legal name on bank statements</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank / Financial Institution *
              </label>
              <input 
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. JPMorgan Chase, Barclays"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Country & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank Country *
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white cursor-pointer"
              >
                {SUPPORTED_COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payout Currency
              </label>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>{currency}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Deposit</span>
              </div>
            </div>
          </div>

          {/* Account Type Pills */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'checking', label: 'Checking' },
                { id: 'savings', label: 'Savings' },
                { id: 'business', label: 'Business' }
              ].map(type => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setAccountType(type.id)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs capitalize transition-all cursor-pointer border ${
                    accountType === type.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Routing / Sort Code */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {activeCountryConfig.routingLabel} *
            </label>
            <input 
              type="text"
              required
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder={activeCountryConfig.routingPlaceholder}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Account Number & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Account Number / IBAN *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAccountNum(!showAccountNum)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {showAccountNum ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showAccountNum ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input 
                type={showAccountNum ? 'text' : 'password'}
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Account Number *
              </label>
              <input 
                type={showAccountNum ? 'text' : 'password'}
                required
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            {existingDetails ? (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Disconnect Bank
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={closeBankDetailsModal}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Save &amp; Link Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
