'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';

export default function TermsPage() {
  const { t, cmsConfig } = useApp();
  const termsData = cmsConfig?.pagesContent?.terms || {
    title: "Terms of Service",
    lastUpdated: "March 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content: "By accessing and using Avora Library (including as an installed Progressive Web App), you agree to comply with and be bound by these terms. If you do not agree, please discontinue using the service."
      },
      {
        heading: "2. Serialized Author Publishing Rights",
        content: "Authors retain 100% full copyright ownership over all original works, chapters, and storylines published on Avora Library. Authors grant Avora Library a non-exclusive license to host, format, and display the works across web and mobile browsers."
      },
      {
        heading: "3. Reader Conduct & Paragraph Annotations",
        content: "Users may comment line-by-line on chapter paragraphs. Hate speech, harassment, impersonation, or unsolicited spam in annotations will result in immediate moderation suspension or permanent banning."
      },
      {
        heading: "4. Mature & Age-Restricted Content (18+)",
        content: "Works containing mature themes must be accurately flagged as Mature by the author. Readers confirm they meet the legal age of majority in their jurisdiction when passing through the mature age gate."
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="text-3xl font-black">{termsData.title || t.terms}</h1>
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

      <Footer />
    </div>
  );
}
