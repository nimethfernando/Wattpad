'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  BookOpen, 
  Compass, 
  Users, 
  PenTool, 
  Globe, 
  Moon, 
  Sun, 
  Search, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  Trophy, 
  User, 
  LogOut, 
  ChevronDown,
  Settings,
  BookMarked
} from 'lucide-react';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';

export default function Header() {
  const { 
    lang, 
    setLang, 
    theme, 
    toggleTheme, 
    t, 
    user, 
    setUser, 
    logoutUser,
    notifications, 
    setNotifications, 
    markAllNotificationsRead,
    markNotificationRead,
    stories, 
    readingLists,
    library,
    openAuthModal,
    announcementBanner,
    bannerDismissed,
    setBannerDismissed
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtered search results (stories, authors, tags, reading lists)
  const filteredStories = searchQuery.trim() === '' ? [] : stories.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 4);

  const filteredLists = searchQuery.trim() === '' ? [] : readingLists.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 2);

  const markAllRead = () => {
    if (typeof markAllNotificationsRead === 'function') {
      markAllNotificationsRead();
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* 0. Site-Wide Announcement Banner */}
      {announcementBanner?.active && !bannerDismissed && (
        <div className="bg-gradient-to-r from-brand-600 via-amber-500 to-brand-600 text-white text-xs font-semibold py-2 px-4 text-center relative flex items-center justify-center gap-2 shadow-sm">
          <span>{announcementBanner.text}</span>
          {announcementBanner.linkUrl && (
            <Link 
              href={announcementBanner.linkUrl} 
              className="underline font-bold hover:text-white/80 transition-colors ml-1"
            >
              {announcementBanner.linkText || 'Learn More →'}
            </Link>
          )}
          {announcementBanner.dismissible && (
            <button 
              onClick={() => setBannerDismissed(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white cursor-pointer"
              aria-label="Dismiss announcement banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo: Separate Light & Dark Logos (Scope 9) */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            {theme === 'dark' ? (
              // Dark Theme Logo: Electric Amber/Violet glowing crest with high-contrast white glyph
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform ring-1 ring-amber-400/30">
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
              </div>
            ) : (
              // Light Theme Logo: Deep Crimson/Brand-600 with warm amber
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
                Avora<span className="text-brand-500 dark:text-amber-400">Library</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 -mt-0.5">
                {theme === 'dark' ? 'Night Reader' : 'Serialized Fiction'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/browse" className="hover:text-brand-500 flex items-center gap-1.5 transition-colors">
              <Compass className="w-4 h-4" /> {t.browse}
            </Link>
            <Link href="/library" className="hover:text-brand-500 flex items-center gap-1.5 transition-colors">
              <BookMarked className="w-4 h-4 text-brand-500" /> My Library
              {library.length > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-brand-500 text-white">
                  {library.length}
                </span>
              )}
            </Link>
            <Link href="/community" className="hover:text-brand-500 flex items-center gap-1.5 transition-colors">
              <Users className="w-4 h-4" /> {t.community}
            </Link>
            <Link href="/contests" className="hover:text-brand-500 flex items-center gap-1.5 transition-colors">
              <Trophy className="w-4 h-4 text-amber-500" /> {t.contests}
            </Link>
            <Link href="/write" className="hover:text-brand-500 flex items-center gap-1.5 transition-colors">
              <PenTool className="w-4 h-4 text-brand-500" /> {t.write}
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200">
                <ShieldCheck className="w-3.5 h-3.5" /> {t.adminPanel}
              </Link>
            )}
          </nav>
        </div>

        {/* Global Autocomplete Search Bar */}
        <div className="hidden lg:block relative flex-1 max-w-sm mx-6" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchFocused && (filteredStories.length > 0 || filteredLists.length > 0) && (
            <div className="absolute top-11 left-0 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Stories & Authors
              </div>
              {filteredStories.map(story => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <img src={story.cover} alt={story.title} className="w-7 h-10 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{story.title}</p>
                    <p className="text-[10px] text-slate-400">By {story.author} • {story.genre}</p>
                  </div>
                </Link>
              ))}

              {filteredLists.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800">
                    Reading Lists
                  </div>
                  {filteredLists.map(list => (
                    <Link
                      key={list.id}
                      href="/community"
                      className="block p-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      📚 {list.title}
                    </Link>
                  ))}
                </>
              )}

              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1">
                <Link href={`/browse?q=${encodeURIComponent(searchQuery)}`} className="block text-center text-xs font-bold text-brand-500 py-1 hover:underline">
                  View all results for "{searchQuery}"
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons: Language, Theme, Notifications & User */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-full">
            <Globe className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <select 
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language selection"
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
            >
              <option value="en">English (EN)</option>
              <option value="ka">ქართული (KA)</option>
              <option value="hi">हिन्दी (HI)</option>
            </select>
          </div>

          {/* Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            aria-label="Toggle theme mode"
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification Center */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-brand-500 hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 my-2">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        if (!n.read && typeof markNotificationRead === 'function') {
                          markNotificationRead(n.id);
                        }
                      }}
                      className={`py-3 text-xs transition-colors cursor-pointer ${!n.read ? 'bg-brand-50/50 dark:bg-brand-950/20 px-2 rounded-lg' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2'}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/50 transition-all"
              >
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold truncate text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">@{user.username}</p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {user.badges.map((b, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="py-1">
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-500" /> {t.profile}
                    </Link>
                    <Link href="/library" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <BookMarked className="w-3.5 h-3.5 text-brand-500" /> My Library ({library.length})
                    </Link>
                    <Link href="/write" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <PenTool className="w-3.5 h-3.5 text-brand-500" /> {t.myStories}
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Settings className="w-3.5 h-3.5 text-slate-500" /> Account Settings
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-600 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t.adminPanel}
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        logoutUser();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openAuthModal('login')} 
                className="text-xs font-semibold px-3 py-1.5 hover:text-brand-500 transition-colors cursor-pointer"
              >
                {t.login}
              </button>
              <button 
                onClick={() => openAuthModal('register')} 
                className="text-xs font-bold px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all cursor-pointer"
              >
                {t.signup}
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-4 bg-white dark:bg-slate-900 space-y-3">
          <Link href="/browse" className="block py-2 text-sm font-semibold">{t.browse}</Link>
          <Link href="/library" className="block py-2 text-sm font-semibold">My Library ({library.length})</Link>
          <Link href="/community" className="block py-2 text-sm font-semibold">{t.community}</Link>
          <Link href="/contests" className="block py-2 text-sm font-semibold">{t.contests}</Link>
          <Link href="/write" className="block py-2 text-sm font-semibold">{t.write}</Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="block py-2 text-sm font-semibold text-purple-600">{t.adminPanel}</Link>
          )}
          {user ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 px-2 py-1">
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                <span className="text-xs font-bold truncate text-slate-900 dark:text-white">{user.name} (@{user.username})</span>
              </div>
              <Link href={`/profile/${user.username}`} className="block py-1.5 px-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                {t.profile}
              </Link>
              <Link href="/settings" className="block py-1.5 px-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Account Settings
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); logoutUser(); }}
                className="w-full text-left py-1.5 px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
              >
                {t.login}
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); openAuthModal('register'); }}
                className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold"
              >
                {t.signup}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Auth Modal for Facebook, Google, and Email Logins */}
      <AuthModal />

      {/* New Reader Onboarding & Dynamic Genre Wizard */}
      <OnboardingModal />
    </header>
  );
}
