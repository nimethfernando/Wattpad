'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { HelpCircle, ChevronDown, ChevronUp, Mail, BookOpen, Smartphone, ShieldCheck } from 'lucide-react';

export default function HelpCenterPage() {
  const { t } = useApp();
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How do inline paragraph comments work?",
      a: "While reading any chapter, hover or tap on any paragraph. You'll see an orange speech bubble indicating the number of reader reactions. Tapping it opens a live sidebar drawer where you can view discussions, reply to other readers, and add your own line-by-line reactions."
    },
    {
      q: "How do I install Avora Library as a Web App (PWA)?",
      a: "On your mobile device (iOS Safari or Android Chrome), open Avora Library and tap your browser's Share/Options menu, then select 'Add to Home Screen'. Avora Library will install instantly as a lightweight standalone web application with offline progress caching."
    },
    {
      q: "Can anyone publish serialized novels?",
      a: "Yes! Any registered member can click 'Write' in the navigation bar to access the Author Studio, draft chapters, set 18+ age ratings, and publish immediately or schedule releases."
    },
    {
      q: "How are mature (18+) stories handled?",
      a: "Authors can designate stories as Mature. An age-gate prompt will require readers to confirm they are 18 or older before reading chapters containing sensitive or adult themes."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-3 mb-12">
          <HelpCircle className="w-12 h-12 text-brand-500 mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-black">{t.helpCenter} & FAQ</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Answers to common questions about reading, author tools, and PWA setup.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-sm"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-brand-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support Link */}
        <div className="mt-12 text-center p-8 bg-brand-50/60 dark:bg-slate-900 rounded-3xl border border-brand-200 dark:border-slate-800 space-y-3">
          <h3 className="font-black text-lg">Still need assistance?</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our support desk is available to assist authors and readers with account recovery, DMCA requests, and technical issues.
          </p>
          <Link 
            href="/contact" 
            className="inline-block px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
          >
            {t.contactUs}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
