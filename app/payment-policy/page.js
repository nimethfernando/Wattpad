'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black mb-6">Payment Policy</h1>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            StoryVault is currently 100% free for all readers and serialized authors. There are no paid coin gates, subscriptions, or paywalled chapters required to read our catalog.
          </p>
          <p>
            Writing contest cash grants and editorial prizes are funded directly through official sponsorships and platform partnerships with zero deduction from authors.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
