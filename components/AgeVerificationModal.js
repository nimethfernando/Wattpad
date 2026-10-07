'use client';
import { useState, useEffect, useId } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateAgeFromDob, EXPERIENCE_MODES } from '@/lib/agePolicy';
import { ShieldCheck, ShieldAlert, Sparkles, Lock, Check, Calendar, AlertCircle, X } from 'lucide-react';

export default function AgeVerificationModal() {
  const { 
    user, 
    ageVerificationModalOpen, 
    setAgeVerificationModalOpen, 
    updateUserAgeAndDob 
  } = useApp();

  const isMandatory = Boolean(user && (!user.isAgeVerified || !user.birthdate) && user.role !== 'admin');

  const [dob, setDob] = useState(user?.birthdate || '2005-01-01');
  const [selectedExperience, setSelectedExperience] = useState(
    user?.experienceMode || EXPERIENCE_MODES.KIDS
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Synchronize state when user changes
  useEffect(() => {
    if (user?.birthdate) {
      setDob(user.birthdate);
    }
    if (user?.experienceMode) {
      setSelectedExperience(user.experienceMode);
    }
  }, [user]);

  const calculatedAge = calculateAgeFromDob(dob);
  const isUnder18 = calculatedAge !== null && calculatedAge < 18;
  const isUnder13 = calculatedAge !== null && calculatedAge < 13;

  // Close modal on Escape key press (only if not mandatory)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isMandatory) {
        setAgeVerificationModalOpen(false);
      }
    };
    if (ageVerificationModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ageVerificationModalOpen, setAgeVerificationModalOpen, isMandatory]);

  if (!ageVerificationModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dob) {
      setError('Please provide your Date of Birth.');
      return;
    }
    if (isUnder13) {
      setError('Users must be at least 13 years of age to register on Avora Library.');
      return;
    }

    setLoading(true);
    setError('');

    // Force kids mode if under 18
    const finalMode = isUnder18 ? EXPERIENCE_MODES.KIDS : selectedExperience;

    try {
      const res = await fetch('/api/user/age-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthdate: dob,
          experienceMode: finalMode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify age');
      }

      // Update AppContext user
      updateUserAgeAndDob(dob, calculatedAge, finalMode);
      setAgeVerificationModalOpen(false);
    } catch (err) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isMandatory) setAgeVerificationModalOpen(false);
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - hidden if verification is mandatory */}
        {!isMandatory && (
          <button
            type="button"
            onClick={() => setAgeVerificationModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isMandatory ? 'Welcome! Confirm Your Age' : 'Age Verification & Access Control'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isMandatory
              ? 'To protect all readers and personalize your library experience, please confirm your Date of Birth before continuing.'
              : 'Avora Library protects readers by ensuring content access is strictly tailored to your verified Date of Birth.'}
          </p>
        </div>

        {isMandatory && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Setup Step: Enter your Date of Birth to complete your profile setup.</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Date of Birth Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Your Date of Birth (DOB) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-slate-700"
              />
            </div>
            
            {/* Live Age Calculation Display */}
            {calculatedAge !== null && (
              <div className="flex items-center justify-between text-[11px] px-1 pt-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Calculated Age: <strong className="text-slate-900 dark:text-white">{calculatedAge} years old</strong>
                </span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  isUnder18 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isUnder18 ? 'Minor (Under 18)' : 'Adult (18+)'}
                </span>
              </div>
            )}
          </div>

          {/* 2. Choose Your Experience */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Choose Your Reading Experience
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Kids / Family */}
              <div 
                onClick={() => setSelectedExperience(EXPERIENCE_MODES.KIDS)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedExperience === EXPERIENCE_MODES.KIDS || isUnder18
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {(selectedExperience === EXPERIENCE_MODES.KIDS || isUnder18) && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white">Kids / Family</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                    Safe library featuring Kids Books, Educational Stories, and age-appropriate Fantasy. All 18+ content hidden.
                  </p>
                </div>
              </div>

              {/* Option 2: 18+ / Mature */}
              <div 
                onClick={() => {
                  if (!isUnder18) {
                    setSelectedExperience(EXPERIENCE_MODES.MATURE);
                  }
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 relative ${
                  isUnder18 
                    ? 'opacity-60 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                    : selectedExperience === EXPERIENCE_MODES.MATURE 
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm cursor-pointer'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                    {isUnder18 ? <Lock className="w-4 h-4 text-slate-400" /> : '18+'}
                  </div>
                  {!isUnder18 && selectedExperience === EXPERIENCE_MODES.MATURE && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  {isUnder18 && (
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                      Locked (18+)
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white">18+ / Mature</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                    Full general catalog including Fantasy, Thriller, Romance, and 18+ classified serialized novels.
                  </p>
                </div>
              </div>
            </div>

            {/* Explanatory Note regarding DOB-first control */}
            <p className="text-[10px] text-slate-400 leading-relaxed italic pt-1">
              * Note: Your access is primarily controlled by the Date of Birth stored in your account, not merely by the selected toggle. Accounts verified under 18 years cannot access 18+ rated works.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
          >
            {loading ? 'Verifying DOB...' : 'Confirm Age & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
