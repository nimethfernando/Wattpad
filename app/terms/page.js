'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';

export default function TermsPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black mb-6">{t.terms}</h1>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
            <p>
              By accessing and using Avora Library (including as an installed Progressive Web App), you agree to comply with and be bound by these terms. If you do not agree, please discontinue using the service.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">2. Serialized Author Publishing Rights</h3>
            <p>
              Authors retain 100% full copyright ownership over all original works, chapters, and storylines published on Avora Library. Authors grant Avora Library a non-exclusive license to host, format, and display the works across web and mobile browsers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">3. Reader Conduct & Paragraph Annotations</h3>
            <p>
              Users may comment line-by-line on chapter paragraphs. Hate speech, harassment, impersonation, or unsolicited spam in annotations will result in immediate moderation suspension or permanent banning.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">4. Mature & Age-Restricted Content (18+)</h3>
            <p>
              Works containing mature themes must be accurately flagged as Mature by the author. Readers confirm they meet the legal age of majority in their jurisdiction when passing through the mature age gate.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
