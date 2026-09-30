'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { X, BookOpen, Lock, Mail, User, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    authModalMessage, 
    loginWithGoogle, 
    loginWithFacebook, 
    loginWithEmail, 
    registerWithEmail 
  } = useApp();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('2000-01-01');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null
  const [showAccountSelector, setShowAccountSelector] = useState(null); // 'google' | 'facebook' | null
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

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

  const handleFacebookLogin = async (customUser = null) => {
    setSocialLoading('facebook');
    setErrorMessage('');
    try {
      // Simulate real-world OAuth authorization handshake
      await new Promise(r => setTimeout(r, 600));
      await loginWithFacebook(customUser);
    } catch (err) {
      setErrorMessage('Facebook authentication failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGoogleLogin = async (customUser = null) => {
    setSocialLoading('google');
    setErrorMessage('');
    try {
      // Simulate real-world OAuth authorization handshake
      await new Promise(r => setTimeout(r, 600));
      await loginWithGoogle(customUser);
    } catch (err) {
      setErrorMessage('Google authentication failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = (e) => {
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
      if (!email.trim() || !username.trim() || !password.trim()) {
        setErrorMessage('Please complete all registration fields.');
        setLoading(false);
        return;
      }
      if (!isAgeConfirmed) {
        setErrorMessage('You must confirm you meet the age requirements (13+).');
        setLoading(false);
        return;
      }
      registerWithEmail({ username, email, password, birthdate, isAgeConfirmed });
      setLoading(false);
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
        <div className="text-center space-y-1.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25">
            <BookOpen className="w-5 h-5" />
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

        {/* 1. SOCIAL LOGINS (Facebook & Google at top, matching Wattpad) */}
        <div className="space-y-2.5 mb-4">
          {/* Facebook Login Button */}
          <button
            type="button"
            onClick={() => handleFacebookLogin()}
            disabled={loading || socialLoading !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm shadow-[#1877F2]/20 transition-all cursor-pointer disabled:opacity-75"
          >
            {socialLoading === 'facebook' ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Connecting to Facebook...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Continue with Facebook</span>
              </>
            )}
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={loading || socialLoading !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.99] text-slate-700 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-75"
          >
            {socialLoading === 'google' ? (
              <>
                <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Optional: Account Customizer for Real Email/Name Testing */}
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setShowAccountSelector(showAccountSelector ? null : 'google')}
              className="hover:text-brand-500 underline decoration-slate-300 dark:decoration-slate-700 cursor-pointer"
            >
              {showAccountSelector ? '✕ Close custom sign-in' : '⚙️ Custom Google / Facebook account'}
            </button>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 1-Click Instant
            </span>
          </div>

          {showAccountSelector && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-left animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                  Custom Social Credentials:
                </span>
                <div className="flex gap-1 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setShowAccountSelector('google')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${showAccountSelector === 'google' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-amber-400' : 'text-slate-400'}`}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAccountSelector('facebook')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${showAccountSelector === 'facebook' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#1877F2]' : 'text-slate-400'}`}
                  >
                    Facebook
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Your Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input 
                  type="email" 
                  placeholder={showAccountSelector === 'google' ? 'user@gmail.com' : 'user@facebook.com'}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                type="button"
                disabled={socialLoading !== null}
                onClick={() => {
                  if (showAccountSelector === 'google') {
                    handleGoogleLogin(customEmail ? { name: customName, email: customEmail } : null);
                  } else {
                    handleFacebookLogin(customEmail ? { name: customName, email: customEmail } : null);
                  }
                }}
                className={`w-full py-1.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  showAccountSelector === 'google' ? 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800' : 'bg-[#1877F2] hover:bg-[#166fe5]'
                }`}
              >
                <span>Authorize & Sign In</span>
              </button>
            </div>
          )}
        </div>

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
              <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. StoryTeller99"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">
              {authModalMode === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={authModalMode === 'login' ? 'text' : 'email'} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={authModalMode === 'login' ? 'reader@avoralibrary.com' : 'you@example.com'}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-500 dark:text-slate-400">Password</label>
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
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Birthday / Age Verification for COPPA/Mature Content Compliance (Wattpad standard) */}
          {authModalMode === 'register' && (
            <div className="space-y-1.5 pt-0.5">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Birthday</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-0.5">
                <input 
                  type="checkbox" 
                  checked={isAgeConfirmed}
                  onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-brand-500 rounded"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  I confirm that I am at least 13 years of age, and agree to the Terms of Service.
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
