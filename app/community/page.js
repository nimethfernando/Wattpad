'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportModal from '@/components/ReportModal';
import Pagination from '@/components/Pagination';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  BookMarked, 
  Sparkles, 
  Flame, 
  Plus, 
  Share2, 
  ShieldCheck, 
  Award, 
  Send, 
  Check, 
  Flag,
  ArrowUpDown
} from 'lucide-react';

export default function CommunityPage() {
  const { communitySpaces, readingLists, setReadingLists, createReadingList, stories, user, t } = useApp();
  const [activeTab, setActiveTab] = useState('spaces'); // 'spaces' | 'lists' | 'badges'

  // Pagination states
  const [threadPage, setThreadPage] = useState(1);
  const [threadPageSize, setThreadPageSize] = useState(4);
  const [listPage, setListPage] = useState(1);
  const [listPageSize, setListPageSize] = useState(4);
  
  // Discussion thread creation state
  const [selectedSpace, setSelectedSpace] = useState(communitySpaces[0]);
  const [threads, setThreads] = useState([
    {
      id: 1,
      spaceSlug: "fantasy-worldbuilders",
      author: "ArcaneWriter",
      title: "Hard vs Soft Magic: How to keep serialized readers guessing?",
      content: "When releasing weekly chapters, how much of your magic system's rules do you lay out upfront vs unveiling through character trials?",
      replies: 18,
      likes: 42,
      time: "2 hours ago"
    },
    {
      id: 2,
      spaceSlug: "romance-tropes",
      author: "MayaHeart",
      title: "The art of the chapter-ending romantic cliffhanger",
      content: "What's the best way to pause a tension-filled scene without frustrating the readers until next Tuesday's chapter drop?",
      replies: 34,
      likes: 89,
      time: "5 hours ago"
    }
  ]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);

  // Reading List Creation State
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [selectedStoryIds, setSelectedStoryIds] = useState([stories[0]?.id || 1]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportedThreadTitle, setReportedThreadTitle] = useState('');

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setThreads([
      {
        id: Date.now(),
        spaceSlug: selectedSpace.slug,
        author: user?.name || "Community Member",
        title: newThreadTitle.trim(),
        content: newThreadContent.trim(),
        replies: 0,
        likes: 1,
        time: "Just now"
      },
      ...threads
    ]);

    setNewThreadTitle('');
    setNewThreadContent('');
    setShowNewThreadModal(false);
  };

  const handleCreateReadingList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createReadingList(newListName.trim(), newListDesc.trim(), selectedStoryIds);
    setNewListName('');
    setNewListDesc('');
    setShowCreateListModal(false);
  };

  const handleReverseOrder = (listId) => {
    setReadingLists(prev => prev.map(l => {
      if (l.id === listId) {
        return {
          ...l,
          storyIds: [...l.storyIds].reverse()
        };
      }
      return l;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Community Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-amber-600 to-rose-600 p-6 sm:p-12 text-white shadow-xl mb-8 sm:mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              <Users className="w-3.5 h-3.5" /> Fandom Spaces & Discussion
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">The Avora Library Community</h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Connect with fellow serialized readers, curate public reading lists, debate character theories in fandom spaces, and earn achievement badges.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full sm:w-auto">
            <button 
              onClick={() => setShowNewThreadModal(true)}
              className="flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-lg hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
            >
              + Start Discussion
            </button>
            <button 
              onClick={() => setShowCreateListModal(true)}
              className="flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white border border-white/20 font-bold text-xs sm:text-sm hover:bg-slate-900 transition-all shrink-0 cursor-pointer"
            >
              + Create Reading List
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scrollbar-none border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 sm:mb-8">
          <button 
            onClick={() => setActiveTab('spaces')}
            className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'spaces' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" /> Fandom Spaces
          </button>
          <button 
            onClick={() => setActiveTab('lists')}
            className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lists' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <BookMarked className="w-4 h-4" /> Public Reading Lists
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'badges' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Award className="w-4 h-4" /> Badges & Recognition
          </button>
        </div>

        {/* TAB 1: FANDOM SPACES */}
        {activeTab === 'spaces' && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Spaces Selector */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Admin-Created Fandom Spaces</h3>
              <div className="space-y-2">
                {communitySpaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => setSelectedSpace(space)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedSpace.id === space.id
                        ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{space.title}</h4>
                      <span className="text-[11px] text-slate-400">{space.membersCount.toLocaleString()} members</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{space.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Moderator: @{space.moderator}</span>
                      <span>{space.threadsCount} threads</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Space Discussions Feed */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="font-bold text-base">{selectedSpace.title} Threads</h3>
                <span className="text-xs text-slate-400 font-semibold">{threads.length} active topics</span>
              </div>

              <div className="space-y-4">
                {threads.slice((threadPage - 1) * threadPageSize, threadPage * threadPageSize).map((thread) => (
                  <div key={thread.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-200">@{thread.author}</span>
                      <div className="flex items-center gap-3">
                        <span>{thread.time}</span>
                        <button 
                          onClick={() => {
                            setReportedThreadTitle(thread.title);
                            setReportModalOpen(true);
                          }}
                          className="hover:text-rose-500" 
                          title="Report Thread"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{thread.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{thread.content}</p>
                    
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-500" /> {thread.likes} likes</span>
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> {thread.replies} replies</span>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={threadPage}
                totalItems={threads.length}
                pageSize={threadPageSize}
                onPageChange={setThreadPage}
                onPageSizeChange={(newSize) => {
                  setThreadPageSize(newSize);
                  setThreadPage(1);
                }}
                pageSizeOptions={[2, 4, 8]}
              />
            </div>
          </div>
        )}

        {/* TAB 2: READING LISTS */}
        {activeTab === 'lists' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base sm:text-lg">Public Community Reading Lists</h3>
                <p className="text-xs text-slate-400">Curated book collections created, reordered, and shared by readers</p>
              </div>
              <button 
                onClick={() => setShowCreateListModal(true)}
                className="self-start sm:self-auto px-4 py-2 rounded-full bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 shrink-0 cursor-pointer"
              >
                + Create New List
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {readingLists.slice((listPage - 1) * listPageSize, listPage * listPageSize).map((list) => (
                <div key={list.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-600 px-2 py-0.5 rounded-full">
                      {list.isPublic ? 'Public Reading List' : 'Private'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleReverseOrder(list.id)}
                        className="text-slate-400 hover:text-brand-500 text-xs flex items-center gap-1"
                        title="Reorder Stories"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" /> Reorder
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Reading list link copied to clipboard!');
                        }}
                        className="text-slate-400 hover:text-brand-500" 
                        title="Share List"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{list.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{list.description}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {list.storyIds.map((sid) => {
                      const st = stories.find(s => s.id === sid);
                      if (!st) return null;
                      return (
                        <Link key={st.id} href={`/story/${st.slug}`} className="w-14 aspect-[3/4] rounded-lg overflow-hidden border">
                          <img src={st.cover} alt={st.title} className="w-full h-full object-cover" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={listPage}
              totalItems={readingLists.length}
              pageSize={listPageSize}
              onPageChange={setListPage}
              onPageSizeChange={(newSize) => {
                setListPageSize(newSize);
                setListPage(1);
              }}
              pageSizeOptions={[2, 4, 8]}
            />
          </div>
        )}

        {/* TAB 3: BADGES & RECOGNITION */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-8">
              <Award className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h3 className="font-black text-2xl">Reader & Creator Badges</h3>
              <p className="text-xs text-slate-500 mt-1">Earn achievements for reading milestones, serialized publishing consistency, and insightful paragraph comments.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto font-black text-lg">
                  🏆
                </div>
                <h4 className="font-bold text-sm">Top Reader</h4>
                <p className="text-[11px] text-slate-500">Read over 100 chapters and voted on 50 serialized novels.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-500 flex items-center justify-center mx-auto font-black text-lg">
                  ✍️
                </div>
                <h4 className="font-bold text-sm">Rising Writer</h4>
                <p className="text-[11px] text-slate-500">Published 5 consecutive weekly chapters with 5,000+ reads.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center mx-auto font-black text-lg">
                  💬
                </div>
                <h4 className="font-bold text-sm">Inline Annotator</h4>
                <p className="text-[11px] text-slate-500">Contributed 50+ insightful line-by-line paragraph comments.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-500 flex items-center justify-center mx-auto font-black text-lg">
                  ⭐
                </div>
                <h4 className="font-bold text-sm">Watty Nominee</h4>
                <p className="text-[11px] text-slate-500">Official shortlist entrant in the Golden Quill Annual Awards.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Start Discussion Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-lg">Start a Community Thread</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Target Space</label>
              <select 
                value={selectedSpace.slug}
                onChange={(e) => setSelectedSpace(communitySpaces.find(s => s.slug === e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
              >
                {communitySpaces.map(s => (
                  <option key={s.id} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Thread Title</label>
              <input 
                type="text" 
                placeholder="What's on your mind regarding stories or writing?"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Discussion Content</label>
              <textarea 
                rows={4}
                placeholder="Share your theories, feedback, or worldbuilding ideas..."
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs leading-relaxed outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowNewThreadModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateThread}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
              >
                Post Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Reading List Modal */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-lg">Create Public Reading List</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">List Title</label>
              <input 
                type="text" 
                placeholder="e.g. Best Steampunk Serials"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
              <textarea 
                rows={2}
                placeholder="What makes this collection special?"
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs leading-relaxed outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Add Stories to List</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {stories.map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={selectedStoryIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStoryIds([...selectedStoryIds, s.id]);
                        } else {
                          setSelectedStoryIds(selectedStoryIds.filter(id => id !== s.id));
                        }
                      }}
                      className="accent-brand-500"
                    />
                    <span className="font-bold">{s.title}</span>
                    <span className="text-slate-400 text-[10px]">({s.genre})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowCreateListModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateReadingList}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
              >
                Publish Reading List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="thread"
        storyTitle={reportedThreadTitle}
      />

      <Footer />
    </div>
  );
}
