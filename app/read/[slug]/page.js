'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReportModal from '@/components/ReportModal';
import InlineCommentDrawer from '@/components/InlineCommentDrawer';
import { useApp } from '@/context/AppContext';
import { 
  Type, 
  Sun, 
  Moon, 
  Heart, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  X, 
  Send, 
  BookOpen, 
  ListFilter, 
  CheckCircle, 
  Sparkles, 
  ShieldAlert, 
  Flag, 
  ThumbsUp, 
  CornerDownRight,
  BookMarked,
  Check,
  Plus,
  ImageIcon,
  Eye
} from 'lucide-react';
import { canUserAccessContent } from '@/lib/agePolicy';

export default function ReaderPage() {
  const params = useParams();
  const { slug } = params;
  const router = useRouter();
  const { 
    stories, 
    user, 
    voteChapter, 
    reactChapterEmoji, 
    addParagraphComment, 
    saveReadingProgress, 
    library,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    openAuthModal,
    openPaymentModal,
    featureFlags,
    setAgeVerificationModalOpen,
    t 
  } = useApp();

  const story = stories.find(s => s.slug === slug);
  const inLib = story ? isInLibrary(story.id) : false;
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const chapter = story?.chapters?.[currentChapterIndex] || story?.chapters?.[0];

  // Reader Customization State
  const [readerTheme, setReaderTheme] = useState('sepia'); // 'light' | 'dark' | 'sepia'
  const [fontSize, setFontSize] = useState(18); // px
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans'
  const [lineSpacing, setLineSpacing] = useState('leading-relaxed'); // 'leading-normal' | 'leading-relaxed' | 'leading-loose'
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);

  // Inline Paragraph Comments & Emojis State
  const [activeParagraph, setActiveParagraph] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentSort, setCommentSort] = useState('newest'); // 'newest' | 'likes'
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Reading Animations State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [voteHearts, setVoteHearts] = useState([]);
  const [voteBonusPop, setVoteBonusPop] = useState(false);
  const [emojiBursts, setEmojiBursts] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [pageTurnDirection, setPageTurnDirection] = useState('next');
  const [pageFlipKey, setPageFlipKey] = useState(0);
  const [chapterTransitionKey, setChapterTransitionKey] = useState(0);

  // Animated Reading Progress Bar: Smooth Scroll Depth Tracker
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentChapterIndex, activePageIndex]);

  // Sync reading progress
  useEffect(() => {
    if (story && chapter) {
      saveReadingProgress(story.id, chapter.id, 0);
    }
  }, [story?.id, chapter?.id]);

  const triggerChapterCompletion = () => {
    const pieces = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#ea580c', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899', '#3b82f6', '#06b6d4', '#e11d48'][i % 8],
      delay: Math.random() * 0.7,
      size: 7 + Math.random() * 9,
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'star' : 'ribbon',
      rotation: Math.random() * 360,
    }));
    setConfettiPieces(pieces);
    setShowCompletionModal(true);
  };

  const spawnVoteHearts = () => {
    setVoteBonusPop(true);
    setTimeout(() => setVoteBonusPop(false), 900);

    const icons = ['💖', '❤️', '✨', '💕', '🔥', '🎉'];
    const newHearts = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i,
      char: icons[i % icons.length],
      x: (Math.random() - 0.5) * 110,
      y: -35 - Math.random() * 65,
      scale: 0.8 + Math.random() * 0.6,
      rot: (Math.random() - 0.5) * 45,
    }));
    setVoteHearts(newHearts);
    setTimeout(() => setVoteHearts([]), 1100);
  };

  const spawnEmojiBurst = (emoji) => {
    const burst = {
      id: Date.now(),
      emoji,
      x: (Math.random() - 0.5) * 50,
    };
    setEmojiBursts(prev => [...prev.slice(-3), burst]);
    setTimeout(() => {
      setEmojiBursts(prev => prev.filter(b => b.id !== burst.id));
    }, 900);
  };

  const handlePageChange = (newIndex, direction) => {
    setPageTurnDirection(direction);
    setPageFlipKey(prev => prev + 1);
    setActivePageIndex(newIndex);
  };

  const handleChapterChange = (newIndex) => {
    setChapterTransitionKey(prev => prev + 1);
    setCurrentChapterIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!story || !chapter) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">Chapter Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-md">
            This story or chapter could not be located. It may have been unpublished or moved.
          </p>
          <Link 
            href="/browse" 
            className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all"
          >
            Browse Other Stories →
          </Link>
        </main>
      </div>
    );
  }

  const handleVote = () => {
    if (!user) {
      openAuthModal('login', `Sign in to vote on Chapter ${chapter.number} and support ${story.author}!`, () => {
        voteChapter(story.id, chapter.id);
        setHasVoted(true);
        spawnVoteHearts();
      });
      return;
    }
    if (!hasVoted) {
      voteChapter(story.id, chapter.id);
      setHasVoted(true);
      spawnVoteHearts();
    }
  };

  const handleEmojiReact = (emoji) => {
    spawnEmojiBurst(emoji);
    if (!user) {
      openAuthModal('login', `Sign in to react with ${emoji} on Chapter ${chapter.number}!`, () => {
        reactChapterEmoji(story.id, chapter.id, emoji);
      });
      return;
    }
    reactChapterEmoji(story.id, chapter.id, emoji);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'Sign in to post inline reactions and join the community discussion.');
      return;
    }
    if (commentInput.trim() === '' || !activeParagraph) return;
    addParagraphComment(story.id, chapter.id, activeParagraph.id, commentInput.trim());
    
    // Update local active paragraph
    setActiveParagraph(prev => ({
      ...prev,
      comments: [
        {
          id: Date.now(),
          author: user?.name || "Reader",
          avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
          time: "Just now",
          text: commentInput.trim(),
          likes: 0,
          emojis: { "❤️": 1 }
        },
        ...prev.comments
      ]
    }));
    setCommentInput('');
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;
    setActiveParagraph(prev => ({
      ...prev,
      comments: prev.comments.map(c => {
        if (c.id === commentId) {
          const replies = c.replies || [];
          return {
            ...c,
            replies: [
              ...replies,
              {
                id: Date.now(),
                author: user?.name || "Reader",
                time: "Just now",
                text: replyText.trim()
              }
            ]
          };
        }
        return c;
      })
    }));
    setReplyToId(null);
    setReplyText('');
  };

  // Core Platform-Level Rule: DOB Age Access Enforcement
  const accessCheck = canUserAccessContent(user, story);
  if (!accessCheck.canAccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full inline-block">
            Rating: {story.ageRating || '18+'}
          </span>
          <h2 className="text-2xl font-black">Age-Restricted Content</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {accessCheck.message}
          </p>

          <div className="w-full bg-slate-800/80 p-3.5 rounded-2xl text-left text-xs space-y-1.5 border border-slate-700">
            <div className="flex justify-between text-slate-400">
              <span>Required Age:</span>
              <strong className="text-rose-400">{story.ageRating || '18+'}</strong>
            </div>
            {accessCheck.userAge !== null && (
              <div className="flex justify-between text-slate-400">
                <span>Your Account Age:</span>
                <strong className="text-amber-400">{accessCheck.userAge} years old</strong>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {accessCheck.reason === 'LOGIN_REQUIRED_FOR_MATURE' && (
              <button
                onClick={() => openAuthModal('login', `Log in with an age-verified account to read ${story.title}.`)}
                className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 font-bold text-xs shadow-md shadow-brand-500/25 transition-all cursor-pointer"
              >
                Log In / Create Verified Account
              </button>
            )}

            {accessCheck.reason === 'DOB_REQUIRED' && (
              <button
                onClick={() => setAgeVerificationModalOpen(true)}
                className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 font-bold text-xs shadow-md shadow-brand-500/25 transition-all cursor-pointer"
              >
                Verify Your Date of Birth
              </button>
            )}

            <Link
              href="/browse"
              className="w-full py-3 rounded-full border border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-800 transition-all text-center"
            >
              Browse Other Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sorted active comments
  const sortedComments = activeParagraph?.comments ? [...activeParagraph.comments].sort((a, b) => {
    if (commentSort === 'likes') return (b.likes || 0) - (a.likes || 0);
    return b.id - a.id;
  }) : [];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      readerTheme === 'dark' ? 'bg-slate-950 text-slate-100' :
      readerTheme === 'sepia' ? 'sepia-reader' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. TOP READER NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-8 h-14 flex items-center justify-between border-black/10 dark:border-white/10 relative">
        {/* Animated Reading Progress Bar (Top Edge of Reader) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/10 z-50 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 via-amber-400 to-orange-500 transition-all duration-150 ease-out shadow-sm shadow-orange-500/50"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link 
            href={`/story/${story.slug}`} 
            className="text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:opacity-80 transition-opacity truncate max-w-[95px] sm:max-w-xs shrink-0"
          >
            ← {story.title}
          </Link>
          <button 
            onClick={() => setShowChapterDrawer(true)}
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
          >
            <ListFilter className="w-3.5 h-3.5" /> Ch. {chapter.number} / {story.chapters.length}
          </button>

          {/* Reading Progress Percentage Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 text-[11px] font-extrabold border border-brand-500/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>{Math.round(scrollProgress)}% read</span>
          </div>

          {/* Add to Library Toggle in Reader Navbar (Wattpad UX) */}
          <button
            onClick={() => inLib ? removeFromLibrary(story.id) : addToLibrary(story.id)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              inLib
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-700 dark:text-slate-200'
            }`}
            title="Save to Library"
          >
            {inLib ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <BookMarked className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{inLib ? 'In Library' : 'Add to Library'}</span>
          </button>
        </div>

        {/* Reader Customization Settings Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile "Aa" Appearance Button */}
          <button
            onClick={() => setShowAppearanceModal(true)}
            className="sm:hidden flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-black cursor-pointer"
            title="Appearance Settings"
          >
            Aa
          </button>

          {/* Quick Font Size (Desktop) */}
          <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2 py-1 text-xs font-bold hover:text-brand-500 cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] font-mono px-1">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="px-2 py-1 text-xs font-bold hover:text-brand-500 cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Theme Mode Buttons (Desktop) */}
          <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setReaderTheme('light')} 
              className={`p-1.5 rounded-md text-xs cursor-pointer ${readerTheme === 'light' ? 'bg-white shadow text-slate-900 font-bold' : ''}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setReaderTheme('sepia')} 
              className={`p-1.5 rounded-md text-xs cursor-pointer ${readerTheme === 'sepia' ? 'bg-[#f4ecd8] shadow text-amber-900 font-bold' : ''}`}
              title="Sepia Paper Theme"
            >
              ☕
            </button>
            <button 
              onClick={() => setReaderTheme('dark')} 
              className={`p-1.5 rounded-md text-xs cursor-pointer ${readerTheme === 'dark' ? 'bg-slate-800 shadow text-amber-400 font-bold' : ''}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Family Toggle (Desktop) */}
          <button 
            onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
            className="hidden sm:inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 cursor-pointer"
            title="Toggle Font Family"
          >
            {fontFamily === 'serif' ? 'Serif' : 'Sans'}
          </button>

          {/* Report Button */}
          <button 
            onClick={() => setReportModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
            title="Report Chapter"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. MAIN CHAPTER READING CANVAS */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
              Chapter {chapter.number}
            </span>
            {story.ranking && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center gap-1">
                <span>{story.ranking.rank === 1 ? '🥇 #1' : story.ranking.rank === 2 ? '🥈 #2' : story.ranking.rank === 3 ? '🥉 #3' : `#${story.ranking.rank}`} in {story.ranking.tag}</span>
              </span>
            )}
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Eye className="w-3 h-3 text-brand-500" /> {(story.reads || 0).toLocaleString()} reads
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">{chapter.title}</h1>
          <p className="text-xs opacity-70">
            By {story.author} • Published {chapter.publishedAt}
          </p>
        </header>

        {/* 2A. ILLUSTRATED PICTURE BOOK / VISUAL STORY VIEWER */}
        {chapter.pages && chapter.pages.length > 0 ? (
          <div className="space-y-6">
            <div 
              key={pageFlipKey}
              className={`bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 ${
                pageTurnDirection === 'next' ? 'animate-page-turn-next' : 'animate-page-turn-prev'
              }`}
            >
              {/* Page Image */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <img 
                  src={chapter.pages[activePageIndex]?.image} 
                  alt={`Page ${activePageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Floating Page Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs">
                  Page {activePageIndex + 1} of {chapter.pages.length}
                </div>
              </div>

              {/* Page Text & Caption */}
              <div className="p-6 sm:p-8 space-y-4">
                <p className={`text-base sm:text-lg leading-relaxed ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}>
                  {chapter.pages[activePageIndex]?.text || chapter.pages[activePageIndex]?.caption}
                </p>

                {/* Page Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handlePageChange(Math.max(0, activePageIndex - 1), 'prev')}
                    disabled={activePageIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-30 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Page
                  </button>

                  <div className="flex items-center gap-1.5">
                    {chapter.pages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx, idx >= activePageIndex ? 'next' : 'prev')}
                        className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                          activePageIndex === idx 
                            ? 'bg-brand-500 scale-125' 
                            : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                        }`}
                        title={`Go to page ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(chapter.pages.length - 1, activePageIndex + 1), 'next')}
                    disabled={activePageIndex === chapter.pages.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white disabled:opacity-30 font-bold text-xs hover:bg-brand-600 transition-all cursor-pointer"
                  >
                    Next Page <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 2B. NOVEL PARAGRAPH-LEVEL READING CANVAS */
          <div 
            key={chapterTransitionKey}
            className={`space-y-6 animate-chapter-slide ${lineSpacing} ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {chapter.paragraphs?.map((p) => (
              <div 
                key={p.id}
                onClick={() => setActiveParagraph(p)}
                className="relative group p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <p className="leading-relaxed">{p.text}</p>

                {/* Inline Reaction Badge */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveParagraph(p);
                  }}
                  className="absolute right-[-15px] sm:right-[-32px] top-2 opacity-60 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md transition-all hover:scale-105"
                  title="View & Post Paragraph Comments"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{p.comments?.length || 0}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CHAPTER EMOJI REACTIONS */}
        <div className="mt-14 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col items-center gap-4 relative">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60">Chapter Emoji Reactions</span>
          
          {/* Floating Emoji Bursts */}
          {emojiBursts.map(b => (
            <div 
              key={b.id}
              className="absolute -top-6 text-2xl font-bold animate-out fade-out slide-out-to-top duration-700 pointer-events-none select-none"
              style={{ transform: `translateX(${b.x}px) scale(1.3)` }}
            >
              {b.emoji}
            </div>
          ))}

          <div className="flex items-center gap-3">
            {['🔥', '❤️', '😭', '👏', '😱'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiReact(emoji)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:scale-110 active:scale-95 transition-all text-sm font-bold cursor-pointer"
              >
                <span>{emoji}</span>
                <span className="text-xs">{chapter.emojis?.[emoji] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CHAPTER VOTE & TIP AUTHOR FOOTER */}
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3 relative">
            
            {/* Floating Heart Bursts upon Voting */}
            {voteHearts.map(h => (
              <div 
                key={h.id}
                className="absolute pointer-events-none select-none text-xl animate-heart-burst z-30"
                style={{
                  '--hx': `${h.x}px`,
                  '--hy': `${h.y}px`,
                  '--hs': h.scale,
                  '--hr': `${h.rot}deg`,
                  top: '50%',
                  left: '50%',
                }}
              >
                {h.char}
              </div>
            ))}

            {voteBonusPop && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-md animate-bounce pointer-events-none select-none z-30 whitespace-nowrap">
                +1 Loved! 💖
              </div>
            )}

            <button 
              onClick={handleVote}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-xl cursor-pointer ${
                hasVoted 
                  ? 'bg-rose-500 text-white shadow-rose-500/30' 
                  : 'bg-brand-500 hover:bg-brand-600 active:scale-95 text-white shadow-brand-500/30 hover:scale-[1.02]'
              }`}
            >
              <Heart className={`w-5 h-5 ${hasVoted ? 'fill-white' : ''}`} />
              <span>{hasVoted ? t.voted : t.vote} ({chapter.votes + (hasVoted ? 1 : 0)})</span>
            </button>

            {featureFlags?.enablePaidFeatures && (
              <button 
                onClick={() => {
                  openPaymentModal({
                    mode: 'donate',
                    author: story.author,
                    story: story
                  });
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                title="Send a tip to the author"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Tip {story.author}</span>
              </button>
            )}
          </div>

          {/* Chapter Next / Previous Navigation */}
          <div className="flex items-center justify-between w-full pt-4">
            <button 
              onClick={() => handleChapterChange(Math.max(0, currentChapterIndex - 1))}
              disabled={currentChapterIndex === 0}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold opacity-60 hover:opacity-100 disabled:opacity-20 cursor-pointer transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerChapterCompletion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all hover:scale-105 cursor-pointer shadow-sm"
                title="Celebrate finishing this chapter with confetti"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Celebrate Finish 🎉</span>
              </button>

              {currentChapterIndex < story.chapters.length - 1 ? (
                <button 
                  onClick={() => handleChapterChange(currentChapterIndex + 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={triggerChapterCompletion}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" /> Complete Story! 🎉
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 3. PARAGRAPH INLINE COMMENTS SIDE DRAWER */}
      <InlineCommentDrawer
        isOpen={Boolean(activeParagraph)}
        onClose={() => setActiveParagraph(null)}
        paragraph={activeParagraph}
        story={story}
        chapter={chapter}
        user={user}
        onAddComment={(text) => {
          addParagraphComment(story.id, chapter.id, activeParagraph.id, text);
          setActiveParagraph(prev => ({
            ...prev,
            comments: [
              {
                id: Date.now(),
                author: user?.name || "Reader",
                avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
                time: "Just now",
                text,
                likes: 0
              },
              ...(prev?.comments || [])
            ]
          }));
        }}
        openAuthModal={openAuthModal}
      />

      {/* 4. CHAPTERS DRAWER */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start">
          <div className="w-80 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 h-full p-6 shadow-2xl overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm">All Chapters ({story.chapters.length})</h3>
              <button onClick={() => setShowChapterDrawer(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              {story.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => { handleChapterChange(idx); setShowChapterDrawer(false); }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    idx === currentChapterIndex 
                      ? 'bg-brand-500 text-white' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate pr-2">Ch. {ch.number}: {ch.title}</span>
                  {idx === currentChapterIndex && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MOBILE READING APPEARANCE BOTTOM SHEET */}
      {showAppearanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:hidden">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-6 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm">Reading Appearance</h3>
              <button onClick={() => setShowAppearanceModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Mode Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setReaderTheme('light')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    readerTheme === 'light' ? 'bg-white text-slate-900 border-slate-400 shadow-sm' : 'bg-slate-100 text-slate-600 border-transparent'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    readerTheme === 'sepia' ? 'bg-[#f4ecd8] text-amber-950 border-amber-400 shadow-sm' : 'bg-[#fbf7ee] text-amber-800 border-transparent'
                  }`}
                >
                  ☕ Sepia
                </button>
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    readerTheme === 'dark' ? 'bg-slate-800 text-white border-slate-600 shadow-sm' : 'bg-slate-900 text-slate-400 border-transparent'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>

            {/* Font Size Stepper */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Font Size</label>
                <span className="text-xs font-mono font-bold">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer"
                >
                  A- Smaller
                </button>
                <button
                  onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer"
                >
                  A+ Larger
                </button>
              </div>
            </div>

            {/* Typeface Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Typeface</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFontFamily('serif')}
                  className={`py-2.5 rounded-xl font-serif text-sm font-bold border transition-all cursor-pointer ${
                    fontFamily === 'serif' ? 'bg-brand-500 text-white border-brand-500' : 'bg-slate-100 dark:bg-slate-800 border-transparent'
                  }`}
                >
                  Serif (Book)
                </button>
                <button
                  onClick={() => setFontFamily('sans')}
                  className={`py-2.5 rounded-xl font-sans text-sm font-bold border transition-all cursor-pointer ${
                    fontFamily === 'sans' ? 'bg-brand-500 text-white border-brand-500' : 'bg-slate-100 dark:bg-slate-800 border-transparent'
                  }`}
                >
                  Sans-Serif (Clean)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="chapter"
        reportedUser={story.authorUsername}
        storyTitle={`${story.title} - Chapter ${chapter.number}`}
      />

      {/* CHAPTER COMPLETION CELEBRATION MODAL & CONFETTI ANIMATION */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Confetti Falling Particle Stream */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map(c => (
              <div 
                key={c.id}
                className={`absolute animate-fall pointer-events-none ${
                  c.shape === 'circle' 
                    ? 'w-3 h-3 rounded-full' 
                    : c.shape === 'ribbon'
                    ? 'w-2 h-4 rounded-xs'
                    : 'w-3 h-3 rotate-45 rounded-xs'
                }`}
                style={{
                  left: `${c.left}%`,
                  top: '-24px',
                  backgroundColor: c.color,
                  animationDelay: `${c.delay}s`,
                  animationDuration: '2.5s',
                  transform: `rotate(${c.rotation}deg)`,
                }}
              />
            ))}
          </div>

          {/* Celebration Card */}
          <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-2xl border border-brand-100 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-250">
            <button 
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Trophy Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-brand-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-3 py-1 rounded-full">
                Reading Milestone
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white pt-1">
                Chapter Completed! 🎉
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You just finished Chapter {chapter.number} of <strong className="text-slate-800 dark:text-slate-200">{story.title}</strong>
              </p>
            </div>

            {/* Streak Bonus Pill */}
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40 text-orange-700 dark:text-orange-300 text-xs font-bold">
              <span className="text-base">🔥</span>
              <span>+1 Daily Streak Progress Logged!</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              {currentChapterIndex < story.chapters.length - 1 ? (
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    handleChapterChange(currentChapterIndex + 1);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-extrabold text-xs shadow-md shadow-brand-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Chapter {chapter.number + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/browse"
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Explore Another Story</span>
                  <Sparkles className="w-4 h-4" />
                </Link>
              )}

              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close & Review Comments
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
