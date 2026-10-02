'use client';
import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  initialGenres, 
  initialStories, 
  initialTestimonials, 
  initialContests, 
  initialBlogPosts, 
  initialCommunitySpaces,
  initialReaderReactions,
  initialRegisteredUsers,
  initialTransactions,
  initialReadingStreak,
  initialReadingProgress,
  initialFeatureFlags,
  initialCmsConfig
} from '@/lib/data';
import { translations } from '@/lib/translations';
import { 
  calculateAgeFromDob, 
  canUserAccessContent, 
  filterStoriesForUser, 
  filterGenresForUser, 
  EXPERIENCE_MODES 
} from '@/lib/agePolicy';
import { 
  computeStoryRankings, 
  sortStoriesByReads 
} from '@/lib/rankingEngine';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Multilingual & Theme
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');

  // Authenticated User State (defaults to null for unauthenticated guests)
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Stories & Content State (Dynamically calculated based on live reads)
  const [stories, setStories] = useState(() => computeStoryRankings(initialStories));
  const [genres, setGenres] = useState(initialGenres);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [contests, setContests] = useState(initialContests);
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [communitySpaces, setCommunitySpaces] = useState(initialCommunitySpaces);
  const [readerReactions, setReaderReactions] = useState(initialReaderReactions);

  // Social & Community State
  const [followingAuthors, setFollowingAuthors] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [library, setLibrary] = useState([]); // Wattpad Personal Library
  const [wishlist, setWishlist] = useState([]); // Dedicated Personal Wish List
  const [readingLists, setReadingLists] = useState([]);

  // Reading Progress & Streaks
  const [readingProgress, setReadingProgress] = useState(initialReadingProgress || {});
  const [readingStreak, setReadingStreak] = useState(initialReadingStreak || {
    currentStreak: 0,
    chaptersReadThisWeek: 0,
    dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    daysActive: [false, false, false, false, false, false, false]
  });

  // Dual-State Home Feed View Mode: 'landing' (public default) or 'feed' (authenticated)
  const [homeFeedViewMode, setHomeFeedViewMode] = useState('landing');

  // Soft Launch Feature Flags
  const [featureFlags, setFeatureFlags] = useState(initialFeatureFlags || {
    enablePaidFeatures: true,
    authorSelfPublishing: true,
    requireStoryApproval: false,
    ageGateEnforced: true,
    defaultItemsPerPage: 9
  });

  // VIP Subscription & Billing
  const [subscription, setSubscription] = useState({
    active: false,
    plan: null,
    renewDate: null,
    cardBrand: null,
    cardLast4: null
  });

  // Financial Ledger Transactions
  const [transactions, setTransactions] = useState(initialTransactions || []);

  // Registered Users (Moderation & Roles)
  const [registeredUsers, setRegisteredUsers] = useState(initialRegisteredUsers || []);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({ mode: 'donate', story: null, author: null, plan: null });

  // Onboarding & Reader Preferences State
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    goals: "Both reading and writing",
    favoriteGenres: ["Romance", "Fantasy", "Werewolf"],
    language: "en"
  });
  const [hiddenStoryIds, setHiddenStoryIds] = useState([]);

  // Adaptive Taste Discovery State (Emerging Genres)
  const [genreEngagement, setGenreEngagement] = useState({});
  const [dismissedEmergingGenres, setDismissedEmergingGenres] = useState([]);
  const [emergingGenrePrompt, setEmergingGenrePrompt] = useState(null);

  // Site Announcements Banner State
  const [announcementBanner, setAnnouncementBanner] = useState({
    active: true,
    text: "🎉 The Golden Quill Annual Writing Awards 2026 are officially open for submissions!",
    linkText: "Submit Novel",
    linkUrl: "/contests",
    dismissible: true
  });
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Wattpad-style Public Conversations Wall per author profile
  const [userConversations, setUserConversations] = useState({});

  // Auth Modal State (Facebook, Google, Email)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Age Verification & Content Access Control State
  const [ageVerificationModalOpen, setAgeVerificationModalOpen] = useState(false);

  // NextAuth Session Sync (Automatically populates user from Google OAuth)
  const { data: session, status: sessionStatus } = useSession();

  // Automatically sync NextAuth Google/Facebook session to AppContext user
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      const email = session.user.email;
      if (email && (!user || user.email !== email)) {
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const name = session.user.name || email.split('@')[0].replace(/[._-]/g, ' ');
        const avatar = session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

        let savedDob = null;
        let savedAge = null;
        let savedMode = EXPERIENCE_MODES.KIDS;
        let isAgeVerified = false;

        if (typeof window !== 'undefined') {
          try {
            const rawUser = localStorage.getItem('avora_user');
            if (rawUser) {
              const u = JSON.parse(rawUser);
              if (u.email === email && u.birthdate) {
                savedDob = u.birthdate;
                savedAge = calculateAgeFromDob(savedDob);
                savedMode = (savedAge !== null && savedAge < 18) 
                  ? EXPERIENCE_MODES.KIDS 
                  : (u.experienceMode || EXPERIENCE_MODES.MATURE);
                isAgeVerified = true;
              }
            }
          } catch (e) {}
        }

        const authenticatedUser = {
          id: session.user.id || Date.now(),
          username,
          name,
          email,
          provider: "google",
          role: "reader",
          avatar,
          badges: ["Google Verified", "Avid Reader"],
          birthdate: savedDob,
          age: savedAge,
          experienceMode: savedMode,
          isAgeVerified,
          hideMature: savedMode === EXPERIENCE_MODES.KIDS,
          hasCompletedOnboarding: true,
          userPreferences: {
            goals: "I'm here to read stories",
            favoriteGenres: ["Romance", "Fantasy", "Mystery"],
            language: "en"
          }
        };

        setUser(authenticatedUser);
        setHomeFeedViewMode('feed');
        setAuthModalOpen(false);

        // Only prompt for DOB if this authentication was explicitly triggered by user registration
        if (typeof window !== 'undefined') {
          const isRegistrationPending = sessionStorage.getItem('avora_registration_pending') === 'true';
          sessionStorage.removeItem('avora_registration_pending');

          if (isRegistrationPending && !isAgeVerified) {
            setAgeVerificationModalOpen(true);
          }
        }

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('avora_user', JSON.stringify(authenticatedUser));
            localStorage.setItem('avora_user_preferences', JSON.stringify(authenticatedUser.userPreferences));
            localStorage.setItem('avora_user_onboarding', 'true');
            document.cookie = `avora_session=${encodeURIComponent(email)}; path=/; max-age=2592000; SameSite=Lax`;
            if (savedDob) {
              document.cookie = `avora_dob=${encodeURIComponent(savedDob)}; path=/; max-age=2592000; SameSite=Lax`;
              document.cookie = `avora_age=${encodeURIComponent(String(savedAge))}; path=/; max-age=2592000; SameSite=Lax`;
              document.cookie = `avora_experience_mode=${encodeURIComponent(savedMode)}; path=/; max-age=2592000; SameSite=Lax`;
            }
          } catch (e) {
            console.error("Failed to sync session to localStorage", e);
          }
        }

        sendNotification({
          title: "Google Sign-In Successful",
          message: `Welcome to Avora Library, ${name}! Signed in via Google.`,
          type: "system"
        });
      }
    }
  }, [session, sessionStatus, user]);

  // Moderation & Audit Log
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // CMS Content Management (PWA, QR Code, Footer Socials, Pages)
  const [cmsConfig, setCmsConfig] = useState(initialCmsConfig);

  // Theme Syncing to HTML class
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Sync User Session, Reading Progress & Preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('avora_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser.birthdate) {
            parsedUser.age = calculateAgeFromDob(parsedUser.birthdate);
            parsedUser.isAgeVerified = true;
            if (parsedUser.age !== null && parsedUser.age < 18) {
              parsedUser.experienceMode = EXPERIENCE_MODES.KIDS;
              parsedUser.hideMature = true;
            }
          }
          setUser(parsedUser);
          setHomeFeedViewMode('feed');
        }
      } catch (e) {
        console.error("Could not load user from localStorage", e);
      }

      try {
        const saved = localStorage.getItem('avora_reading_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          setReadingProgress(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Could not load reading progress from localStorage", e);
      }

      try {
        const savedPrefs = localStorage.getItem('avora_user_preferences');
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          setUserPreferences(parsed);
          if (parsed?.language && ['en', 'ka', 'hi', 'es'].includes(parsed.language)) {
            setLang(parsed.language);
          }
        }
        const savedLang = localStorage.getItem('avora_lang');
        if (savedLang && ['en', 'ka', 'hi', 'es'].includes(savedLang)) {
          setLang(savedLang);
          if (typeof document !== 'undefined') {
            document.documentElement.lang = savedLang;
          }
        }
        const savedHidden = localStorage.getItem('avora_hidden_stories');
        if (savedHidden) {
          setHiddenStoryIds(JSON.parse(savedHidden));
        }

        const savedEngagement = localStorage.getItem('avora_genre_engagement');
        if (savedEngagement) {
          setGenreEngagement(JSON.parse(savedEngagement));
        }

        const savedDismissed = localStorage.getItem('avora_dismissed_emerging_genres');
        if (savedDismissed) {
          setDismissedEmergingGenres(JSON.parse(savedDismissed));
        }
      } catch (e) {
        console.error("Could not load user preferences from localStorage", e);
      }

      // Sync CMS Content Configuration
      try {
        const savedCms = localStorage.getItem('avora_cms_config');
        if (savedCms) {
          const parsedCms = JSON.parse(savedCms);
          setCmsConfig(prev => ({
            ...prev,
            ...parsedCms,
            pwaSection: { ...prev.pwaSection, ...(parsedCms.pwaSection || {}) },
            socialLinks: { ...prev.socialLinks, ...(parsedCms.socialLinks || {}) },
            footerConfig: { ...prev.footerConfig, ...(parsedCms.footerConfig || {}) },
            pagesContent: { ...prev.pagesContent, ...(parsedCms.pagesContent || {}) }
          }));
        }
      } catch (e) {
        console.error("Could not load CMS config from localStorage", e);
      }

      // Sync Wish List and Library from localStorage
      try {
        const savedWishlist = localStorage.getItem('avora_wishlist');
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
        const savedLib = localStorage.getItem('avora_library');
        if (savedLib) {
          setLibrary(JSON.parse(savedLib));
        }
      } catch (e) {
        console.error("Could not load wishlist/library from localStorage", e);
      }

      // Sync Custom Stories from localStorage
      try {
        const savedCustomStories = localStorage.getItem('avora_custom_stories');
        if (savedCustomStories) {
          const custom = JSON.parse(savedCustomStories);
          if (Array.isArray(custom) && custom.length > 0) {
            setStories(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const newItems = custom.filter(s => !existingIds.has(s.id));
              return computeStoryRankings([...newItems, ...prev]);
            });
          }
        }
      } catch (e) {
        console.error("Could not load custom stories from localStorage", e);
      }

      // Sync story read counts from localStorage and dynamically re-rank
      try {
        const savedReads = localStorage.getItem('avora_story_reads');
        if (savedReads) {
          const deltas = JSON.parse(savedReads);
          setStories(prev => {
            const merged = prev.map(s => {
              const delta = Number(deltas[s.id]) || 0;
              const updatedChapters = s.chapters?.map(c => {
                const chDelta = Number(deltas[`${s.id}_ch_${c.id}`]) || 0;
                return { ...c, reads: (c.reads || 0) + chDelta };
              }) || [];
              return {
                ...s,
                reads: (s.reads || 0) + delta,
                chapters: updatedChapters
              };
            });
            return computeStoryRankings(merged);
          });
        }
        // Sync Feature Flags from localStorage
        const savedFeatureFlags = localStorage.getItem('avora_feature_flags');
        if (savedFeatureFlags) {
          setFeatureFlags(prev => ({ ...prev, ...JSON.parse(savedFeatureFlags) }));
        }
      } catch (e) {
        console.error("Could not load story read counts from localStorage", e);
      }

      setIsHydrated(true);
    }
  }, []);

  // Sync User Session to localStorage (only after initial load has finished)
  const isInitialUserSyncRef = useRef(true);
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    if (isInitialUserSyncRef.current) {
      isInitialUserSyncRef.current = false;
      return;
    }
    try {
      if (user) {
        localStorage.setItem('avora_user', JSON.stringify(user));
        document.cookie = `avora_session=${encodeURIComponent(user.email)}; path=/; max-age=2592000; SameSite=Lax`;
      } else {
        localStorage.removeItem('avora_user');
        document.cookie = 'avora_session=; path=/; max-age=0';
      }
    } catch (e) {
      console.error("Could not sync user to localStorage", e);
    }
  }, [user, isHydrated]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      try {
        localStorage.setItem('avora_wishlist', JSON.stringify(wishlist));
      } catch (e) {}
    }
  }, [wishlist, isHydrated]);

  // Sync Library to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      try {
        localStorage.setItem('avora_library', JSON.stringify(library));
      } catch (e) {}
    }
  }, [library, isHydrated]);

  // Trigger onboarding modal if user has not completed onboarding
  useEffect(() => {
    if (typeof window !== 'undefined' && user && user.hasCompletedOnboarding === false) {
      const completed = localStorage.getItem('avora_user_onboarding');
      if (!completed) {
        setOnboardingModalOpen(true);
      }
    }
  }, [user]);

  // Sync Notifications from MariaDB for authenticated user
  useEffect(() => {
    if (!user?.email) {
      setNotifications([]);
      return;
    }
    let isMounted = true;
    async function fetchDbNotifications() {
      try {
        const userEmail = user.email;
        const res = await fetch(`/api/notifications?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      } catch (e) {
        // Fallback silently if offline
      }
    }
    fetchDbNotifications();
    return () => { isMounted = false; };
  }, [user?.email]);

  // Persistent Language Changer
  const changeLanguage = (newLang) => {
    if (['en', 'ka', 'hi', 'es'].includes(newLang)) {
      setLang(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('avora_lang', newLang);
        document.documentElement.lang = newLang;
      }
      setUserPreferences(prev => {
        const updated = { ...prev, language: newLang };
        if (typeof window !== 'undefined') {
          localStorage.setItem('avora_user_preferences', JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  // Safe Fallback Translation Dictionary (merges requested language over English default)
  const t = useMemo(() => {
    const activeDict = translations[lang] || translations.en;
    return { ...translations.en, ...activeDict };
  }, [lang]);

  // Actions
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const sendNotification = async ({ 
    title, 
    message, 
    type = 'system', 
    link = null, 
    sendEmail = false, 
    recipientEmail = null,
    authorName = null,
    storyTitle = null,
    chapterTitle = null 
  }) => {
    const targetEmail = recipientEmail || user?.email || null;
    const tempId = `notif_${Date.now()}`;
    const newNotif = {
      id: tempId,
      title,
      message,
      type,
      link,
      read: false,
      emailSent: sendEmail,
      recipientEmail: targetEmail,
      time: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type,
          link,
          userEmail: user?.email || null,
          sendEmail,
          recipientEmail: targetEmail,
          authorName,
          storyTitle,
          chapterTitle
        })
      });
      const data = await res.json();
      if (data.success && data.notificationId) {
        setNotifications(prev => prev.map(n => n.id === tempId ? { ...n, id: data.notificationId, emailSent: data.emailSent } : n));
      }
    } catch (e) {
      console.error("Failed to post notification to DB:", e);
    }
  };

  const markNotificationRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error("Failed to mark notification read in DB:", e);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userEmail: user?.email || null })
      });
    } catch (e) {
      console.error("Failed to mark all read in DB:", e);
    }
  };

  const hideStory = (storyId) => {
    setHiddenStoryIds(prev => {
      const updated = [...new Set([...prev, storyId])];
      if (typeof window !== 'undefined') {
        localStorage.setItem('avora_hidden_stories', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const unhideStory = (storyId) => {
    setHiddenStoryIds(prev => {
      const updated = prev.filter(id => id !== storyId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('avora_hidden_stories', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const openOnboardingModal = () => {
    setOnboardingModalOpen(true);
  };

  const completeOnboarding = (prefs) => {
    const updatedPreferences = {
      ...userPreferences,
      ...prefs
    };
    setUserPreferences(updatedPreferences);
    if (user) {
      setUser(prev => ({
        ...prev,
        hasCompletedOnboarding: true,
        userPreferences: updatedPreferences
      }));
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('avora_user_preferences', JSON.stringify(updatedPreferences));
      localStorage.setItem('avora_user_onboarding', 'true');
    }
    setOnboardingModalOpen(false);
    setHomeFeedViewMode('feed');

    sendNotification({
      title: "Personal Library Curated! ✨",
      message: `Your home feed is now customized for ${updatedPreferences.favoriteGenres?.join(', ')}. Enjoy discovering new serialized chapters!`,
      type: "system"
    });
  };

  // Adaptive Taste Discovery Engine
  // Computes emerging genres (read by user but not in their initial favorite genres)
  const emergingGenres = useMemo(() => {
    const userFavs = (userPreferences?.favoriteGenres || []).map(g => (g || '').toLowerCase());
    const dismissed = dismissedEmergingGenres.map(g => (g || '').toLowerCase());
    return Object.keys(genreEngagement)
      .filter(genre => {
        if (!genre) return false;
        const gLower = genre.toLowerCase();
        const isFav = userFavs.some(fav => fav.includes(gLower) || gLower.includes(fav));
        const isDismissed = dismissed.includes(gLower);
        const reads = genreEngagement[genre]?.reads || 0;
        return !isFav && !isDismissed && reads >= 1;
      })
      .sort((a, b) => (genreEngagement[b]?.reads || 0) - (genreEngagement[a]?.reads || 0));
  }, [genreEngagement, userPreferences?.favoriteGenres, dismissedEmergingGenres]);

  const recordGenreInteraction = (genre) => {
    if (!genre) return;
    setGenreEngagement(prev => {
      const current = prev[genre] || { reads: 0, lastRead: Date.now() };
      const newCount = current.reads + 1;
      const updated = {
        ...prev,
        [genre]: {
          reads: newCount,
          lastRead: Date.now()
        }
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_genre_engagement', JSON.stringify(updated));
        } catch (e) {}
      }

      // Check if this genre is NOT in user's favorites and NOT dismissed
      const userFavs = (userPreferences?.favoriteGenres || []).map(g => (g || '').toLowerCase());
      const isFav = userFavs.some(f => f.includes(genre.toLowerCase()) || genre.toLowerCase().includes(f));
      const isDismissed = dismissedEmergingGenres.map(d => (d || '').toLowerCase()).includes(genre.toLowerCase());

      // If user has read this unselected genre at least twice, pop up the discovery modal!
      if (!isFav && !isDismissed && newCount >= 2) {
        setEmergingGenrePrompt({
          open: true,
          genre,
          reads: newCount
        });
      }

      return updated;
    });
  };

  const addGenreToFavorites = (genre) => {
    if (!genre) return;
    setUserPreferences(prev => {
      const currentFavs = prev?.favoriteGenres || [];
      const alreadyHas = currentFavs.some(g => g.toLowerCase() === genre.toLowerCase());
      const updatedFavs = alreadyHas ? currentFavs : [...currentFavs, genre];
      const updated = {
        ...prev,
        favoriteGenres: updatedFavs
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user_preferences', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (user) {
      setUser(prev => ({
        ...prev,
        userPreferences: {
          ...(prev?.userPreferences || {}),
          favoriteGenres: [...new Set([...(prev?.userPreferences?.favoriteGenres || []), genre])]
        }
      }));
    }

    setEmergingGenrePrompt(null);
    sendNotification({
      title: `${genre} Added to Favorites! ✨`,
      message: `Your home feed and recommendations will now feature popular ${genre} serialized stories!`,
      type: 'system'
    });
  };

  const dismissEmergingGenre = (genre) => {
    if (genre) {
      setDismissedEmergingGenres(prev => {
        const updated = [...new Set([...prev, genre])];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('avora_dismissed_emerging_genres', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
    }
    setEmergingGenrePrompt(null);
  };

  const triggerEmergingModal = (genre = 'Romance') => {
    setEmergingGenrePrompt({
      open: true,
      genre,
      reads: (genreEngagement[genre]?.reads || 2)
    });
  };

  const followAuthor = (authorUsername) => {
    setFollowingAuthors(prev => {
      const isFollowing = prev.includes(authorUsername);
      const updated = isFollowing ? prev.filter(u => u !== authorUsername) : [...prev, authorUsername];
      if (!isFollowing) {
        sendNotification({
          title: "Follow Success",
          message: `You are now following @${authorUsername}. You will receive alerts when new chapters drop.`,
          type: "system"
        });
      }
      return updated;
    });
  };

  const blockUser = (username) => {
    setBlockedUsers(prev => [...prev, username]);
    alert(`User @${username} has been blocked.`);
  };

  const submitReport = ({ targetType, reportedUser, reason, details, storyTitle }) => {
    const newReport = {
      id: Date.now(),
      targetType,
      reportedUser: reportedUser || "Unknown",
      reason,
      details: details || "",
      story: storyTitle || "Avora Library General",
      status: "pending",
      timestamp: "Just now"
    };
    setReports(prev => [newReport, ...prev]);
    addAuditLog(`Report Filed (${targetType})`, `Target: ${reportedUser || storyTitle}`);
  };

  const addAuditLog = (action, target) => {
    setAuditLogs(prev => [
      { id: Date.now(), action, target, admin: user?.name || "Admin", time: "Just now" },
      ...prev
    ]);
  };

  const voteChapter = (storyId, chapterId) => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return {
          ...s,
          votes: s.votes + 1,
          chapters: s.chapters.map(c => c.id === chapterId ? { ...c, votes: c.votes + 1 } : c)
        };
      }
      return s;
    }));
  };

  const reactChapterEmoji = (storyId, chapterId, emoji) => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id === chapterId) {
              const currentEmojis = c.emojis || { "🔥": 0, "❤️": 0, "😭": 0, "👏": 0, "😱": 0 };
              return {
                ...c,
                emojis: {
                  ...currentEmojis,
                  [emoji]: (currentEmojis[emoji] || 0) + 1
                }
              };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const addParagraphComment = (storyId, chapterId, paragraphId, text, authorName = user?.name || "Anonymous Reader") => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return {
          ...s,
          commentsCount: s.commentsCount + 1,
          chapters: s.chapters.map(c => {
            if (c.id === chapterId) {
              return {
                ...c,
                paragraphs: c.paragraphs.map(p => {
                  if (p.id === paragraphId) {
                    return {
                      ...p,
                      comments: [
                        ...p.comments,
                        {
                          id: Date.now(),
                          author: authorName,
                          avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
                          time: "Just now",
                          text,
                          likes: 0,
                          emojis: { "❤️": 1 }
                        }
                      ]
                    };
                  }
                  return p;
                })
              };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const incrementStoryReads = (storyId, chapterId = null, amount = 1) => {
    setStories(prev => {
      const updated = prev.map(s => {
        if (s.id === storyId) {
          const newReads = (s.reads || 0) + amount;
          const newChapters = s.chapters?.map(c => {
            if (chapterId && c.id === chapterId) {
              return { ...c, reads: (c.reads || 0) + amount };
            }
            return c;
          }) || [];
          return {
            ...s,
            reads: newReads,
            chapters: newChapters
          };
        }
        return s;
      });

      // Dynamically recalculate all rankings and positions
      const newlyRanked = computeStoryRankings(updated);

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('avora_story_reads');
          const deltas = raw ? JSON.parse(raw) : {};
          deltas[storyId] = (deltas[storyId] || 0) + amount;
          if (chapterId) {
            deltas[`${storyId}_ch_${chapterId}`] = (deltas[`${storyId}_ch_${chapterId}`] || 0) + amount;
          }
          localStorage.setItem('avora_story_reads', JSON.stringify(deltas));
        } catch (e) {
          console.error("Failed to persist read counter:", e);
        }
      }

      return newlyRanked;
    });

    // Asynchronously notify backend API
    if (typeof window !== 'undefined') {
      const targetStory = stories.find(s => s.id === storyId);
      if (targetStory?.slug) {
        fetch(`/api/stories/${targetStory.slug}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId, count: amount })
        }).catch(() => {});
      }
    }
  };

  const publishStory = (newStory) => {
    setStories(prev => {
      const updated = computeStoryRankings([newStory, ...prev]);
      if (typeof window !== 'undefined') {
        try {
          const savedCustom = localStorage.getItem('avora_custom_stories');
          const list = savedCustom ? JSON.parse(savedCustom) : [];
          localStorage.setItem('avora_custom_stories', JSON.stringify([newStory, ...list]));
        } catch (e) {}
      }
      return updated;
    });
    addAuditLog("Story Published", newStory.title);
  };

  const deleteStory = (storyId) => {
    const target = stories.find(s => s.id === storyId);
    setStories(prev => {
      const updated = computeStoryRankings(prev.filter(s => s.id !== storyId));
      if (typeof window !== 'undefined') {
        try {
          const savedCustom = localStorage.getItem('avora_custom_stories');
          if (savedCustom) {
            const list = JSON.parse(savedCustom);
            localStorage.setItem('avora_custom_stories', JSON.stringify(list.filter(s => s.id !== storyId)));
          }
        } catch (e) {}
      }
      return updated;
    });
    if (target) addAuditLog("Story Deleted", target.title);
  };

  const saveReadingProgress = (storyId, chapterId, paragraphIndex = 0, scrollOffset = 0) => {
    // Record read counter for this chapter session
    if (typeof window !== 'undefined' && storyId) {
      const sessionKey = `avora_read_session_${storyId}_${chapterId || 'main'}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        incrementStoryReads(storyId, chapterId, 1);
      }
    }

    const targetStory = stories.find(s => s.id === storyId);
    if (targetStory?.genre) {
      recordGenreInteraction(targetStory.genre);
    }
    const targetChapter = targetStory?.chapters?.find(c => c.id === chapterId) || targetStory?.chapters?.[0];
    const totalChapters = targetStory?.chapters?.length || 1;
    const chapterNum = targetChapter?.number || 1;
    const progressPercent = Math.min(100, Math.max(10, Math.round((chapterNum / totalChapters) * 100)));

    const newProgress = {
      storyId,
      chapterId,
      chapterNumber: chapterNum,
      chapterTitle: targetChapter?.title || `Chapter ${chapterNum}`,
      paragraphIndex,
      scrollOffset,
      progressPercent,
      lastReadAt: "Just now"
    };

    setReadingProgress(prev => {
      const updated = { ...prev, [storyId]: newProgress };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_reading_progress', JSON.stringify(updated));
        } catch (e) {
          console.error("Could not save reading progress", e);
        }
      }
      return updated;
    });

    if (user && !library.includes(storyId)) {
      setLibrary(prev => [...prev, storyId]);
    }
  };

  const getProgress = (storyId) => {
    return readingProgress[storyId] || null;
  };

  const recordChapterRead = (storyId, chapterId) => {
    saveReadingProgress(storyId, chapterId);
    incrementStoryReads(storyId, chapterId, 1);
    setReadingStreak(prev => ({
      ...prev,
      chaptersReadThisWeek: (prev?.chaptersReadThisWeek || 0) + 1
    }));
  };

  const createReadingList = (title, description, storyIds = []) => {
    const newList = {
      id: Date.now(),
      title,
      description,
      storyIds,
      isPublic: true
    };
    setReadingLists(prev => [newList, ...prev]);
  };

  // Wattpad-style Library Management
  const addToLibrary = (storyId) => {
    if (!user) {
      openAuthModal('login', 'Log in to add this novel to your private Library and get new chapter updates.', () => addToLibrary(storyId));
      return;
    }
    if (!library.includes(storyId)) {
      setLibrary(prev => [...prev, storyId]);
      const targetStory = stories.find(s => s.id === storyId);
      setNotifications(prev => [
        { 
          id: Date.now(), 
          title: "Added to Library", 
          message: `"${targetStory?.title || 'Story'}" has been added to your Library. You'll receive alerts when new chapters drop!`, 
          time: "Just now", 
          read: false 
        },
        ...prev
      ]);
    }
  };

  const removeFromLibrary = (storyId) => {
    setLibrary(prev => prev.filter(id => id !== storyId));
  };

  const isInLibrary = (storyId) => {
    return library.includes(storyId);
  };

  // Dedicated Personal Wish List Operations
  const addToWishlist = (storyId) => {
    const numId = Number(storyId);
    if (!user) {
      openAuthModal('login', 'Sign in to save this story to your personal Wish List!', () => addToWishlist(storyId));
      return;
    }
    if (!wishlist.includes(numId)) {
      setWishlist(prev => [...prev, numId]);
      const targetStory = stories.find(s => s.id === numId);
      sendNotification({
        title: "Added to Wish List! 🎁",
        message: `"${targetStory?.title || 'Story'}" has been added to your personal Wish List.`,
        type: "system"
      });
    }
  };

  const removeFromWishlist = (storyId) => {
    const numId = Number(storyId);
    setWishlist(prev => prev.filter(id => id !== numId));
  };

  const isInWishlist = (storyId) => {
    const numId = Number(storyId);
    return wishlist.includes(numId);
  };

  const toggleWishlist = (storyId) => {
    const numId = Number(storyId);
    if (isInWishlist(numId)) {
      removeFromWishlist(numId);
    } else {
      addToWishlist(numId);
    }
  };

  // Financial & Payment Operations
  const openPaymentModal = (params = {}) => {
    const mode = params.mode || params.type || 'donate';
    const plan = params.plan || null;
    const author = params.author || null;
    const authorUsername = params.authorUsername || null;
    const story = params.story || null;
    setPaymentModalData({ mode, type: mode, story, author, authorUsername, plan });
    setPaymentModalOpen(true);
  };

  const addTransaction = ({ type, amount, plan = null, cardBrand = 'visa', cardLast4 = '4242', author, authorUsername, storyTitle }) => {
    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      type,
      plan,
      amount: Number(amount) || 0,
      cardBrand,
      cardLast4,
      user: user?.name || "Anonymous Reader",
      author: author || "Platform",
      authorUsername: authorUsername || "avoralibrary",
      storyTitle: storyTitle || "Platform VIP",
      status: "Completed"
    };

    setTransactions(prev => [newTx, ...prev]);
    addAuditLog(type === 'subscription' ? 'VIP Pass Subscribed' : 'Author Tip Sent', `$${amount} to ${author || 'Platform'}`);
    return newTx;
  };

  const refundTransaction = (txId) => {
    setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'Refunded' } : tx));
    addAuditLog('Transaction Refunded', `Transaction ID: ${txId}`);
  };

  const subscribe = (plan, cardDetails) => {
    const amount = plan.includes('Annual') ? 49.99 : 5.99;
    addTransaction({
      type: 'subscription',
      amount,
      plan,
      cardBrand: cardDetails?.brand || 'visa',
      cardLast4: cardDetails?.last4 || '4242',
      author: 'Platform',
      authorUsername: 'avoralibrary',
      storyTitle: 'Avora VIP Membership'
    });
    setSubscription({
      active: true,
      plan,
      renewDate: 'April 30, 2026',
      cardBrand: cardDetails?.brand || 'visa',
      cardLast4: cardDetails?.last4 || '4242'
    });
  };

  const cancelSubscription = () => {
    setSubscription({
      active: false,
      plan: null,
      renewDate: null,
      cardBrand: null,
      cardLast4: null
    });
    setNotifications(prev => [
      {
        id: Date.now(),
        title: 'Subscription Cancelled',
        message: 'Your VIP subscription has been cancelled. You will continue to have standard free access.',
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
    addAuditLog('VIP Subscription Cancelled', user?.name || 'Reader');
  };

  const togglePaidFeatures = () => {
    setFeatureFlags(prev => {
      const next = !prev.enablePaidFeatures;
      addAuditLog('Feature Flag Changed', `enablePaidFeatures: ${next ? 'ENABLED' : 'DISABLED'}`);
      const updated = { ...prev, enablePaidFeatures: next };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_feature_flags', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const updateFeatureFlags = (updates) => {
    setFeatureFlags(prev => {
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_feature_flags', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    addAuditLog('Platform Settings Updated', 'Feature flags modified');
  };

  // User Management
  const updateUserRole = (userId, newRole) => {
    setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    addAuditLog('User Role Updated', `User ID ${userId} assigned role: ${newRole}`);
  };

  const toggleUserStatus = (userId) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        addAuditLog('User Status Changed', `${u.name} status: ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const deleteUser = (userId) => {
    const target = registeredUsers.find(u => u.id === userId);
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
    if (target) addAuditLog('User Deleted', target.name);
  };

  const addUser = ({ name, username, email, role = 'reader' }) => {
    const newUser = {
      id: Date.now(),
      name,
      username: username || name.toLowerCase().replace(/\s+/g, ''),
      email,
      role,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      storiesCount: 0
    };
    setRegisteredUsers(prev => [newUser, ...prev]);
    addAuditLog('User Registered by Admin', `${name} (@${newUser.username})`);
    return newUser;
  };

  // Auth Modal & OAuth methods
  const openAuthModal = (mode = 'login', message = '', action = null) => {
    setAuthModalMode(mode);
    setAuthModalMessage(message);
    setPendingAction(action ? () => action : null);
    setAuthModalOpen(true);
  };

  const executePending = () => {
    if (pendingAction && typeof pendingAction === 'function') {
      try {
        pendingAction();
      } catch (e) {
        console.error("Failed to execute pending action:", e);
      }
      setPendingAction(null);
    }
  };

  // 1. Google Authentication (Automatically triggers Google Account Chooser popup via NextAuth with resilient demo fallback)
  const loginWithGoogle = async (customUser = null) => {
    if (customUser && customUser.email) {
      const email = customUser.email.trim();
      const name = customUser.name?.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const avatar = customUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

      const googleUser = {
        id: Date.now(),
        username,
        name,
        email,
        provider: "google",
        role: "reader",
        avatar,
        badges: ["Google Verified", "Avid Reader"],
        isAgeVerified: true,
        hideMature: false,
        hasCompletedOnboarding: true,
        userPreferences: {
          goals: "I'm here to read stories",
          favoriteGenres: ["Romance", "Fantasy", "Mystery"],
          language: "en"
        }
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(googleUser));
          localStorage.setItem('avora_user_preferences', JSON.stringify(googleUser.userPreferences));
          localStorage.setItem('avora_user_onboarding', 'true');
          document.cookie = `avora_session=${encodeURIComponent(googleUser.email)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {
          console.error("Failed to save google user to localStorage", e);
        }
      }

      setUser(googleUser);
      setHomeFeedViewMode('feed');
      setAuthModalOpen(false);
      executePending();
      return googleUser;
    }
    
    // Attempt real NextAuth Google sign-in with seamless fallback
    try {
      await signIn('google', { callbackUrl: '/home' });
    } catch (e) {
      console.warn("NextAuth Google sign-in fallback triggered:", e);
      return loginWithGoogle({
        email: "alex.rivers.google@gmail.com",
        name: "Alex Rivers",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
      });
    }
  };

  // 2. Facebook Authentication (Gracefully logs in with Facebook persona)
  const loginWithFacebook = async (customUser = null) => {
    if (customUser && customUser.email) {
      const email = customUser.email.trim();
      const name = customUser.name?.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
      const username = `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')}_fb`;
      const avatar = customUser.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80";

      const facebookUser = {
        id: Date.now(),
        username,
        name,
        email,
        provider: "facebook",
        role: "author",
        avatar,
        badges: ["Facebook Verified", "Rising Author"],
        isAgeVerified: true,
        hideMature: false,
        hasCompletedOnboarding: true,
        userPreferences: {
          goals: "Both reading and writing",
          favoriteGenres: ["Romance", "Werewolf", "Teen Fiction"],
          language: "en"
        }
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(facebookUser));
          localStorage.setItem('avora_user_preferences', JSON.stringify(facebookUser.userPreferences));
          localStorage.setItem('avora_user_onboarding', 'true');
          document.cookie = `avora_session=${encodeURIComponent(facebookUser.email)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {
          console.error("Failed to save facebook user to localStorage", e);
        }
      }

      setUser(facebookUser);
      setHomeFeedViewMode('feed');
      setAuthModalOpen(false);
      executePending();
      return facebookUser;
    }

    // Gracefully authenticate with verified Facebook demo persona
    return loginWithFacebook({
      email: "jordan.fb.author@facebook.com",
      name: "Jordan Smith",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80"
    });
  };

  // 3. Email Authentication
  const loginWithEmail = (email, password) => {
    const cleanEmail = (email || '').trim();
    const username = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
    const isAdmin = cleanEmail.toLowerCase().includes('admin');
    const isAuthor = cleanEmail.toLowerCase().includes('author') || cleanEmail.toLowerCase().includes('elena');
    const emailUser = {
      id: Date.now(),
      username: username || 'reader',
      name: cleanEmail.includes('@') ? username.replace(/[._-]/g, ' ') : (username || 'Reader'),
      email: cleanEmail.includes('@') ? cleanEmail : `${username || 'reader'}@avoralibrary.com`,
      provider: "email",
      role: isAdmin ? 'admin' : (isAuthor ? 'author' : 'reader'),
      avatar: isAdmin 
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        : (isAuthor 
            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"),
      badges: isAdmin ? ["Admin", "Editorial Member"] : (isAuthor ? ["Verified Author", "Rising Creator"] : ["Member", "Avid Reader"]),
      isAgeVerified: true,
      hideMature: false,
      hasCompletedOnboarding: true,
      userPreferences: {
        goals: isAdmin ? "Both reading and writing" : (isAuthor ? "Publishing original serials" : "I'm here to read stories"),
        favoriteGenres: ["Romance", "Fantasy", "Mystery"],
        language: "en"
      }
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('avora_user', JSON.stringify(emailUser));
        localStorage.setItem('avora_user_preferences', JSON.stringify(emailUser.userPreferences));
        localStorage.setItem('avora_user_onboarding', 'true');
        document.cookie = `avora_session=${encodeURIComponent(emailUser.email)}; path=/; max-age=2592000; SameSite=Lax`;
      } catch (e) {}
    }

    setUser(emailUser);
    setHomeFeedViewMode('feed');
    setAuthModalOpen(false);
    executePending();
    return emailUser;
  };

  const registerWithEmail = ({ username, email, password, birthdate, age = null, experienceMode = 'mature', isAgeConfirmed }) => {
    const calculatedAge = age !== null ? age : (birthdate ? calculateAgeFromDob(birthdate) : null);
    const enforcedMode = (calculatedAge !== null && calculatedAge < 18) 
      ? EXPERIENCE_MODES.KIDS 
      : (experienceMode === EXPERIENCE_MODES.KIDS ? EXPERIENCE_MODES.KIDS : EXPERIENCE_MODES.MATURE);

    const newUser = {
      id: Date.now(),
      username,
      name: username,
      email,
      provider: "email",
      birthdate,
      age: calculatedAge,
      experienceMode: enforcedMode,
      role: 'author',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: calculatedAge && calculatedAge < 18 ? ["Young Creator", "Kids Reader"] : ["New Creator"],
      isAgeVerified: Boolean(birthdate && calculatedAge !== null),
      hideMature: enforcedMode === EXPERIENCE_MODES.KIDS,
      hasCompletedOnboarding: false
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('avora_user', JSON.stringify(newUser));
        document.cookie = `avora_session=${encodeURIComponent(newUser.email)}; path=/; max-age=2592000; SameSite=Lax`;
        if (birthdate) {
          document.cookie = `avora_dob=${encodeURIComponent(birthdate)}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_age=${encodeURIComponent(String(calculatedAge))}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_experience_mode=${encodeURIComponent(enforcedMode)}; path=/; max-age=2592000; SameSite=Lax`;
        }
      } catch (e) {}
    }

    setUser(newUser);
    setHomeFeedViewMode('feed');
    setAuthModalOpen(false);
    executePending();
    setOnboardingModalOpen(true);

  // Age Verification & DOB Management
  const updateUserAgeAndDob = (birthdate, age, experienceMode = EXPERIENCE_MODES.MATURE) => {
    const calculatedAge = age ?? calculateAgeFromDob(birthdate);
    const enforcedMode = (calculatedAge !== null && calculatedAge < 18) 
      ? EXPERIENCE_MODES.KIDS 
      : (experienceMode === EXPERIENCE_MODES.KIDS ? EXPERIENCE_MODES.KIDS : EXPERIENCE_MODES.MATURE);

    setUser(prev => {
      const updated = {
        ...(prev || {}),
        birthdate,
        age: calculatedAge,
        experienceMode: enforcedMode,
        isAgeVerified: true,
        hideMature: enforcedMode === EXPERIENCE_MODES.KIDS
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(updated));
          document.cookie = `avora_dob=${encodeURIComponent(birthdate)}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_age=${encodeURIComponent(String(calculatedAge))}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_experience_mode=${encodeURIComponent(enforcedMode)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {
          console.error("Failed to update user age in localStorage", e);
        }
      }

      return updated;
    });

    sendNotification({
      title: "Age Verification Completed",
      message: `Your account is verified (${calculatedAge} years old) in ${enforcedMode === EXPERIENCE_MODES.KIDS ? 'Kids / Family' : '18+ Mature'} mode.`,
      type: "system"
    });
  };

  const toggleExperienceMode = (mode) => {
    if (!user) return;
    const userAge = user.birthdate ? calculateAgeFromDob(user.birthdate) : user.age;
    if (userAge !== null && userAge < 18 && mode === EXPERIENCE_MODES.MATURE) {
      alert("Access Restricted: Accounts verified under 18 years cannot access 18+ Mature mode.");
      return;
    }
    const newMode = mode === EXPERIENCE_MODES.KIDS ? EXPERIENCE_MODES.KIDS : EXPERIENCE_MODES.MATURE;
    setUser(prev => {
      const updated = {
        ...prev,
        experienceMode: newMode,
        hideMature: newMode === EXPERIENCE_MODES.KIDS
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(updated));
          document.cookie = `avora_experience_mode=${encodeURIComponent(newMode)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {}
      }
      return updated;
    });
  };

  const canAccessStory = (story) => {
    return canUserAccessContent(user, story);
  };

    // Dispatch welcome notification & welcome email
    sendNotification({
      title: "Welcome to Avora Library!",
      message: `Welcome @${username}! Your serialized reading and writing journey begins today. Check out trending stories or serialize your first novel.`,
      type: "welcome",
      sendEmail: true,
      recipientEmail: email
    });
    return newUser;
  };

  // Logout & Clear Session
  const logoutUser = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('avora_user');
        document.cookie = 'avora_session=; path=/; max-age=0';
      } catch (e) {
        console.error("Could not clear user session", e);
      }
    }
    signOut({ redirect: false });
    setHomeFeedViewMode('landing');
  };

  // Public Conversations Wall
  const postConversationMessage = (authorUsername, text) => {
    const key = authorUsername.toLowerCase();
    const newMsg = {
      id: Date.now(),
      author: user?.name || "Reader",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      text,
      time: "Just now"
    };
    setUserConversations(prev => ({
      ...prev,
      [key]: [newMsg, ...(prev[key] || [])]
    }));
  };

  // CMS Content Management & Customization
  const updateCmsConfig = (updates) => {
    setCmsConfig(prev => {
      const next = {
        ...prev,
        ...updates,
        pwaSection: updates.pwaSection ? { ...prev.pwaSection, ...updates.pwaSection } : prev.pwaSection,
        socialLinks: updates.socialLinks ? { ...prev.socialLinks, ...updates.socialLinks } : prev.socialLinks,
        footerConfig: updates.footerConfig ? { ...prev.footerConfig, ...updates.footerConfig } : prev.footerConfig,
        pagesContent: updates.pagesContent ? {
          ...prev.pagesContent,
          ...updates.pagesContent
        } : prev.pagesContent
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_cms_config', JSON.stringify(next));
        } catch (e) {
          console.error("Could not save CMS config to localStorage", e);
        }
      }
      return next;
    });
    addAuditLog("CMS Content Updated", "Website content, PWA banner, or social links modified");
  };

  const resetCmsConfig = () => {
    setCmsConfig(initialCmsConfig);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('avora_cms_config');
      } catch (e) {
        console.error("Could not reset CMS config in localStorage", e);
      }
    }
    addAuditLog("CMS Reset", "Website content restored to defaults");
  };

  // DOB-based Age Verification and Experience Mode controls
  const updateUserAgeAndDob = ({ birthdate, experienceMode }) => {
    const age = calculateAgeFromDob(birthdate);
    const enforcedMode = (age !== null && age < 18) ? EXPERIENCE_MODES.KIDS : experienceMode;
    const hideMature = enforcedMode === EXPERIENCE_MODES.KIDS || (age !== null && age < 18);

    setUser(prev => {
      const updated = prev ? {
        ...prev,
        birthdate,
        age,
        experienceMode: enforcedMode,
        isAgeVerified: true,
        hideMature
      } : {
        id: Date.now(),
        name: "Reader",
        username: "reader",
        email: "reader@avora.org",
        role: "reader",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=reader",
        badges: ["Verified Reader"],
        birthdate,
        age,
        experienceMode: enforcedMode,
        isAgeVerified: true,
        hideMature,
        hasCompletedOnboarding: true,
        userPreferences: {
          goals: "I'm here to read stories",
          favoriteGenres: (age !== null && age < 18) ? ["Kids Books", "Educational Stories", "Fantasy"] : ["Romance", "Fantasy", "Werewolf"],
          language: "en"
        }
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(updated));
          document.cookie = `avora_dob=${encodeURIComponent(birthdate)}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_age=${encodeURIComponent(String(age))}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_experience_mode=${encodeURIComponent(enforcedMode)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {
          console.error("Could not sync age to localStorage/cookies:", e);
        }
      }
      return updated;
    });

    setAgeVerificationModalOpen(false);
  };

  const toggleExperienceMode = () => {
    if (!user) return;
    if (user.age !== undefined && user.age !== null && user.age < 18) {
      alert("Protected Minor Account: Users under 18 cannot switch to 18+ Mature mode.");
      return;
    }
    const nextMode = user.experienceMode === EXPERIENCE_MODES.KIDS ? EXPERIENCE_MODES.MATURE : EXPERIENCE_MODES.KIDS;
    setUser(prev => {
      const updated = {
        ...prev,
        experienceMode: nextMode,
        hideMature: nextMode === EXPERIENCE_MODES.KIDS
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(updated));
          document.cookie = `avora_experience_mode=${encodeURIComponent(nextMode)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {
          console.error("Could not save mode:", e);
        }
      }
      return updated;
    });
  };

  const canAccessStory = (story) => {
    return canUserAccessContent(user, story);
  };

  return (
    <AppContext.Provider value={{
      lang,
      setLang: changeLanguage,
      changeLanguage,
      theme,
      setTheme,
      toggleTheme,
      t,
      user,
      setUser,
      stories,
      setStories,
      genres,
      setGenres,
      testimonials,
      setTestimonials,
      contests,
      setContests,
      blogPosts,
      communitySpaces,
      readerReactions,
      followingAuthors,
      followAuthor,
      blockedUsers,
      blockUser,
      reports,
      setReports,
      submitReport,
      auditLogs,
      addAuditLog,
      library,
      setLibrary,
      addToLibrary,
      removeFromLibrary,
      isInLibrary,
      wishlist,
      setWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      readingLists,
      setReadingLists,
      createReadingList,
      readingProgress,
      saveReadingProgress,
      getProgress,
      readingStreak,
      recordChapterRead,
      homeFeedViewMode,
      setHomeFeedViewMode,
      featureFlags,
      togglePaidFeatures,
      updateFeatureFlags,
      subscription,
      subscribe,
      cancelSubscription,
      transactions,
      addTransaction,
      refundTransaction,
      registeredUsers,
      updateUserRole,
      toggleUserStatus,
      deleteUser,
      addUser,
      paymentModalOpen,
      setPaymentModalOpen,
      paymentModalData,
      setPaymentModalData,
      openPaymentModal,
      notifications,
      setNotifications,
      sendNotification,
      markNotificationRead,
      markAllNotificationsRead,
      voteChapter,
      reactChapterEmoji,
      addParagraphComment,
      incrementStoryReads,
      publishStory,
      deleteStory,
      authModalOpen,
      setAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      authModalMessage,
      setAuthModalMessage,
      openAuthModal,
      loginWithGoogle,
      loginWithFacebook,
      loginWithEmail,
      registerWithEmail,
      logoutUser,
      userConversations,
      postConversationMessage,
      announcementBanner,
      setAnnouncementBanner,
      bannerDismissed,
      setBannerDismissed,
      onboardingModalOpen,
      setOnboardingModalOpen,
      openOnboardingModal,
      completeOnboarding,
      userPreferences,
      setUserPreferences,
      hiddenStoryIds,
      hideStory,
      unhideStory,
      cmsConfig,
      setCmsConfig,
      updateCmsConfig,
      resetCmsConfig,
      ageVerificationModalOpen,
      setAgeVerificationModalOpen,
      updateUserAgeAndDob,
      toggleExperienceMode,
      canAccessStory,
      EXPERIENCE_MODES,
      genreEngagement,
      emergingGenres,
      emergingGenrePrompt,
      setEmergingGenrePrompt,
      addGenreToFavorites,
      dismissEmergingGenre,
      triggerEmergingModal,
      recordGenreInteraction
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
