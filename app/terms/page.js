'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DeletedPageGate } from '@/components/ManagedPageBanner';
import { useApp } from '@/context/AppContext';

export default function TermsPage() {
  const { t, cmsConfig } = useApp();
  const termsData = cmsConfig?.pagesContent?.terms || {
    title: "Terms of Service",
    lastUpdated: "March 2026",
    sections: []
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <DeletedPageGate pageKey="terms" title={termsData.title || "Terms of Service"}>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <h1 className="text-3xl font-black">{termsData.title ?? t.terms}</h1>
            {termsData.lastUpdated && (
              <span className="text-xs font-semibold text-slate-400">Last updated: {termsData.lastUpdated}</span>
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
            {termsData.sections?.map((sec, idx) => (
              <section key={idx} className="space-y-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{sec.heading}</h3>
                <p className="whitespace-pre-line">{sec.content}</p>
              </section>
            ))}
          </div>
        </main>
      </DeletedPageGate>

      <Footer />
    </div>
  );
}
