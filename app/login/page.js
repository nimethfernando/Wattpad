'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BrandLogo from '@/components/BrandLogo';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, user, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If the user is already authenticated (e.g. from local session or earlier login), redirect to /home or /admin
  useEffect(() => {
    if (user) {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const callbackUrl = params?.get('callbackUrl') || (user.role === 'admin' ? '/admin' : '/home');
      router.replace(callbackUrl);
    }
  }, [user, router]);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    try {
      const loggedInUser = loginWithEmail(email, password);
      if (cleanEmail === 'gbncircle@gmail.com' || cleanEmail === 'gbncircle' || cleanEmail === 'groupditya@gmail.com' || cleanEmail === 'groupditya') {
        router.push('/admin', { scroll: false });
      } else {
        router.push('/home', { scroll: false });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center pb-2">
              <BrandLogo size="lg" />
            </div>
            <h1 className="text-2xl font-black">Welcome Back</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to sync your serialized library, vote on chapters, and engage with authors.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECURE EMAIL FORM */}
          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email or username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">Password</label>
                <Link 
                  href="/forgot-password"
                  className="text-brand-500 dark:text-amber-400 font-bold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold shadow-lg shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-60"
            >
              Sign In to Avora Library
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-brand-500 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
