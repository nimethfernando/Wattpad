'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Handshake, Mail } from 'lucide-react';

export default function PartnershipsPage() {
  const { cmsConfig } = useApp();
  const partnerData = cmsConfig?.pagesContent?.partnerships || {
    title: "Brand Partnerships",
    subtitle: "Collaborate with Avora Library on writing contests, literary sponsorships, and adaptations.",
    partnerEmail: "partnerships@avoralibrary.com",
    content: "Connect with an engaged global audience of serialized readers and creators. Email us at partnerships@avoralibrary.com."
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-2 mb-10">
          <Handshake className="w-10 h-10 text-brand-500 mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-black">{partnerData.title || "Brand Partnerships"}</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            {partnerData.subtitle || "Collaborate with Avora Library on writing contests, literary sponsorships, and adaptations."}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
          <p className="whitespace-pre-line">
            {partnerData.content}
          </p>
          {partnerData.partnerEmail && (
            <div className="pt-2">
              <a 
                href={`mailto:${partnerData.partnerEmail}`} 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Contact Partnerships Desk ({partnerData.partnerEmail})
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
