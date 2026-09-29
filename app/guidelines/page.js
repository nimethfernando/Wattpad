'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Feather, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function GuidelinesPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-2 mb-10">
          <Feather className="w-10 h-10 text-brand-500 mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-black">{t.guidelines} & Writer Resources</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            How to craft serialized novels that build passionate audiences on StoryVault.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-3">
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" /> 1. The Power of Paragraph Hooks
            </h3>
            <p>
              On StoryVault, readers interact with individual paragraphs through inline comments. Craft dialogue beats, witty comebacks, and atmospheric descriptions that invite reader reaction. A single poignant sentence can generate hundreds of reader annotations!
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> 2. Chapter Release Cadence
            </h3>
            <p>
              Successful serialized authors publish on a consistent schedule (e.g. Every Tuesday and Friday). Keep individual chapters between 1,200 and 2,500 words for optimal mobile reading pacing.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> 3. Content Ratings & Safety
            </h3>
            <p>
              Always set the correct maturity rating when configuring your story. Graphic violence, strong sexual content, or distressing themes must be labeled as Mature (18+). Plagiarism or copying content from external platforms is strictly prohibited.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link 
              href="/write" 
              className="inline-block px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/25 transition-all"
            >
              Enter Author Studio & Start Writing
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
