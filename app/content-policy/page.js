'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { ShieldAlert } from 'lucide-react';

export default function ContentPolicyPage() {
  const { t, cmsConfig } = useApp();
  const policyData = cmsConfig?.pagesContent?.contentPolicy || {
    title: "Content & Safety Policy",
    lastUpdated: "March 2026",
    sections: [
      {
        heading: "Prohibited Content",
        content: "Avora Library maintains strict community safety guidelines. Non-consensual sexual depictions or exploitation of minors, hate speech or violence incitement against protected groups, plagiarized texts, and doxxing are strictly disallowed."
      },
      {
        heading: "Mature Rating Expectations",
        content: "Authors writing graphic romance, body horror, or psychological trauma must mark their story as Mature (18+). Readers under 18 will be blocked by our age gate."
      }
    ]
  };

  const sections = policyData.sections || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-black">{policyData.title || "Content & Safety Policy"}</h1>
          </div>
          {policyData.lastUpdated && (
            <span className="text-xs font-semibold text-slate-400">Last updated: {policyData.lastUpdated}</span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
          {sections.map((sec, idx) => (
            <section key={idx} className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{sec.heading}</h3>
              <p className="whitespace-pre-line">{sec.content}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
