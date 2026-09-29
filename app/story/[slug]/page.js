'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportModal from '@/components/ReportModal';
import { useApp } from '@/context/AppContext';
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  BookOpen, 
  Share2, 
  Check, 
  ShieldAlert, 
  UserPlus, 
  UserCheck, 
  Flag,
  ArrowRight
} from 'lucide-react';

export default function StoryDetailPage() {
  const params = useParams();
  const { slug } = params;
  const { stories, followingAuthors, followAuthor } = useApp();

  const [copiedShare, setCopiedShare] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const story = stories.find(s => s.slug === slug) || stories[0];
  const isFollowing = followingAuthors.includes(story.authorUsername);

  // Related stories from same genre
  const relatedStories = stories.filter(s => s.id !== story.id && s.genre === story.genre);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Story Hero Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Story Cover */}
          <div className="w-56 sm:w-64 aspect-[3/4] shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-100 dark:border-slate-800 relative">
            <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
            {story.isOriginal && (
              <span className="absolute top-3 left-3 bg-brand-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                HOUSE ORIGINAL
              </span>
            )}
          </div>

          {/* Story Details & CTAs */}
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg">
                  {story.genre}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {story.status === 'completed' ? '✓ Completed' : '⚡ Ongoing'}
                </span>
                {story.maturity === 'mature' && (
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                    18+ Mature
                  </span>
                )}
                {story.trope && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    {story.trope}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {story.title}
              </h1>

              {/* Author Row */}
              <div className="flex items-center gap-4 mt-4 pt-2">
                <Link href={`/profile/${story.authorUsername}`} className="flex items-center gap-2.5 group">
                  <img src={story.authorAvatar} alt={story.author} className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20" />
                  <div>
                    <p className="text-xs text-slate-400">Written by</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                      {story.author}
                    </p>
                  </div>
                </Link>

                <button 
                  onClick={() => followAuthor(story.authorUsername)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isFollowing 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200' 
                      : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                {/* Report button */}
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 ml-auto"
                  title="Report Content"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              </div>

              {/* Story Stats */}
              <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold"><Eye className="w-4 h-4 text-brand-500" /> {story.reads.toLocaleString()} Reads</span>
                <span className="flex items-center gap-1.5 font-semibold"><Heart className="w-4 h-4 text-rose-500" /> {story.votes.toLocaleString()} Votes</span>
                <span className="flex items-center gap-1.5 font-semibold"><MessageSquare className="w-4 h-4 text-indigo-500" /> {story.commentsCount.toLocaleString()} Comments</span>
                <span className="flex items-center gap-1.5 font-semibold"><BookOpen className="w-4 h-4 text-amber-500" /> {story.chapters.length} Chapters</span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-5 leading-relaxed">
                {story.description}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap mt-4">
                {story.tags.map((tag, i) => (
                  <Link 
                    key={i} 
                    href={`/browse?q=${tag}`} 
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Read & Share CTA Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Link 
                href={`/read/${story.slug}`} 
                className="px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Start Reading Chapter 1
              </Link>

              <button 
                onClick={handleShare}
                className="p-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Share Story"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Chapters Table of Contents */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black tracking-tight">Table of Contents</h2>
              <p className="text-xs text-slate-400 mt-0.5">{story.chapters.length} Published Serial Chapters</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Updated {story.lastUpdated}</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {story.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/read/${story.slug}`}
                className="flex items-center justify-between py-4 group hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    {chapter.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                      {chapter.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Published on {chapter.publishedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="hidden sm:inline">{chapter.reads.toLocaleString()} reads</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-black tracking-tight mb-6">More in {story.genre}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {relatedStories.slice(0, 4).map((rel) => (
                <Link key={rel.id} href={`/story/${rel.slug}`} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                  <img src={rel.cover} alt={rel.title} className="aspect-[3/4] object-cover group-hover:scale-105 transition-transform" />
                  <div className="p-3">
                    <h4 className="font-bold text-xs truncate group-hover:text-brand-500">{rel.title}</h4>
                    <p className="text-[11px] text-slate-400">By {rel.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="story"
        reportedUser={story.authorUsername}
        storyTitle={story.title}
      />

      <Footer />
    </div>
  );
}
