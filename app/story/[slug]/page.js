'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportModal from '@/components/ReportModal';
import ReadingListModal from '@/components/ReadingListModal';
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
  ArrowRight,
  Plus,
  Trophy,
  BookMarked,
  Sparkles,
  ChevronDown,
  Lock
} from 'lucide-react';
import { canUserAccessContent, filterStoriesForUser } from '@/lib/agePolicy';

export default function StoryDetailPage() {
  const params = useParams() || {};
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : (Array.isArray(rawSlug) ? rawSlug[0] : '');
  const { 
    stories, 
    setStories,
    isHydrated,
    followingAuthors, 
    followAuthor,
    library,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    wishlist,
    toggleWishlist,
    isInWishlist,
    readingLists,
    setReadingLists,
    readingProgress,
    openAuthModal,
    user,
    setAgeVerificationModalOpen,
    openPaymentModal,
    featureFlags,
    t,
    translateGenre
  } = useApp();

  const [copiedShare, setCopiedShare] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showReadingListModal, setShowReadingListModal] = useState(false);
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

  useEffect(() => {
    if (story?.title) {
      document.title = `${story.title} - Avora Library`;
    } else {
      document.title = 'Avora Library';
    }
  }, [story?.title]);

  if (!story) {
    if (!isHydrated) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-24 text-center flex flex-col items-center justify-center animate-pulse">
            <div className="w-20 h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6" />
            <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-3" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading serialized story...</p>
          </main>
          <Footer />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">Story Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-md">
            The serialized story you are looking for does not exist or may have been unpublished by the author.
          </p>
          <Link 
            href="/browse" 
            className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all"
          >
            Browse Stories Library →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Moderation Enforcement: Check if Story or Author is Banned/Removed
  if (story.status === 'removed' || story.isBanned || story.isRemoved) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/15">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-500/10 px-3.5 py-1 rounded-full mb-3 border border-rose-500/20">
            Content Removed by Moderation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mb-3 text-slate-900 dark:text-white">
            Story Unavailable
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-xs sm:text-sm max-w-md leading-relaxed">
            This story was removed by platform administrators following community reports for violating our content and safety guidelines ({story.moderationReason || 'Inappropriate content policy violation'}).
          </p>
          <div className="w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 mb-6 shadow-sm">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Title:</span>
              <strong className="text-slate-900 dark:text-white">{story.title}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Author:</span>
              <span className="font-semibold">{story.author}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Status:</span>
              <span className="font-extrabold text-rose-600">Taken Down / Author Banned</span>
            </div>
          </div>
          <Link 
            href="/browse" 
            className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all"
          >
            Browse Verified Community Stories →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Core Platform-Level Rule: Check DOB Age & Access Permissions
  const accessCheck = canUserAccessContent(user, story);
  if (!accessCheck.canAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full mb-2">
            Classified: {story.ageRating || '18+'} Content
          </span>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Age-Restricted Content
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {accessCheck.message}
          </p>

          <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 mb-6 shadow-sm">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Title:</span>
              <strong className="text-slate-900 dark:text-white">{story.title}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Required Rating:</span>
              <span className="font-extrabold text-rose-500">{story.ageRating || '18+'}</span>
            </div>
            {accessCheck.userAge !== null && (
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Your Verified Age:</span>
                <span className="font-bold text-amber-500">{accessCheck.userAge} years old</span>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-2.5">
            {accessCheck.reason === 'LOGIN_REQUIRED_FOR_MATURE' && (
              <button
                onClick={() => openAuthModal('login', `Log in with an age-verified account to read ${story.title}.`)}
                className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all cursor-pointer"
              >
                Log In / Create Verified Account
              </button>
            )}

            {accessCheck.reason === 'DOB_REQUIRED' && (
              <button
                onClick={() => setAgeVerificationModalOpen(true)}
                className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all cursor-pointer"
              >
                Verify Your Date of Birth
              </button>
            )}

            <Link
              href="/browse"
              className="w-full py-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
            >
              Browse Age-Appropriate Stories →
            </Link>

            <Link
              href="/home"
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold pt-1"
            >
              Return to Family Home Feed
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFollowing = followingAuthors.includes(story.authorUsername);
  const inLib = isInLibrary(story.id);
  const isWish = isInWishlist ? isInWishlist(story.id) : false;

  // Reading progress check
  const savedProgress = readingProgress[story.id];
  const currentChapter = savedProgress 
    ? story.chapters.find(c => c.id === savedProgress.chapterId) || story.chapters[0]
    : story.chapters[0];

  // Related stories from same genre filtered strictly by user's verified age
  const accessibleStories = filterStoriesForUser(stories, user);
  const relatedStories = accessibleStories.filter(s => s.id !== story.id && s.genre === story.genre);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleToggleReadingList = (listId) => {
    if (!user) {
      openAuthModal('login', 'Log in to curate your custom reading lists.');
      return;
    }
    setReadingLists(prev => prev.map(l => {
      if (l.id === listId) {
        const hasStory = l.storyIds.includes(story.id);
        return {
          ...l,
          storyIds: hasStory ? l.storyIds.filter(id => id !== story.id) : [...l.storyIds, story.id]
        };
      }
      return l;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Story Hero Header Card with Ambient Blurred Backdrop (Wattpad Style) */}
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Ambient Glow Backdrop */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl -z-10 opacity-20 dark:opacity-30 blur-3xl pointer-events-none">
            <img src={story.cover} alt="" className="w-full h-full object-cover scale-150" />
          </div>

          {/* Story Cover */}
          <div className="w-56 sm:w-64 aspect-[3/4] shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-100 dark:border-slate-800 relative group">
            <img src={story.cover} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {story.isOriginal && (
              <span className="absolute top-3 left-3 bg-brand-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                HOUSE ORIGINAL
              </span>
            )}
          </div>

          {/* Story Details & CTAs */}
          <div className="flex-1 flex flex-col justify-between space-y-5">
            <div>
              {/* Category, Status, Maturity */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg">
                  {translateGenre ? translateGenre(story.genre) : story.genre}
                </span>
                {/* Age Rating Badge */}
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                  story.ageRating === '18+' 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                    : story.ageRating === '16+'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      : story.ageRating === '13+'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}>
                  Rating: {story.ageRating || (story.maturity === 'mature' ? '18+' : '13+')}
                </span>

                {story.contentType === 'picture_book' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    📖 Illustrated Picture Book
                  </span>
                )}

                {story.status === 'completed' && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ✓ Completed
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {story.title}
              </h1>

              {/* Wattpad-style Leaderboard Ranking Badge */}
              {story.ranking && (
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-700 dark:text-amber-400 flex-wrap">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>{story.ranking.rank === 1 ? '🥇 #1' : story.ranking.rank === 2 ? '🥈 #2' : story.ranking.rank === 3 ? '🥉 #3' : `#${story.ranking.rank}`} {t?.inRankingTag ? t.inRankingTag.replace('{tag}', translateGenre ? translateGenre(story.ranking.tag) : story.ranking.tag) : `in ${story.ranking.tag}`}</span>
                  {story.ranking.globalRank && (
                    <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                      #{story.ranking.globalRank} Overall
                    </span>
                  )}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">out of {story.ranking.totalInTag}</span>
                </div>
              )}

              {/* Author Row */}
              <div className="flex items-center gap-4 mt-4 pt-2">
                <Link href={`/profile/${story.authorUsername}`} className="flex items-center gap-2.5 group">
                  <img src={story.authorAvatar} alt={story.author} className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20" />
                  <div>
                    <p className="text-xs text-slate-400">{t?.writtenBy || 'Written by'}</p>
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
                  {isFollowing ? (t?.following || 'Following') : (t?.follow || 'Follow')}
                </button>

                {featureFlags?.enablePaidFeatures && (
                  <button
                    onClick={() => {
                      openPaymentModal({
                        mode: 'donate',
                        author: story.author,
                        authorUsername: story.authorUsername,
                        story: story
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm cursor-pointer hover:scale-105"
                    title={`Send a tip to ${story.author}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>{t?.tipAuthor || 'Tip Author'}</span>
                  </button>
                )}

                {/* Report button */}
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 ml-auto cursor-pointer"
                  title="Report Content"
                >
                  <Flag className="w-3.5 h-3.5" /> {t?.report || 'Report'}
                </button>
              </div>

              {/* Story Stats */}
              <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-300 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold"><Eye className="w-4 h-4 text-brand-500" /> {story.reads.toLocaleString()} {t?.reads || 'Reads'}</span>
                <span className="flex items-center gap-1.5 font-semibold"><Heart className="w-4 h-4 text-rose-500" /> {story.votes.toLocaleString()} {t?.votes || 'Votes'}</span>
                <span className="flex items-center gap-1.5 font-semibold"><MessageSquare className="w-4 h-4 text-indigo-500" /> {story.commentsCount.toLocaleString()} {t?.comments || 'Comments'}</span>
                <span className="flex items-center gap-1.5 font-semibold"><BookOpen className="w-4 h-4 text-amber-500" /> {story.chapters.length} {t?.chapters || 'Chapters'}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
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

            {/* Read & Wattpad-style Library CTA Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-3 flex-wrap">
              {/* Primary Start / Continue Reading Button */}
              <Link 
                href={`/read/${story.slug}`} 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> 
                {savedProgress 
                  ? `${t?.continueReading || 'Continue Reading'} (Ch. ${currentChapter.number})` 
                  : (t?.startReading || 'Start Reading Chapter 1')}
              </Link>

              {/* Add to Library Toggle Button & Reading List Popover Group */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => inLib ? removeFromLibrary(story.id) : addToLibrary(story.id)}
                  className={`flex-1 sm:flex-initial px-5 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inLib
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-500'
                  }`}
                >
                  {inLib ? <Check className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
                  <span>{inLib ? (t?.inLibrary || 'In Your Library') : (t?.addToLibrary || 'Add to Library')}</span>
                </button>

                {/* Dedicated 1-Click Wish List Button */}
                <button
                  onClick={() => toggleWishlist && toggleWishlist(story.id)}
                  className={`px-4 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isWish
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-400 hover:text-rose-500'
                  }`}
                  title={isWish ? (t?.removeFromWishlist || "Remove from Wish List") : (t?.addToWishlist || "Add to Wish List")}
                >
                  <Heart className={`w-4 h-4 ${isWish ? 'fill-current text-rose-500' : ''}`} />
                  <span>{isWish ? (t?.wishlisted || 'Wish Listed') : (t?.wishlist || 'Wish List')}</span>
                </button>

                {/* Add to Reading List Popover */}
                <div className="relative">
                  <button
                    onClick={() => setShowListDropdown(!showListDropdown)}
                    className="p-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Add to Reading List"
                  >
                    <BookMarked className="w-4 h-4" />
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showListDropdown && (
                    <div className="absolute left-0 bottom-14 sm:bottom-auto sm:top-14 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs">
                      <div className="flex items-center justify-between px-2 py-1">
                        <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                          Save to Reading List
                        </p>
                        <button 
                          onClick={() => {
                            setShowListDropdown(false);
                            setShowReadingListModal(true);
                          }}
                          className="text-[11px] font-bold text-brand-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> New
                        </button>
                      </div>
                      <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                        {readingLists.map((list) => {
                          const isContained = list.storyIds.includes(story.id);
                          return (
                            <button
                              key={list.id}
                              onClick={() => handleToggleReadingList(list.id)}
                              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-semibold cursor-pointer"
                            >
                              <span className="truncate">{list.title}</span>
                              {isContained && <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                      <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setShowListDropdown(false);
                            setShowReadingListModal(true);
                          }}
                          className="w-full py-1.5 text-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Manage All Lists
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Button */}
              <button 
                onClick={handleShare}
                className="p-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
                href={`/read/${story.slug}?chapter=${chapter.number}`}
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
                    <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-amber-400">{rel.title}</h4>
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

      {/* Reading List Management Modal */}
      <ReadingListModal 
        isOpen={showReadingListModal}
        onClose={() => setShowReadingListModal(false)}
        story={story}
      />

      <Footer />
    </div>
  );
}
