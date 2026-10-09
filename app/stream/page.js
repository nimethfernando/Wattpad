'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookShowcaseView from '@/components/BookShowcaseView';

export default function StreamPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white">
      <Header />
      <main className="flex-1">
        <BookShowcaseView />
      </main>
      <Footer />
    </div>
  );
}
