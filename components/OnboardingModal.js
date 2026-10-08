'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  BookOpen, 
  PenTool, 
  Sparkles, 
  Check, 
  Heart, 
  Moon, 
  Wand2, 
  GraduationCap, 
  Search, 
  Rocket, 
  Hourglass, 
  Flame, 
  Feather, 
  Globe, 
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Eye,
  Smile,
  Coffee,
  Zap,
  Map,
  FileText,
  Bookmark,
  UserCheck,
  Compass,
  AlertCircle
} from 'lucide-react';
import { filterGenresForUser } from '@/lib/agePolicy';

// Complete list of ALL 23 Platform Genres from lib/data.js
export const ALL_ONBOARDING_GENRES = [
  { id: 'Romance', label: 'Romance', tag: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-600', desc: 'Enemies-to-lovers, slow burns, billionaires', count: '14.2K' },
  { id: 'Fanfiction', label: 'Fanfiction', tag: 'Fanfiction', icon: Flame, color: 'from-orange-500 to-red-600', desc: 'Cinematic universes, idol romances, alternate lore', count: '9.8K' },
  { id: 'LGBTQ+', label: 'LGBTQ+', tag: 'LGBTQ+', icon: Sparkles, color: 'from-rose-500 via-amber-500 to-teal-500', desc: 'Inclusive romances, queer discoveries, authentic lives', count: '6.4K' },
  { id: 'Fantasy', label: 'Fantasy', tag: 'Fantasy', icon: Wand2, color: 'from-violet-600 to-fuchsia-600', desc: 'Ancient kingdoms, court intrigue, mythical beasts', count: '18.9K' },
  { id: 'Teen Fiction', label: 'Teen Fiction', tag: 'Teen Fiction', icon: GraduationCap, color: 'from-amber-500 to-orange-600', desc: 'High school drama, rivalries, coming of age', count: '8.5K' },
  { id: 'Historical Fiction', label: 'Historical Fiction', tag: 'Historical Fiction', icon: Hourglass, color: 'from-amber-700 to-stone-800', desc: 'Regency balls, wartime sagas, royal courts', count: '4.3K' },
  { id: 'Paranormal', label: 'Paranormal', tag: 'Paranormal', icon: Eye, color: 'from-purple-800 to-slate-900', desc: 'Ghosts, psychics, supernatural dimensions', count: '7.1K' },
  { id: 'Humor', label: 'Humor & Comedy', tag: 'Humor', icon: Smile, color: 'from-yellow-400 to-amber-500', desc: 'Witty rom-coms, satirical parodies, laughter', count: '5.2K' },
  { id: 'Horror', label: 'Horror', tag: 'Horror', icon: Flame, color: 'from-red-900 to-slate-950', desc: 'Haunted houses, urban legends, psychological terror', ageRating: '18+', count: '6.1K' },
  { id: 'Contemporary', label: 'Contemporary', tag: 'Contemporary', icon: Coffee, color: 'from-teal-500 to-emerald-700', desc: 'Modern life dramas, career ambitions, relationships', count: '7.8K' },
  { id: 'Diverse Lit', label: 'Diverse Lit', tag: 'Diverse Lit', icon: Globe, color: 'from-blue-600 to-indigo-800', desc: 'Global cultures, diasporic voices, authentic journeys', count: '3.9K' },
  { id: 'Mystery', label: 'Mystery', tag: 'Mystery', icon: Search, color: 'from-emerald-600 to-teal-800', desc: 'Unsolved crimes, psychological suspense, dark secrets', count: '9.2K' },
  { id: 'Thriller', label: 'Thriller', tag: 'Thriller', icon: Zap, color: 'from-red-600 to-rose-900', desc: 'High-stakes cat-and-mouse chases, espionage, survival', count: '8.4K' },
  { id: 'Science Fiction', label: 'Science Fiction', tag: 'Science Fiction', icon: Rocket, color: 'from-cyan-500 to-blue-600', desc: 'Space opera, dystopian rebellions, androids', count: '11.2K' },
  { id: 'Adventure', label: 'Adventure', tag: 'Adventure', icon: Compass, color: 'from-emerald-500 to-green-700', desc: 'Treasure hunts, wilderness survival, epic quests', count: '6.7K' },
  { id: 'Non-Fiction', label: 'Non-Fiction', tag: 'Non-Fiction', icon: FileText, color: 'from-slate-600 to-slate-800', desc: 'Biographies, memoirs, essay collections, guides', count: '2.8K' },
  { id: 'Poetry', label: 'Poetry', tag: 'Poetry', icon: Feather, color: 'from-purple-500 to-indigo-700', desc: 'Soulful verses, microfiction, lyrical storytelling', count: '3.1K' },
  { id: 'Short Story', label: 'Short Story', tag: 'Short Story', icon: Bookmark, color: 'from-blue-500 to-cyan-600', desc: 'Quick reads, flash fiction, anthology pieces', count: '4.9K' },
  { id: 'Werewolf', label: 'Werewolf & Shifter', tag: 'Werewolf', icon: Moon, color: 'from-indigo-600 to-purple-800', desc: 'Alpha bonds, rejected mates, pack loyalty', count: '13.5K' },
  { id: 'New Adult', label: 'New Adult', tag: 'New Adult', icon: UserCheck, color: 'from-pink-600 to-purple-700', desc: 'College years, first careers, intense romance', count: '9.6K' },
  { id: 'Kids Books', label: 'Kids Books', tag: 'Kids Books', icon: Sparkles, color: 'from-amber-400 to-yellow-500', desc: 'Fun picture books, bedtime tales, early readers', ageRating: '3+', count: '4.2K' },
  { id: 'Educational Stories', label: 'Educational Stories', tag: 'Educational Stories', icon: BookOpen, color: 'from-sky-500 to-blue-600', desc: 'Moral lessons, STEM discoveries, learning adventures', ageRating: '3+', count: '3.1K' },
  { id: 'Fairy Tales & Fables', label: 'Fairy Tales & Fables', tag: 'Fairy Tales & Fables', icon: Wand2, color: 'from-teal-400 to-emerald-600', desc: 'Magical folklore, talking animals, timeless enchantments', ageRating: '7+', count: '2.8K' }
];

export const ONBOARDING_GOALS = [
  {
    id: "I'm here to read stories",
    title: "I'm here to read stories",
    desc: "Discover serialized blockbusters, trending fanfiction, and community marginalia.",
    icon: BookOpen,
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/30"
  },
  {
    id: "I want to write & publish",
    title: "I want to write & publish",
    desc: "Serialize chapters, grow a dedicated audience, and enter annual writing awards.",
    icon: PenTool,
    accent: "text-purple-500 bg-purple-500/10 border-purple-500/30"
  },
  {
    id: "Both reading and writing",
    title: "Both reading and writing",
    desc: "Immerse in reader communities while drafting and publishing your own serial stories.",
    icon: Sparkles,
    accent: "text-brand-500 bg-brand-500/10 border-brand-500/30"
  }
];

export const ONBOARDING_LANGUAGES = [
  { code: 'en', label: 'English (US / UK)', flag: '🌐', sub: 'Worldwide serialized community' },
  { code: 'ka', label: 'ქართული (Georgian)', flag: '🇬🇪', sub: 'სერიალიზებული მოთხრობები და ავტორები' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', sub: 'भारतीय धारावाहिक कथाएं और लेखक' },
  { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸', sub: 'Historias seriadas y comunidad' }
];

export default function OnboardingModal() {
  const router = useRouter();
  const { 
    onboardingModalOpen, 
    setOnboardingModalOpen, 
    userPreferences, 
    completeOnboarding,
    changeLanguage,
    setLang,
    user,
    t = {} 
  } = useApp();

  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState(userPreferences?.favoriteGenres?.slice(0, 3) || ["Romance", "Fantasy"]);
  const [genreSearch, setGenreSearch] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(userPreferences?.goals || "Both reading and writing");
  const [selectedLang, setSelectedLang] = useState(userPreferences?.language || 'en');
  const [maxWarning, setMaxWarning] = useState(false);
  const [curationProgress, setCurationProgress] = useState(0);

  // Filter genres based on user age policy (under 18 cannot see mature genres)
  const availableGenres = useMemo(() => {
    const rawNames = ALL_ONBOARDING_GENRES.map(g => g.id);
    const approvedNames = filterGenresForUser(rawNames, user);
    return ALL_ONBOARDING_GENRES.filter(g => approvedNames.includes(g.id));
  }, [user]);

  // Search filter
  const filteredGenres = useMemo(() => {
    if (!genreSearch.trim()) return availableGenres;
    const q = genreSearch.toLowerCase().trim();
    return availableGenres.filter(g => 
      g.label.toLowerCase().includes(q) || 
      g.tag.toLowerCase().includes(q) || 
      g.desc.toLowerCase().includes(q)
    );
  }, [availableGenres, genreSearch]);

  // Sync state if preferences change
  useEffect(() => {
    if (userPreferences) {
      if (userPreferences.goals) setSelectedGoal(userPreferences.goals);
      if (userPreferences.favoriteGenres?.length) {
        setSelectedGenres(userPreferences.favoriteGenres.slice(0, 3));
      }
      if (userPreferences.language) setSelectedLang(userPreferences.language);
    }
  }, [userPreferences]);

  // Handle Step 4 Curation Animation
  useEffect(() => {
    if (step === 4) {
      setCurationProgress(15);
      const timer1 = setTimeout(() => setCurationProgress(50), 300);
      const timer2 = setTimeout(() => setCurationProgress(85), 750);
      const timer3 = setTimeout(() => setCurationProgress(100), 1200);
      const timerFinish = setTimeout(() => {
        completeOnboarding({
          goals: selectedGoal,
          favoriteGenres: selectedGenres.slice(0, 3),
          language: selectedLang
        });
        if (changeLanguage) changeLanguage(selectedLang);
        else if (setLang) setLang(selectedLang);
        router.push('/home', { scroll: false });
      }, 1600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timerFinish);
      };
    }
  }, [step, selectedGoal, selectedGenres, selectedLang, changeLanguage, setLang, completeOnboarding, router]);

  if (!onboardingModalOpen) return null;

  // Selection toggle enforcing max 3 genres rule
  const toggleGenre = (genreId) => {
    setMaxWarning(false);
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(prev => prev.filter(g => g !== genreId));
    } else {
      if (selectedGenres.length >= 3) {
        setMaxWarning(true);
        setTimeout(() => setMaxWarning(false), 3500);
        return;
      }
      setSelectedGenres(prev => [...prev, genreId]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (selectedGenres.length === 0) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSkip = () => {
    completeOnboarding({
      goals: selectedGoal,
      favoriteGenres: selectedGenres.length > 0 ? selectedGenres.slice(0, 3) : ["Romance", "Fantasy", "Mystery"],
      language: selectedLang
    });
    router.push('/home', { scroll: false });
  };

  return (
    <div 
      className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setOnboardingModalOpen(false)}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div 
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-left transition-all sm:my-8 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header & Step Progress */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/25 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  {t.onboardingTitle || "Personalize Your Reading Experience"}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Step {step} of 4 • {
                    step === 1 
                      ? (t.step1Title || "Favorite Genres (Up to 3)") 
                      : step === 2 
                      ? (t.step2Title || "Reading Goals") 
                      : step === 3 
                      ? (t.step3Title || "Platform Language") 
                      : "Curating Library"
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {step < 4 && (
                <button 
                  onClick={handleSkip}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t.maybeLater || "Skip for now"}
                </button>
              )}
              <button 
                onClick={() => setOnboardingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 via-rose-500 to-amber-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Modal Body: Dynamic Step Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8">
            
            {/* STEP 1: FAVORITE GENRES (ALL 23 CATEGORIES, SELECT UP TO 3) */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 fill-brand-500" />
                      {t.step1Title || "Select Up To 3 Favorite Genres"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Which genres do you love reading?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.onboardingSubtitle || "Choose up to 3 genres out of all categories. If your tastes change later, Avora will automatically detect and feature newly liked genres!"}
                    </p>
                  </div>

                  {/* Live Counter Badge */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      selectedGenres.length === 3
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : selectedGenres.length > 0
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedGenres.length} / 3 {t.genresSelected || "selected (Max 3)"}
                    </span>
                  </div>
                </div>

                {/* Maximum 3 Genres Warning Banner */}
                {maxWarning && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{t.maxGenresReached || "Maximum 3 favorite genres selected! Deselect one if you want to replace it."}</span>
                  </div>
                )}

                {/* Genre Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    placeholder={t.searchGenres || "Search all 23 genres (Romance, Werewolf, Fantasy, Sci-Fi...)"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {genreSearch && (
                    <button 
                      onClick={() => setGenreSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* 23 Genres Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[46vh] overflow-y-auto pr-1">
                  {filteredGenres.map((genre) => {
                    const Icon = genre.icon;
                    const isSelected = selectedGenres.includes(genre.id);
                    const isAtMax = selectedGenres.length >= 3 && !isSelected;

                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => toggleGenre(genre.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer relative ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/30 shadow-md' 
                            : isAtMax
                            ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 opacity-60 hover:opacity-100'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${genre.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">
                              {genre.label}
                            </span>
                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">{genre.count}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {genre.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: USER GOALS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
                    Step 2 • Intent
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {t.step2Title || "What is your main goal on Avora Library?"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    We tailor your navigation bar and creator tools based on your reading and writing ambitions.
                  </p>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {ONBOARDING_GOALS.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setSelectedGoal(goal.id)}
                        className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/20 shadow-md' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl shrink-0 ${goal.accent}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {goal.title}
                            </h4>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {goal.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: PLATFORM LANGUAGE */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
                    Step 3 • Localization
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {t.step3Title || "Choose Your Platform Language"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This sets your website language across all navigation, reading tools, and story cards.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {ONBOARDING_LANGUAGES.map((langItem) => {
                    const isSelected = selectedLang === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => {
                          setSelectedLang(langItem.code);
                          if (changeLanguage) changeLanguage(langItem.code);
                          else if (setLang) setLang(langItem.code);
                        }}
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/20 shadow-md' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className="text-3xl shrink-0 p-1">{langItem.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {langItem.label}
                            </h4>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {langItem.sub}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: CURATING ANIMATION */}
            {step === 4 && (
              <div className="py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-brand-500/25 animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Curating Your Avora Experience...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Setting up your tailored feed for <strong>{selectedGenres.join(', ')}</strong> and live leaderboard rankings.
                  </p>
                </div>

                <div className="w-full max-w-md mx-auto space-y-2">
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-500 via-rose-500 to-amber-500 transition-all duration-300"
                      style={{ width: `${curationProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{curationProgress}% Complete</span>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Controls */}
          {step < 4 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : <div />}

              <button
                type="button"
                disabled={step === 1 && selectedGenres.length === 0}
                onClick={handleNextStep}
                className={`px-6 py-2.5 rounded-full font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  step === 1 && selectedGenres.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white shadow-brand-500/25 hover:scale-[1.02]'
                }`}
              >
                <span>{step === 3 ? (t.finishBtn || "Finish & Open Library") : (t.continueBtn || "Continue")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
