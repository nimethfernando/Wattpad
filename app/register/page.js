'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { BookOpen } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, t } = useApp();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!isAgeConfirmed) {
      alert('Please confirm your age to complete registration.');
      return;
    }

    setUser({
      id: Date.now(),
      username: username || "NewAuthor",
      name: username || "New StoryVault Author",
      email,
      role: 'author',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: ["Rising Writer"],
      isAgeVerified: isAgeConfirmed,
      hideMature: false
    });
    router.push('/write');
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
            <h1 className="text-2xl font-black">Create Free Account</h1>
            <p className="text-xs text-slate-400">Join thousands of serialized readers and authors</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Desired Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. ElenaWrites"
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="elena@example.com"
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Age Confirmation Requirement (Scope 7) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isAgeConfirmed}
                  onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 accent-brand-500 rounded"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                  I confirm that I am at least 13 years of age, or 18+ to view and write mature content, and agree to the Terms of Service.
                </span>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 transition-all"
            >
              Complete Registration & Start Writing
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-brand-500 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
