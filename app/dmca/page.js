'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, Mail } from 'lucide-react';

export default function DmcaPage() {
  const { t, cmsConfig } = useApp();
  const dmcaData = cmsConfig?.pagesContent?.dmca || {
    title: "DMCA Policy",
    agentEmail: "copyright@avoralibrary.com",
    subjectLine: "DMCA Notice - [Story Title]",
    intro: "Avora Library respects the intellectual property rights of creators and expects authors and readers to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to notices of alleged copyright infringement.",
    requirementsTitle: "Notice Requirements",
    requirements: [
      "Identification of the copyrighted serialized work claimed to be infringed.",
      "The URL of the specific story or chapter on Avora Library that contains the infringing material.",
      "Your contact information (name, email address, physical address, and telephone number).",
      "A statement of good faith belief that the use is unauthorized by the copyright owner.",
      "A physical or electronic signature of the authorized copyright holder."
    ]
  };

  const requirements = dmcaData.requirements || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          <h1 className="text-3xl font-black">{dmcaData.title || `${t.dmca} Policy`}</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
          <p className="whitespace-pre-line">
            {dmcaData.intro}
          </p>

          <section className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {dmcaData.requirementsTitle || "Notice Requirements"}
            </h3>
            <p>To submit a DMCA takedown request, please provide our designated copyright agent with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </section>

          <section className="p-4 sm:p-5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700/50">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-500" /> Designated DMCA Agent Contact:
            </h4>
            <p className="text-xs">Email: <a href={`mailto:${dmcaData.agentEmail || 'copyright@avoralibrary.com'}`} className="font-mono text-brand-500 font-bold hover:underline">{dmcaData.agentEmail || 'copyright@avoralibrary.com'}</a></p>
            {dmcaData.subjectLine && (
              <p className="text-xs">Subject line: <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">{dmcaData.subjectLine}</span></p>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
