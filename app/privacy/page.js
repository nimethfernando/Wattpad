'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';

export default function PrivacyPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black mb-6">{t.privacy}</h1>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Information We Collect</h3>
            <p>
              We collect information you provide directly, such as when creating an author or reader account, bookmarking serialized stories, posting paragraph comments, or submitting support messages.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Reading Progress & Device Synchronization</h3>
            <p>
              To offer a continuous reading experience across your smartphone (PWA), tablet, and desktop browser, we cache your latest read chapter and paragraph scroll offset securely.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Data Protection & Privacy</h3>
            <p>
              We do not sell personal reader information to third parties. Emails are used strictly for chapter release alerts from followed authors, password resets, and essential security notifications.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
