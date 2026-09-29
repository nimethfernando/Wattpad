'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { 
  PenTool, 
  Save, 
  Sparkles, 
  Eye, 
  Heart, 
  MessageSquare, 
  CheckCircle, 
  BarChart3, 
  BookOpen, 
  Calendar, 
  Plus, 
  Clock, 
  AlertCircle,
  Trash2,
  ArrowUpDown,
  Edit,
  FolderOpen
} from 'lucide-react';

export default function AuthorStudio() {
  const router = useRouter();
  const { genres, stories, setStories, deleteStory, user, publishStory, t } = useApp();
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'stories' | 'analytics'

  // Story Form State
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('fantasy');
  const [maturity, setMaturity] = useState('everyone');
  const [language, setLanguage] = useState('en');
  const [copyright, setCopyright] = useState('All Rights Reserved');
  const [tagsInput, setTagsInput] = useState('magic, serialized, mystery');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');

  // Chapter Content
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [publishStatus, setPublishStatus] = useState('published'); // 'draft' | 'published' | 'scheduled'
  const [autoSaved, setAutoSaved] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Author stories
  const myStories = stories.filter(s => s.authorUsername === user?.username || s.author === user?.name);

  // Trigger simulated auto-save on typing
  const handleContentChange = (e) => {
    setChapterContent(e.target.value);
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!storyTitle.trim() || !chapterContent.trim()) {
      alert('Please provide a Story Title and Chapter Content.');
      return;
    }

    const slug = storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const paragraphs = chapterContent.split('\n\n').filter(p => p.trim() !== '').map((text, idx) => ({
      id: idx + 1,
      text: text.trim(),
      comments: []
    }));

    const newStory = {
      id: Date.now(),
      slug,
      title: storyTitle,
      author: user?.name || "Author",
      authorUsername: user?.username || "author",
      authorAvatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      genre: genres.find(g => g.slug === selectedGenre)?.name || "Fantasy",
      genreSlug: selectedGenre,
      cover: coverUrl,
      description: storyDescription || "A thrilling serialized narrative updated weekly.",
      status: "ongoing",
      language,
      maturity,
      isOriginal: user?.role === 'admin',
      isEditorsPick: false,
      isTrending: true,
      reads: 1,
      votes: 1,
      commentsCount: 0,
      lastUpdated: "Just now",
      tags: tagsInput.split(',').map(s => s.trim()),
      copyright,
      chapters: [
        {
          id: Date.now() + 1,
          number: 1,
          title: chapterTitle || "Chapter 1",
          publishedAt: new Date().toISOString().split('T')[0],
          reads: 1,
          votes: 1,
          paragraphs
        }
      ]
    };

    publishStory(newStory);
    setPublishSuccess(true);
    setTimeout(() => {
      router.push(`/story/${slug}`);
    }, 1500);
  };

  const handleReorderChapters = (storyId) => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return {
          ...s,
          chapters: [...s.chapters].reverse()
        };
      }
      return s;
    }));
    alert('Chapter order updated!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Author Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Author Studio & Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Create & Manage Serial Stories</h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'editor' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Studio Editor
            </button>
            <button 
              onClick={() => setActiveTab('stories')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'stories' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" /> My Serials ({myStories.length})
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Creator Analytics
            </button>
          </div>
        </div>

        {/* TAB 1: STUDIO EDITOR */}
        {activeTab === 'editor' && (
          <form onSubmit={handlePublish} className="grid lg:grid-cols-12 gap-8 mt-8">
            {/* Writing Workspace */}
            <div className="lg:col-span-8 space-y-5">
              {publishSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Story and Chapter published successfully! Redirecting...
                </div>
              )}

              {/* Story Title & Chapter */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Story Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Crown of Thorns & Neon"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    required
                    className="w-full text-xl font-black px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Chapter 1 Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chapter 1: The Gathering Storm"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="w-full text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Chapter Writing Canvas with Auto-Save */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Chapter Body (Paragraphs)
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    {autoSaved ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Auto-saved draft
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Auto-save active
                      </span>
                    )}
                  </div>
                </div>

                <textarea 
                  rows={16}
                  placeholder="Begin drafting your serialized chapter here. Separate paragraphs with double newlines — each paragraph will automatically become an interactive discussion anchor for your readers!"
                  value={chapterContent}
                  onChange={handleContentChange}
                  required
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500 font-serif text-base leading-relaxed"
                />

                <p className="text-[11px] text-slate-400">
                  Word count: ~{chapterContent.trim() ? chapterContent.trim().split(/\s+/).length : 0} words
                </p>
              </div>

              {/* Publishing Bar */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <select 
                    value={publishStatus}
                    onChange={(e) => setPublishStatus(e.target.value)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                    <option value="scheduled">Schedule Release</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" /> {t.publishChapter}
                </button>
              </div>
            </div>

            {/* Right: Story Settings Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Story Settings</h3>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Cover Image URL</label>
                  <input 
                    type="url" 
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none"
                  />
                  <div className="mt-2 w-24 aspect-[3/4] rounded-lg overflow-hidden border">
                    <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Description / Hook</label>
                  <textarea 
                    rows={3}
                    placeholder="Hook readers in 2-3 sentences..."
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                {/* Genre Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary Genre</label>
                  <select 
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    {genres.map(g => (
                      <option key={g.id} value={g.slug}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Maturity Rating */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Maturity Level</label>
                  <select 
                    value={maturity}
                    onChange={(e) => setMaturity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    <option value="everyone">Everyone (All Ages)</option>
                    <option value="mature">Mature 18+ (Age Gate Triggered)</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tags & Tropes (comma-separated)</label>
                  <input 
                    type="text" 
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                {/* Copyright */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Copyright License</label>
                  <select 
                    value={copyright}
                    onChange={(e) => setCopyright(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    <option value="All Rights Reserved">All Rights Reserved</option>
                    <option value="Creative Commons (CC-BY)">Creative Commons</option>
                    <option value="Public Domain">Public Domain</option>
                  </select>
                </div>
              </div>

              {/* Guidelines helper card */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300">Creator Standards</h4>
                  <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                    Serialized stories that maintain consistent weekly release schedules receive featured carousels and eligibility for Golden Quill awards.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: MY SERIALS (Manage, Delete, Reorder Chapters) */}
        {activeTab === 'stories' && (
          <div className="mt-8 space-y-6">
            <h3 className="font-black text-lg">Manage Your Published Serials</h3>

            {myStories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold">No serial stories yet</h4>
                <p className="text-xs text-slate-500 mt-1">Use the Studio Editor tab to write your very first chapter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myStories.map(s => (
                  <div key={s.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={s.cover} alt={s.title} className="w-14 aspect-[3/4] object-cover rounded-xl" />
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 uppercase">{s.genre}</span>
                        <h4 className="font-black text-base text-slate-900 dark:text-white">{s.title}</h4>
                        <p className="text-xs text-slate-400">{s.chapters.length} Chapters • {s.reads.toLocaleString()} Reads • {s.votes.toLocaleString()} Votes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleReorderChapters(s.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" /> Reorder Chapters
                      </button>
                      <Link 
                        href={`/story/${s.slug}`}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200"
                      >
                        View Public Page
                      </Link>
                      <button 
                        onClick={() => deleteStory(s.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATOR ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Total Chapter Reads</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">142,500</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">↑ 18.4% this week</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Total Votes Received</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">9,840</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">↑ 9.2% this week</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Inline Annotations</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">1,320</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">94 new today</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-bold">Follower Base</span>
                <p className="text-2xl sm:text-3xl font-black mt-2">4,890</p>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 block">↑ 310 this month</span>
              </div>
            </div>

            {/* Audience Geography & Top Chapters */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Audience Country Breakdown</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>United States</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>India</span>
                      <span>28%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>Georgia</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold pb-1">
                      <span>United Kingdom & Other</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing Chapters */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Top Performing Chapters</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold">The Shadow Alchemist • Chapter 1</p>
                      <p className="text-[11px] text-slate-400">The Whispering Observatory</p>
                    </div>
                    <span className="font-bold text-brand-600">45,200 reads</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold">The Shadow Alchemist • Chapter 2</p>
                      <p className="text-[11px] text-slate-400">Pact of Mercury and Bone</p>
                    </div>
                    <span className="font-bold text-brand-600">38,900 reads</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
