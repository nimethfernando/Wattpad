'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeFeedView from '@/components/HomeFeedView';

export default function HomeFeedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HomeFeedView />
      </main>
      <Footer />
    </div>
  );
}

