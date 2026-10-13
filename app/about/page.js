'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DeletedPageGate, ManagedPageCustomSections } from '@/components/ManagedPageBanner';
import { useApp } from '@/context/AppContext';
import { BookOpen } from 'lucide-react';

export default function AboutPage() {
  const { t, cmsConfig } = useApp();
  const content = cmsConfig?.pagesContent?.about || {
    title: "About Avora Library",
    subtitle: "Avora Library is a modern, responsive, and multilingual serialized storytelling platform built for community reading and creator empowerment.",
    missionTitle: "Our Mission",
    missionContent: "We believe great storytelling thrives in the open air of community. By enabling line-by-line paragraph reactions, reader badges, and author followings, Avora Library transforms solitary reading into a shared cultural experience.",
    pwaTitle: "Mobile-First Progressive Web App",
    pwaContent: "Rather than locking readers behind hefty app store downloads, Avora Library is built from the ground up as a high-performance Progressive Web App (PWA). Readers in Georgia, India, the United States, and across the globe can install it directly to their phones with one tap and read seamlessly anywhere."
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <DeletedPageGate pageKey="about" title={content.title || "About Avora Library"}>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
          <div className="text-center space-y-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{content.title ?? t.about}</h1>
            {content.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
            {(content.missionTitle || content.missionContent) && (
              <section className="space-y-2">
                {content.missionTitle && (
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">{content.missionTitle}</h3>
                )}
                {content.missionContent && (
                  <p className="whitespace-pre-line">
                    {content.missionContent}
                  </p>
                )}
              </section>
            )}

            {(content.pwaTitle || content.pwaContent) && (
              <section className="space-y-2">
                {content.pwaTitle && (
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">{content.pwaTitle}</h3>
                )}
                {content.pwaContent && (
                  <p className="whitespace-pre-line">
                    {content.pwaContent}
                  </p>
                )}
              </section>
            )}
          </div>

          <ManagedPageCustomSections pageKey="about" />
        </main>
      </DeletedPageGate>

      <Footer />
    </div>
  );
}
