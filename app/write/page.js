'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  FolderOpen,
  Image as ImageIcon,
  Layers,
  FileText,
  Building2,
  X,
  HelpCircle,
  ChevronRight,
  Hash
} from 'lucide-react';
import { AGE_RATINGS, AGE_THRESHOLDS } from '@/lib/agePolicy';

function insertFormatIntoText(currentText, setText, prefix, defaultPlaceholder = '', isBreak = false, suffix = '') {
  if (isBreak) {
    const divider = currentText.endsWith('\n\n') ? '* * *\n\n' : (currentText ? '\n\n* * *\n\n' : '* * *\n\n');
    setText(currentText + divider);
    return;
  }
  if (suffix) {
    const insertion = `${prefix}${defaultPlaceholder}${suffix}`;
    setText(currentText ? `${currentText} ${insertion}` : insertion);
    return;
  }
  const lead = currentText ? (currentText.endsWith('\n\n') ? '' : currentText.endsWith('\n') ? '\n' : '\n\n') : '';
  const insertion = `${lead}${prefix}${defaultPlaceholder}\n\n`;
  setText(currentText + insertion);
}

function BookFormattingToolbar({ onInsert, showGuide, setShowGuide }) {
  return (
    <div className="space-y-2 mb-3">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => onInsert('## ', 'Scene Title')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
            title="Insert Subheading (Scene Title)"
          >
            <span className="font-mono text-[10px] opacity-70">##</span> Subheading
          </button>

          <button
            type="button"
            onClick={() => onInsert('### ', 'Location, Time or POV')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
            title="Insert Section Header (Location/Time/POV)"
          >
            <span className="font-mono text-[10px] opacity-70">###</span> Section
          </button>

          <button
            type="button"
            onClick={() => onInsert('\n\n* * *\n\n', '', true)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
            title="Insert Scene Break Divider (✦ ✦ ✦)"
          >
            ✦ Scene Break
          </button>

          <span className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></span>

          <button
            type="button"
            onClick={() => onInsert('**', 'bold text', false, '**')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-600 shadow-2xs transition-all cursor-pointer"
            title="Bold Text"
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            onClick={() => onInsert('*', 'italic text', false, '*')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 italic font-serif text-xs border border-slate-200 dark:border-slate-600 shadow-2xs transition-all cursor-pointer"
            title="Italic Text"
          >
            <em>I</em>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Formatting Tips</span>
        </button>
      </div>

      {showGuide && (
        <div className="p-3 bg-brand-500/10 dark:bg-brand-950/40 border border-brand-500/20 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold text-brand-700 dark:text-brand-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Book Formatting Guide
            </span>
            <button type="button" onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">📌 Subheadings & Sections:</p>
              <p>Type <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600 font-mono">## Scene Title</code> on a new line for scene subheadings.</p>
              <p>Type <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600 font-mono">### Time/Place</code> for section timestamps & POV.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">✨ Scene Breaks & Text:</p>
              <p>Type <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-amber-600 font-mono">* * *</code> or <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-amber-600 font-mono">---</code> for a book ornament (✦ ✦ ✦).</p>
              <p>Use <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-200 font-mono">**bold**</code> and <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-200 font-mono">*italics*</code> in paragraphs.</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic">Separate paragraphs with double Enter — each paragraph gets its own reader comment bubble!</p>
        </div>
      )}
    </div>
  );
}

export default function AuthorStudio() {
  const router = useRouter();
  const { genres, stories, setStories, deleteStory, user, publishStory, addChapterToStory, updateStory, openBankDetailsModal, t } = useApp();
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'stories' | 'analytics'

  // Author stories
  const myStories = stories.filter(s => s.authorUsername === user?.username || s.author === user?.name);

  // Studio Mode: Create a brand new story OR serialize another chapter to existing story
  const [editorMode, setEditorMode] = useState('new_story'); // 'new_story' | 'add_chapter'
  const [selectedExistingStoryId, setSelectedExistingStoryId] = useState('');
  const [existingChapterNumber, setExistingChapterNumber] = useState(2);
  const [existingChapterTitle, setExistingChapterTitle] = useState('');
  const [existingChapterContent, setExistingChapterContent] = useState('');
  const [existingPages, setExistingPages] = useState([
    {
      pageNumber: 1,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      caption: 'Page 1',
      text: ''
    }
  ]);
  const [existingPublishSuccess, setExistingPublishSuccess] = useState(false);
  const [existingPublishing, setExistingPublishing] = useState(false);
  const [showExistingGuide, setShowExistingGuide] = useState(false);

  // Story Form State (New Story)
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('fantasy');
  const [contentType, setContentType] = useState('story'); // 'story' | 'picture_book'
  const [ageRating, setAgeRating] = useState('13+');
  const [maturity, setMaturity] = useState('everyone');
  const [language, setLanguage] = useState('en');
  const [copyright, setCopyright] = useState('All Rights Reserved');
  const [tagsInput, setTagsInput] = useState('magic, serialized, mystery');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
  const [showFormattingGuide, setShowFormattingGuide] = useState(false);

  // Modal State: "+ Add Chapter" from My Serials tab
  const [addChapterModalOpen, setAddChapterModalOpen] = useState(false);
  const [targetStoryForChapter, setTargetStoryForChapter] = useState(null);
  const [modalChapterNumber, setModalChapterNumber] = useState(2);
  const [modalChapterTitle, setModalChapterTitle] = useState('');
  const [modalChapterContent, setModalChapterContent] = useState('');
  const [modalPages, setModalPages] = useState([]);
  const [modalPublishSuccess, setModalPublishSuccess] = useState(false);
  const [modalPublishing, setModalPublishing] = useState(false);
  const [modalShowGuide, setModalShowGuide] = useState(false);

  // Picture Book Pages (One by one image uploading)
  const [pages, setPages] = useState([
    {
      pageNumber: 1,
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      caption: 'The Journey Begins',
      text: 'Deep in the heart of the enchanted forest, a tiny spark of starlight fell to the mossy ground.'
    }
  ]);

  const addPage = () => {
    setPages(prev => [
      ...prev,
      {
        pageNumber: prev.length + 1,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        caption: `Page ${prev.length + 1}`,
        text: ''
      }
    ]);
  };

  const removePage = (indexToRemove) => {
    if (pages.length <= 1) {
      alert('Picture books must have at least 1 page.');
      return;
    }
    setPages(prev => prev.filter((_, idx) => idx !== indexToRemove).map((p, idx) => ({ ...p, pageNumber: idx + 1 })));
  };

  const updatePage = (index, field, value) => {
    setPages(prev => prev.map((p, idx) => idx === index ? { ...p, [field]: value } : p));
  };

  // Chapter Content (For standard text novels)
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [publishStatus, setPublishStatus] = useState('published'); // 'draft' | 'published' | 'scheduled'
  const [autoSaved, setAutoSaved] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Trigger simulated auto-save on typing
  const handleContentChange = (e) => {
    setChapterContent(e.target.value);
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (contentType === 'story' && (!storyTitle.trim() || !chapterContent.trim())) {
      alert('Please provide a Story Title and Chapter Content.');
      return;
    }

    if (contentType === 'picture_book' && (!storyTitle.trim() || pages.length === 0)) {
      alert('Please provide a Story Title and at least one Illustrated Page.');
      return;
    }

    const slug = storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const paragraphs = chapterContent.split('\n\n').filter(p => p.trim() !== '').map((text, idx) => ({
      id: idx + 1,
      text: text.trim(),
      comments: []
    }));

    const minAge = AGE_THRESHOLDS[ageRating] || 13;
    const targetAudience = ageRating === '3+' 
      ? 'Toddlers & Early Readers' 
      : ageRating === '7+' 
      ? 'Children & Family' 
      : ageRating === '13+' 
      ? 'Young Adult' 
      : ageRating === '16+' 
      ? 'Older Teens & Adults' 
      : 'Mature Adults (18+)';

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
      maturity: ageRating === '18+' ? 'mature' : maturity,
      ageRating,
      minAge,
      contentType,
      targetAudience,
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
          title: chapterTitle || (contentType === 'picture_book' ? "Illustrated Edition" : "Chapter 1"),
          publishedAt: new Date().toISOString().split('T')[0],
          reads: 1,
          votes: 1,
          paragraphs: contentType === 'story' ? paragraphs : [],
          pages: contentType === 'picture_book' ? pages : []
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
    const target = stories.find(s => s.id === storyId);
    if (target) {
      const updated = {
        ...target,
        chapters: [...target.chapters].reverse()
      };
      updateStory(updated);
      alert('Chapter order updated!');
    }
  };

  const handleOpenAddChapterModal = (story) => {
    setTargetStoryForChapter(story);
    const nextNum = (story.chapters?.length || 0) + 1;
    setModalChapterNumber(nextNum);
    setModalChapterTitle(`Chapter ${nextNum}: `);
    setModalChapterContent('');
    setModalPages([
      {
        pageNumber: 1,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        caption: `Chapter ${nextNum} - Page 1`,
        text: ''
      }
    ]);
    setModalPublishSuccess(false);
    setAddChapterModalOpen(true);
  };

  const handleModalPublishChapter = async (e) => {
    e.preventDefault();
    if (!targetStoryForChapter) return;

    if (targetStoryForChapter.contentType === 'picture_book') {
      if (modalPages.length === 0) {
        alert('Please add at least one page for this picture book chapter.');
        return;
      }
    } else {
      if (!modalChapterContent.trim()) {
        alert('Please provide chapter content.');
        return;
      }
    }

    setModalPublishing(true);
    const paragraphs = modalChapterContent.split('\n\n').filter(p => p.trim() !== '').map((text, idx) => ({
      id: idx + 1,
      text: text.trim(),
      comments: []
    }));

    const chapterNum = Number(modalChapterNumber) || ((targetStoryForChapter.chapters?.length || 0) + 1);
    const newChapter = {
      id: Date.now(),
      number: chapterNum,
      title: modalChapterTitle.trim() || `Chapter ${chapterNum}`,
      publishedAt: new Date().toISOString().split('T')[0],
      reads: 1,
      votes: 0,
      paragraphs: targetStoryForChapter.contentType === 'picture_book' ? [] : paragraphs,
      pages: targetStoryForChapter.contentType === 'picture_book' ? modalPages : []
    };

    await addChapterToStory(targetStoryForChapter.id, newChapter);
    setModalPublishing(false);
    setModalPublishSuccess(true);
    setTimeout(() => {
      setModalPublishSuccess(false);
      setAddChapterModalOpen(false);
      router.push(`/read/${targetStoryForChapter.slug}?chapter=${chapterNum}`);
    }, 1200);
  };

  const handleExistingStoryPublish = async (e) => {
    e.preventDefault();
    const currentStory = myStories.find(s => String(s.id) === String(selectedExistingStoryId)) || myStories[0];
    if (!currentStory) {
      alert('Please select a book to add a chapter to.');
      return;
    }

    if (currentStory.contentType === 'picture_book') {
      if (existingPages.length === 0) {
        alert('Please provide at least one page.');
        return;
      }
    } else {
      if (!existingChapterContent.trim()) {
        alert('Please provide chapter content.');
        return;
      }
    }

    setExistingPublishing(true);
    const chapterNum = Number(existingChapterNumber) || ((currentStory.chapters?.length || 0) + 1);
    const paragraphs = existingChapterContent.split('\n\n').filter(p => p.trim() !== '').map((text, idx) => ({
      id: idx + 1,
      text: text.trim(),
      comments: []
    }));

    const newChapter = {
      id: Date.now(),
      number: chapterNum,
      title: existingChapterTitle.trim() || `Chapter ${chapterNum}`,
      publishedAt: new Date().toISOString().split('T')[0],
      reads: 1,
      votes: 0,
      paragraphs: currentStory.contentType === 'picture_book' ? [] : paragraphs,
      pages: currentStory.contentType === 'picture_book' ? existingPages : []
    };

    await addChapterToStory(currentStory.id, newChapter);
    setExistingPublishing(false);
    setExistingPublishSuccess(true);
    setTimeout(() => {
      setExistingPublishSuccess(false);
      router.push(`/read/${currentStory.slug}?chapter=${chapterNum}`);
    }, 1400);
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

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none w-full sm:w-auto pb-1">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Studio Editor
            </button>
            <button 
              onClick={() => setActiveTab('stories')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stories' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" /> My Serials ({myStories.length})
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics' 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Creator Analytics
            </button>
            <button 
              type="button"
              onClick={() => openBankDetailsModal()}
              className="shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-sm"
              title="Add or update your bank payout account for 90% royalties"
            >
              <Building2 className="w-3.5 h-3.5" /> 
              <span>{user?.bankDetails ? `Bank (${user.bankDetails.bankName})` : '+ Add Bank Details'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: STUDIO EDITOR */}
        {activeTab === 'editor' && (
          <div className="mt-8 space-y-6">
            {/* Mode Switcher: Write New Book vs Add Chapter to Existing Serial */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setEditorMode('new_story')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editorMode === 'new_story'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" /> + Write New Book
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditorMode('add_chapter');
                  if (!selectedExistingStoryId && myStories.length > 0) {
                    const firstStory = myStories[0];
                    setSelectedExistingStoryId(firstStory.id);
                    const nextNum = (firstStory.chapters?.length || 0) + 1;
                    setExistingChapterNumber(nextNum);
                    setExistingChapterTitle(`Chapter ${nextNum}: `);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editorMode === 'add_chapter'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> + Add Chapter to Existing Book ({myStories.length})
              </button>
            </div>

            {editorMode === 'add_chapter' ? (
              myStories.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <h4 className="font-bold text-base">No Published Books Found</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-5">You haven't written any books yet. First, create your book, then you can add Chapter 2 and subsequent chapters!</p>
                  <button
                    type="button"
                    onClick={() => setEditorMode('new_story')}
                    className="px-6 py-2.5 rounded-full bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 cursor-pointer shadow-md shadow-brand-500/20"
                  >
                    Start New Book
                  </button>
                </div>
              ) : (
                (() => {
                  const currentStory = myStories.find(s => String(s.id) === String(selectedExistingStoryId)) || myStories[0];
                  return (
                    <form onSubmit={handleExistingStoryPublish} className="grid lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 space-y-5">
                        {existingPublishSuccess && (
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> Chapter {existingChapterNumber} published successfully! Redirecting...
                          </div>
                        )}

                        {/* Story Selection & Chapter Info */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Select Book to Continue Serializing
                            </label>
                            <select
                              value={currentStory.id}
                              onChange={(e) => {
                                const st = myStories.find(s => String(s.id) === String(e.target.value));
                                setSelectedExistingStoryId(e.target.value);
                                if (st) {
                                  const nextNum = (st.chapters?.length || 0) + 1;
                                  setExistingChapterNumber(nextNum);
                                  setExistingChapterTitle(`Chapter ${nextNum}: `);
                                }
                              }}
                              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none border border-slate-200 dark:border-slate-700"
                            >
                              {myStories.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.title} ({s.chapters?.length || 0} Chapters)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center gap-4">
                            <img src={currentStory.cover} alt={currentStory.title} className="w-12 aspect-[3/4] object-cover rounded-lg border shadow-xs shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-black uppercase text-brand-600">{currentStory.genre}</span>
                              <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{currentStory.title}</h4>
                              <p className="text-xs text-slate-500">Currently: {currentStory.chapters?.length || 0} Chapters • Appending Chapter {existingChapterNumber}</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Chapter No.
                              </label>
                              <input 
                                type="number" 
                                min="1"
                                value={existingChapterNumber}
                                onChange={(e) => setExistingChapterNumber(e.target.value)}
                                required
                                className="w-full text-base font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                              />
                            </div>
                            <div className="sm:col-span-9">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Chapter Title
                              </label>
                              <input 
                                type="text" 
                                placeholder={`e.g. Chapter ${existingChapterNumber}: Into the Shadows`}
                                value={existingChapterTitle}
                                onChange={(e) => setExistingChapterTitle(e.target.value)}
                                required
                                className="w-full text-sm font-bold px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Chapter Body or Picture Book Pages */}
                        {currentStory.contentType === 'picture_book' ? (
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b">
                              <span className="text-xs font-bold text-slate-400 uppercase">Pages ({existingPages.length})</span>
                              <button
                                type="button"
                                onClick={() => setExistingPages(prev => [...prev, { pageNumber: prev.length + 1, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: `Page ${prev.length + 1}`, text: '' }])}
                                className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Page
                              </button>
                            </div>
                            {existingPages.map((p, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 border">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span>Page {idx + 1}</span>
                                  {existingPages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setExistingPages(prev => prev.filter((_, i) => i !== idx))}
                                      className="text-rose-500 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="url"
                                  placeholder="Image URL"
                                  value={p.image}
                                  onChange={(e) => setExistingPages(prev => prev.map((item, i) => i === idx ? { ...item, image: e.target.value } : item))}
                                  className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border outline-none"
                                />
                                <textarea
                                  rows={2}
                                  placeholder="Narration / dialogue..."
                                  value={p.text}
                                  onChange={(e) => setExistingPages(prev => prev.map((item, i) => i === idx ? { ...item, text: e.target.value } : item))}
                                  className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                              Chapter Body (Paragraphs & Scenes)
                            </span>
                            <BookFormattingToolbar 
                              onInsert={(prefix, placeholder, isBreak, suffix) => insertFormatIntoText(existingChapterContent, setExistingChapterContent, prefix, placeholder, isBreak, suffix)}
                              showGuide={showExistingGuide}
                              setShowGuide={setShowExistingGuide}
                            />
                            <textarea 
                              rows={16}
                              placeholder="Write your serialized chapter here. Use the toolbar buttons above to insert ## Subheadings, ### Sections, and * * * Scene Breaks!"
                              value={existingChapterContent}
                              onChange={(e) => setExistingChapterContent(e.target.value)}
                              required
                              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500 font-serif text-base leading-relaxed"
                            />
                            <p className="text-[11px] text-slate-400">
                              Word count: ~{existingChapterContent.trim() ? existingChapterContent.trim().split(/\s+/).length : 0} words
                            </p>
                          </div>
                        )}

                        {/* Publish Chapter Button */}
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <p className="text-xs text-slate-400">
                            Appends directly to <span className="font-bold text-slate-800 dark:text-slate-200">"{currentStory.title}"</span>
                          </p>
                          <button 
                            type="submit"
                            disabled={existingPublishing}
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-4 h-4" /> {existingPublishing ? 'Publishing...' : `Publish Chapter ${existingChapterNumber}`}
                          </button>
                        </div>
                      </div>

                      {/* Right Sidebar */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Book Details</h3>
                          <div className="w-32 aspect-[3/4] rounded-xl overflow-hidden border shadow-sm mx-auto">
                            <img src={currentStory.cover} alt={currentStory.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1 text-center">
                            <h4 className="font-black text-sm">{currentStory.title}</h4>
                            <p className="text-xs text-brand-600 font-bold">{currentStory.genre}</p>
                            <p className="text-[11px] text-slate-400">{currentStory.chapters?.length || 0} Existing Chapters • {(currentStory.reads || 0).toLocaleString()} Reads</p>
                          </div>
                          <div className="pt-2 border-t text-xs text-slate-500 space-y-1">
                            <p><span className="font-bold">Maturity:</span> {currentStory.maturity}</p>
                            <p><span className="font-bold">Age Rating:</span> {currentStory.ageRating || '13+'}</p>
                            <p><span className="font-bold">Status:</span> {currentStory.status}</p>
                          </div>
                        </div>
                      </div>
                    </form>
                  );
                })()
              )
            ) : (
              <form onSubmit={handlePublish} className="grid lg:grid-cols-12 gap-8">
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

                  {/* Content Canvas: Picture Book vs Novel */}
                  {contentType === 'story' ? (
                    /* Text Novel Canvas with Auto-Save */
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Chapter Body (Paragraphs & Scenes)
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

                      <BookFormattingToolbar 
                        onInsert={(prefix, placeholder, isBreak, suffix) => insertFormatIntoText(chapterContent, setChapterContent, prefix, placeholder, isBreak, suffix)}
                        showGuide={showFormattingGuide}
                        setShowGuide={setShowFormattingGuide}
                      />

                      <textarea 
                        rows={16}
                        placeholder="Begin drafting your serialized chapter here. Separate paragraphs with double newlines — each paragraph will automatically become an interactive discussion anchor for your readers!"
                        value={chapterContent}
                        onChange={handleContentChange}
                        required={contentType === 'story'}
                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500 font-serif text-base leading-relaxed"
                      />

                      <p className="text-[11px] text-slate-400">
                        Word count: ~{chapterContent.trim() ? chapterContent.trim().split(/\s+/).length : 0} words
                      </p>
                    </div>
                  ) : (
                /* Picture Book / Comic Page Builder */
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Illustrated Pages ({pages.length})
                      </span>
                      <p className="text-xs text-slate-500">Upload or provide images and narration for each page in sequence.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addPage}
                      className="px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Page
                    </button>
                  </div>

                  <div className="space-y-6">
                    {pages.map((p, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                            Page {idx + 1}
                          </span>
                          {pages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePage(idx)}
                              className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove Page
                            </button>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-4 aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                            <img src={p.image} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>

                          <div className="sm:col-span-8 space-y-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Page Illustration URL</label>
                              <input
                                type="url"
                                value={p.image}
                                onChange={(e) => updatePage(idx, 'image', e.target.value)}
                                placeholder="https://..."
                                className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Caption (Optional)</label>
                              <input
                                type="text"
                                value={p.caption}
                                onChange={(e) => updatePage(idx, 'caption', e.target.value)}
                                placeholder="e.g. In the deep enchanted forest"
                                className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Narration / Page Text</label>
                              <textarea
                                rows={2}
                                value={p.text}
                                onChange={(e) => updatePage(idx, 'text', e.target.value)}
                                placeholder="Story dialogue or narrative text for this page..."
                                className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addPage}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-brand-500 hover:border-brand-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Append Another Page
                  </button>
                </div>
              )}

              {/* Publishing Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <select 
                    value={publishStatus}
                    onChange={(e) => setPublishStatus(e.target.value)}
                    className="w-full sm:w-auto p-2.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                    <option value="scheduled">Schedule Release</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> {t.publishChapter}
                </button>
              </div>
            </div>

            {/* Right: Story Settings Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Story Settings</h3>

                {/* Content Format Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Story Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContentType('story')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        contentType === 'story'
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Text Novel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType('picture_book')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        contentType === 'picture_book'
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Picture Book</span>
                    </button>
                  </div>
                </div>

                {/* Age Rating (DOB Protection) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Age Rating (DOB Protection)
                  </label>
                  <select 
                    value={ageRating}
                    onChange={(e) => {
                      const newRating = e.target.value;
                      setAgeRating(newRating);
                      if (newRating === '18+') {
                        setMaturity('mature');
                      } else {
                        setMaturity('everyone');
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-brand-600 dark:text-brand-400 outline-none"
                  >
                    <option value="3+">👶 3+ (Kids & Toddlers)</option>
                    <option value="7+">🧒 7+ (Children & Family)</option>
                    <option value="13+">🧑 13+ (Teens & YA)</option>
                    <option value="16+">🧑‍🎤 16+ (Upper YA)</option>
                    <option value="18+">🔥 18+ (Mature / Adult Only)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {ageRating === '18+' 
                      ? '⚠️ Restricted to users with verified DOB 18+. Completely hidden from minors.' 
                      : `Accessible to readers verified aged ${ageRating} and above.`}
                  </p>
                </div>

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
                  <label className="block text-xs font-bold text-slate-500 mb-1">Maturity Flag</label>
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
        </div>
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
                  <div key={s.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={s.cover} alt={s.title} className="w-14 aspect-[3/4] object-cover rounded-xl shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 uppercase">{s.genre}</span>
                        <h4 className="font-black text-base text-slate-900 dark:text-white line-clamp-1">{s.title}</h4>
                        <p className="text-xs text-slate-400">{s.chapters.length} Chapters • {s.reads.toLocaleString()} Reads • {s.votes.toLocaleString()} Votes</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => handleOpenAddChapterModal(s)}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Add Chapter {s.chapters.length + 1}
                      </button>
                      <button 
                        onClick={() => handleReorderChapters(s.id)}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" /> Reorder Chapters
                      </button>
                      <Link 
                        href={`/story/${s.slug}`}
                        className="flex-1 md:flex-initial text-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200"
                      >
                        View Public Page
                      </Link>
                      <button 
                        onClick={() => deleteStory(s.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
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

            {/* Reads Over Time Timeline Chart (Scope 4: reads over time) */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Reads Over Time</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daily reading traffic and chapter completion velocity (Past 7 Days)</p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  Weekly Reads: 37,700
                </span>
              </div>

              <div className="pt-4 flex items-end justify-between gap-3 h-44 border-b border-slate-100 dark:border-slate-800 pb-2">
                {[
                  { day: "Mon", reads: 3200, height: "45%" },
                  { day: "Tue", reads: 4800, height: "65%" },
                  { day: "Wed", reads: 4100, height: "55%" },
                  { day: "Thu", reads: 5600, height: "78%" },
                  { day: "Fri", reads: 6900, height: "92%" },
                  { day: "Sat", reads: 7200, height: "100%" },
                  { day: "Sun", reads: 5900, height: "80%" }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow">
                      {item.reads.toLocaleString()}
                    </div>
                    <div 
                      className="w-full max-w-[44px] bg-gradient-to-t from-brand-600 to-amber-500 rounded-t-xl group-hover:brightness-110 transition-all cursor-pointer shadow-sm"
                      style={{ height: item.height }}
                    />
                    <span className="text-[11px] font-bold text-slate-400">{item.day}</span>
                  </div>
                ))}
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

      {/* 4. MODAL: ADD CHAPTER TO SERIAL STORY */}
      {addChapterModalOpen && targetStoryForChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img 
                  src={targetStoryForChapter.cover} 
                  alt={targetStoryForChapter.title} 
                  className="w-12 aspect-[3/4] object-cover rounded-lg border shadow-sm shrink-0"
                />
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">
                    Add Serial Chapter
                  </span>
                  <h3 className="text-lg font-black line-clamp-1">{targetStoryForChapter.title}</h3>
                  <p className="text-xs text-slate-400">
                    Currently: {targetStoryForChapter.chapters?.length || 0} Chapters • Appending Chapter {modalChapterNumber}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setAddChapterModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalPublishSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black">Chapter {modalChapterNumber} Published!</h4>
                <p className="text-xs text-slate-500">Your new chapter is now live for all readers in the Avora Library.</p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link 
                    href={`/read/${targetStoryForChapter.slug}?chapter=${modalChapterNumber}`}
                    className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs hover:bg-brand-600"
                  >
                    Read Chapter {modalChapterNumber} →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalPublishChapter} className="space-y-5">
                <div className="grid sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chapter Number
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={modalChapterNumber}
                      onChange={(e) => setModalChapterNumber(e.target.value)}
                      required
                      className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="sm:col-span-9">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chapter Title
                    </label>
                    <input 
                      type="text" 
                      placeholder={`e.g. Chapter ${modalChapterNumber}: Pact of Mercury`}
                      value={modalChapterTitle}
                      onChange={(e) => setModalChapterTitle(e.target.value)}
                      required
                      className="w-full text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {targetStoryForChapter.contentType === 'picture_book' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-400 uppercase">Pages ({modalPages.length})</span>
                      <button
                        type="button"
                        onClick={() => setModalPages(prev => [...prev, { pageNumber: prev.length + 1, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', caption: `Page ${prev.length + 1}`, text: '' }])}
                        className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Page
                      </button>
                    </div>
                    {modalPages.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 border">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Page {idx + 1}</span>
                          {modalPages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setModalPages(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="Image URL"
                          value={p.image}
                          onChange={(e) => setModalPages(prev => prev.map((item, i) => i === idx ? { ...item, image: e.target.value } : item))}
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border outline-none"
                        />
                        <textarea
                          rows={2}
                          placeholder="Narration / dialogue..."
                          value={p.text}
                          onChange={(e) => setModalPages(prev => prev.map((item, i) => i === idx ? { ...item, text: e.target.value } : item))}
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border outline-none"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Chapter Body (Paragraphs & Scenes)
                    </label>
                    <BookFormattingToolbar 
                      onInsert={(prefix, placeholder, isBreak, suffix) => insertFormatIntoText(modalChapterContent, setModalChapterContent, prefix, placeholder, isBreak, suffix)}
                      showGuide={modalShowGuide}
                      setShowGuide={setModalShowGuide}
                    />
                    <textarea 
                      rows={12}
                      placeholder="Write your next chapter here. Use the buttons above to easily add ## Subheadings, ### Sections, or * * * Scene Breaks!"
                      value={modalChapterContent}
                      onChange={(e) => setModalChapterContent(e.target.value)}
                      required
                      className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500 font-serif text-sm leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Word count: ~{modalChapterContent.trim() ? modalChapterContent.trim().split(/\s+/).length : 0} words
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setAddChapterModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={modalPublishing}
                    className="flex items-center gap-1.5 px-7 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 
                    <span>{modalPublishing ? 'Publishing...' : `Publish Chapter ${modalChapterNumber}`}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
