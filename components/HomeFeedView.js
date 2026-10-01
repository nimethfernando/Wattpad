'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ReadingListModal from '@/components/ReadingListModal';
import { filterStoriesForUser, filterGenresForUser } from '@/lib/agePolicy';
import { 
  Flame, 
  BookOpen, 
  ChevronRight, 
  Check, 
  Plus, 
  Sparkles, 
  Clock, 
  Eye, 
  Heart, 
  Trophy, 
  BookMarked, 
  ArrowRight, 
  TrendingUp, 
  Star,
  MoreVertical,
  EyeOff,
  UserCheck,
  UserPlus,
  SlidersHorizontal,
  BookmarkCheck,
  BookmarkPlus
} from 'lucide-react';

export default function HomeFeedView() {
  const { 
    stories, 
    library, 
    addToLibrary, 
    removeFromLibrary, 
    isInLibrary, 
    readingProgress, 
    getProgress, 
    readingStreak = {
      currentStreak: 0,
      chaptersReadThisWeek: 0,
      dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysActive: [false, false, false, false, false, false, false]
    }, 
    user, 
    readingLists, 
    userPreferences,
    openOnboardingModal,
    hiddenStoryIds = [],
    hideStory,
    followingAuthors = [],
    followAuthor,
    t,
    emergingGenres = [],
    genreEngagement = {},
    addGenreToFavorites,
    triggerEmergingModal
  } = useApp();

  const [selectedStoryForList, setSelectedStoryForList] = useState(null);

  // 1. Core DOB Age Policy Filter + hidden stories filter
  const ageApprovedStories = filterStoriesForUser(stories, user);
  const visibleStories = ageApprovedStories.filter(s => !hiddenStoryIds.includes(s.id));

  // 2. Find active story for Continue Reading / Jump Back In
  const activeStoryId = Object.keys(readingProgress || {})[0] || (library.length > 0 ? library[0] : visibleStories[0]?.id);
  const activeStory = visibleStories.find(s => s.id === Number(activeStoryId)) || visibleStories[0];
  const activeProgress = (readingProgress && readingProgress[activeStory?.id]) || {
    chapterNumber: 1,
    chapterTitle: activeStory?.chapters?.[0]?.title || "Chapter 1",
    progressPercent: 0,
    lastReadAt: "New"
  };

  // 3. User Selected Favorite Genres filtered by age policy
  const defaultGenres = (user?.experienceMode === 'kids' || (user?.age !== undefined && user.age < 18))
    ? ["Kids Books", "Educational Stories", "Fantasy"]
    : ["Romance", "Fantasy", "Werewolf"];

  const rawFavoriteGenres = userPreferences?.favoriteGenres && userPreferences.favoriteGenres.length > 0
    ? userPreferences.favoriteGenres
    : defaultGenres;

  const favoriteGenres = filterGenresForUser(rawFavoriteGenres, user);

  // Helper: Match story to genre keyword
  const matchesGenre = (story, targetGenre) => {
    if (!targetGenre) return false;
    const g = targetGenre.toLowerCase();
    const cleanG = g.split('&')[0].trim().replace(/\s+/g, '-');
    return (
      story.genre?.toLowerCase().includes(g.split(' ')[0]) ||
      story.genreSlug?.toLowerCase().includes(cleanG) ||
      story.tags?.some(tag => tag.toLowerCase().includes(g.split(' ')[0]))
    );
  };

  // 4. "Tailored For You" - Stories matching any of the user's selected genres (dynamically sorted by reads)
  const tailoredStories = visibleStories
    .filter(story => favoriteGenres.some(genre => matchesGenre(story, genre)))
    .sort((a, b) => (b.reads || 0) - (a.reads || 0));

  // 4B. Top Reading Leaderboard (strictly sorted #1, #2, #3... by live total reads)
  const topReadingLeaderboard = [...visibleStories]
    .sort((a, b) => (b.reads || 0) - (a.reads || 0));

  // 5. Stories from Followed Writers
  const followedAuthorsStories = visibleStories.filter(story =>
    followingAuthors.some(author => 
      author.toLowerCase() === story.authorUsername?.toLowerCase() ||
      author.toLowerCase() === story.author?.toLowerCase().replace(/\s+/g, '')
    )
  );

  // 6. Dynamic Genre Shelves: Dedicated shelf for each top favorite genre
  const topDynamicGenres = favoriteGenres.slice(0, 3);

  // 7. House Originals & Library Stories
  const libraryStories = library.map(id => visibleStories.find(s => s.id === id)).filter(Boolean);
  const houseOriginals = visibleStories.filter(s => s.isOriginal);

  const streakDays = readingStreak?.dayLabels || ["M", "T", "W", "T", "F", "S", "S"];
  const streakActive = readingStreak?.daysActive || [true, true, true, true, true, false, false];

  return (
    <div className="space-y-10 animate-fade-in pb-12">

      {/* 1. TOP HERO: JUMP BACK IN & READING STREAK WIDGET */}
      <section className="grid lg:grid-cols-12 gap-6">
        
        {/* Continue Reading / Jump Back In Bar */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 pb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Clock className="w-3.5 h-3.5" /> Jump Back In • Resume Reading
              </span>
              <span className="text-[11px] text-slate-400">
                Updated {activeProgress.lastReadAt || 'recently'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-2">
              <Link href={`/read/${activeStory?.slug}`} className="shrink-0 group">
                <img 
                  src={activeStory?.cover} 
                  alt={activeStory?.title} 
                  className="w-20 sm:w-24 aspect-[3/4] object-cover rounded-xl shadow-lg ring-2 ring-white/10 group-hover:scale-105 transition-transform" 
                />
              </Link>

              <div className="flex-1 space-y-2">
                <Link href={`/story/${activeStory?.slug}`} className="hover:underline">
                  <h2 className="text-xl sm:text-2xl font-black text-white line-clamp-1">
                    {activeStory?.title}
                  </h2>
                </Link>
                <p className="text-xs text-slate-300">
                  By <strong className="text-white font-bold">{activeStory?.author}</strong> • {activeStory?.genre}
                </p>
                <p className="text-xs font-semibold text-brand-400">
                  Chapter {activeProgress.chapterNumber}: {activeProgress.chapterTitle}
                </p>

                {/* Reading Progress Bar */}
                <div className="space-y-1 pt-1 max-w-md">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>Progress</span>
                    <span className="text-white">{activeProgress.progressPercent || 40}% completed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-500" 
                      style={{ width: `${activeProgress.progressPercent || 40}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {activeStory?.chapters?.length || 1} Total Chapters published
            </span>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link 
                href={`/story/${activeStory?.slug}`}
                className="flex-1 sm:flex-initial text-center text-xs font-bold text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
              >
                Table of Contents
              </Link>
              <Link 
                href={`/read/${activeStory?.slug}`}
                className="flex-1 sm:flex-initial text-center px-5 sm:px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Resume Reading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Reading Streak & 7-Day Challenge Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wider">Reading Streak</h3>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                (readingStreak?.currentStreak ?? 0) > 0 
                  ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {(readingStreak?.currentStreak ?? 0) > 0 ? 'ACTIVE' : 'READY'}
              </span>
            </div>

            <div className="py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {readingStreak?.currentStreak ?? 0}
                </span>
                <span className="text-xs font-bold uppercase text-slate-400">Days in a row</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You've read <strong>{readingStreak?.chaptersReadThisWeek ?? 0} chapters</strong> this week. Keep reading today to maintain your streak!
              </p>
            </div>

            {/* 7-Day Visual Calendar Tracker */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
              {streakDays.map((day, idx) => {
                const active = streakActive[idx];
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">{day}</span>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-tr from-brand-500 to-amber-400 text-white shadow-md shadow-brand-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {active ? '✓' : idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Weekly Goal: 15 Ch.</span>
            <span className="font-extrabold text-brand-600 dark:text-brand-400">93% Achieved</span>
          </div>
        </div>

      </section>

      {/* 2. TAILORED FOR YOU (MAIN WATTPAD ALGORITHMIC HERO SHELF) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg sm:text-xl font-black">{t.tailoredForYou || 'Tailored For You'}</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60">
                {t.personalizedFeed ? 'Personalized' : 'Personalized'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.personalizedFeed || 'Curated from your favorite genres'}: <strong className="text-slate-700 dark:text-slate-300">{favoriteGenres.join(', ')}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerEmergingModal && triggerEmergingModal('Romance')}
              className="self-start sm:self-auto text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Simulate Taste Pop-up (e.g. user started reading Romance)"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>⚡ Test Taste Pop-up</span>
            </button>

            <button
              onClick={openOnboardingModal}
              className="self-start sm:self-auto text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t.filterGenre || 'Customize Genres'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {(tailoredStories.length > 0 ? tailoredStories : visibleStories).slice(0, 4).map(story => (
            <StoryFeedCard 
              key={story.id} 
              story={story} 
              isInLib={isInLibrary(story.id)}
              onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)}
              onOpenReadingList={(s) => setSelectedStoryForList(s)}
              onHideStory={(id) => hideStory(id)}
            />
          ))}
        </div>
      </section>

      {/* 2B. ADAPTIVE TASTE DISCOVERY: SEPARATELY POPPING OUT NEWLY LIKED GENRES */}
      {emergingGenres.map((genre) => {
        const genreStories = visibleStories
          .filter(s => matchesGenre(s, genre))
          .sort((a, b) => (b.reads || 0) - (a.reads || 0));
        if (genreStories.length === 0) return null;
        const readCount = genreEngagement?.[genre]?.reads || 2;

        return (
          <section key={`emerging-${genre}`} className="space-y-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-500/5 via-pink-500/5 to-purple-500/5 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-purple-950/30 border border-rose-200/70 dark:border-rose-900/50 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {t.trendingInRecentReading || 'Trending In Your Recent Reading'}: {genre}
                  </h2>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800">
                    ⚡ {t.newlyDetectedTaste || 'Auto-Detected Taste'} • {readCount} {t.reads || 'Reads'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.detectedTasteDesc || "Because you've been reading this lately, here are popular stories curated separately for you!"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => addGenreToFavorites(genre)}
                  className="text-xs font-bold px-3.5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addToFavorites || 'Add to My Favorites'}</span>
                </button>
                <Link 
                  href={`/browse?genre=${encodeURIComponent(genre.toLowerCase())}`} 
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <span>{t.exploreAll || 'Explore All'} {genre}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pt-1">
              {genreStories.slice(0, 4).map(story => (
                <StoryFeedCard 
                  key={story.id} 
                  story={story} 
                  isInLib={isInLibrary(story.id)}
                  onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)}
                  onOpenReadingList={(s) => setSelectedStoryForList(s)}
                  onHideStory={(id) => hideStory(id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* 2B. TOP READING LEADERBOARD (Strictly sorted by reads descending: #1, #2, #3...) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg sm:text-xl font-black">{t.topReadingLeaderboard || 'Top Reading Leaderboard'}</h2>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                ⚡ {t.autoRankedByReads || 'Auto-Ranked by Reads'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live leaderboard updated automatically as community members read chapters across the library
            </p>
          </div>

          <Link
            href="/browse?sort=most_read"
            className="self-start sm:self-auto text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors cursor-pointer"
          >
            <span>{t.fullLeaderboard || 'Full Leaderboard'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {topReadingLeaderboard.slice(0, 4).map(story => (
            <StoryFeedCard 
              key={story.id} 
              story={story} 
              isInLib={isInLibrary(story.id)}
              onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)}
              onOpenReadingList={(s) => setSelectedStoryForList(s)}
              onHideStory={(id) => hideStory(id)}
            />
          ))}
        </div>
      </section>

      {/* 3. UPDATES FROM WRITERS YOU FOLLOW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg sm:text-xl font-black">{t.updatesFromFollowed || 'Updates From Writers You Follow'}</h2>
            </div>
            <p className="text-xs text-slate-400">Latest serialized chapter drops from authors in your network</p>
          </div>
          <Link href="/browse?tab=authors" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>{t.discoverAuthors || 'Discover Authors'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {followedAuthorsStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {followedAuthorsStories.slice(0, 4).map(story => (
              <StoryFeedCard 
                key={story.id} 
                story={story} 
                isInLib={isInLibrary(story.id)}
                onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)}
                onOpenReadingList={(s) => setSelectedStoryForList(s)}
                onHideStory={(id) => hideStory(id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              You haven't followed any authors with new chapters yet.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Follow creators to receive instant notifications when they publish new serialized chapters!
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => followAuthor('elenavance')}
                className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-200 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Follow Elena Vance
              </button>
              <button
                onClick={() => followAuthor('astraquill')}
                className="px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Follow Astra Quill
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. MY PERSONAL SHELF / READING LIST (HORIZONTAL SCROLL) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg sm:text-xl font-black">{t.myPersonalShelf || 'My Personal Shelf'}</h2>
            <span className="text-xs text-slate-400 font-bold">({libraryStories.length} {t.library || 'books'})</span>
          </div>
          <Link href="/library" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>{t.viewAll || 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {libraryStories.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">{t.emptyShelf || 'Your personal library is empty.'}</p>
            <p className="text-[11px] text-slate-400">{t.emptyShelfDesc || 'Save books to your shelf to read offline and receive chapter updates!'}</p>
          </div>
        ) : (
          <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x">
            {libraryStories.map(story => (
              <div 
                key={story.id} 
                className="w-40 sm:w-44 shrink-0 snap-start bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                    <img src={story.cover} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button
                      onClick={() => removeFromLibrary(story.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-500 transition-colors cursor-pointer"
                      title={t.removeFromLibrary || 'Remove from Shelf'}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                  <Link href={`/story/${story.slug}`}>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 hover:text-brand-500">
                      {story.title}
                    </h3>
                  </Link>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{story.author}</p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{story.chapters?.length || 1} {t.chapters || 'Ch.'}</span>
                  <Link href={`/read/${story.slug}`} className="font-extrabold text-brand-600 dark:text-brand-400 hover:underline">
                    {t.readNow || 'Read'} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. DYNAMIC SHELVES GENERATED FROM USER'S ONBOARDING GENRES */}
      {topDynamicGenres.map((genre) => {
        const genreStories = visibleStories
          .filter(s => matchesGenre(s, genre))
          .sort((a, b) => (b.reads || 0) - (a.reads || 0));
        if (genreStories.length === 0) return null;

        return (
          <section key={genre} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-brand-500 fill-brand-500" />
                  <h2 className="text-lg sm:text-xl font-black">{t.becauseYouFavorite || 'Because You Favorite'}: {genre}</h2>
                </div>
                <p className="text-xs text-slate-400">Top-rated serialized novels matching your {genre} reading preference</p>
              </div>
              <Link 
                href={`/browse?genre=${encodeURIComponent(genre.toLowerCase())}`} 
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>{t.exploreAll || 'See More in'} {genre}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {genreStories.slice(0, 4).map(story => (
                <StoryFeedCard 
                  key={story.id} 
                  story={story} 
                  isInLib={isInLibrary(story.id)}
                  onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)}
                  onOpenReadingList={(s) => setSelectedStoryForList(s)}
                  onHideStory={(id) => hideStory(id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* 6. HOUSE ORIGINALS & WATTY WINNERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-black">{t.houseOriginalsShelf || t.houseOriginals || 'Avora House Originals & Watty Winners'}</h2>
            </div>
            <p className="text-xs text-slate-400">{t.houseOriginalsDesc || t.houseOriginalsSub || 'Flagship serialized masterworks produced in collaboration with our editorial studio'}</p>
          </div>
          <Link href="/browse?filter=originals" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>{t.viewAll || 'All Originals'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {houseOriginals.slice(0, 4).map(story => (
            <StoryFeedCard 
              key={story.id} 
              story={story} 
              isInLib={isInLibrary(story.id)}
              onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)}
              onOpenReadingList={(s) => setSelectedStoryForList(s)}
              onHideStory={(id) => hideStory(id)}
            />
          ))}
        </div>
      </section>

      {/* Reading List Modal */}
      {selectedStoryForList && (
        <ReadingListModal 
          isOpen={Boolean(selectedStoryForList)}
          onClose={() => setSelectedStoryForList(null)}
          story={selectedStoryForList}
        />
      )}

    </div>
  );
}

// Reusable Wattpad-style Card Component with 3-Dot Quick Actions
function StoryFeedCard({ story, isInLib, onToggleLib, onOpenReadingList, onHideStory }) {
  const { isInWishlist, toggleWishlist, t } = useApp();
  const isWish = isInWishlist ? isInWishlist(story.id) : false;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative">
      <div>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
          <img 
            src={story.cover} 
            alt={story.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />

          {/* Dynamic Ranking Badge if present */}
          {story.ranking && (
            <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-md border flex items-center gap-1 z-10 shadow-sm ${
              story.ranking.rank === 1
                ? 'bg-amber-950/90 text-amber-300 border-amber-400/50 ring-1 ring-amber-400/30'
                : story.ranking.rank === 2
                ? 'bg-slate-900/90 text-slate-200 border-slate-400/40'
                : story.ranking.rank === 3
                ? 'bg-amber-950/80 text-amber-200 border-amber-600/40'
                : 'bg-slate-950/80 text-slate-300 border-slate-700/50'
            }`}>
              <span>{story.ranking.rank === 1 ? '🥇 #1' : story.ranking.rank === 2 ? '🥈 #2' : story.ranking.rank === 3 ? '🥉 #3' : `#${story.ranking.rank}`} in {story.ranking.tag}</span>
            </div>
          )}

          {/* Age Rating & Content Format Badges */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10 flex-wrap">
            {story.ageRating && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full backdrop-blur-md border ${
                story.ageRating === '18+'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : story.ageRating === '16+'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}>
                {story.ageRating}
              </span>
            )}
            {story.contentType === 'picture_book' && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                🎨 Illustrated
              </span>
            )}
          </div>

          {/* Top Right Actions: Quick Wishlist + Quick Add + 3-Dot Menu */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
            {/* Quick Wish List Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (toggleWishlist) toggleWishlist(story.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isWish
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-black/50 hover:bg-black/80 text-white'
              }`}
              title={isWish ? (t?.removeFromWishlist || "Remove from Wish List") : (t?.addToWishlist || "Add to Wish List")}
            >
              <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-current text-white' : 'text-white'}`} />
            </button>

            {/* Quick Add to Library Button */}
            <button
              onClick={onToggleLib}
              className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isInLib
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-black/50 hover:bg-black/80 text-white'
              }`}
              title={isInLib ? "Saved in Library" : "Add to Library"}
            >
              {isInLib ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            {/* 3-Dot Quick Action Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer"
                title="More story options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* 3-Dot Menu Popover */}
              {menuOpen && (
                <div className="absolute right-0 top-10 w-44 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenReadingList(story);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <BookMarked className="w-3.5 h-3.5 text-brand-500" />
                    <span>{t.saveToReadingList || 'Save to Reading List'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleLib();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    {isInLib ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t.inOfflineShelf || 'In Offline Shelf'}</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.addToShelf || 'Add to Shelf'}</span>
                      </>
                    )}
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onHideStory(story.id);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{t.hideStory || 'Hide / Not Interested'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Link href={`/story/${story.slug}`}>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-brand-500 transition-colors">
            {story.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-400 mt-0.5">By {story.author}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {story.description}
        </p>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(story.reads || 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {(story.votes || 0).toLocaleString()}</span>
        </div>
        <span className="font-bold text-brand-600 dark:text-brand-400">
          {story.chapters?.length || 1} Ch.
        </span>
      </div>
    </div>
  );
}
