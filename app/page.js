'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeFeedView from '@/components/HomeFeedView';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  Flame, 
  Compass, 
  Smartphone, 
  QrCode, 
  ArrowRight, 
  Eye, 
  Heart, 
  MessageSquare, 
  Star, 
  Quote, 
  CheckCircle,
  TrendingUp,
  Bookmark,
  Share2,
  BookOpen
} from 'lucide-react';
import { filterStoriesForUser, filterGenresForUser } from '@/lib/agePolicy';

export default function HomePage() {
  const { 
    t, 
    stories, 
    genres, 
    testimonials, 
    readerReactions, 
    user,
    homeFeedViewMode = 'landing',
    setHomeFeedViewMode,
    translateGenre,
    translateStory
  } = useApp();
  const [installPromptShown, setInstallPromptShown] = useState(false);

  // DOB & Age Policy Enforced Content
  const accessibleStories = filterStoriesForUser(stories, user);
  const accessibleGenres = filterGenresForUser(genres, user);

  // Dynamic ranking: sorted automatically by total reads descending (#1, #2, #3...)
  const trendingStories = [...accessibleStories].sort((a, b) => (b.reads || 0) - (a.reads || 0));
  const houseOriginals = accessibleStories.filter(s => s.isOriginal);
  const editorsPicks = accessibleStories.filter(s => s.isEditorsPick);
  const mustReadFanfiction = accessibleStories.filter(s => s.genreSlug === 'fanfiction' || s.isFanfiction);

  const handleInstallClick = () => {
    setInstallPromptShown(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      {/* Dual-State View Switcher (Wattpad Feed vs Public Landing) */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-2 px-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <span>{t.homeView || 'Home View'}:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              <button
                onClick={() => setHomeFeedViewMode('feed')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                  homeFeedViewMode === 'feed'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-500'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.personalizedFeedNav || 'Personalized Feed'}</span>
              </button>
              <button
                onClick={() => setHomeFeedViewMode('landing')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                  homeFeedViewMode === 'landing'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-500'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.publicLandingNav || 'Public Landing'}</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>{user ? `${t.activeMember || 'Active Member'}: @${user.username}` : (t.guestVisitor || 'Guest Visitor')}</span>
            <span className="hidden md:inline">•</span>
            <Link href="/home" className="text-brand-600 font-bold hover:underline hidden md:inline">
              Direct Route: /home →
            </Link>
          </div>
        </div>
      </div>

      {homeFeedViewMode === 'feed' ? (
        /* 1. PERSONALIZED WATTPAD FEED VIEW */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HomeFeedView />
        </main>
      ) : (
        /* 2. PUBLIC SHOWCASE & MARKETING LANDING VIEW */
        <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/70 bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-[#fafbfc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Original Serialized Fiction & Community
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                  Stories That <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-amber-500 to-rose-500">
                    Capture Your Imagination.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {t.heroSubtitle}
                </p>
                
                {/* Hero section with sign-up, start reading, and login calls to action (Scope 1) */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link 
                    href="/register" 
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm text-center shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
                  >
                    {t.signUp || t.signup || 'Sign up'} Free
                  </Link>
                  <Link 
                    href="/browse" 
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 font-bold text-sm text-center hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                  >
                    {t.startReading}
                  </Link>
                  {!user && (
                    <Link 
                      href="/login" 
                      className="w-full sm:w-auto px-5 py-3.5 rounded-full text-slate-700 dark:text-slate-300 font-bold text-sm text-center hover:text-brand-500 transition-colors"
                    >
                      {t.logIn || t.login || 'Log in'} →
                    </Link>
                  )}
                  {user && (
                    <Link 
                      href="/write" 
                      className="w-full sm:w-auto px-5 py-3.5 rounded-full text-brand-600 dark:text-brand-400 font-bold text-sm text-center hover:underline"
                    >
                      {t.write} +
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-500" /> Free to Read</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-500" /> Line-by-Line Comments</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-500" /> Mobile PWA Offline</span>
                </div>
              </div>

              {/* Hero Spotlight Story Card */}
              {stories[0] && (() => {
                const spotStory = translateStory ? translateStory(stories[0]) : stories[0];
                return (
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="relative group w-full max-w-[280px] sm:max-w-xs rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transition-transform duration-300 hover:scale-[1.02]">
                      <img 
                        src={stories[0].cover} 
                        alt={spotStory.title} 
                        className="w-full h-[360px] sm:h-[450px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-brand-500 w-fit mb-2">
                          Featured House Original
                        </span>
                        <h3 className="text-2xl font-black">{spotStory.title}</h3>
                        <p className="text-xs text-slate-300 mt-1">{t?.by || 'By'} {spotStory.author}</p>
                        <p className="text-xs text-slate-300/90 mt-2 line-clamp-2">{spotStory.description}</p>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-brand-400" /> {stories[0].reads.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> {stories[0].votes.toLocaleString()}</span>
                          </div>
                          <Link href={`/read/${stories[0].slug}`} className="px-3 py-1.5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-200">
                            {t?.readNow || 'Read Now'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* 2. TRENDING NOW STORY CAROUSEL (Dynamically ordered by reads descending) */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Flame className="w-6 h-6 text-brand-500 fill-brand-500" />
                <h2 className="text-2xl font-black tracking-tight">{t.trendingNow}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  ⚡ Auto-Ranked by Reads
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The most active serialized stories readers are devouring today • Live ordered #1, #2, #3 by reader volume
              </p>
            </div>
            <Link href="/browse?sort=most_read" className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1">
              Leaderboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingStories.slice(0, 8).map((story, index) => {
              const locStory = translateStory ? translateStory(story) : story;
              return (
                <Link 
                  key={story.id} 
                  href={`/story/${story.slug}`} 
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-brand-500/50 transition-all duration-200 relative"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={story.cover} 
                      alt={locStory.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Real-time Leaderboard Position Ribbon */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black backdrop-blur-md shadow-md flex items-center gap-1 ${
                        index === 0
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 ring-1 ring-amber-300'
                        : index === 1
                          ? 'bg-slate-200/90 text-slate-900 ring-1 ring-slate-300 dark:bg-slate-800/90 dark:text-slate-100'
                        : index === 2
                          ? 'bg-amber-800/90 text-amber-100 ring-1 ring-amber-600'
                        : 'bg-slate-950/80 text-white'
                      }`}>
                        <span>{index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}</span>
                      </span>
                      {story.isOriginal && (
                        <span className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-brand-400">
                          ORIGINAL
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{translateGenre ? translateGenre(locStory.genre || story.genre) : (locStory.genre || story.genre)}</span>
                        {story.ranking && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            story.ranking.rank === 1
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300/40'
                              : story.ranking.rank === 2
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          }`}>
                            #{story.ranking.rank} {t?.inRankingTag ? t.inRankingTag.replace('{tag}', translateGenre ? translateGenre(story.ranking.tag) : story.ranking.tag) : `in ${story.ranking.tag}`}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base mt-1 line-clamp-1 text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-amber-400 transition-colors">{locStory.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t?.by || 'By'} {locStory.author}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300"><Eye className="w-3.5 h-3.5 text-brand-500" /> {(story.reads || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> {(story.votes || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 2B. EDITOR'S PICKS CAROUSEL (Admin-Curated, Scope 2) */}
        <section className="py-12 bg-amber-50/40 dark:bg-amber-950/20 border-y border-amber-200/50 dark:border-amber-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Editorial Selection</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">Editor's Picks</h2>
                <p className="text-xs text-slate-500 mt-0.5">Handpicked literary serialized masterpieces chosen directly by our staff</p>
              </div>
              <Link href="/browse?filter=picks" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                View All Picks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {editorsPicks.map((story) => {
                const locStory = translateStory ? translateStory(story) : story;
                return (
                  <div key={story.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-amber-200/60 dark:border-amber-900/50 p-4 flex gap-4 hover:shadow-lg transition-all group">
                    <img src={story.cover} alt={locStory.title} className="w-24 sm:w-28 aspect-[3/4] object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                            ★ Editor's Choice
                          </span>
                          <span className="text-[10px] text-slate-400">{translateGenre ? translateGenre(locStory.genre || story.genre) : (locStory.genre || story.genre)}</span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base mt-1.5 text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1">{locStory.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t?.by || 'By'} {locStory.author}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">{locStory.description}</p>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" /> {story.votes.toLocaleString()} votes
                        </span>
                        <Link href={`/story/${story.slug}`} className="text-xs font-bold text-amber-600 hover:underline">
                          Read Story →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. FEATURED CATEGORY CAROUSEL: "MUST-READ FANFICTION" (Admin-Chosen) */}
        <section className="py-14 bg-purple-50/50 dark:bg-purple-950/20 border-y border-purple-100 dark:border-purple-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Featured Category Spotlight</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Must-Read Fanfiction</h2>
                <p className="text-xs text-slate-500 mt-0.5">Admin-curated alternative universe and character spin-offs</p>
              </div>
              <Link href="/browse?genre=fanfiction" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                Explore Fanfiction <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mustReadFanfiction.map((story) => {
                const locStory = translateStory ? translateStory(story) : story;
                return (
                  <div key={story.id} className="flex bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-purple-200/60 dark:border-purple-900/50 p-4 gap-4 hover:shadow-lg transition-all">
                    <img src={story.cover} alt={locStory.title} className="w-28 sm:w-32 aspect-[3/4] object-cover rounded-xl" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
                            {translateGenre ? translateGenre(locStory.genre || story.genre) : (locStory.genre || story.genre)}
                          </span>
                          <span className="text-[10px] text-slate-400">• {story.chapters.length} {t?.chapters || 'Chapters'}</span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg mt-1.5 text-slate-900 dark:text-white">{locStory.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t?.by || 'By'} {locStory.author}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">{locStory.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {story.reads.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {story.votes.toLocaleString()}</span>
                        </div>
                        <Link href={`/story/${story.slug}`} className="text-xs font-bold text-purple-600 hover:underline">
                          Start Reading →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. 20+ GENRE LIBRARY GRID */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Catalog</span>
            <h2 className="text-3xl font-black tracking-tight">{t.genreLibrary}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">{t.genreSub}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
            {accessibleGenres.map((g) => (
              <Link 
                key={g.id} 
                href={`/browse?genre=${g.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  #
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                    {translateGenre ? translateGenre(g.slug) : g.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{g.count} titles</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. "READ. WATCH. OBSESS." FEATURED EDITORIAL CAROUSEL (Admin-Managed) */}
        <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center sm:text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">Flagship Stories</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-1">Read. Watch. Obsess.</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                The top-voted serialized phenomena destined for adaptation and worldwide acclaim.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {houseOriginals.map((story) => {
                const locStory = translateStory ? translateStory(story) : story;
                return (
                  <div key={story.id} className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700/80 hover:border-brand-500 transition-all flex flex-col justify-between">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={story.cover} alt={locStory.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-brand-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        HOUSE ORIGINAL
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-lg text-white">{locStory.title}</h3>
                        <p className="text-xs text-slate-400">{t?.by || 'By'} {locStory.author}</p>
                        <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">{locStory.description}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{story.reads.toLocaleString()} Reads</span>
                        <Link href={`/story/${story.slug}`} className="font-bold text-brand-400 hover:text-brand-300">
                          Dive In →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. COMMUNITY SECTION: SAMPLE READER REACTIONS & COMMENTS */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Passionate Fandom</span>
            <h2 className="text-3xl font-black tracking-tight">Real Reader Reactions</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              See what readers are exclaiming in paragraph-by-paragraph annotations right now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {readerReactions.map((r) => (
              <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600">
                    {r.reaction}
                  </span>
                  <span className="text-[10px] text-slate-400">{r.chapter}</span>
                </div>
                <p className="text-xs sm:text-sm italic text-slate-700 dark:text-slate-200 leading-relaxed">
                  "{r.comment}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <img src={r.avatar} alt={r.reader} className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{r.reader}</h4>
                    <p className="text-[10px] text-slate-400">On <strong className="text-brand-600">{r.storyTitle}</strong></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. AUTHOR SUCCESS STORIES / TESTIMONIALS (Admin-Managed, No Dummy Data) */}
        <section className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Creator Milestones</span>
              <h2 className="text-3xl font-black tracking-tight">{t.authorSuccess}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">{t.authorSuccessSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((test) => (
                <div key={test.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all">
                  <Quote className="w-8 h-8 text-brand-500/20 absolute top-4 right-4" />
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed mb-6">
                    "{test.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <img src={test.avatar} alt={test.author} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{test.author}</h4>
                      <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">{test.bookTitle}</p>
                      <p className="text-[10px] text-slate-400">{test.stats}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. INSTALL AS PWA SECTION WITH QR CODE */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-brand-950 text-white p-8 sm:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Smartphone className="w-3.5 h-3.5" /> Progressive Web App (PWA)
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                {t.installApp}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {t.installDesc} Reads seamlessly offline and resumes exactly where you left off on phone, tablet, or laptop.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button 
                  onClick={handleInstallClick}
                  className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-500/30"
                >
                  {t.installBtn}
                </button>
                {installPromptShown && (
                  <p className="text-xs text-brand-300 font-semibold flex items-center gap-1 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Web App ready: tap 'Add to Home Screen' in your mobile browser!
                  </p>
                )}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center">
              <div className="w-36 h-36 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <span className="text-xs font-bold text-slate-300 mt-3">{t.scanQR}</span>
              <span className="text-[10px] text-slate-400">Instant mobile web app</span>
            </div>
          </div>
        </section>
      </main>
      )}

      <Footer />
    </div>
  );
}
