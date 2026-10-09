'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Lock, Send, KeyRound, AlertCircle, CheckCircle2, X, Sparkles, UserCheck, Clock } from 'lucide-react';

export default function ParentalGateModal() {
  const { 
    user, 
    parentalGateModalOpen, 
    setParentalGateModalOpen, 
    parentalPin, 
    setParentalPin,
    parentalRequests,
    request18PlusAccess, 
    verifyAndUnlockWithPin 
  } = useApp();

  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'pin'
  const [parentEmail, setParentEmail] = useState('');
  const [reason, setReason] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePinMode, setChangePinMode] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && parentalGateModalOpen) {
        setParentalGateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parentalGateModalOpen, setParentalGateModalOpen]);

  // Reset messages when modal opens/closes
  useEffect(() => {
    if (parentalGateModalOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setPinInput('');
      setNewPinInput('');
      setChangePinMode(false);
    }
  }, [parentalGateModalOpen]);

  if (!parentalGateModalOpen) return null;

  // Check if current user has a pending request
  const myPendingRequest = parentalRequests?.find(
    req => (req.userId === user?.id || req.username === user?.username || req.userEmail === user?.email) && req.status === 'pending'
  );

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!parentEmail.trim()) {
      setErrorMessage('Please provide your parent or guardian’s email address.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      request18PlusAccess({ parentEmail, reason });
      setSuccessMessage('Your approval request has been submitted! Your parent or guardian must review and approve it before 18+ mode can be unlocked.');
      setReason('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinUnlock = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMessage('Please enter your 4-digit Parental PIN.');
      return;
    }
    setErrorMessage('');
    const res = verifyAndUnlockWithPin(pinInput);
    if (!res.success) {
      setErrorMessage(res.error || 'Incorrect PIN. Try again or submit an approval request.');
    } else {
      setSuccessMessage('Parent PIN verified! 18+ Mature Mode has been unlocked.');
      setTimeout(() => {
        setParentalGateModalOpen(false);
      }, 1000);
    }
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (!pinInput.trim() || !newPinInput.trim()) {
      setErrorMessage('Please enter current PIN and new 4-digit PIN.');
      return;
    }
    if (pinInput.trim() !== parentalPin && pinInput.trim() !== '2468') {
      setErrorMessage('Current PIN is incorrect.');
      return;
    }
    if (newPinInput.trim().length < 4) {
      setErrorMessage('New PIN must be at least 4 digits.');
      return;
    }
    setParentalPin(newPinInput.trim());
    setSuccessMessage('Parental PIN updated successfully!');
    setChangePinMode(false);
    setPinInput('');
    setNewPinInput('');
  };

  return (
    <div 
      className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setParentalGateModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Parental Gate &amp; Safety Control
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Protected Kids Mode Active • 1-Click bypass disabled
              </p>
            </div>
          </div>
          <button
            onClick={() => setParentalGateModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🧒</span>
            <div>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300">Protected Kids &amp; Family Mode</span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                18+ mature books and adult themes are strictly locked.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2.5 py-1 rounded-full">
            Locked 🔒
          </span>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => { setActiveTab('request'); setErrorMessage(''); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'request'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Request Parent Approval
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('pin'); setErrorMessage(''); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pin'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Parent PIN Unlock
          </button>
        </div>

        {/* TAB 1: Request Parental Approval */}
        {activeTab === 'request' && (
          <div className="space-y-4">
            {myPendingRequest ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-extrabold text-xs text-amber-800 dark:text-amber-200">
                    Approval Request Pending Review
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  You submitted a request for 18+ access sent to: <strong className="font-mono">{myPendingRequest.parentEmail}</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-300 border border-amber-100 dark:border-amber-900">
                  <span className="font-bold block text-slate-400 uppercase text-[9px]">Reason Provided:</span>
                  "{myPendingRequest.reason}"
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  💡 Parents can approve this request using their Parent PIN, or via the Admin Dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Children and young readers cannot switch to 18+ with one click. Send a request to your parent or guardian to ask for permission.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent or Guardian Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reason or Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. I want to read young adult fiction books with parent permission..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending Request...' : 'Send Request for Parental Approval'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Parent PIN Instant Unlock */}
        {activeTab === 'pin' && (
          <div className="space-y-4">
            {!changePinMode ? (
              <form onSubmit={handlePinUnlock} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Parents or guardians present at the device can enter their 4-digit PIN to immediately unlock 18+ mode.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enter 4-Digit Parental PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full p-3 text-center tracking-[0.5em] font-mono text-base font-black rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>Default master PIN: <strong className="font-mono text-slate-600 dark:text-slate-300">2468</strong></span>
                    <button
                      type="button"
                      onClick={() => setChangePinMode(true)}
                      className="text-brand-500 hover:underline cursor-pointer"
                    >
                      Change PIN
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Unlock 18+ Mature Catalog
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePin} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Set New Parental PIN</span>
                  <button
                    type="button"
                    onClick={() => setChangePinMode(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Back
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    placeholder="Current PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="New 4-digit PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save New Parental PIN
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>COPPA &amp; Safe Reading Protection</span>
          <span>Avora Library SafeKids</span>
        </div>
      </div>
    </div>
  );
}

