'use client';
import { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';

export const ONBOARDING_GENRES = [
  { id: 'Romance', label: 'Romance & Drama', tag: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-600', desc: 'Enemies-to-lovers, slow burns, billionaires' },
  { id: 'Werewolf', label: 'Werewolf & Shifter', tag: 'Werewolf', icon: Moon, color: 'from-indigo-600 to-purple-800', desc: 'Alpha bonds, rejected mates, pack loyalty' },
  { id: 'Fantasy', label: 'Fantasy & Magic', tag: 'Fantasy', icon: Wand2, color: 'from-violet-600 to-fuchsia-600', desc: 'Ancient kingdoms, court intrigue, mythical beasts' },
  { id: 'Teen Fiction', label: 'Young Adult / Teen', tag: 'Teen Fiction', icon: GraduationCap, color: 'from-amber-500 to-orange-600', desc: 'High school drama, rivalries, coming of age' },
  { id: 'Mystery', label: 'Mystery & Thriller', tag: 'Mystery', icon: Search, color: 'from-emerald-600 to-teal-800', desc: 'Unsolved crimes, psychological suspense, dark secrets' },
  { id: 'Sci-Fi', label: 'Sci-Fi & Cyberpunk', tag: 'Sci-Fi', icon: Rocket, color: 'from-cyan-500 to-blue-600', desc: 'Space opera, dystopian rebellions, androids' },
  { id: 'Historical', label: 'Historical Fiction', tag: 'Historical Fiction', icon: Hourglass, color: 'from-amber-700 to-stone-800', desc: 'Regency balls, wartime sagas, royal courts' },
  { id: 'Fanfiction', label: 'Fanfiction & Fandom', tag: 'Fanfiction', icon: Flame, color: 'from-orange-500 to-red-600', desc: 'Cinematic universes, idol romances, alternate lore' },
  { id: 'Poetry', label: 'Poetry & Prose', tag: 'Poetry', icon: Feather, color: 'from-purple-500 to-indigo-700', desc: 'Soulful verses, microfiction, lyrical storytelling' },
  { id: 'LGBTQ+', label: 'LGBTQ+ & Diverse Lit', tag: 'LGBTQ+', icon: Sparkles, color: 'from-rose-500 via-amber-500 to-teal-500', desc: 'Inclusive romances, queer discoveries, authentic lives' }
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
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', sub: 'भारतीय धारावाहिक कथाएं और लेखक' },
  { code: 'ka', label: 'ქართული (Georgian)', flag: '🇬🇪', sub: 'სერიალიზებული მოთხრობები და ავტორები' },
  { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸', sub: 'Historias seriadas y comunidad' }
];

export default function OnboardingModal() {
  const router = useRouter();
  const { 
    onboardingModalOpen, 
    setOnboardingModalOpen, 
    userPreferences, 
    completeOnboarding,
    setLang 
  } = useApp();

  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(userPreferences?.goals || "Both reading and writing");
  const [selectedGenres, setSelectedGenres] = useState(userPreferences?.favoriteGenres || ["Romance", "Fantasy", "Werewolf"]);
  const [selectedLang, setSelectedLang] = useState(userPreferences?.language || 'en');
  const [curationProgress, setCurationProgress] = useState(0);

  // Sync state if preferences change
  useEffect(() => {
    if (userPreferences) {
      if (userPreferences.goals) setSelectedGoal(userPreferences.goals);
      if (userPreferences.favoriteGenres?.length) setSelectedGenres(userPreferences.favoriteGenres);
      if (userPreferences.language) setSelectedLang(userPreferences.language);
    }
  }, [userPreferences]);

  // Handle Step 4 Generation Animation
  useEffect(() => {
    if (step === 4) {
      setCurationProgress(10);
      const timer1 = setTimeout(() => setCurationProgress(45), 300);
      const timer2 = setTimeout(() => setCurationProgress(85), 800);
      const timer3 = setTimeout(() => setCurationProgress(100), 1300);
      const timerFinish = setTimeout(() => {
        completeOnboarding({
          goals: selectedGoal,
          favoriteGenres: selectedGenres,
          language: selectedLang
        });
        setLang(selectedLang);
        router.push('/home');
      }, 1800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timerFinish);
      };
    }
  }, [step, selectedGoal, selectedGenres, selectedLang]);

  if (!onboardingModalOpen) return null;

  const toggleGenre = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(prev => prev.filter(g => g !== genreId));
    } else {
      setSelectedGenres(prev => [...prev, genreId]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (selectedGenres.length < 3) return;
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSkip = () => {
    completeOnboarding({
      goals: selectedGoal,
      favoriteGenres: selectedGenres.length >= 3 ? selectedGenres : ["Romance", "Fantasy", "Werewolf"],
      language: selectedLang
    });
    router.push('/home');
  };

  return (
    <div 
      className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setOnboardingModalOpen(false)}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-left transition-all sm:my-8 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Top Header & Progress Indicator */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                Customize Your Reading Feed
              </h2>
              <p className="text-[11px] text-slate-400">
                Step {step} of 4 • {step === 1 ? 'Reading Goals' : step === 2 ? 'Favorite Genres' : step === 3 ? 'Language' : 'Curating'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step < 4 && (
              <button 
                onClick={handleSkip}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            )}
            <button 
              onClick={() => setOnboardingModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 via-amber-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body: Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {/* STEP 1: READER GOALS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
                  Welcome to Avora Library
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  How do you plan to use Avora Library?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We'll customize your home shelves and navigation according to your storytelling ambitions.
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {ONBOARDING_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
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

          {/* STEP 2: FAVORITE GENRES & TROPES (The Core Wattpad Feature) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
                    Wattpad-Style Discovery Engine
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Select 3 or more genres you enjoy reading:
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your selections immediately generate dedicated recommendation rows on your dashboard.
                  </p>
                </div>

                {/* Counter Badge */}
                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                    selectedGenres.length >= 3 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {selectedGenres.length >= 3 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {selectedGenres.length} selected • Ready!
                      </>
                    ) : (
                      <>
                        Select {3 - selectedGenres.length} more to continue
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Genre Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {ONBOARDING_GENRES.map((genre) => {
                  const Icon = genre.icon;
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 ring-2 ring-brand-500/30 shadow-md' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${genre.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-brand-500 text-white' 
                            : 'border border-slate-300 dark:border-slate-700 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                          {genre.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {genre.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PREFERRED READING LANGUAGES */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
                  Global Storytelling
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Choose your preferred reading language:
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Avora Library connects serialized novels and author communities across multiple languages.
                </p>
              </div>

              <div className="grid gap-3">
                {ONBOARDING_LANGUAGES.map((langItem) => {
                  const isSelected = selectedLang === langItem.code;
                  return (
                    <button
                      key={langItem.code}
                      onClick={() => setSelectedLang(langItem.code)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{langItem.flag}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {langItem.label}
                          </h4>
                          <p className="text-[11px] text-slate-400">{langItem.sub}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'bg-brand-500 text-white' : 'border border-slate-300 dark:border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: GENERATION / CELEBRATORY STATE */}
          {step === 4 && (
            <div className="py-8 space-y-8 text-center animate-in fade-in duration-300">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
                  <Sparkles className="w-10 h-10 animate-spin-slow" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Curating your personal library...
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Generating tailored shelves, author chapter updates, and recommendations based on your favorite genres.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 via-amber-400 to-purple-600 transition-all duration-500 shadow-sm"
                    style={{ width: `${curationProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>Building personalized algorithm</span>
                  <span className="text-brand-500">{curationProgress}%</span>
                </div>
              </div>

              {/* Selected Genres Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-md mx-auto">
                {selectedGenres.map(g => (
                  <span key={g} className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm">
                    ✨ {g}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            <button
              onClick={handleNextStep}
              disabled={step === 2 && selectedGenres.length < 3}
              className={`px-8 py-3 rounded-full text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                step === 2 && selectedGenres.length < 3
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25 hover:scale-[1.02]'
              }`}
            >
              <span>{step === 3 ? 'Curate My Feed' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  </div>
  );
}
