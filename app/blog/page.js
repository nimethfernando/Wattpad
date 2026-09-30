'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { BookOpen, Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { blogPosts, t } = useApp();

  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 4;

  const updatePage = (newPage) => {
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('page', newPage.toString());
      router.push(`/blog?${params.toString()}`);
    }
  };

  const totalPages = Math.ceil(blogPosts.length / itemsPerPage) || 1;
  const paginatedPosts = blogPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Blog Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Editorials & Insights</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">{t.blog}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Writing craft techniques, serialization strategies, and platform announcements.
          </p>
        </div>

        {/* Blog Articles Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {paginatedPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div className="h-60 w-full overflow-hidden relative">
                <img 
                  src={post.cover} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white">
                  {post.category}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">By {post.author}</span>
                  <Link href={`/blog/${post.slug}`} className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Blog Pagination (Scope 10) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-12 pb-4">
            <button 
              onClick={() => updatePage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => updatePage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button 
              onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-xs text-slate-500 font-bold">Loading Editorials...</p>
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}
