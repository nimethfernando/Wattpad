'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DeletedPageGate, ManagedPageCustomSections } from '@/components/ManagedPageBanner';
import { useApp } from '@/context/AppContext';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function HelpCenterPage() {
  const { t, cmsConfig } = useApp();
  const [activeFaq, setActiveFaq] = useState(null);

  const helpData = cmsConfig?.pagesContent?.help || {
    title: "Help Center & FAQ",
    subtitle: "Answers to common questions about reading, author tools, and PWA setup.",
    supportHeading: "Still need assistance?",
    supportText: "Our support desk is available to assist authors and readers with account recovery, DMCA requests, and technical issues.",
    faqs: []
  };

  const faqs = helpData.faqs || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <DeletedPageGate pageKey="help" title={helpData.title || "Help Center & FAQ"}>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-3 mb-12">
            <HelpCircle className="w-12 h-12 text-brand-500 mx-auto" />
            <h1 className="text-3xl sm:text-4xl font-black">{helpData.title ?? `${t.helpCenter} & FAQ`}</h1>
            {helpData.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                {helpData.subtitle}
              </p>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-brand-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support Link */}
          {(helpData.supportHeading || helpData.supportText) && (
            <div className="mt-12 text-center p-8 bg-brand-50/60 dark:bg-slate-900 rounded-3xl border border-brand-200 dark:border-slate-800 space-y-3">
              {helpData.supportHeading && (
                <h3 className="font-black text-lg">{helpData.supportHeading}</h3>
              )}
              {helpData.supportText && (
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {helpData.supportText}
                </p>
              )}
              <Link 
                href="/contact" 
                className="inline-block px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
              >
                {t.contactUs}
              </Link>
            </div>
          )}

          <ManagedPageCustomSections pageKey="help" />
        </main>
      </DeletedPageGate>

      <Footer />
    </div>
  );
}
