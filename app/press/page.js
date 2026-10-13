'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DeletedPageGate, ManagedPageCustomSections } from '@/components/ManagedPageBanner';
import { useApp } from '@/context/AppContext';
import { Newspaper, Mail } from 'lucide-react';

export default function PressPage() {
  const { cmsConfig } = useApp();
  const pressData = cmsConfig?.pagesContent?.press || {
    title: "Press & Media Kit",
    subtitle: "Official announcements, brand assets, and media contact info.",
    pressEmail: "press@avoralibrary.com",
    content: "For press inquiries, author interviews, or brand assets, please contact our media team at press@avoralibrary.com."
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <DeletedPageGate pageKey="press" title={pressData.title || "Press & Media Kit"}>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
          <div className="text-center space-y-2 mb-10">
            <Newspaper className="w-10 h-10 text-brand-500 mx-auto" />
            <h1 className="text-3xl sm:text-4xl font-black">{pressData.title ?? "Press & Media Kit"}</h1>
            {pressData.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                {pressData.subtitle}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500" /> Media &amp; Press Contact
              </h3>
              {pressData.content && (
                <p className="whitespace-pre-line">
                  {pressData.content}
                </p>
              )}
              {pressData.pressEmail && (
                <div className="pt-2">
                  <a 
                    href={`mailto:${pressData.pressEmail}`} 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Press Desk ({pressData.pressEmail})
                  </a>
                </div>
              )}
            </div>
          </div>

          <ManagedPageCustomSections pageKey="press" />
        </main>
      </DeletedPageGate>

      <Footer />
    </div>
  );
}
