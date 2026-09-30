'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
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
  Star
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
      currentStreak: 5,
      chaptersReadThisWeek: 14,
      dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysActive: [true, true, true, true, true, false, false]
    }, 
    user, 
    readingLists, 
    t 
  } = useApp();

  // Find active story for Continue Reading / Jump Back In
  const activeStoryId = Object.keys(readingProgress || {})[0] || (library.length > 0 ? library[0] : stories[0]?.id);
  const activeStory = stories.find(s => s.id === Number(activeStoryId)) || stories[0];
  const activeProgress = (readingProgress && readingProgress[activeStory?.id]) || {
    chapterNumber: 1,
    chapterTitle: activeStory?.chapters?.[0]?.title || "Chapter 1",
    progressPercent: 42,
    lastReadAt: "Today"
  };

  // Curated Recommendation Shelves
  const becauseYouRead = stories.filter(s => s.id !== activeStory?.id && (s.genreSlug === activeStory?.genreSlug || s.genreSlug === 'fantasy' || s.genreSlug === 'mystery'));
  const topRomance = stories.filter(s => s.genreSlug === 'romance');
  const houseOriginals = stories.filter(s => s.isOriginal);
  const communityFavorites = stories.filter(s => s.isTrending || s.reads > 50000);
  const libraryStories = library.map(id => stories.find(s => s.id === id)).filter(Boolean);

  const streakDays = readingStreak?.dayLabels || ["M", "T", "W", "T", "F", "S", "S"];
  const streakActive = readingStreak?.daysActive || [true, true, true, true, true, false, false];

  return (
    <div className="space-y-10 animate-fade-in pb-12">

      {/* 1. TOP HERO: JUMP BACK IN & READING STREAK WIDGET */}
      <section className="grid lg:grid-cols-12 gap-6">
        
        {/* Continue Reading / Jump Back In Bar */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          {/* Subtle Ambient Glow */}
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

          <div className="pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {activeStory?.chapters?.length || 1} Total Chapters published
            </span>

            <div className="flex items-center gap-3">
              <Link 
                href={`/story/${activeStory?.slug}`}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
              >
                Table of Contents
              </Link>
              <Link 
                href={`/read/${activeStory?.slug}`}
                className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-lg shadow-brand-500/25 flex items-center gap-1.5 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Resume Reading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Reading Streak & 7-Day Challenge Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wider">Reading Streak</h3>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                ACTIVE
              </span>
            </div>

            <div className="py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {readingStreak?.currentStreak || 5}
                </span>
                <span className="text-xs font-bold uppercase text-slate-400">Days in a row</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You've read <strong>{readingStreak?.chaptersReadThisWeek || 14} chapters</strong> this week. Keep reading today to maintain your streak!
              </p>
            </div>

            {/* 7-Day Visual Calendar Tracker */}
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {streakDays.map((day, idx) => {
                const active = streakActive[idx];
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">{day}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
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

      {/* 2. MY PERSONAL SHELF / READING LIST (HORIZONTAL SCROLL) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg sm:text-xl font-black">My Personal Shelf</h2>
            <span className="text-xs text-slate-400 font-bold">({libraryStories.length} books)</span>
          </div>
          <Link href="/library" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {libraryStories.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">Your personal library is empty.</p>
            <p className="text-[11px] text-slate-400">Save books to your shelf to read offline and receive chapter updates!</p>
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
                      title="Remove from Shelf"
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
                  <span>{story.chapters?.length || 1} Ch.</span>
                  <Link href={`/read/${story.slug}`} className="font-extrabold text-brand-600 dark:text-brand-400 hover:underline">
                    Read →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. ALGORITHMIC RECOMMENDATION ROW: "BECAUSE YOU READ THE SHADOW ALCHEMIST" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h2 className="text-lg sm:text-xl font-black">Because You Read {activeStory?.title}</h2>
            </div>
            <p className="text-xs text-slate-400">Serialized fiction recommendations based on your recent library choices</p>
          </div>
          <Link href="/browse?genre=fantasy" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>Explore More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {becauseYouRead.slice(0, 4).map(story => (
            <StoryFeedCard 
              key={story.id} 
              story={story} 
              isInLib={isInLibrary(story.id)}
              onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)} 
            />
          ))}
        </div>
      </section>

      {/* 4. CURATED GENRE ROW: TRENDING IN ROMANCE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h2 className="text-lg sm:text-xl font-black">Top Picks in Romance & Drama</h2>
            </div>
            <p className="text-xs text-slate-400">Enemies-to-lovers, slow-burn mysteries, and contemporary serialized romance</p>
          </div>
          <Link href="/browse?genre=romance" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>See Romance</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {topRomance.slice(0, 4).map(story => (
            <StoryFeedCard 
              key={story.id} 
              story={story} 
              isInLib={isInLibrary(story.id)}
              onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)} 
            />
          ))}
        </div>
      </section>

      {/* 5. HOUSE ORIGINALS & WATTY LAUREATES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-black">Avora House Originals & Watty Winners</h2>
            </div>
            <p className="text-xs text-slate-400">Flagship serialized masterworks produced in collaboration with our editorial studio</p>
          </div>
          <Link href="/browse?filter=originals" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>All Originals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {houseOriginals.slice(0, 4).map(story => (
            <StoryFeedCard 
              key={story.id} 
              story={story} 
              isInLib={isInLibrary(story.id)}
              onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)} 
            />
          ))}
        </div>
      </section>

      {/* 6. COMMUNITY FAVORITES & VIRAL SERIALS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h2 className="text-lg sm:text-xl font-black">Community Favorites & Rising Serials</h2>
            </div>
            <p className="text-xs text-slate-400">The most discussed weekly chapter drops across the Avora Library reader community</p>
          </div>
          <Link href="/browse?sort=trending" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {communityFavorites.slice(0, 4).map(story => (
            <StoryFeedCard 
              key={story.id} 
              story={story} 
              isInLib={isInLibrary(story.id)}
              onToggleLib={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)} 
            />
          ))}
        </div>
      </section>

    </div>
  );
}

// Reusable Wattpad-style Card Component for Feed Rows
function StoryFeedCard({ story, isInLib, onToggleLib }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
          <img 
            src={story.cover} 
            alt={story.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />

          {/* Ranking Badge if present */}
          {story.ranking && (
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30 flex items-center gap-1">
              <span>#{story.ranking.rank} in {story.ranking.tag}</span>
            </div>
          )}

          {/* Quick Add to Library Button */}
          <button
            onClick={onToggleLib}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isInLib
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-black/40 hover:bg-black/70 text-white'
            }`}
            title={isInLib ? "Saved in Library" : "Add to Library"}
          >
            {isInLib ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
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

