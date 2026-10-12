'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Eye, CheckCircle2 } from 'lucide-react';

export default function AccessibilityPage() {
  const { cmsConfig } = useApp();
  const accessData = cmsConfig?.pagesContent?.accessibility || {
    title: "Accessibility Statement",
    lastUpdated: "March 2026",
    intro: "Avora Library is committed to digital accessibility for individuals with diverse abilities. We adhere to WCAG 2.1 AA standards across mobile, tablet, and desktop interfaces.",
    features: [
      "Reading Customization: Adjustable font sizes (14px to 26px) and high-contrast Light, Dark, and warm Sepia reading backgrounds.",
      "Typography Selection: High-legibility Serif and Sans-serif typefaces.",
      "Screen Reader Navigation: Semantic HTML landmarks and ARIA attributes for seamless screen reading."
    ]
  };

  const features = accessData.features || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-black">{accessData.title || "Accessibility Statement"}</h1>
          </div>
          {accessData.lastUpdated && (
            <span className="text-xs font-semibold text-slate-400">Last updated: {accessData.lastUpdated}</span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
          <p className="whitespace-pre-line">
            {accessData.intro}
          </p>

          <section className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Accessibility Features Built-In:</h3>
            <ul className="space-y-2.5">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
