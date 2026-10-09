'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { filterStoriesForUser } from '@/lib/agePolicy';
import { 
  Play, 
  Plus, 
  Check, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  Star, 
  Eye, 
  Heart, 
  X, 
  BookOpen, 
  Clock, 
  Crown, 
  Volume2, 
  VolumeX, 
  Share2, 
  Compass, 
  TrendingUp, 
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';

// =========================================================================
// SVG Number Component for Top 10 Showcase Row
// =========================================================================
function ShowcaseTop10Number({ number }) {
  return (
    <div className="relative shrink-0 select-none flex items-center justify-center -mr-4 sm:-mr-6 z-10 w-16 sm:w-24 md:w-28 h-48 sm:h-64 md:h-72">
      <svg 
        viewBox="0 0 100 130" 
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] overflow-visible"
      >
        <text
          x="50%"
          y="92%"
          textAnchor="middle"
          fontSize="130"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#141414"
          stroke="#595959"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {number}
        </text>
        <text
          x="50%"
          y="92%"
          textAnchor="middle"
          fontSize="130"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="url(#showcaseNumGrad)"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.85"
        >
          {number}
        </text>
        <defs>
          <linearGradient id="showcaseNumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2b2b2b" />
            <stop offset="50%" stopColor="#141414" />
            <stop offset="100%" stopColor="#080808" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// =========================================================================
// Single Story Showcase Card
// =========================================================================
function ShowcaseCard({ 
  story, 
  isTop10 = false, 
  rank = null, 
  onSelectStory, 
  isInLibrary, 
  onToggleLibrary 
}) {
  const inList = isInLibrary(story.id);

  // Match score algorithm based on reads and engagement
  const matchScore = useMemo(() => {
    const score = 88 + ((story.id * 7 + (story.reads || 0)) % 11);
    return Math.min(99, score);
  }, [story.id, story.reads]);

  return (
    <div className={`relative shrink-0 group select-none transition-all duration-300 ${
      isTop10 
        ? 'flex items-center w-52 sm:w-64 md:w-72' 
        : 'w-36 sm:w-44 md:w-52'
    }`}>
      {/* Top 10 Giant Digit */}
      {isTop10 && rank && <ShowcaseTop10Number number={rank} />}

      {/* Poster Container */}
      <div 
        onClick={() => onSelectStory(story)}
        className="w-full aspect-[2/3] relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-brand-500/20 group-hover:border-white/30 group-hover:z-30"
      >
        <img 
          src={story.cover} 
          alt={story.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {story.isOriginal ? (
            <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md">
              ORIGINAL
            </span>
          ) : story.contentType === 'picture_book' ? (
            <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md">
              ILLUSTRATED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
              {story.genre || 'Fiction'}
            </span>
          )}

          {story.ageRating && (
            <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-black border border-white/20">
              {story.ageRating}
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 z-20">
          
          {/* Quick Action Circles */}
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/read/${story.slug}?chapter=1`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black hover:bg-slate-200 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Start Reading Chapter 1"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLibrary(story.id);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                inList 
                  ? 'bg-brand-500 border-brand-500 text-white' 
                  : 'bg-black/60 border-white/40 text-white hover:border-white'
              }`}
              title={inList ? "Remove from My List" : "Add to My List"}
            >
              {inList ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectStory(story);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 border border-white/40 text-white hover:border-white flex items-center justify-center transition-all hover:scale-110 ml-auto cursor-pointer"
              title="More Details & Chapters"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info text */}
          <h4 className="text-white text-xs sm:text-sm font-black line-clamp-1 leading-tight">
            {story.title}
          </h4>
          <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
            By {story.author}
          </p>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold mt-1.5 flex-wrap">
            <span className="text-emerald-400 font-extrabold">{matchScore}% Match</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{story.chapters?.length || 1} Ch.</span>
            <span className="text-slate-400">•</span>
            <span className="text-amber-400 flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {(story.reads || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1.5 overflow-hidden">
            {(story.tags || []).slice(0, 2).map((t, idx) => (
              <span key={idx} className="text-[9px] text-slate-400 truncate">
                • {t}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Horizontal Scroll Category Shelf (Row)
// =========================================================================
function ShowcaseRow({ 
  title, 
  badge, 
  stories = [], 
  isTop10 = false, 
  onSelectStory, 
  isInLibrary, 
  onToggleLibrary 
}) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!stories || stories.length === 0) return null;

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const handleScroll = (direction) => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative group/row my-6 sm:my-8">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3 px-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {badge}
            </span>
          )}
          <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-1 transition-all" />
          </h3>
        </div>

        <Link 
          href="/browse" 
          className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          Explore All →
        </Link>
      </div>

      {/* Rail Container with Navigation Arrows */}
      <div className="relative">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-10 sm:w-14 bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all cursor-pointer rounded-r-xl"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={rowRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-none py-3 px-4 sm:px-8 scroll-smooth snap-x"
        >
          {stories.map((story, idx) => (
            <ShowcaseCard 
              key={story.id}
              story={story}
              isTop10={isTop10}
              rank={isTop10 ? idx + 1 : null}
              onSelectStory={onSelectStory}
              isInLibrary={isInLibrary}
              onToggleLibrary={onToggleLibrary}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 w-10 sm:w-14 bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all cursor-pointer rounded-l-xl"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </section>
  );
}

// =========================================================================
// Book Details & Chapter Episode Selector Modal
// =========================================================================
function ShowcaseDetailModal({ 
  story, 
  onClose, 
  isInLibrary, 
  onToggleLibrary, 
  allStories = [], 
  onSelectStory 
}) {
  if (!story) return null;

  const inList = isInLibrary(story.id);

  // Recommendations based on same genre/tags
  const relatedStories = allStories
    .filter(s => s.id !== story.id && (s.genreSlug === story.genreSlug || s.genre === story.genre))
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#141414] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#181818]/80 hover:bg-white hover:text-black text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Hero Banner */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-950">
          <img 
            src={story.cover} 
            alt={story.title} 
            className="w-full h-full object-cover scale-105 filter blur-xs brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />

          {/* Book Foreground & Title Info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6 z-20">
            <img 
              src={story.cover} 
              alt={story.title} 
              className="w-24 sm:w-36 aspect-[2/3] object-cover rounded-xl shadow-2xl border-2 border-white/20 shrink-0" 
            />

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {story.isOriginal && (
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[11px] font-black uppercase tracking-wider">
                    Avora Original
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-white/10 text-white text-xs font-bold uppercase">
                  {story.genre}
                </span>
                {story.ageRating && (
                  <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs font-bold border border-white/20">
                    {story.ageRating}
                  </span>
                )}
                <span className="text-emerald-400 font-extrabold text-xs">
                  98% Match
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {story.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Written by <span className="font-bold text-white">{story.author}</span> • {story.chapters?.length || 1} Chapters • {(story.reads || 0).toLocaleString()} Total Reads
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href={`/read/${story.slug}?chapter=1`}
                  className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 font-black text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Reading Chapter 1</span>
                </Link>

                <button
                  type="button"
                  onClick={() => onToggleLibrary(story.id)}
                  className={`px-4 py-2.5 rounded-full border text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer ${
                    inList 
                      ? 'bg-brand-500 border-brand-500 text-white' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  {inList ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                  <span>{inList ? 'In My List' : 'Add to My List'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          
          {/* Synopsis */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Synopsis
            </h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {story.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-2">
              {(story.tags || []).map((tag, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Episode / Chapter Picker */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-500" />
                <span>Chapters & Episodes ({story.chapters?.length || 1})</span>
              </h4>
              <span className="text-xs text-slate-400 font-bold">
                Serialized Story
              </span>
            </div>

            <div className="space-y-2">
              {(story.chapters && story.chapters.length > 0 ? story.chapters : [
                { id: 1, number: 1, title: 'Chapter 1: The Beginning', reads: story.reads || 1200 }
              ]).map((chap) => (
                <div 
                  key={chap.id || chap.number}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-black text-slate-400 group-hover:text-white w-6 text-center">
                      {chap.number}
                    </span>
                    <div>
                      <h5 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                        {chap.title || `Chapter ${chap.number}`}
                      </h5>
                      <span className="text-[11px] text-slate-400">
                        {chap.reads ? `${chap.reads.toLocaleString()} reads` : 'New chapter'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/read/${story.slug}?chapter=${chap.number}`}
                    className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-black flex items-center gap-1.5 transition-transform group-hover:scale-105 shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Read</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* More Like This Recommendations */}
          {relatedStories.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-base sm:text-lg font-black text-white">
                More Like This
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {relatedStories.map((rel) => (
                  <div 
                    key={rel.id}
                    onClick={() => onSelectStory(rel)}
                    className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-slate-900">
                      <img 
                        src={rel.cover} 
                        alt={rel.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">
                        {rel.genre}
                      </span>
                    </div>
                    <div className="p-3 space-y-1.5">
                      <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand-400">
                        {rel.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {rel.description}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-emerald-400 font-extrabold">96% Match</span>
                        <Link
                          href={`/read/${rel.slug}?chapter=1`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold text-brand-400 hover:underline"
                        >
                          Read →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Story Metadata */}
          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-1.5">
            <p><span className="text-white font-bold">Author:</span> {story.author}</p>
            <p><span className="text-white font-bold">Genre:</span> {story.genre}</p>
            <p><span className="text-white font-bold">Maturity:</span> {story.maturity || 'Everyone'}</p>
            <p><span className="text-white font-bold">Copyright:</span> {story.copyright || 'All Rights Reserved'}</p>
          </div>

        </div>

      </div>
    </div>
  );
}

// =========================================================================
// Main Book Showcase View Component
// =========================================================================
export default function BookShowcaseView() {
  const { 
    stories, 
    library, 
    addToLibrary, 
    removeFromLibrary, 
    isInLibrary, 
    readingProgress, 
    user, 
    t 
  } = useApp();

  const [selectedStory, setSelectedStory] = useState(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // Age Gate / DOB Policy Filter
  const accessibleStories = useMemo(() => filterStoriesForUser(stories, user), [stories, user]);

  // Dynamic ranking sorted strictly by reads descending
  const trendingStories = useMemo(() => {
    return [...accessibleStories].sort((a, b) => (b.reads || 0) - (a.reads || 0));
  }, [accessibleStories]);

  // Spotlight stories (Top 5)
  const spotlightStories = useMemo(() => {
    return trendingStories.slice(0, 5);
  }, [trendingStories]);

  const currentSpotlight = spotlightStories[spotlightIndex] || trendingStories[0];

  // Auto-rotate spotlight every 12 seconds
  useEffect(() => {
    if (spotlightStories.length <= 1) return;
    const interval = setInterval(() => {
      setSpotlightIndex(prev => (prev + 1) % spotlightStories.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [spotlightStories.length]);

  // Categorized Rows
  const top10Stories = useMemo(() => trendingStories.slice(0, 10), [trendingStories]);

  const originalsStories = useMemo(() => {
    return accessibleStories.filter(s => s.isOriginal);
  }, [accessibleStories]);

  const romanceStories = useMemo(() => {
    return accessibleStories.filter(s => 
      s.genreSlug === 'romance' || 
      s.genre?.toLowerCase().includes('romance') || 
      s.tags?.some(tag => ['romance', 'love', 'slowburn', 'dating'].includes(tag.toLowerCase()))
    );
  }, [accessibleStories]);

  const werewolfStories = useMemo(() => {
    return accessibleStories.filter(s => 
      s.genreSlug === 'werewolf' || 
      s.genreSlug === 'paranormal' || 
      s.tags?.some(tag => ['werewolf', 'vampire', 'alpha', 'pack', 'shifter', 'paranormal'].includes(tag.toLowerCase()))
    );
  }, [accessibleStories]);

  const fantasyStories = useMemo(() => {
    return accessibleStories.filter(s => 
      s.genreSlug === 'fantasy' || 
      s.tags?.some(tag => ['fantasy', 'magic', 'academy', 'alchemy', 'steampunk', 'dragons'].includes(tag.toLowerCase()))
    );
  }, [accessibleStories]);

  const pictureBooks = useMemo(() => {
    return accessibleStories.filter(s => 
      s.contentType === 'picture_book' || 
      s.tags?.some(tag => ['picture-book', 'illustrated', 'graphic', 'comics'].includes(tag.toLowerCase()))
    );
  }, [accessibleStories]);

  const thrillerStories = useMemo(() => {
    return accessibleStories.filter(s => 
      s.genreSlug === 'thriller' || 
      s.genreSlug === 'mystery' || 
      s.genreSlug === 'horror' || 
      s.tags?.some(tag => ['thriller', 'mystery', 'detective', 'crime', 'murder'].includes(tag.toLowerCase()))
    );
  }, [accessibleStories]);

  const sciFiStories = useMemo(() => {
    return accessibleStories.filter(s => 
      s.genreSlug === 'sci-fi' || 
      s.tags?.some(tag => ['sci-fi', 'cyberpunk', 'space', 'dystopian', 'future'].includes(tag.toLowerCase()))
    );
  }, [accessibleStories]);

  const editorsPicks = useMemo(() => {
    return accessibleStories.filter(s => s.isEditorsPick);
  }, [accessibleStories]);

  const continueReadingStories = useMemo(() => {
    if (!library || library.length === 0) return [];
    return library
      .map(id => accessibleStories.find(s => s.id === id))
      .filter(Boolean);
  }, [library, accessibleStories]);

  const handleToggleLibrary = (storyId) => {
    if (isInLibrary(storyId)) {
      removeFromLibrary(storyId);
    } else {
      addToLibrary(storyId);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-brand-500 selection:text-white transition-colors">
      
      {/* 1. CINEMATIC SPOTLIGHT BILLBOARD BANNER */}
      {currentSpotlight && (
        <section className="relative w-full h-[75vh] sm:h-[82vh] max-h-[780px] min-h-[500px] overflow-hidden bg-black select-none">
          
          {/* Backdrop Image with Multi-Gradient Vignette */}
          <div className="absolute inset-0">
            <img 
              src={currentSpotlight.cover} 
              alt={currentSpotlight.title}
              className="w-full h-full object-cover object-center filter brightness-60 scale-105 transition-all duration-1000"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent w-full lg:w-3/4" />
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
          </div>

          {/* Hero Content Container */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-8 flex flex-col justify-end pb-16 sm:pb-24 z-20">
            <div className="max-w-2xl space-y-4">
              
              {/* Badge Row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-brand-600 text-white font-black text-xs uppercase tracking-wider shadow-lg">
                  <Flame className="w-3.5 h-3.5 text-amber-300" /> TOP 10 TODAY
                </span>
                <span className="text-emerald-400 font-extrabold text-xs sm:text-sm">
                  99% Match
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-white text-xs font-bold">
                  {currentSpotlight.ageRating || '16+'}
                </span>
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">
                  {currentSpotlight.chapters?.length || 1} Chapters
                </span>
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">
                  {currentSpotlight.genre}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-xl">
                {currentSpotlight.title}
              </h1>

              {/* Synopsis snippet */}
              <p className="text-sm sm:text-base text-slate-200 line-clamp-3 leading-relaxed drop-shadow-md font-normal max-w-xl">
                {currentSpotlight.description}
              </p>

              {/* Author Credit */}
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Written by <span className="font-extrabold text-white">{currentSpotlight.author}</span>
              </p>

              {/* CTA Action Buttons */}
              <div className="flex items-center gap-3.5 pt-2 flex-wrap">
                <Link
                  href={`/read/${currentSpotlight.slug}?chapter=1`}
                  className="px-7 py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-black text-sm sm:text-base flex items-center gap-2 shadow-xl transition-transform hover:scale-105 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Reading</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggleLibrary(currentSpotlight.id)}
                  className={`px-5 py-3 rounded-xl border text-sm sm:text-base font-bold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer ${
                    isInLibrary(currentSpotlight.id)
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md'
                  }`}
                >
                  {isInLibrary(currentSpotlight.id) ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>In My List</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>My List</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStory(currentSpotlight)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-bold text-sm sm:text-base flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Info className="w-5 h-5" />
                  <span>More Info</span>
                </button>
              </div>

            </div>

            {/* Spotlight Selector Controls */}
            <div className="absolute right-4 sm:right-8 bottom-16 sm:bottom-24 flex items-center gap-2">
              {spotlightStories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSpotlightIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    spotlightIndex === idx 
                      ? 'w-8 bg-brand-500' 
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Jump to spotlight story ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 2. CATEGORY SHELVES (HORIZONTAL CAROUSEL RAILS) */}
      <div className="relative -mt-10 sm:-mt-16 z-30 space-y-6 sm:space-y-10 pb-20">

        {/* Row 1: Top 10 Books Today on Avora */}
        <ShowcaseRow 
          title="Top 10 Books Today on Avora"
          badge="🔥 Trending Now"
          stories={top10Stories}
          isTop10={true}
          onSelectStory={setSelectedStory}
          isInLibrary={isInLibrary}
          onToggleLibrary={handleToggleLibrary}
        />

        {/* Row 2: Continue Reading / My Reading Queue */}
        {continueReadingStories.length > 0 && (
          <ShowcaseRow 
            title="Continue Reading & My Reading List"
            badge="📚 In Your Queue"
            stories={continueReadingStories}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 3: Avora Originals & Exclusives */}
        {originalsStories.length > 0 && (
          <ShowcaseRow 
            title="Avora Originals & Exclusive Premieres"
            badge="👑 Exclusive"
            stories={originalsStories}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 4: Binge-Worthy Romance & Forbidden Desires */}
        {romanceStories.length > 0 && (
          <ShowcaseRow 
            title="Binge-Worthy Romance & Forbidden Desires"
            badge="❤️ Romance"
            stories={romanceStories}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 5: Werewolf, Vampire & Paranormal Sagas */}
        {werewolfStories.length > 0 && (
          <ShowcaseRow 
            title="Werewolves, Vampires & Paranormal Sagas"
            badge="🐺 Paranormal"
            stories={werewolfStories}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 6: Epic Fantasy & Magic Academies */}
        {fantasyStories.length > 0 && (
          <ShowcaseRow 
            title="Epic High Fantasy & Magic Academies"
            badge="⚔️ Fantasy"
            stories={fantasyStories}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 7: Illustrated Picture Books & Graphic Reads */}
        {pictureBooks.length > 0 && (
          <ShowcaseRow 
            title="Illustrated Picture Books & Graphic Reads"
            badge="🎨 Visual Books"
            stories={pictureBooks}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 8: Dark Thrillers & Psychological Suspense */}
        {thrillerStories.length > 0 && (
          <ShowcaseRow 
            title="Dark Thrillers, Crime & Psychological Suspense"
            badge="🕵️ Thriller"
            stories={thrillerStories}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 9: Sci-Fi & Cyberpunk Visions */}
        {sciFiStories.length > 0 && (
          <ShowcaseRow 
            title="Sci-Fi, Cyberpunk & Futuristic Odysseys"
            badge="🚀 Sci-Fi"
            stories={sciFiStories}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

        {/* Row 10: Editor's Choice & Award Winners */}
        {editorsPicks.length > 0 && (
          <ShowcaseRow 
            title="Editor's Choice & Hall of Fame"
            badge="🏆 Staff Pick"
            stories={editorsPicks}
            onSelectStory={setSelectedStory}
            isInLibrary={isInLibrary}
            onToggleLibrary={handleToggleLibrary}
          />
        )}

      </div>

      {/* 3. MODAL: MORE INFO & CHAPTER EPISODE PICKER */}
      {selectedStory && (
        <ShowcaseDetailModal 
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          isInLibrary={isInLibrary}
          onToggleLibrary={handleToggleLibrary}
          allStories={accessibleStories}
          onSelectStory={setSelectedStory}
        />
      )}

    </div>
  );
}

