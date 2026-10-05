'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';

export default function BlogArticlePage() {
  const params = useParams() || {};
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : (Array.isArray(rawSlug) ? rawSlug[0] : '');
  const { blogPosts } = useApp();

  const post = (blogPosts || []).find(p => p.slug === slug) || (blogPosts && blogPosts[0]) || null;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-black">Editorial Not Found</h1>
          <p className="text-xs text-slate-500">The requested article could not be located.</p>
          <Link href="/blog" className="px-5 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs">
            Back to Editorials
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-500 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Editorials
        </Link>

        <article className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-12 space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>By <strong>{post.author}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
            </div>
          </div>

          <div className="w-full h-80 rounded-2xl overflow-hidden relative">
            <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
            {post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Share this craft article:</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Article URL copied!');
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-brand-500"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
