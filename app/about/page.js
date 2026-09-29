'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { BookOpen, Users, Globe, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-3 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">{t.about}</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            StoryVault is a modern, responsive, and multilingual serialized storytelling platform built for community reading and creator empowerment.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">Our Mission</h3>
            <p>
              We believe great storytelling thrives in the open air of community. By enabling line-by-line paragraph reactions, reader badges, and author followings, StoryVault transforms solitary reading into a shared cultural experience.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">Mobile-First Progressive Web App</h3>
            <p>
              Rather than locking readers behind hefty app store downloads, StoryVault is built from the ground up as a high-performance Progressive Web App (PWA). Readers in Georgia, India, the United States, and across the globe can install it directly to their phones with one tap and read seamlessly anywhere.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
