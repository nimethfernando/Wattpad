'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';
import { useApp } from '@/context/AppContext';
import { Trophy, Calendar, Award, CheckCircle, Clock, ArrowRight, Sparkles, Star } from 'lucide-react';

export default function ContestsPage() {
  const { contests, stories, user, t } = useApp();
  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'winners'
  const [selectedContest, setSelectedContest] = useState(contests[0]);
  const [submissionStoryId, setSubmissionStoryId] = useState(stories[0]?.id || '');
  const [submitted, setSubmitted] = useState(false);

  // Pagination states
  const [contestPage, setContestPage] = useState(1);
  const [contestPageSize, setContestPageSize] = useState(2);
  const [winnerPage, setWinnerPage] = useState(1);
  const [winnerPageSize, setWinnerPageSize] = useState(2);

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
              <Trophy className="w-3.5 h-3.5 text-amber-300" /> Avora Library Awards & Competitions
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">The Watty-Style Annual Writing Contests</h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Submit your serialized novel to our annual competitions. Win cash grants, official badges, and editorial publishing consideration.
            </p>
          </div>
        </div>

        {/* Tab Controls: Open Competitions vs Winners Showcase */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
          <button 
            onClick={() => setActiveTab('open')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'open' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Trophy className="w-4 h-4" /> Open Competitions
          </button>
          <button 
            onClick={() => setActiveTab('winners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
              
              {contests.slice((contestPage - 1) * contestPageSize, contestPage * contestPageSize).map((c) => (
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
                      <span className="text-[11px] text-slate-400 block">Deadline</span>
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

              <Pagination
                currentPage={contestPage}
                totalItems={contests.length}
                pageSize={contestPageSize}
                onPageChange={setContestPage}
                onPageSizeChange={(newSize) => {
                  setContestPageSize(newSize);
                  setContestPage(1);
                }}
                pageSizeOptions={[2, 4, 8]}
              />
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
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Entry submitted for jury evaluation!
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

        {/* TAB 2: WINNERS SHOWCASE (Scope 4: Winners Page) */}
        {activeTab === 'winners' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto mb-6">
              <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <h2 className="text-2xl font-black">Official Contest Laureates</h2>
              <p className="text-xs text-slate-400">Award-winning serialized novels as selected by the editorial jury and community vote.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {contests.filter(c => c.winners && c.winners.length > 0)
                .slice((winnerPage - 1) * winnerPageSize, winnerPage * winnerPageSize)
                .map(c => (
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

            <Pagination
              currentPage={winnerPage}
              totalItems={contests.filter(c => c.winners && c.winners.length > 0).length}
              pageSize={winnerPageSize}
              onPageChange={setWinnerPage}
              onPageSizeChange={(newSize) => {
                setWinnerPageSize(newSize);
                setWinnerPage(1);
              }}
              pageSizeOptions={[2, 4, 8]}
            />
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
