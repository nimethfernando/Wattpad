'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  Heart, 
  BookOpen, 
  X, 
  Check, 
  Flame, 
  Star, 
  ArrowRight,
  TrendingUp,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export default function EmergingGenreModal() {
  const {
    emergingGenrePrompt,
    setEmergingGenrePrompt,
    addGenreToFavorites,
    dismissEmergingGenre,
    stories = [],
    userPreferences,
    t = {}
  } = useApp();

  if (!emergingGenrePrompt || !emergingGenrePrompt.open) {
    return null;
  }

  const genre = emergingGenrePrompt.genre;
  const readsCount = emergingGenrePrompt.reads || 2;
  const currentFavs = userPreferences?.favoriteGenres || [];

  // Find popular stories in this emerging genre sorted by reads descending
  const popularInGenre = (stories || [])
    .filter(s => {
      const g = (genre || '').toLowerCase();
      return (
        s.genre?.toLowerCase().includes(g) ||
        s.genreSlug?.toLowerCase().includes(g.replace(/\s+/g, '-')) ||
        s.tags?.some(tag => tag.toLowerCase().includes(g))
      );
    })
    .sort((a, b) => (b.reads || 0) - (a.reads || 0))
    .slice(0, 3);

  const handleAddToFavorites = () => {
    addGenreToFavorites(genre);
  };

  const handleDismiss = () => {
    dismissEmergingGenre(genre);
  };

  return (
    <div 
      className="fixed inset-0 z-[115] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/25 animate-pulse">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                ✨ {t.newlyDetectedTaste || 'Auto-Detected Reading Taste'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.trendingInRecentReading ? `${t.trendingInRecentReading}: ${genre}` : `You've Been Loving ${genre} Lately!`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {readsCount} {t.chapters || 'chapters'} {t.published || 'read in'} <strong>{genre}</strong>.
            </p>
          </div>
        </div>

        {/* Descriptive Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-purple-500/10 border border-rose-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          <p className="font-semibold text-slate-900 dark:text-white">
            {t.detectedTasteDesc || `Because you've been reading ${genre} lately, we can automatically feature popular ${genre} books on your home dashboard!`}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            {t.becauseYouFavorite || 'Current Favorites'}: <strong>{currentFavs.join(', ')}</strong>.
          </p>
        </div>

        {/* Popular Stories Preview in this Genre */}
        {popularInGenre.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{t.trendingNow || 'Top Popular in'} {genre}</span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400">{t.autoRankedByReads || 'Ranked by reads'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {popularInGenre.map((story, idx) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  onClick={handleDismiss}
                  className="group block bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:border-rose-400 transition-all text-left"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5">
                    <img 
                      src={story.cover} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-slate-950/80 text-amber-400">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : `🥉 #3`}
                    </div>
                  </div>
                  <h4 className="font-bold text-[11px] text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-500">
                    {story.title}
                  </h4>
                  <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Eye className="w-2.5 h-2.5 text-brand-500" /> {(story.reads || 0).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={handleAddToFavorites}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Star className="w-4 h-4 fill-white" />
            <span>{t.addToFavorites || 'Add to My Favorites'}</span>
          </button>

          <Link
            href={`/browse?genre=${encodeURIComponent(genre.toLowerCase())}&sort=most_read`}
            onClick={handleDismiss}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors text-center"
          >
            <span>{t.exploreAll || 'Explore'} {genre}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="text-center pt-1">
          <button
            onClick={handleDismiss}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            {t.all ? 'Not right now' : 'Not right now'}
          </button>
        </div>
      </div>
    </div>
  );
}

