'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';
import { useApp } from '@/context/AppContext';
import { 
  Filter, 
  Eye, 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Flame,
  Check,
  BookMarked,
  Plus
} from 'lucide-react';

export default function BrowsePage() {
  const { stories, genres, library, addToLibrary, removeFromLibrary, isInLibrary, t } = useApp();

  // Filters & Sorting state
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMaturity, setSelectedMaturity] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedTrope, setSelectedTrope] = useState('all');
  const [selectedLength, setSelectedLength] = useState('all');
  const [specialFilter, setSpecialFilter] = useState('all'); // 'all' | 'originals' | 'picks'
  const [sortBy, setSortBy] = useState('trending'); // 'trending' | 'newest' | 'most_read' | 'most_voted' | 'recently_updated'
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Filtered and sorted stories
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      if (selectedGenre !== 'all' && story.genreSlug !== selectedGenre) return false;
      if (selectedStatus !== 'all' && story.status !== selectedStatus) return false;
      if (selectedMaturity !== 'all' && story.maturity !== selectedMaturity) return false;
      if (selectedLanguage !== 'all' && story.language !== selectedLanguage) return false;
      if (selectedMood !== 'all' && story.mood !== selectedMood) return false;
      if (selectedTrope !== 'all' && story.trope !== selectedTrope) return false;
      if (selectedLength !== 'all' && story.length !== selectedLength) return false;
      if (specialFilter === 'originals' && !story.isOriginal) return false;
      if (specialFilter === 'picks' && !story.isEditorsPick) return false;
      if (searchFilter.trim() !== '') {
        const q = searchFilter.toLowerCase();
        const matchTitle = story.title.toLowerCase().includes(q);
        const matchAuthor = story.author.toLowerCase().includes(q);
        const matchTags = story.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchTags) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'most_read') return b.reads - a.reads;
      if (sortBy === 'most_voted') return b.votes - a.votes;
      if (sortBy === 'recently_updated') return b.id - a.id;
      return (b.reads + b.votes * 5) - (a.reads + a.votes * 5); // trending
    });
  }, [stories, selectedGenre, selectedStatus, selectedMaturity, selectedLanguage, selectedMood, selectedTrope, selectedLength, specialFilter, sortBy, searchFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStories.length / itemsPerPage) || 1;
  const paginatedStories = filteredStories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setSelectedGenre('all');
    setSelectedStatus('all');
    setSelectedMaturity('all');
    setSelectedLanguage('all');
    setSelectedMood('all');
    setSelectedTrope('all');
    setSelectedLength('all');
    setSpecialFilter('all');
    setSearchFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t.browse} Library</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore thousands of serialized novels, filtered by mood, tropes, maturity, and length.
            </p>
          </div>

          {/* Quick special toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setSpecialFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                specialFilter === 'all' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Stories
            </button>
            <button
              onClick={() => { setSpecialFilter('originals'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                specialFilter === 'originals' 
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              ⭐ House Originals
            </button>
            <button
              onClick={() => { setSpecialFilter('picks'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                specialFilter === 'picks' 
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              ✨ Editor’s Picks
            </button>
          </div>
        </div>

        {/* Filter Controls Row 1 & 2 */}
        <div className="space-y-3 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by title, author, tag..."
                value={searchFilter}
                onChange={(e) => { setSearchFilter(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Genre Filter */}
            <div>
              <select 
                value={selectedGenre}
                onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Genres (20+)</option>
                {genres.map(g => (
                  <option key={g.id} value={g.slug}>{g.name} ({g.count})</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select 
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Maturity Filter */}
            <div>
              <select 
                value={selectedMaturity}
                onChange={(e) => { setSelectedMaturity(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Maturity Levels</option>
                <option value="everyone">Everyone</option>
                <option value="mature">Mature (18+)</option>
              </select>
            </div>
          </div>

          {/* Trope, Mood, Length & Sorting Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Mood */}
            <div>
              <select 
                value={selectedMood}
                onChange={(e) => { setSelectedMood(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Moods</option>
                <option value="Mysterious">Mysterious</option>
                <option value="Romantic">Romantic</option>
                <option value="Dark">Dark & Atmospheric</option>
                <option value="Uplifting">Uplifting</option>
              </select>
            </div>

            {/* Trope */}
            <div>
              <select 
                value={selectedTrope}
                onChange={(e) => { setSelectedTrope(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Tropes</option>
                <option value="Enemies to Lovers">Enemies to Lovers</option>
                <option value="Slow Burn">Slow Burn</option>
                <option value="Survival">Survival</option>
                <option value="Found Family">Found Family</option>
              </select>
            </div>

            {/* Length */}
            <div>
              <select 
                value={selectedLength}
                onChange={(e) => { setSelectedLength(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Lengths</option>
                <option value="Short (<10)">Short (&lt;10 Chapters)</option>
                <option value="Medium (10-30)">Medium (10-30 Chapters)</option>
                <option value="Epic (30+)">Epic (30+ Chapters)</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <select 
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-bold text-brand-600 dark:text-brand-400 cursor-pointer"
              >
                <option value="trending">🔥 Trending</option>
                <option value="newest">🕒 Newest Releases</option>
                <option value="recently_updated">⚡ Recently Updated</option>
                <option value="most_read">👁️ Most Read</option>
                <option value="most_voted">❤️ Most Voted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pb-4">
          <p>Showing <span className="font-bold text-slate-900 dark:text-white">{filteredStories.length}</span> stories</p>
          {(selectedGenre !== 'all' || selectedStatus !== 'all' || selectedMaturity !== 'all' || selectedMood !== 'all' || selectedTrope !== 'all' || specialFilter !== 'all' || searchFilter !== '') && (
            <button onClick={resetFilters} className="text-brand-500 font-bold hover:underline">
              Clear all filters
            </button>
          )}
        </div>

        {/* Editor's Pick in Category Banner (Scope 2: shown on category pages) */}
        {selectedGenre !== 'all' && (
          (() => {
            const categoryPick = stories.find(s => s.genreSlug === selectedGenre && s.isEditorsPick) || stories.find(s => s.genreSlug === selectedGenre);
            if (!categoryPick) return null;
            return (
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img src={categoryPick.cover} alt={categoryPick.title} className="w-16 sm:w-20 aspect-[3/4] object-cover rounded-xl shadow-md shrink-0" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      ★ Editor's Pick in {categoryPick.genre}
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">{categoryPick.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">By {categoryPick.author} • {categoryPick.reads.toLocaleString()} reads</p>
                  </div>
                </div>
                <Link href={`/story/${categoryPick.slug}`} className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-md">
                  Read Spotlight Novel →
                </Link>
              </div>
            );
          })()
        )}

        {/* Stories Grid */}
        {paginatedStories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base">No stories match your filter criteria</h3>
            <p className="text-xs text-slate-500">Try adjusting your genre or search term to discover more serialized fiction.</p>
            <button onClick={resetFilters} className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStories.map((story) => (
              <div 
                key={story.id} 
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-brand-500/50 transition-all duration-200"
              >
                <div className="flex p-4 gap-4 flex-1">
                  <Link href={`/story/${story.slug}`} className="shrink-0 w-28 aspect-[3/4] relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={story.cover} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md">
                          {story.genre}
                        </span>
                        {story.ranking && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                            #{story.ranking.rank} in {story.ranking.tag}
                          </span>
                        )}
                        {story.isOriginal && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-600">
                            Original
                          </span>
                        )}
                        {story.maturity === 'mature' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                            18+
                          </span>
                        )}
                      </div>

                      <Link href={`/story/${story.slug}`}>
                        <h3 className="font-extrabold text-sm sm:text-base mt-1.5 line-clamp-1 group-hover:text-brand-500 transition-colors">
                          {story.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">By {story.author}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">{story.description}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {story.reads.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {story.votes.toLocaleString()}</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{story.chapters.length} Ch.</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Quick Library Save row */}
                <div className="px-4 pb-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {story.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => isInLibrary(story.id) ? removeFromLibrary(story.id) : addToLibrary(story.id)}
                    className={`p-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isInLibrary(story.id)
                        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isInLibrary(story.id) ? "Saved in Library" : "Add to Library"}
                  >
                    {isInLibrary(story.id) ? <Check className="w-3.5 h-3.5" /> : <BookMarked className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        <div className="pt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredStories.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            pageSizeOptions={[6, 9, 12, 24]}
          />
        </div>

      </main>

      <Footer />
    </div>
  );
}
