'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { ShieldAlert } from 'lucide-react';

export default function DmcaPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          <h1 className="text-3xl font-black">{t.dmca} Policy</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Avora Library respects the intellectual property rights of creators and expects authors and readers to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to notices of alleged copyright infringement.
          </p>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Notice Requirements</h3>
            <p>To submit a DMCA takedown request, please provide our designated copyright agent with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identification of the copyrighted serialized work claimed to be infringed.</li>
              <li>The URL of the specific story or chapter on Avora Library that contains the infringing material.</li>
              <li>Your contact information (name, email address, physical address, and telephone number).</li>
              <li>A statement of good faith belief that the use is unauthorized by the copyright owner.</li>
              <li>A physical or electronic signature of the authorized copyright holder.</li>
            </ul>
          </section>

          <section className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">Designated DMCA Agent Contact:</h4>
            <p className="text-xs">Email: <span className="font-mono text-brand-500">copyright@avoralibrary.com</span></p>
            <p className="text-xs">Subject line: <span className="font-mono">DMCA Notice - [Story Title]</span></p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
