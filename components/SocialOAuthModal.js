'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SocialOAuthModal() {
  const { 
    socialModalOpen, 
    closeSocialModal, 
    socialModalProvider, 
    loginWithGoogle, 
    loginWithFacebook, 
    socialModalCallback 
  } = useApp();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal opens or provider changes
  useEffect(() => {
    if (socialModalOpen) {
      setEmail('');
      setName('');
      setPassword('');
      setErrorMessage('');
      setLoading(false);
    }
  }, [socialModalOpen, socialModalProvider]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && socialModalOpen && !loading) {
        closeSocialModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socialModalOpen, loading, closeSocialModal]);

  if (!socialModalOpen) return null;

  const isGoogle = socialModalProvider === 'google';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage(
        isGoogle 
          ? 'Please enter your Google account email address.' 
          : 'Please enter your Facebook email address or mobile number.'
      );
      return;
    }

    if (!email.includes('@') && isGoogle) {
      setErrorMessage('Please enter a valid Google email address (e.g. name@gmail.com).');
      return;
    }

    setLoading(true);
    try {
      // Realistic brief authorization loading animation
      await new Promise(r => setTimeout(r, 600));

      if (isGoogle) {
        await loginWithGoogle({ email: email.trim(), name: name.trim() });
      } else {
        await loginWithFacebook({ email: email.trim(), name: name.trim() });
      }

      if (socialModalCallback && typeof socialModalCallback === 'function') {
        socialModalCallback();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => { if (!loading) closeSocialModal(); }}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-left shadow-2xl border border-slate-200 dark:border-slate-800 transition-all sm:my-8 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {!loading && (
            <button 
              onClick={closeSocialModal}
              className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* GOOGLE VIEW */}
          {isGoogle ? (
            <div className="p-7 sm:p-8 space-y-5">
              {/* Google Brand Header */}
              <div className="text-center space-y-2">
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Sign in with Google
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  to continue to <span className="font-semibold text-slate-700 dark:text-slate-200">Avora Library</span>
                </p>
              </div>

              {/* Animated Google Progress Bar when loading */}
              {loading && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 animate-pulse w-full"></div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Google Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="email"
                    autoFocus
                    required
                    disabled={loading}
                    placeholder="e.g. yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the Google email you want to sign in with.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name (optional)
                  </label>
                  <input 
                    type="text"
                    disabled={loading}
                    placeholder="Your name (e.g. Elena)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-xs"
                  />
                </div>

                <div className="pt-1 text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  To continue, Google will share your name, email address, language preference, and profile picture with Avora Library.
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={closeSocialModal}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.99] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#1a73e8]/25 transition-all cursor-pointer disabled:opacity-75"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying Google account...</span>
                      </>
                    ) : (
                      <span>Sign in with Google</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* FACEBOOK VIEW */
            <div>
              {/* Facebook Blue Header */}
              <div className="bg-[#1877F2] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-black text-lg tracking-tight">facebook</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-white/15 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure Meta OAuth</span>
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Log in with Facebook
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect your Facebook account to sign in to Avora Library.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile number or email address <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      autoFocus
                      required
                      disabled={loading}
                      placeholder="e.g. yourname@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Facebook Password
                    </label>
                    <input 
                      type="password" 
                      disabled={loading}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name (optional)
                    </label>
                    <input 
                      type="text"
                      disabled={loading}
                      placeholder="Your name (e.g. Alex)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent text-xs"
                    />
                  </div>

                  <div className="pt-1 text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    Avora Library will receive: your name, profile picture, and email address.
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={closeSocialModal}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#1877F2]/25 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <span>Log In with Facebook</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
