'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Newspaper } from 'lucide-react';

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-2 mb-10">
          <Newspaper className="w-10 h-10 text-brand-500 mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-black">Press & Media Kit</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official announcements, brand assets, and media contact info.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            For press inquiries, author interviews, or brand assets, please contact our media team at <span className="font-mono text-brand-500">press@storyvault.com</span>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
