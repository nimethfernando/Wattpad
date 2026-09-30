'use client';
import { useState } from 'react';
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
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!authModalOpen) return null;

  const handleFacebookLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await loginWithFacebook();
    } catch (err) {
      setErrorMessage('Facebook authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMessage('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {authModalMode === 'login' ? 'Welcome Back' : 'Join Avora Library'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {authModalMessage || (authModalMode === 'login' 
              ? 'Log in to sync your library, vote on chapters, and join the discussion.' 
              : 'Create a free account to discover thousands of serialized stories and publish your own.')}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. SOCIAL LOGINS (Facebook & Google at top, matching Wattpad) */}
        <div className="space-y-3 mb-5">
          {/* Facebook Login Button */}
          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-3 shadow-md shadow-[#1877F2]/20 transition-all cursor-pointer"
          >
            {/* Official Facebook SVG Logo */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Continue with Facebook</span>
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.99] text-slate-700 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
          >
            {/* Official Google Multicolored SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider OR */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
            OR
          </span>
        </div>

        {/* 2. EMAIL FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Birthday / Age Verification for COPPA/Mature Content Compliance (Wattpad standard) */}
          {authModalMode === 'register' && (
            <div className="space-y-2 pt-1">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Birthday</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
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
            className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold shadow-md shadow-brand-500/25 transition-all cursor-pointer mt-2"
          >
            {loading ? 'Processing...' : (authModalMode === 'login' ? 'Log In to Avora Library' : 'Create Free Account')}
          </button>
        </form>

        {/* Modal Footer Toggle */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setAuthModalMode('register'); setErrorMessage(''); }}
                className="font-bold text-brand-500 hover:underline"
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
                className="font-bold text-brand-500 hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
