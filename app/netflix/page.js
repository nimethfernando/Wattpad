'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NetflixView from '@/components/NetflixView';

export default function NetflixPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white">
      <Header />
      <main className="flex-1">
        <NetflixView />
      </main>
      <Footer />
    </div>
  );
}

