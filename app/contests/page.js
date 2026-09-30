'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { 
  Trophy, 
  Calendar, 
  Award, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Star, 
  Heart, 
  ThumbsUp, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

function ContestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { contests, stories, user, t } = useApp();

  const tabParam = searchParams.get('tab') || 'open';
  const [activeTab, setActiveTab] = useState(tabParam); // 'open' | 'voting' | 'winners'
  const [selectedContest, setSelectedContest] = useState(contests[0]);
  const [submissionStoryId, setSubmissionStoryId] = useState(stories[0]?.id || '');
  const [submitted, setSubmitted] = useState(false);

  // Community Entries for Voting (Scope 4)
  const [nominatedEntries, setNominatedEntries] = useState([
    {
      id: 1,
      contestId: 1,
      storyTitle: "The Shadow Alchemist",
      author: "Elena Vance",
      category: "Best Dark Fantasy Novel",
      votes: 1420,
      hasVoted: false,
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
      slug: "the-shadow-alchemist"
    },
    {
      id: 2,
      contestId: 1,
      storyTitle: "Neon Gods of Neo-Tokyo",
      author: "Astra Quill",
      category: "Best Sci-Fi & Cyberpunk",
      votes: 980,
      hasVoted: false,
      cover: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80",
      slug: "neon-gods-of-neo-tokyo"
    },
    {
      id: 3,
      contestId: 1,
      storyTitle: "Whispers of the Heart",
      author: "Maya Lin",
      category: "Best Contemporary Romance",
      votes: 840,
      hasVoted: false,
      cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
      slug: "whispers-of-the-heart"
    },
    {
      id: 4,
      contestId: 2,
      storyTitle: "Midnight in St. Jude",
      author: "Julian Cross",
      category: "Best Paranormal Mystery",
      votes: 610,
      hasVoted: false,
      cover: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=400&q=80",
      slug: "midnight-in-st-jude"
    }
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', tab);
      router.push(`/contests?${params.toString()}`);
    }
  };

  const handleVoteEntry = (entryId) => {
    setNominatedEntries(prev => prev.map(entry => {
      if (entry.id === entryId && !entry.hasVoted) {
        return {
          ...entry,
          votes: entry.votes + 1,
          hasVoted: true
        };
      }
      return entry;
    }));
  };

  const handleSubmitEntry = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-brand-600 to-purple-700 p-8 sm:p-12 text-white shadow-xl mb-10">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5 text-amber-300" /> StoryVault Awards & Competitions
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">The Watty-Style Annual Writing Contests</h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Submit your serialized novel to our annual competitions. Win cash grants, official winner badges, and editorial publishing consideration.
            </p>
          </div>
        </div>

        {/* Tab Controls: Open Competitions, Community Voting & Past Winners */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 overflow-x-auto">
          <button 
            onClick={() => handleTabChange('open')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'open' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Trophy className="w-4 h-4" /> Open Competitions ({contests.length})
          </button>
          <button 
            onClick={() => handleTabChange('voting')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'voting' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <ThumbsUp className="w-4 h-4 text-rose-400" /> Community Voting ({nominatedEntries.length} Nominees)
          </button>
          <button 
            onClick={() => handleTabChange('winners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'winners' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" /> Past Winners Showcase
          </button>
        </div>

        {/* TAB 1: OPEN COMPETITIONS */}
        {activeTab === 'open' && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Contest Cards */}
            <div className="lg:col-span-8 space-y-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Open & Active Competitions</h3>
              
              {contests.map((c) => (
                <div 
                  key={c.id} 
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border transition-all ${
                    selectedContest.id === c.id 
                      ? 'border-brand-500 shadow-xl' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600">
                        {c.status.toUpperCase()}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black mt-2 text-slate-900 dark:text-white">{c.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{c.tagline}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">Submission Deadline</span>
                      <span className="text-xs font-bold text-rose-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.deadline}</span>
                    </div>
                  </div>

                  <div className="py-4 space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Categories</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {c.categories.map((cat, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Prizes & Awards</span>
                      <p className="font-bold text-brand-600 dark:text-brand-400 mt-0.5">{c.prize}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{c.entriesCount} stories entered so far</span>
                    <button 
                      onClick={() => setSelectedContest(c)}
                      className="px-5 py-2 rounded-full bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors"
                    >
                      Enter This Contest
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submission Form Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-black text-base">Submit Your Serial Novel</h3>
                <p className="text-xs text-slate-500">
                  Selected Contest: <strong className="text-slate-900 dark:text-white">{selectedContest.title}</strong>
                </p>

                {submitted && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Entry submitted for jury evaluation and community voting!
                  </div>
                )}

                <form onSubmit={handleSubmitEntry} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Select Story from Your Portfolio</label>
                    <select 
                      value={submissionStoryId}
                      onChange={(e) => setSubmissionStoryId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                    >
                      {stories.map(s => (
                        <option key={s.id} value={s.id}>{s.title} ({s.chapters.length} Ch.)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Target Category</label>
                    <select className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none">
                      {selectedContest.categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/25 transition-all"
                    >
                      Submit Story Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMMUNITY VOTING & ENTRIES (Scope 4) */}
        {activeTab === 'voting' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Vote for Contest Nominees</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Readers cast their votes to determine the Readers' Choice Laureate for this year's awards.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900">
                1 Vote Per Reader / Category
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nominatedEntries.map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all group">
                  <div className="aspect-[3/4] w-full overflow-hidden relative">
                    <img src={entry.cover} alt={entry.storyTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-400">
                      {entry.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{entry.storyTitle}</h4>
                      <p className="text-xs text-slate-400">By {entry.author}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {entry.votes.toLocaleString()}
                      </span>

                      <button 
                        onClick={() => handleVoteEntry(entry.id)}
                        disabled={entry.hasVoted}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          entry.hasVoted 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-brand-500 hover:bg-brand-600 text-white'
                        }`}
                      >
                        {entry.hasVoted ? '✓ Voted' : 'Vote Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WINNERS SHOWCASE (Scope 4: Winners Page) */}
        {activeTab === 'winners' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto mb-6">
              <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <h2 className="text-2xl font-black">Official Contest Laureates</h2>
              <p className="text-xs text-slate-400">Award-winning serialized novels as selected by the editorial jury and community vote.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {contests.filter(c => c.winners && c.winners.length > 0).map(c => (
                <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-base">{c.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
                      HALL OF FAME
                    </span>
                  </div>

                  <div className="space-y-3">
                    {c.winners.map((w, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-amber-600 block text-[10px] uppercase">{w.category}</span>
                          <h4 className="font-extrabold text-sm">{w.story}</h4>
                          <p className="text-slate-400 text-[11px]">By {w.author}</p>
                        </div>
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function ContestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-xs text-slate-500 font-bold">Loading Contests & Awards...</p>
      </div>
    }>
      <ContestsContent />
    </Suspense>
  );
}
