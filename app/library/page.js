'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { 
  BookMarked, 
  BookOpen, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Heart, 
  Eye, 
  Share2,
  FolderPlus
} from 'lucide-react';

export default function LibraryPage() {
  const { 
    stories, 
    library, 
    removeFromLibrary, 
    readingLists, 
    createReadingList, 
    readingProgress, 
    user, 
    openAuthModal, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'lists' | 'archive'
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter stories in user library
  const libraryStories = stories.filter(s => library.includes(s.id));

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    createReadingList(newListTitle.trim(), newListDesc.trim(), []);
    setNewListTitle('');
    setNewListDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Library Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-amber-600 to-purple-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              <BookMarked className="w-3.5 h-3.5" /> Personal Bookshelf
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Library & Reading Lists</h1>
            <p className="text-white/90 text-xs sm:text-sm">
              Keep track of ongoing serials, resume right where you left off, and curate custom themed collections.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'library'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Current Reads ({libraryStories.length})
            </button>
            <button
              onClick={() => setActiveTab('lists')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'lists'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <BookMarked className="w-4 h-4" /> Reading Lists ({readingLists.length})
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'archive'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Archive / Finished
            </button>
          </div>

          {activeTab === 'lists' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Reading List
            </button>
          )}
        </div>

        {/* TAB 1: CURRENT READS (LIBRARY) */}
        {activeTab === 'library' && (
          <div>
            {libraryStories.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-500 mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black">Your Library is Empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Explore trending serialized stories and tap "Add to Library" to save them here with automated chapter update alerts!
                </p>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 hover:bg-brand-600"
                >
                  Explore Trending Novels <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {libraryStories.map((story) => {
                  const progress = readingProgress[story.id] || { chapterId: story.chapters[0]?.id, paragraphIndex: 0 };
                  const chapterIndex = story.chapters.findIndex(c => c.id === progress.chapterId);
                  const currentChNum = chapterIndex >= 0 ? chapterIndex + 1 : 1;
                  const totalCh = story.chapters.length || 1;
                  const percent = Math.min(100, Math.round((currentChNum / totalCh) * 100));

                  return (
                    <div 
                      key={story.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      <div className="flex gap-4">
                        <Link href={`/story/${story.slug}`} className="shrink-0">
                          <img 
                            src={story.cover} 
                            alt={story.title}
                            className="w-24 sm:w-28 aspect-[3/4] object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                                {story.genre}
                              </span>
                              {story.ranking && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                                  #{story.ranking.rank} in {story.ranking.tag}
                                </span>
                              )}
                            </div>
                            <Link href={`/story/${story.slug}`}>
                              <h3 className="font-extrabold text-base line-clamp-1 group-hover:text-brand-500 transition-colors mt-0.5">
                                {story.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-slate-400">By {story.author}</p>
                          </div>

                          {/* Reading Progress Indicator */}
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-500">Ch. {currentChNum} of {totalCh}</span>
                              <span className="text-brand-600 dark:text-brand-400">{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link 
                          href={`/read/${story.slug}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Continue Reading
                        </Link>

                        <button
                          onClick={() => removeFromLibrary(story.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove from Library"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: READING LISTS */}
        {activeTab === 'lists' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {readingLists.map((list) => {
                const listStories = stories.filter(s => list.storyIds.includes(s.id));
                return (
                  <div 
                    key={list.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookMarked className="w-4 h-4 text-brand-500" />
                          <h3 className="font-extrabold text-base">{list.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{list.description}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {listStories.length} Stories
                      </span>
                    </div>

                    {/* Book Covers Collage */}
                    <div className="flex items-center gap-3 overflow-x-auto py-2">
                      {listStories.map((story) => (
                        <Link key={story.id} href={`/story/${story.slug}`} className="shrink-0 group">
                          <img 
                            src={story.cover} 
                            alt={story.title} 
                            className="w-16 aspect-[3/4] object-cover rounded-xl shadow group-hover:scale-105 transition-transform" 
                          />
                        </Link>
                      ))}
                      {listStories.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-4">No stories added to this list yet.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ARCHIVE */}
        {activeTab === 'archive' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-lg">Completed & Archived Serials</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Completed novels you have finished reading will be preserved here for rereading and review.
            </p>
          </div>
        )}

      </main>

      {/* CREATE READING LIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-black text-xl">Create New Reading List</h3>
            <form onSubmit={handleCreateList} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">List Title</label>
                <input 
                  type="text" 
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="e.g. Best Enemies to Lovers 2026"
                  required
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Description (Optional)</label>
                <textarea 
                  rows={3}
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Describe the mood, tropes, or theme of this list..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/25"
                >
                  Create List
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 rounded-full border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
