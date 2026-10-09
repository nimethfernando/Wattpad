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

function formatInlineText(text) {
  if (!text) return '';
  const tokens = text.split(/(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={idx} className="font-extrabold text-current">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={idx} className="italic">{token.slice(1, -1)}</em>;
    }
    return token;
  });
}

export default function ReaderPage() {
  const params = useParams() || {};
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : (Array.isArray(rawSlug) ? rawSlug[0] : '');
  const router = useRouter();
  const { 
    stories, 
    setStories,
    isHydrated,
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

  const [localCustomFallback, setLocalCustomFallback] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !stories.some(s => s.slug === slug || String(s.id) === String(slug))) {
      try {
        const stored = localStorage.getItem('avora_custom_stories');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find(s => s.slug === slug || String(s.id) === String(slug));
          if (found) {
            setLocalCustomFallback(found);
            if (setStories) {
              setStories(prev => {
                if (!prev.some(s => s.id === found.id || s.slug === found.slug)) {
                  return [found, ...prev];
                }
                return prev;
              });
            }
          }
        }
      } catch (e) {}
    }
  }, [slug, stories, setStories]);

  const story = stories.find(s => s.slug === slug || String(s.id) === String(slug)) || localCustomFallback;
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

  // Detect chapter query parameter (e.g. ?chapter=2)
  useEffect(() => {
    if (typeof window !== 'undefined' && story?.chapters?.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const chapterQuery = params.get('chapter');
      if (chapterQuery) {
        const targetIdx = story.chapters.findIndex(c => String(c.number) === String(chapterQuery) || String(c.id) === String(chapterQuery));
        if (targetIdx !== -1) {
          setCurrentChapterIndex(targetIdx);
        }
      }
    }
  }, [story]);

  // Sync reading progress
  useEffect(() => {
    if (story && chapter) {
      saveReadingProgress(story.id, chapter.id, 0);
    }
  }, [story?.id, chapter?.id]);

  // Update browser tab title to show chapter and story title
  useEffect(() => {
    if (story) {
      const chNum = chapter?.number ?? (currentChapterIndex + 1);
      const chTitle = chapter?.title ? `Ch. ${chNum}: ${chapter.title}` : `Chapter ${chNum}`;
      document.title = `${chTitle} | ${story.title} - Avora Library`;
    } else {
      document.title = 'Avora Library';
    }
  }, [story?.title, chapter?.title, chapter?.number, currentChapterIndex]);

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

  // Story existence check
  if (!story) {
    if (!isHydrated) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl animate-pulse">
            <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto" />
            <div className="h-6 w-48 bg-slate-800 rounded mx-auto" />
            <div className="h-4 w-64 bg-slate-800 rounded mx-auto" />
            <p className="text-xs text-slate-400">Loading reader & chapter...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-black">Story Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The serialized story or chapter you are looking for does not exist or may have been unpublished.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/browse"
              className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 font-bold text-xs shadow-md shadow-brand-500/25 transition-all text-center text-white"
            >
              Browse Stories
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-full border border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-800 transition-all text-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Moderation Enforcement: Check if Story or Author is Banned/Removed
  if (story.status === 'removed' || story.isBanned || story.isRemoved) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3.5 py-1 rounded-full inline-block border border-rose-500/30">
            Removed by Moderation
          </span>
          <h2 className="text-2xl font-black">Story Unavailable</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Reading access to this serialized story has been terminated because the author was banned for violating community safety standards ({story.moderationReason || 'Content policy violation'}).
          </p>

          <div className="w-full bg-slate-800/80 p-3.5 rounded-2xl text-left text-xs space-y-1.5 border border-slate-700">
            <div className="flex justify-between text-slate-400">
              <span>Title:</span>
              <strong className="text-white">{story.title}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Author:</span>
              <strong className="text-slate-300">@{story.authorUsername || story.author}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <strong className="text-rose-400">Banned & Taken Down</strong>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/browse"
              className="w-full inline-block py-3 rounded-full bg-brand-500 hover:bg-brand-600 font-bold text-xs shadow-md shadow-brand-500/25 transition-all text-center"
            >
              Browse Verified Community Stories →
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const themeStyles = {
    dark: {
      chapterPill: 'bg-brand-500/15 text-brand-400 border border-brand-500/30 font-black',
      rankingPill: 'bg-amber-950/80 text-amber-200 border border-amber-700 font-black',
      readsPill: 'bg-slate-800 text-slate-200 border border-slate-700 font-bold',
      h1: 'text-white',
      meta: 'text-slate-300',
      author: 'text-white font-extrabold',
      h2: 'text-white border-white/10',
      h3: 'text-brand-400',
      h4: 'text-slate-300',
      quote: 'text-slate-200 bg-brand-500/10 border-brand-500',
      reactionsHeader: 'text-slate-200',
      reactionBtn: 'bg-white/10 text-slate-200 border-white/10',
      divider: 'border-white/10',
      prevBtn: 'text-slate-200 hover:text-brand-400',
      topNav: 'border-white/10 bg-slate-900/90 text-slate-100',
      activeThemePill: 'bg-white/20 text-white font-bold',
      drawerCard: 'bg-slate-900 border-white/10 text-slate-100',
    },
    sepia: {
      chapterPill: 'bg-brand-500/15 text-brand-700 border border-brand-600/30 font-black',
      rankingPill: 'bg-[#edd9af] text-[#4a2e0e] border border-[#d6be8c] font-black',
      readsPill: 'bg-[#ebdcb9] text-[#2b1d0c] border border-[#d6be8c] font-black',
      h1: 'text-[#2b1d0c]',
      meta: 'text-[#5c4326]',
      author: 'text-[#2b1d0c] font-extrabold',
      h2: 'text-[#2b1d0c] border-[#ebdcb9]',
      h3: 'text-brand-700',
      h4: 'text-[#5c4326]',
      quote: 'text-[#2b1d0c] bg-amber-500/10 border-brand-600',
      reactionsHeader: 'text-[#2b1d0c]',
      reactionBtn: 'bg-[#edd9af]/80 text-[#2b1d0c] border-[#d6be8c]',
      divider: 'border-[#ebdcb9]',
      prevBtn: 'text-[#2b1d0c] hover:text-brand-600',
      topNav: 'border-[#e5dac2] bg-[#f2ebd9]/95 text-[#2b1d0c]',
      activeThemePill: 'bg-[#edd9af] text-[#2b1d0c] font-black shadow-xs',
      drawerCard: 'bg-[#fffaf0] border-[#ebdcb9] text-[#2b1d0c]',
    },
    light: {
      chapterPill: 'bg-brand-500/10 text-brand-600 border border-brand-500/30 font-black',
      rankingPill: 'bg-amber-100 text-amber-900 border border-amber-300 font-black',
      readsPill: 'bg-slate-100 text-slate-800 border border-slate-300 font-bold',
      h1: 'text-slate-900',
      meta: 'text-slate-600',
      author: 'text-slate-900 font-extrabold',
      h2: 'text-slate-900 border-slate-200',
      h3: 'text-brand-600',
      h4: 'text-slate-700',
      quote: 'text-slate-800 bg-brand-500/5 border-brand-500',
      reactionsHeader: 'text-slate-800',
      reactionBtn: 'bg-slate-100 text-slate-800 border-slate-200',
      divider: 'border-slate-200',
      prevBtn: 'text-slate-800 hover:text-brand-600',
      topNav: 'border-slate-200 bg-white/95 text-slate-900',
      activeThemePill: 'bg-slate-200 text-slate-900 font-bold',
      drawerCard: 'bg-white border-slate-200 text-slate-900',
    }
  };
  const tStyles = themeStyles[readerTheme] || themeStyles.sepia;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      readerTheme === 'dark' ? 'dark-reader bg-slate-950 text-slate-100' :
      readerTheme === 'sepia' ? 'sepia-reader bg-[#faf5eb] text-[#2b1d0c]' : 'light-reader bg-white text-slate-900'
    }`}>
      
      {/* 1. TOP READER NAVIGATION BAR */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-8 h-14 flex items-center justify-between relative ${tStyles.topNav}`}>
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
        <header className="mb-10 text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
            <span className={`text-xs sm:text-sm uppercase font-black tracking-wider px-3.5 py-1 rounded-full ${tStyles.chapterPill}`}>
              Chapter {chapter.number}
            </span>
            {story.ranking && (
              <span className={`text-xs sm:text-sm font-black px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 ${tStyles.rankingPill}`}>
                <span>{story.ranking.rank === 1 ? '🥇 #1' : story.ranking.rank === 2 ? '🥈 #2' : story.ranking.rank === 3 ? '🥉 #3' : `#${story.ranking.rank}`} in {story.ranking.tag}</span>
              </span>
            )}
            <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 px-3.5 py-1 rounded-full shadow-xs ${tStyles.readsPill}`}>
              <Eye className="w-3.5 h-3.5 text-brand-500" /> {(story.reads || 0).toLocaleString()} reads
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight pt-1 ${tStyles.h1}`}>
            {chapter.title}
          </h1>
          <p className={`text-xs sm:text-sm font-medium ${tStyles.meta}`}>
            By <strong className={`font-bold ${tStyles.author}`}>{story.author}</strong> • Published {chapter.publishedAt}
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
            {chapter.paragraphs?.map((p) => {
              const rawText = p.text ? p.text.trim() : '';

              // 1. Scene Divider (* * * or --- or ***)
              const isSceneBreak = rawText === '---' || rawText === '***' || rawText === '* * *' || rawText === '— — —' || rawText === '✦ ✦ ✦';
              if (isSceneBreak) {
                return (
                  <div 
                    key={p.id}
                    onClick={() => setActiveParagraph(p)}
                    className="relative group py-6 my-4 flex items-center justify-center gap-4 text-brand-500/80 cursor-pointer select-none"
                  >
                    <span className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></span>
                    <span className="font-serif text-sm tracking-widest text-slate-400 dark:text-slate-500">✦ ✦ ✦</span>
                    <span className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveParagraph(p);
                      }}
                      className="absolute right-[-15px] sm:right-[-32px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-black bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105"
                      title="Scene Break Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{p.comments?.length || 0}</span>
                    </button>
                  </div>
                );
              }

              // 2. Major Heading (# Act / Part)
              if (rawText.startsWith('# ')) {
                return (
                  <div 
                    key={p.id}
                    onClick={() => setActiveParagraph(p)}
                    className="relative group p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer mt-8 mb-3"
                  >
                    <h2 className={`text-2xl sm:text-3xl font-black tracking-tight font-sans border-b pb-2 ${tStyles.h2}`}>
                      {formatInlineText(rawText.slice(2))}
                    </h2>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveParagraph(p);
                      }}
                      className="absolute right-[-15px] sm:right-[-32px] top-3 opacity-85 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-black bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105"
                      title="View & Post Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{p.comments?.length || 0}</span>
                    </button>
                  </div>
                );
              }

              // 3. Subheading (## Scene / Sub-chapter Title)
              if (rawText.startsWith('## ')) {
                return (
                  <div 
                    key={p.id}
                    onClick={() => setActiveParagraph(p)}
                    className="relative group p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer mt-7 mb-2"
                  >
                    <h3 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5 font-sans ${tStyles.h3}`}>
                      <span className="w-1.5 h-5 bg-brand-500 rounded-full inline-block shrink-0"></span>
                      <span>{formatInlineText(rawText.slice(3))}</span>
                    </h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveParagraph(p);
                      }}
                      className="absolute right-[-15px] sm:right-[-32px] top-3 opacity-85 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-black bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105"
                      title="View & Post Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{p.comments?.length || 0}</span>
                    </button>
                  </div>
                );
              }

              // 4. Section / Timestamp (### Location / Section)
              if (rawText.startsWith('### ')) {
                return (
                  <div 
                    key={p.id}
                    onClick={() => setActiveParagraph(p)}
                    className="relative group p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer mt-5 mb-1"
                  >
                    <h4 className={`text-xs sm:text-sm font-black uppercase tracking-widest font-sans ${tStyles.h4}`}>
                      {formatInlineText(rawText.slice(4))}
                    </h4>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveParagraph(p);
                      }}
                      className="absolute right-[-15px] sm:right-[-32px] top-2 opacity-85 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-black bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105"
                      title="View & Post Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{p.comments?.length || 0}</span>
                    </button>
                  </div>
                );
              }

              // 4B. Blockquote / Character Dialogue (> Quote)
              if (rawText.startsWith('> ')) {
                return (
                  <div 
                    key={p.id}
                    onClick={() => setActiveParagraph(p)}
                    className="relative group p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer my-4"
                  >
                    <blockquote className={`border-l-4 pl-4 py-2 italic font-serif rounded-r-xl leading-relaxed ${tStyles.quote}`}>
                      {formatInlineText(rawText.slice(2))}
                    </blockquote>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveParagraph(p);
                      }}
                      className="absolute right-[-15px] sm:right-[-32px] top-2 opacity-85 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-black bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105"
                      title="View & Post Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{p.comments?.length || 0}</span>
                    </button>
                  </div>
                );
              }

              // 4C. Inline Illustration Image (![alt](url))
              if (rawText.startsWith('![') && rawText.includes('](') && rawText.endsWith(')')) {
                const match = rawText.match(/\!\[(.*?)\]\((.*?)\)/);
                if (match) {
                  const alt = match[1] || 'Illustration';
                  const src = match[2];
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setActiveParagraph(p)}
                      className="relative group p-2 my-6 text-center cursor-pointer"
                    >
                      <img src={src} alt={alt} className="max-h-96 rounded-2xl mx-auto shadow-md border border-slate-200 dark:border-slate-800 object-cover" />
                      {alt && alt.toLowerCase() !== 'illustration' && (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic mt-2">{alt}</p>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveParagraph(p);
                        }}
                        className="absolute right-[-15px] sm:right-[-32px] top-2 opacity-85 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-black bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105"
                        title="View & Post Comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{p.comments?.length || 0}</span>
                      </button>
                    </div>
                  );
                }
              }

              // 5. Standard Paragraph with inline formatting
              return (
                <div 
                  key={p.id}
                  onClick={() => setActiveParagraph(p)}
                  className="relative group p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <p className="leading-relaxed whitespace-pre-line">{formatInlineText(p.text)}</p>

                  {/* Inline Reaction Badge */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveParagraph(p);
                    }}
                    className="absolute right-[-15px] sm:right-[-32px] top-2 opacity-85 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-black bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-md transition-all hover:scale-105"
                    title="View & Post Paragraph Comments"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{p.comments?.length || 0}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CHAPTER EMOJI REACTIONS */}
        <div className={`mt-14 pt-8 border-t flex flex-col items-center gap-4 relative ${tStyles.divider}`}>
          <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${tStyles.reactionsHeader}`}>
            Chapter Emoji Reactions
          </span>
          
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

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {['🔥', '❤️', '😭', '👏', '😱'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiReact(emoji)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border hover:scale-110 active:scale-95 transition-all text-sm font-bold shadow-xs cursor-pointer ${tStyles.reactionBtn}`}
              >
                <span className="text-base">{emoji}</span>
                <span className="text-xs sm:text-sm font-black">{chapter.emojis?.[emoji] || 0}</span>
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
              className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-extrabold text-sm sm:text-base transition-all shadow-xl cursor-pointer ${
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
                className="flex items-center gap-2 px-7 py-3.5 rounded-full font-extrabold text-sm sm:text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer"
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
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold disabled:opacity-30 cursor-pointer transition-colors ${tStyles.prevBtn}`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerChapterCompletion}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 transition-all hover:scale-105 cursor-pointer shadow-xs"
                title="Celebrate finishing this chapter with confetti"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Celebrate Finish 🎉</span>
              </button>

              {currentChapterIndex < story.chapters.length - 1 ? (
                <button 
                  onClick={() => handleChapterChange(currentChapterIndex + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={triggerChapterCompletion}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all cursor-pointer animate-pulse"
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
        readerTheme={readerTheme}
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

      {/* 4. CHAPTERS DRAWER (HIGH CONTRAST & THEME AWARE) */}
      {showChapterDrawer && (
        <div 
          onClick={() => setShowChapterDrawer(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`chapter-drawer w-84 max-w-[calc(100vw-3rem)] h-full p-6 shadow-2xl overflow-y-auto space-y-4 border-r flex flex-col ${
              readerTheme === 'dark' 
                ? 'bg-slate-900 text-slate-100 border-slate-800' 
                : readerTheme === 'sepia' 
                ? 'bg-[#faf5eb] text-[#2b1d0c] border-[#ebdcb9]' 
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-brand-600 dark:text-brand-400">
                  Table of Contents
                </span>
                <h3 className="font-black text-base text-current">
                  All Chapters ({story.chapters.length})
                </h3>
              </div>
              <button 
                onClick={() => setShowChapterDrawer(false)} 
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Close Table of Contents"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chapters List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {story.chapters.map((ch, idx) => {
                const isActive = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id}
                    onClick={() => { handleChapterChange(idx); setShowChapterDrawer(false); }}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                      isActive
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md scale-[1.01]'
                        : readerTheme === 'dark'
                        ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-100 hover:text-white border-slate-700/80 hover:border-slate-600'
                        : readerTheme === 'sepia'
                        ? 'bg-[#f4ecd8]/90 hover:bg-[#edd9af] text-[#2b1d0c] hover:text-[#1a1005] border-[#e2d5bd] hover:border-[#cfbc99]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-900 hover:text-black border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : readerTheme === 'dark'
                          ? 'bg-slate-700/90 text-slate-200'
                          : readerTheme === 'sepia'
                          ? 'bg-[#edd9af] text-[#4a3525]'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        Ch. {ch.number}
                      </span>
                      <span className={`truncate text-xs font-extrabold ${isActive ? 'text-white' : 'text-current'}`}>
                        {ch.title?.replace(/^Chapter\s+\d+:\s*/i, '') || `Chapter ${ch.number}`}
                      </span>
                    </div>
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 shrink-0 text-white" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-black/10 dark:border-white/10 shrink-0 flex items-center justify-between text-[11px] opacity-75 font-semibold">
              <span>Reading: Chapter {chapter.number}</span>
              <span>{Math.round(scrollProgress)}% completed</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. MOBILE READING APPEARANCE BOTTOM SHEET */}
      {showAppearanceModal && (
        <div 
          onClick={() => setShowAppearanceModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:hidden"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full rounded-t-3xl p-6 border-t space-y-5 animate-in slide-in-from-bottom duration-200 ${
              readerTheme === 'dark' 
                ? 'bg-slate-900 text-slate-100 border-slate-800' 
                : readerTheme === 'sepia' 
                ? 'bg-[#faf5eb] text-[#2b1d0c] border-[#ebdcb9]' 
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
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
