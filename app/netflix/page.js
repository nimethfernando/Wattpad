'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookShowcaseView from '@/components/BookShowcaseView';
import { useApp } from '@/context/AppContext';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function NetflixPage() {
  const { user, openAuthModal } = useApp();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#141414] text-white">
        <Header />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/15">
            <Lock className="w-10 h-10" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3.5 py-1 rounded-full mb-3 border border-rose-500/20">
            Showcase • Member Access Only
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mb-3 text-white">
            Sign In to Access Book Showcase
          </h1>
          <p className="text-slate-400 mb-6 text-xs sm:text-sm max-w-md leading-relaxed">
            Streaming showcase and preview carousels are exclusively available to registered members. Sign in or create a free account to continue.
          </p>
          <div className="w-full max-w-xs space-y-3">
            <button
              type="button"
              onClick={() => openAuthModal('login', 'Sign in to access the Book Showcase.')}
              className="w-full py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
            >
              Sign In to Showcase
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register', 'Create an account to start reading.')}
              className="w-full py-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              Create Free Account
            </button>
            <Link 
              href="/"
              className="block pt-2 text-xs text-slate-500 hover:text-slate-300"
            >
              ← Return to Home Page
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white">
      <Header />
      <main className="flex-1">
        <BookShowcaseView />
      </main>
      <Footer />
    </div>
  );
}
