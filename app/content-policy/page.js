'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, CheckCircle } from 'lucide-react';

export default function ContentPolicyPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black mb-6">Content & Safety Policy</h1>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Prohibited Content</h3>
            <p>Avora Library maintains strict community safety guidelines. The following are strictly disallowed:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Non-consensual sexual depictions or exploitation of minors (zero tolerance).</li>
              <li>Hate speech or violence incitement against protected groups.</li>
              <li>Plagiarized texts or stories scraped from other platforms without authorization.</li>
              <li>Doxxing or revealing personal identifiable information in stories or comments.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Mature Rating Expectations</h3>
            <p>
              Authors writing graphic romance, body horror, or psychological trauma must mark their story as <strong>Mature (18+)</strong>. Readers under 18 will be blocked by our age gate.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
