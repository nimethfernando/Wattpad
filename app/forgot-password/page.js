'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black">Reset Password</h1>
            <p className="text-xs text-slate-400">Enter your email and we'll dispatch a secure recovery link</p>
          </div>

          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold">
                If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>, a reset link has been dispatched via our secure mail server.
              </p>
              <Link href="/login" className="inline-block pt-2 text-xs font-bold text-brand-500 hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Account Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="author@avoralibrary.com"
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 transition-all"
              >
                Send Password Reset Link
              </button>
            </form>
          )}

          <div className="text-center text-xs">
            <Link href="/login" className="font-bold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
