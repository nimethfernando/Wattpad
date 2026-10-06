'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { X, BookOpen, Lock, Mail, User, Calendar, CheckCircle2, AlertCircle, Sparkles, Check, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { calculateAgeFromDob, EXPERIENCE_MODES } from '@/lib/agePolicy';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    authModalMessage, 
    loginWithEmail, 
    registerWithEmail
  } = useApp();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('2005-01-01');
  const [experienceMode, setExperienceMode] = useState(EXPERIENCE_MODES.MATURE);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculatedAge = calculateAgeFromDob(birthdate);
  const isUnder18 = calculatedAge !== null && calculatedAge < 18;
  const isUnder13 = calculatedAge !== null && calculatedAge < 13;

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAuthModalOpen(false);
      }
    };
    if (authModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, setAuthModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (authModalMode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please fill in both fields.');
        setLoading(false);
        return;
      }
      loginWithEmail(email, password);
      setLoading(false);
    } else {
      if (!email.trim() || !username.trim() || !password.trim() || !birthdate) {
        setErrorMessage('Please complete all registration fields.');
        setLoading(false);
        return;
      }
      if (isUnder13) {
        setErrorMessage('You must be at least 13 years of age to register.');
        setLoading(false);
        return;
      }
      if (!isAgeConfirmed) {
        setErrorMessage('You must confirm that your Date of Birth is accurate.');
        setLoading(false);
        return;
      }

      const finalMode = isUnder18 ? EXPERIENCE_MODES.KIDS : experienceMode;

      try {
        await fetch('/api/user/age-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthdate,
            experienceMode: finalMode
          })
        });

        registerWithEmail({
          username,
          email,
          password,
          birthdate,
          age: calculatedAge,
          experienceMode: finalMode,
          isAgeConfirmed
        });
      } catch (err) {
        console.error("Age verification API error during registration:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setAuthModalOpen(false)}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="relative w-full max-w-md transform rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 text-left shadow-2xl border border-slate-200 dark:border-slate-800 transition-all sm:my-8 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Logo & Header */}
          <div className="text-center space-y-2 mb-4">
            <div className="flex justify-center pb-1">
              <img src="/logo.png" alt="Avora Library" className="h-9 sm:h-10 w-auto object-contain dark:hidden" />
              <img src="/logo-dark.png" alt="Avora Library" className="h-9 sm:h-10 w-auto object-contain hidden dark:block" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {authModalMode === 'login' ? 'Welcome Back' : 'Join Avora Library'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {authModalMessage || (authModalMode === 'login' 
                ? 'Log in to sync your library, vote on chapters, and join the discussion.' 
                : 'Create a free account to discover thousands of serialized stories and publish your own.')}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SOCIAL LOGINS (Google at top, matching Wattpad) */}
          <div className="space-y-2.5 mb-4">

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => {
                setAuthModalOpen(false);
                if (typeof window !== 'undefined') {
                  if (authModalMode === 'register') {
                    sessionStorage.setItem('avora_registration_pending', 'true');
                  } else {
                    sessionStorage.removeItem('avora_registration_pending');
                  }
                }
                signIn('google', { callbackUrl: '/home' });
              }}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.99] text-slate-700 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>


          {/* Quick Demo Access (1-Click) */}
          {authModalMode === 'login' && (
            <div className="mb-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-slate-800/60 dark:to-slate-800/30 p-3 rounded-2xl border border-brand-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-brand-700 dark:text-brand-300">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-brand-500" /> Instant 1-Click Demo</span>
                <span className="text-[10px] text-slate-400">No Password</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                <button
                  type="button"
                  onClick={() => {
                    loginWithEmail('gbncircle@gmail.com', 'admin123');
                    setAuthModalOpen(false);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all text-center cursor-pointer"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginWithEmail('reader@avoralibrary.com', 'password123');
                    setAuthModalOpen(false);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all text-center cursor-pointer"
                >
                  📖 Reader
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginWithEmail('elena.author@avoralibrary.com', 'password123');
                    setAuthModalOpen(false);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all text-center cursor-pointer"
                >
                  ✍️ Author
                </button>
              </div>
            </div>
          )}

          {/* Divider OR */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              OR
            </span>
          </div>

          {/* 2. EMAIL FORM */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {authModalMode === 'register' && (
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. StoryTeller99"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                {authModalMode === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type={authModalMode === 'login' ? 'text' : 'email'} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authModalMode === 'login' ? 'gbncircle@gmail.com or username' : 'you@example.com'}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">Password</label>
                {authModalMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => alert("Password reset link will be sent to your email address.")}
                    className="text-brand-500 font-bold hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Birthday / Age Verification for DOB Access Control */}
            {authModalMode === 'register' && (
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth (DOB) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                    <input 
                      type="date" 
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 text-xs font-bold transition-all shadow-inner"
                    />
                  </div>
                  
                  {calculatedAge !== null && (
                    <div className="flex items-center justify-between text-[10px] px-1 pt-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        Age: <strong className="text-slate-900 dark:text-white">{calculatedAge} yrs</strong>
                      </span>
                      <span className={`font-bold px-1.5 py-0.5 rounded-full ${
                        isUnder18 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isUnder18 ? 'Under 18 (Minor)' : '18+ (Adult)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Experience Mode Selector */}
                <div className="space-y-1">
                  <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Choose Experience:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      onClick={() => setExperienceMode(EXPERIENCE_MODES.KIDS)}
                      className={`p-2 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        experienceMode === EXPERIENCE_MODES.KIDS || isUnder18
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500" /> Kids / Family
                      </div>
                      <p className="text-[9px] text-slate-400 leading-tight mt-0.5">Kids & Teen stories</p>
                    </div>

                    <div 
                      onClick={() => {
                        if (!isUnder18) setExperienceMode(EXPERIENCE_MODES.MATURE);
                      }}
                      className={`p-2 rounded-xl border-2 transition-all text-left ${
                        isUnder18
                          ? 'opacity-60 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                          : experienceMode === EXPERIENCE_MODES.MATURE
                            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer'
                            : 'border-slate-200 dark:border-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="font-bold text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {isUnder18 ? <Lock className="w-3 h-3 text-slate-400" /> : <ShieldCheck className="w-3 h-3 text-amber-500" />} 18+ / Mature
                        </span>
                        {isUnder18 && <span className="text-[8px] text-rose-500 font-bold">Locked</span>}
                      </div>
                      <p className="text-[9px] text-slate-400 leading-tight mt-0.5">Full adult library</p>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2 cursor-pointer pt-0.5">
                  <input 
                    type="checkbox" 
                    checked={isAgeConfirmed}
                    onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 accent-brand-500 rounded"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    I confirm that my Date of Birth is accurate and agree to Terms of Service.
                  </span>
                </label>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold shadow-md shadow-brand-500/25 transition-all cursor-pointer mt-2"
            >
              {loading ? 'Processing...' : (authModalMode === 'login' ? 'Log In to Avora Library' : 'Create Free Account')}
            </button>
          </form>

          {/* Modal Footer Toggle */}
          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 mt-3.5">
            {authModalMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => { setAuthModalMode('register'); setErrorMessage(''); }}
                  className="font-bold text-brand-500 hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => { setAuthModalMode('login'); setErrorMessage(''); }}
                  className="font-bold text-brand-500 hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}