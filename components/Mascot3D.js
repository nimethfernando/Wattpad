'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  X, 
  ChevronUp, 
  ChevronDown, 
  BookOpen, 
  Heart, 
  Flame, 
  Lightbulb, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';

export default function Mascot3D() {
  const pathname = usePathname();
  const { 
    stories, 
    user, 
    readingStreak, 
    openPaymentModal, 
    featureFlags 
  } = useApp();

  const mascotRef = useRef(null);
  const [minimized, setMinimized] = useState(false);
  const [speechOpen, setSpeechOpen] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [emotion, setEmotion] = useState('idle'); // 'idle' | 'happy' | 'wink'
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [particles, setParticles] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check if we are currently inside the reader page
  const isReaderPage = pathname?.startsWith('/read/');

  // Generate dynamic speech messages based on platform state
  const speechMessages = useMemo(() => {
    const validStories = (stories && stories.length > 0) ? stories : [];
    const randomStory = validStories[Math.floor(Math.random() * validStories.length)] || null;
    const topStory = validStories[0] || null;

    const messages = [];

    // 1. Personalized Greeting
    if (user) {
      messages.push({
        id: 'greet_user',
        badge: 'Welcome Back',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        badgeIcon: 'Sparkles',
        title: `Hi, ${user.name.split(' ')[0]}! ✨`,
        text: `Avora is keeping your place warm in the library. Ready to continue reading today?`,
        actionLabel: 'Explore Library',
        actionUrl: '/library',
      });
    } else {
      messages.push({
        id: 'greet_guest',
        badge: 'Book Guardian',
        badgeColor: 'bg-brand-500/10 text-brand-600 border-brand-500/20',
        badgeIcon: 'Sparkles',
        title: `Hoot! I'm Avora 🦉`,
        text: `Welcome to Avora Library! I am your magical reading companion. Click me anytime for recommendations and secret reading tips!`,
        actionLabel: 'Browse All Stories',
        actionUrl: '/browse',
      });
    }

    // 2. Reading Streak Cheering
    const streakCount = readingStreak?.currentStreak || 0;
    messages.push({
      id: 'streak',
      badge: streakCount > 0 ? `${streakCount} Day Streak!` : 'Daily Habit',
      badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      badgeIcon: 'Flame',
      title: streakCount > 0 ? `Your Flame is Blazing! 🔥` : `Start a Streak Today! 📖`,
      text: streakCount > 0 
        ? `You've read ${readingStreak?.chaptersReadThisWeek || 1} chapter(s) this week! Keep reading today to protect your streak!` 
        : `Read at least 1 chapter every day to build a habit and earn the Golden Scholar badge!`,
      actionLabel: 'Start Reading',
      actionUrl: randomStory ? `/read/${randomStory.slug}` : '/browse',
    });

    // 3. Dynamic Story Recommendation
    if (randomStory) {
      messages.push({
        id: 'rec',
        badge: 'Recommended For You',
        badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        badgeIcon: 'BookOpen',
        title: randomStory.title,
        text: `Readers are raving about this ${randomStory.genre} serialized story by ${randomStory.author} (${(randomStory.reads || 0).toLocaleString()} reads)!`,
        story: randomStory,
        actionLabel: 'Read Chapter 1 📖',
        actionUrl: `/read/${randomStory.slug}`,
      });
    }

    // 4. Feature Tip (Inline Comments & Reactions)
    messages.push({
      id: 'tip_comments',
      badge: 'Reading Tip',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      badgeIcon: 'MessageSquare',
      title: 'Join the Discussion! 💬',
      text: 'Did you know? You can click the speech bubble on any paragraph in a story to read thoughts and react line-by-line!',
      actionLabel: 'Try in a Story',
      actionUrl: topStory ? `/read/${topStory.slug}` : '/browse',
    });

    // 5. Modern Light Theme Highlight
    messages.push({
      id: 'light_theme',
      badge: 'Visual Comfort',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      badgeIcon: 'Lightbulb',
      title: 'Fresh & Modern Design ☀️',
      text: 'Avora Library features a clean, lively light aesthetic tailored for daytime reading without eye fatigue!',
      actionLabel: 'Explore Genres',
      actionUrl: '/browse',
    });

    // 6. Creator Support / Tipping (if enabled)
    if (featureFlags?.enablePaidFeatures) {
      messages.push({
        id: 'tip_author',
        badge: 'Support Creators',
        badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        badgeIcon: 'Heart',
        title: 'Send Author Love 💖',
        text: 'Tips and VIP passes empower authors to write serialized fiction full-time. Have a favorite writer?',
        actionLabel: 'Support an Author',
        actionCallbackType: 'donate',
      });
    }

    return messages;
  }, [stories, user, readingStreak, featureFlags]);

  // Initial greeting timer (opens speech bubble after 2.8s on initial load)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted && !isReaderPage) {
        setSpeechOpen(true);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [hasInteracted, isReaderPage]);

  // Blinking loop (natural blinking every 3.2 to 5.5s)
  useEffect(() => {
    let blinkTimeout;
    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 2500;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 160);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Mouse Movement & Pupil Cursor-Tracking Vector Math
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      
      // Calculate center of eyes on screen
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height * 0.38;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      // Clamp pupil distance inside eye boundary (max 6.5px)
      const maxRadius = 6.5;
      const clampedDist = Math.min(distance * 0.045, maxRadius);

      const pupilX = Math.cos(angle) * clampedDist;
      const pupilY = Math.sin(angle) * clampedDist;

      setPupilOffset({ x: pupilX, y: pupilY });

      // 3D Card tilt calculation (gentle tilt towards mouse)
      const winW = window.innerWidth || 1200;
      const winH = window.innerHeight || 800;
      const normX = Math.max(-1, Math.min(1, (e.clientX - eyeCenterX) / (winW * 0.4)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - eyeCenterY) / (winH * 0.4)));

      setTilt({
        rotateY: normX * 12,
        rotateX: -normY * 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mascot Click Interaction
  const handleMascotClick = () => {
    setHasInteracted(true);
    
    // Trigger celebration / cheer emotion
    setEmotion('happy');
    setTimeout(() => setEmotion('idle'), 1400);

    // Spawn burst of joyful floating particles
    const emojis = ['✨', '⭐', '📖', '💖', '🔥', '🦉', '🎉'];
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -20 - Math.random() * 50,
      scale: 0.8 + Math.random() * 0.5,
      char: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);

    // Toggle speech bubble or cycle to next message
    if (!speechOpen) {
      setSpeechOpen(true);
    } else {
      setSpeechIndex(prev => (prev + 1) % speechMessages.length);
    }
  };

  const currentMessage = speechMessages[speechIndex] || speechMessages[0];

  const renderBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-3 h-3" />;
      case 'BookOpen': return <BookOpen className="w-3 h-3" />;
      case 'MessageSquare': return <MessageSquare className="w-3 h-3" />;
      case 'Lightbulb': return <Lightbulb className="w-3 h-3" />;
      case 'Heart': return <Heart className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div 
      className={`fixed z-40 transition-all duration-300 pointer-events-none ${
        minimized 
          ? 'bottom-20 md:bottom-6 right-4 sm:right-6' 
          : 'bottom-20 md:bottom-6 right-3 sm:right-6'
      }`}
    >
      <div className="relative pointer-events-auto flex flex-col items-end">
        
        {/* SPEECH BUBBLE POPUP */}
        {speechOpen && !minimized && currentMessage && (
          <div 
            className="mb-3 w-[290px] sm:w-[330px] bg-white rounded-3xl p-4 shadow-2xl border border-brand-100 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-3 duration-200 relative select-none"
            style={{
              boxShadow: '0 20px 40px -15px rgba(234, 88, 12, 0.15), 0 0 0 1px rgba(234, 88, 12, 0.08)'
            }}
          >
            {/* Header with Guardian badge & close button */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentMessage.badgeColor} flex items-center gap-1`}>
                  {renderBadgeIcon(currentMessage.badgeIcon)}
                  {currentMessage.badge}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSpeechIndex(prev => (prev + 1) % speechMessages.length)}
                  className="p-1 rounded-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  title="Next tip"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setSpeechOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Close tip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bubble Content Body */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                {currentMessage.title}
              </h4>

              {currentMessage.story ? (
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-brand-50/60 border border-brand-100/80">
                  <img 
                    src={currentMessage.story.cover} 
                    alt={currentMessage.story.title} 
                    className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-900 truncate">
                      {currentMessage.story.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      by {currentMessage.story.author}
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] font-extrabold text-brand-600 bg-brand-100 px-1.5 py-0.2 rounded">
                      {currentMessage.story.genre}
                    </span>
                  </div>
                </div>
              ) : null}

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {currentMessage.text}
              </p>

              {/* Action Button & Carousel Dots */}
              <div className="flex items-center justify-between pt-2 mt-1">
                <div className="flex items-center gap-1">
                  {speechMessages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSpeechIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        speechIndex === i ? 'w-4 bg-brand-500' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>

                {currentMessage.actionCallbackType === 'donate' ? (
                  <button
                    onClick={() => {
                      openPaymentModal({ mode: 'donate' });
                      setSpeechOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{currentMessage.actionLabel}</span>
                  </button>
                ) : currentMessage.actionUrl ? (
                  <Link
                    href={currentMessage.actionUrl}
                    onClick={() => setSpeechOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>{currentMessage.actionLabel}</span>
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Speech Bubble Arrow Tail */}
            <div 
              className="absolute -bottom-2 right-10 w-4 h-4 bg-white rotate-45 border-r border-b border-brand-100/80 shadow-sm"
            />
          </div>
        )}

        {/* FLOATING SPARKLE PARTICLES */}
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute pointer-events-none text-base font-bold animate-out fade-out slide-out-to-top duration-1000"
            style={{
              right: 40 + p.x,
              bottom: 80 - p.y,
              transform: `scale(${p.scale})`,
              zIndex: 50,
            }}
          >
            {p.char}
          </div>
        ))}

        {/* MASCOT CONTAINER & 3D INTERACTIVE AVORA */}
        <div className="flex items-center gap-2">
          
          {/* Minimize / Expand Toggle Pill */}
          <button
            onClick={() => {
              setMinimized(!minimized);
              if (!minimized) setSpeechOpen(false);
            }}
            className="p-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200 text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all cursor-pointer hover:scale-110 active:scale-95"
            title={minimized ? "Wake Avora" : "Minimize Mascot"}
          >
            {minimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* MAIN 3D CHARACTER */}
          {minimized ? (
            /* MINIMIZED BADGE / TOKEN */
            <button
              onClick={() => {
                setMinimized(false);
                setSpeechOpen(true);
              }}
              className="group relative flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {/* Mini animated eyes peeking */}
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center gap-1 shadow-inner relative overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 transition-transform duration-75"
                     style={{ transform: `translate(${pupilOffset.x * 0.25}px, ${pupilOffset.y * 0.25}px)` }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 transition-transform duration-75"
                     style={{ transform: `translate(${pupilOffset.x * 0.25}px, ${pupilOffset.y * 0.25}px)` }} />
              </div>
              <span>Avora</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-white/50" />
            </button>
          ) : (
            /* FULL 3D INTERACTIVE AVORA GUARDIAN */
            <div
              ref={mascotRef}
              onClick={handleMascotClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative cursor-pointer select-none group"
              style={{
                perspective: '800px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Ambient Pulsing Aura Glow */}
              <div 
                className="absolute inset-0 -m-3 rounded-full opacity-60 blur-xl transition-all duration-500 pointer-events-none"
                style={{
                  background: isHovered 
                    ? 'radial-gradient(circle, rgba(234,88,12,0.4) 0%, rgba(245,158,11,0.2) 60%, transparent 75%)' 
                    : 'radial-gradient(circle, rgba(234,88,12,0.25) 0%, rgba(245,158,11,0.1) 50%, transparent 70%)',
                }}
              />

              {/* 3D Tilting Body Mesh with Levitation Physics */}
              <div
                className="relative transition-transform duration-150 ease-out animate-mascot-float"
                style={{
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isHovered ? 1.08 : 1})`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* SVG 3D-Look Vector Mascot */}
                <svg
                  width="92"
                  height="102"
                  viewBox="0 0 100 110"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-2xl transition-all filter drop-shadow-[0_12px_20px_rgba(234,88,12,0.22)]"
                >
                  <defs>
                    {/* Body Gradient */}
                    <linearGradient id="avoraBodyGrad" x1="20" y1="15" x2="80" y2="95" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ff782d" />
                      <stop offset="50%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#9a3412" />
                    </linearGradient>

                    {/* Chest Plumage Gradient */}
                    <linearGradient id="avoraChestGrad" x1="50" y1="45" x2="50" y2="88" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fffbeb" />
                      <stop offset="60%" stopColor="#fef3c7" />
                      <stop offset="100%" stopColor="#fed7aa" />
                    </linearGradient>

                    {/* Golden Beak Gradient */}
                    <linearGradient id="avoraBeakGrad" x1="50" y1="52" x2="50" y2="64" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>

                    {/* Eye Iris Ring Gradient */}
                    <radialGradient id="avoraIrisGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1e1b4b" />
                      <stop offset="70%" stopColor="#312e81" />
                      <stop offset="90%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </radialGradient>

                    {/* Tome / Book Pedestal Gradient */}
                    <linearGradient id="avoraTomeGrad" x1="15" y1="90" x2="85" y2="108" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4338ca" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>

                    {/* Ear Tufts Gradient */}
                    <linearGradient id="avoraTuftGrad" x1="50" y1="0" x2="50" y2="30" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>

                  {/* 1. PEDESTAL: GLOWING OPEN MYSTICAL BOOK */}
                  <g className="pedestal-tome">
                    {/* Tome Cover Backing */}
                    <path 
                      d="M18 95 C 32 91, 48 93, 50 96 C 52 93, 68 91, 82 95 L 84 105 C 70 101, 52 103, 50 106 C 48 103, 30 101, 16 105 Z" 
                      fill="url(#avoraTomeGrad)" 
                      opacity="0.9"
                    />
                    {/* Tome Glowing Pages */}
                    <path 
                      d="M20 93 C 34 89, 48 91, 50 94 C 52 91, 66 89, 80 93 L 80 97 C 66 93, 52 95, 50 97 C 48 95, 34 93, 20 97 Z" 
                      fill="#ffffff" 
                      opacity="0.95"
                    />
                    {/* Golden Bookmark Ribbon */}
                    <path d="M48 95 L 52 95 L 53 108 L 50 105 L 47 108 Z" fill="#f59e0b" />
                  </g>

                  {/* 2. FEATHERED EAR TUFTS */}
                  {/* Left Tuft */}
                  <path 
                    d="M26 32 C 18 18, 16 8, 22 4 C 28 8, 33 18, 35 28 Z" 
                    fill="url(#avoraTuftGrad)"
                    className="transition-transform duration-300 origin-bottom"
                    style={{ transform: isHovered ? 'rotate(-6deg)' : 'rotate(0deg)' }}
                  />
                  {/* Right Tuft */}
                  <path 
                    d="M74 32 C 82 18, 84 8, 78 4 C 72 8, 67 18, 65 28 Z" 
                    fill="url(#avoraTuftGrad)"
                    className="transition-transform duration-300 origin-bottom"
                    style={{ transform: isHovered ? 'rotate(6deg)' : 'rotate(0deg)' }}
                  />

                  {/* 3. MAIN OWL BODY */}
                  <ellipse cx="50" cy="55" rx="36" ry="38" fill="url(#avoraBodyGrad)" />

                  {/* Body Feather Highlights */}
                  <path d="M22 40 C 26 34, 34 32, 40 33" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  <path d="M78 40 C 74 34, 66 32, 60 33" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

                  {/* 4. CHEST / BELLY CREST */}
                  <path 
                    d="M30 52 C 30 75, 40 88, 50 88 C 60 88, 70 75, 70 52 C 60 48, 40 48, 30 52 Z" 
                    fill="url(#avoraChestGrad)" 
                  />
                  {/* Chest Feather Chevrons */}
                  <path d="M46 64 L 50 67 L 54 64" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
                  <path d="M42 72 L 50 76 L 58 72" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />

                  {/* 5. WINGS (Flutter on hover / click) */}
                  {/* Left Wing */}
                  <g 
                    className="transition-transform duration-200 origin-top-left"
                    style={{ 
                      transform: emotion === 'happy' || isHovered 
                        ? 'rotate(-12deg) translate(-2px, -2px)' 
                        : 'rotate(0deg)' 
                    }}
                  >
                    <path 
                      d="M16 48 C 10 58, 12 75, 22 84 C 20 74, 21 60, 26 50 Z" 
                      fill="#ea580c" 
                      stroke="#c2410c" 
                      strokeWidth="1"
                    />
                  </g>
                  {/* Right Wing */}
                  <g 
                    className="transition-transform duration-200 origin-top-right"
                    style={{ 
                      transform: emotion === 'happy' || isHovered 
                        ? 'rotate(12deg) translate(2px, -2px)' 
                        : 'rotate(0deg)' 
                    }}
                  >
                    <path 
                      d="M84 48 C 90 58, 88 75, 78 84 C 80 74, 79 60, 74 50 Z" 
                      fill="#ea580c" 
                      stroke="#c2410c" 
                      strokeWidth="1"
                    />
                  </g>

                  {/* 6. ROSY CHEEKS */}
                  <ellipse cx="26" cy="54" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.55" />
                  <ellipse cx="74" cy="54" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.55" />

                  {/* 7. EYE HOUSINGS & DYNAMIC CURSOR-TRACKING PUPILS */}
                  {/* LEFT EYE */}
                  <g className="left-eye">
                    {/* Sclera (White base) */}
                    <circle cx="35" cy="44" r="12" fill="#ffffff" stroke="#ffedd5" strokeWidth="1.5" />
                    
                    {/* Happy / Wink Eye Overlay (When clicked or excited) */}
                    {emotion === 'happy' ? (
                      <path d="M26 44 C 30 38, 40 38, 44 44" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
                    ) : isBlinking ? (
                      <line x1="25" y1="44" x2="45" y2="44" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
                    ) : (
                      <>
                        {/* Dynamic Pupil Tracking Cursor */}
                        <g style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}>
                          {/* Iris */}
                          <circle cx="35" cy="44" r="6.8" fill="url(#avoraIrisGrad)" />
                          {/* Deep Pupil Core */}
                          <circle cx="35" cy="44" r="4.2" fill="#0f172a" />
                          {/* Specular Glint 1 (Large) */}
                          <circle cx="33.2" cy="42" r="2" fill="#ffffff" />
                          {/* Specular Glint 2 (Tiny secondary sparkle) */}
                          <circle cx="36.8" cy="46" r="0.9" fill="#ffffff" opacity="0.85" />
                        </g>
                      </>
                    )}
                  </g>

                  {/* RIGHT EYE */}
                  <g className="right-eye">
                    {/* Sclera (White base) */}
                    <circle cx="65" cy="44" r="12" fill="#ffffff" stroke="#ffedd5" strokeWidth="1.5" />

                    {/* Happy / Wink Eye Overlay */}
                    {emotion === 'happy' || emotion === 'wink' ? (
                      <path d="M56 44 C 60 38, 70 38, 74 44" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
                    ) : isBlinking ? (
                      <line x1="55" y1="44" x2="75" y2="44" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
                    ) : (
                      <>
                        {/* Dynamic Pupil Tracking Cursor */}
                        <g style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}>
                          {/* Iris */}
                          <circle cx="65" cy="44" r="6.8" fill="url(#avoraIrisGrad)" />
                          {/* Deep Pupil Core */}
                          <circle cx="65" cy="44" r="4.2" fill="#0f172a" />
                          {/* Specular Glint 1 */}
                          <circle cx="63.2" cy="42" r="2" fill="#ffffff" />
                          {/* Specular Glint 2 */}
                          <circle cx="66.8" cy="46" r="0.9" fill="#ffffff" opacity="0.85" />
                        </g>
                      </>
                    )}
                  </g>

                  {/* 8. GOLDEN BEAK */}
                  <polygon 
                    points="46,49 54,49 50,58" 
                    fill="url(#avoraBeakGrad)" 
                    stroke="#b45309" 
                    strokeWidth="0.8" 
                    strokeLinejoin="round" 
                  />

                  {/* 9. SCHOLAR'S MAGIC FLOATING CIRCLET */}
                  <g 
                    className="scholar-crown transition-all duration-300"
                    style={{
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0px)',
                    }}
                  >
                    <ellipse cx="50" cy="18" rx="14" ry="4" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.75" />
                    {/* Center Star Gem */}
                    <polygon points="50,13 51.5,16.5 55,18 51.5,19.5 50,23 48.5,19.5 45,18 48.5,16.5" fill="#f59e0b" />
                  </g>
                </svg>

                {/* Subtle Interactive Label on Hover */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[9px] font-black tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
                  Avora ✨
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}