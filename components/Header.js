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
  BookMarked,
  Sparkles,
  Lock
} from 'lucide-react';
import { filterStoriesForUser, EXPERIENCE_MODES } from '@/lib/agePolicy';

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
    setBannerDismissed,
    toggleExperienceMode
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtered search results (Age policy enforced so under-18 users never see 18+ results)
  const accessibleStories = filterStoriesForUser(stories, user);
  const filteredStories = searchQuery.trim() === '' ? [] : accessibleStories.filter(s => 
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
        
        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-3 lg:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform ring-1 ring-amber-400/40 shrink-0 bg-slate-950">
              <img src="/tab-icon.png" alt="Avora Library Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
                Avora<span className="text-brand-500 dark:text-amber-400">Library</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 -mt-0.5 hidden sm:block">
                {theme === 'dark' ? 'Night Reader' : 'Serialized Fiction'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3.5 xl:gap-5 text-xs lg:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/browse" className="hover:text-brand-500 flex items-center gap-1 transition-colors shrink-0">
              <Compass className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {t.browse}
            </Link>
            <Link href="/library" className="hover:text-brand-500 flex items-center gap-1 transition-colors shrink-0">
              <BookMarked className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-brand-500" /> Library
              {library.length > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-brand-500 text-white">
                  {library.length}
                </span>
              )}
            </Link>
            <Link href="/community" className="hidden lg:flex hover:text-brand-500 items-center gap-1 transition-colors shrink-0">
              <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {t.community}
            </Link>
            <Link href="/contests" className="hidden xl:flex hover:text-brand-500 items-center gap-1 transition-colors shrink-0">
              <Trophy className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-500" /> {t.contests}
            </Link>
            <Link href="/write" className="hover:text-brand-500 flex items-center gap-1 transition-colors shrink-0">
              <PenTool className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-brand-500" /> {t.write}
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="hidden 2xl:flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" /> {t.adminPanel}
              </Link>
            )}
          </nav>
        </div>

        {/* Global Autocomplete Search Bar */}
        <div className="hidden xl:block relative flex-1 max-w-xs xl:max-w-sm mx-3 lg:mx-4" ref={searchRef}>
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

        {/* Right Action Icons: Experience Mode, Language, Theme, Search, Notifications & User */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-2">
          {/* Experience Mode Switcher (DOB-enforced) */}
          {user && (
            <div className="hidden sm:block">
              {user.age !== undefined && user.age < 18 ? (
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  title="Age-Protected Kids/Family Mode (Under 18)"
                >
                  <span>🧒</span>
                  <span className="hidden lg:inline">Kids</span>
                  <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <button
                  onClick={() => toggleExperienceMode()}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                    user.experienceMode === 'kids'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-100'
                  }`}
                  title={`Click to switch to ${user.experienceMode === 'kids' ? '18+ Mature' : 'Kids / Family'} mode`}
                >
                  <span>{user.experienceMode === 'kids' ? '🧒 Kids' : '🔥 18+'}</span>
                </button>
              )}
            </div>
          )}

          {/* Language Switcher */}
          <div className="hidden md:flex items-center text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            <Globe className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />
            <select 
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language selection"
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer text-xs"
            >
              <option value="en">EN</option>
              <option value="ka">KA</option>
              <option value="hi">HI</option>
            </select>
          </div>

          {/* Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            aria-label="Toggle theme mode"
            className="p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Search Toggle Button (visible whenever the full search bar is hidden) */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="xl:hidden p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Search"
            title="Search stories"
          >
            <Search className="w-4 h-4" />
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
              <div className="absolute right-0 top-12 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
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
            <div className="relative shrink-0">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-brand-500/50 transition-all cursor-pointer"
                aria-label="User profile menu"
              >
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
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
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl my-1 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">Verified Age:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.age !== undefined ? `${user.age} yrs` : 'Unverified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="font-semibold text-slate-500">Experience:</span>
                      {user.age !== undefined && user.age < 18 ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          Kids Only <Lock className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <button 
                          onClick={() => toggleExperienceMode()}
                          className="font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                        >
                          {user.experienceMode === 'kids' ? '🧒 Kids (Switch)' : '🔥 18+ (Switch)'}
                        </button>
                      )}
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
                className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 hover:text-brand-500 transition-colors cursor-pointer shrink-0"
              >
                {t.login}
              </button>
              <button 
                onClick={() => openAuthModal('register')} 
                className="text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all cursor-pointer shrink-0"
              >
                {t.signup}
              </button>
            </div>
          )}

          {/* Menu Button for Mobile & Tablets */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Expandable Search Bar for screens where full search is hidden */}
      {mobileSearchOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search stories, authors, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-xl max-h-72 overflow-y-auto">
              {filteredStories.map(s => (
                <Link
                  key={s.id}
                  href={`/story/${s.slug}`}
                  onClick={() => setMobileSearchOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <img src={s.cover} alt={s.title} className="w-8 aspect-[3/4] object-cover rounded" />
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-bold truncate text-slate-900 dark:text-white">{s.title}</p>
                    <p className="text-[10px] text-slate-400">By {s.author} • {s.genre}</p>
                  </div>
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                <Link
                  href={`/browse?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setMobileSearchOpen(false)}
                  className="block text-center text-xs font-bold text-brand-500 py-1 hover:underline"
                >
                  View all results for "{searchQuery}" →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Slide-Over Drawer with Backdrop Blur */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Container */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-80 bg-white dark:bg-slate-900 shadow-2xl p-5 overflow-y-auto flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-950 shrink-0">
                    <img src="/tab-icon.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Avora<span className="text-brand-500">Menu</span>
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Card if Logged In */}
              {user ? (
                <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-slate-400 text-xs truncate">@{user.username}</p>
                    </div>
                  </div>

                  {/* DOB Verified Age & Experience Switcher in Mobile Drawer */}
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Verified Age:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.age !== undefined ? `${user.age} yrs` : 'Unverified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-slate-500 font-semibold">Mode:</span>
                      {user.age !== undefined && user.age < 18 ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          Kids Only <Lock className="w-3 h-3" />
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleExperienceMode()}
                          className="font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                        >
                          {user.experienceMode === 'kids' ? '🧒 Kids (Switch)' : '🔥 18+ (Switch)'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t.login}
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); openAuthModal('register'); }}
                    className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:bg-brand-600 transition-colors cursor-pointer"
                  >
                    {t.signup} Free
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="py-4 space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Link 
                  href="/browse" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Compass className="w-4 h-4 text-brand-500" /> {t.browse}
                </Link>
                <Link 
                  href="/library" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <BookMarked className="w-4 h-4 text-brand-500" /> My Library
                  </span>
                  {library.length > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-500 text-white">
                      {library.length}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/community" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Users className="w-4 h-4 text-indigo-500" /> {t.community}
                </Link>
                <Link 
                  href="/contests" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-500" /> {t.contests}
                </Link>
                <Link 
                  href="/write" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <PenTool className="w-4 h-4 text-brand-500" /> {t.write}
                </Link>

                {user && (
                  <>
                    <Link 
                      href={`/profile/${user.username}`} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" /> {t.profile}
                    </Link>
                    <Link 
                      href="/settings" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" /> Settings
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-bold transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" /> {t.adminPanel}
                  </Link>
                )}
              </nav>
            </div>

            {/* Drawer Bottom Controls: Language, Theme, & Logout */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Language Switcher in Drawer */}
              <div className="flex items-center justify-between text-xs px-2">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Language:
                </span>
                <select 
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="en">English (EN)</option>
                  <option value="ka">ქართული (KA)</option>
                  <option value="hi">हिन्दी (HI)</option>
                </select>
              </div>

              {/* Theme Toggle in Drawer */}
              <div className="flex items-center justify-between text-xs px-2">
                <span className="text-slate-400 font-semibold">Appearance:</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-600" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Logout Button */}
              {user && (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
