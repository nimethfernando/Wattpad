'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({
      id: 1,
      username: email.split('@')[0] || "Elena_Author",
      name: email.split('@')[0] || "Elena Vance",
      email,
      role: email.includes('admin') ? 'admin' : 'author',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: ["Top Author", "Rising Writer"],
      isAgeVerified: true,
      hideMature: false
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black">Welcome Back</h1>
            <p className="text-xs text-slate-400">Log in to resume your chapters and community reading</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Email or Username</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="author@storyvault.com"
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-400">Password</label>
                <Link href="/forgot-password" className="text-brand-500 font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 transition-all"
            >
              Sign In to StoryVault
            </button>
          </form>

          {/* Optional Google Login */}
          <div className="relative border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
            <button 
              onClick={() => {
                setUser({
                  id: 2,
                  username: "google_reader",
                  name: "Google Reader",
                  email: "reader@gmail.com",
                  role: "reader",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
                  badges: ["Top Reader"],
                  isAgeVerified: true,
                  hideMature: false
                });
                router.push('/');
              }}
              className="w-full py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              Continue with Google (One-Click)
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
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
