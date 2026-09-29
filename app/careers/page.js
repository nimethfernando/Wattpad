'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Briefcase, Sparkles } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-2 mb-10">
          <Briefcase className="w-10 h-10 text-brand-500 mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-black">Careers at StoryVault</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join our mission to empower the next generation of serialized writers and digital readers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Senior Editorial Curator</h4>
              <p className="text-xs text-slate-400">Remote • Full-time</p>
            </div>
            <a href="mailto:careers@storyvault.com" className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600">
              Apply Now
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Community Safety Moderator (Multilingual)</h4>
              <p className="text-xs text-slate-400">Remote (US / Georgia / India) • Full-time</p>
            </div>
            <a href="mailto:careers@storyvault.com" className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600">
              Apply Now
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
