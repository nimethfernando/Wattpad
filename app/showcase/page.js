'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookShowcaseView from '@/components/BookShowcaseView';
import { DeletedPageGate } from '@/components/ManagedPageBanner';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white">
      <Header />
      <DeletedPageGate pageKey="showcase" title="Immersive Story Showcase">
        <main className="flex-1">
          <BookShowcaseView />
        </main>
      </DeletedPageGate>
      <Footer />
    </div>
  );
}
