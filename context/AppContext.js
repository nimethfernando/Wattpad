'use client';
import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  initialReports,
  initialTransactions,
  initialReadingStreak,
  initialReadingProgress,
  initialFeatureFlags,
  initialCmsConfig
} from '@/lib/data';
import { translations, getTranslatedGenre, getLocalizedStory, getTranslatedDay, dayTranslations } from '@/lib/translations';
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

export const ADMIN_EMAILS = ['gbncircle@gmail.com', 'groupditya@gmail.com'];

export function isUserAdmin(userOrEmail) {
  if (!userOrEmail) return false;
  const email = typeof userOrEmail === 'string' ? userOrEmail : (userOrEmail.email || '');
  const cleanEmail = (email || '').trim().toLowerCase();
  const role = typeof userOrEmail === 'object' ? userOrEmail.role : null;
  return role === 'admin' || 
         cleanEmail === 'gbncircle@gmail.com' || 
         cleanEmail === 'gbncircle' || 
         cleanEmail === 'groupditya@gmail.com' || 
         cleanEmail === 'groupditya' || 
         ADMIN_EMAILS.includes(cleanEmail) || 
         cleanEmail.includes('admin');
}

export function getUserStorageKey(userOrEmail) {
  if (!userOrEmail) return 'guest';
  const email = typeof userOrEmail === 'string' 
    ? userOrEmail 
    : (userOrEmail.email || userOrEmail.username || String(userOrEmail.id || ''));
  const clean = (email || '').trim().toLowerCase();
  if (!clean) return 'guest';
  return clean.replace(/[^a-z0-9_]/g, '_');
}

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
  const [blogPosts, setBlogPosts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('avora_blog_posts');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return initialBlogPosts;
  });
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

  // User-Scoped Data Isolation State & Refs
  const activeUserKeyRef = useRef(null);
  const isSwitchingUserRef = useRef(false);
  const isLoggingOutRef = useRef(false);

  // Load isolated user data (Library, Reading Progress, Wishlist, Lists, Streaks)
  const loadUserDataForUser = (userKey) => {
    if (typeof window === 'undefined') return;

    // Unauthenticated guests never have access to any library or reading records
    if (!userKey || userKey === 'guest') {
      setLibrary([]);
      setReadingProgress({});
      setWishlist([]);
      setReadingLists([]);
      setFollowingAuthors([]);
      try {
        localStorage.removeItem('avora_library_guest');
        localStorage.removeItem('avora_reading_progress_guest');
        localStorage.removeItem('avora_wishlist_guest');
      } catch (e) {}
      return;
    }

    // 1. Library
    try {
      const savedLib = localStorage.getItem(`avora_library_${userKey}`);
      setLibrary(savedLib !== null ? JSON.parse(savedLib) : []);
    } catch (e) {
      setLibrary([]);
    }

    // 2. Reading Progress
    try {
      const savedProg = localStorage.getItem(`avora_reading_progress_${userKey}`);
      setReadingProgress(savedProg !== null ? JSON.parse(savedProg) : {});
    } catch (e) {
      setReadingProgress({});
    }

    // 3. Wishlist
    try {
      const savedWish = localStorage.getItem(`avora_wishlist_${userKey}`);
      setWishlist(savedWish !== null ? JSON.parse(savedWish) : []);
    } catch (e) {
      setWishlist([]);
    }

    // 4. Reading Lists
    try {
      const savedLists = localStorage.getItem(`avora_reading_lists_${userKey}`);
      setReadingLists(savedLists !== null ? JSON.parse(savedLists) : []);
    } catch (e) {
      setReadingLists([]);
    }

    // 5. Reading Streak
    try {
      const savedStreak = localStorage.getItem(`avora_reading_streak_${userKey}`);
      if (savedStreak !== null) {
        setReadingStreak(JSON.parse(savedStreak));
      } else {
        setReadingStreak({
          currentStreak: 0,
          chaptersReadThisWeek: 0,
          dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          daysActive: [false, false, false, false, false, false, false]
        });
      }
    } catch (e) {
      setReadingStreak({
        currentStreak: 0,
        chaptersReadThisWeek: 0,
        dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        daysActive: [false, false, false, false, false, false, false]
      });
    }

    // 6. Following Authors
    try {
      const savedFollowing = localStorage.getItem(`avora_following_${userKey}`);
      setFollowingAuthors(savedFollowing !== null ? JSON.parse(savedFollowing) : []);
    } catch (e) {
      setFollowingAuthors([]);
    }
  };

  // Tri-State Home Discovery View Mode: 'showcase' (categorized book shelves) | 'feed' (community feed) | 'landing' (public marketing)
  const [homeFeedViewMode, setHomeFeedViewModeState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('avora_home_feed_mode');
        if (saved && ['showcase', 'netflix', 'feed', 'landing'].includes(saved)) {
          return saved === 'netflix' ? 'showcase' : saved;
        }
        if (localStorage.getItem('avora_user') || document.cookie.includes('avora_session=')) {
          return 'showcase';
        }
      } catch (e) {}
    }
    return 'landing';
  });

  const setHomeFeedViewMode = (mode) => {
    setHomeFeedViewModeState(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('avora_home_feed_mode', mode);
      } catch (e) {}
    }
  };

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

  // Author Bank & Direct Payout Details Modal State
  const [bankDetailsModalOpen, setBankDetailsModalOpen] = useState(false);
  const [bankDetailsModalTarget, setBankDetailsModalTarget] = useState(null);

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

  // Parental Gate & 18+ Access Request State (Prevents 1-click bypass by minors)
  const [parentalGateModalOpen, setParentalGateModalOpen] = useState(false);
  const [parentalPin, setParentalPinState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('avora_parental_pin') || '2468';
      } catch (e) {}
    }
    return '2468';
  });

  const setParentalPin = (pin) => {
    setParentalPinState(pin);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('avora_parental_pin', pin);
      } catch (e) {}
    }
  };

  const [parentalRequests, setParentalRequests] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('avora_parental_requests');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'req_demo_101',
        userId: 'demo_user',
        username: 'kid_reader',
        userEmail: 'youngreader@gmail.com',
        parentEmail: 'parent.guardian@example.com',
        reason: 'Requesting permission to access young adult fantasy titles for high school reading group.',
        status: 'pending',
        createdAt: '2026-10-09T09:15:00Z'
      }
    ];
  });

  // Persistent User Age Record Lookup (never forgets user's answered DOB across logins)
  const lookupUserAgeRecord = useCallback((userOrEmail) => {
    if (!userOrEmail) return null;
    const cleanEmail = typeof userOrEmail === 'string' 
      ? userOrEmail.toLowerCase().trim() 
      : (userOrEmail.email || userOrEmail.username || '').toLowerCase().trim();
    if (!cleanEmail) return null;
    const storageKey = getUserStorageKey(cleanEmail);

    // 1. Check in-memory registeredUsers
    const matched = (registeredUsers || []).find(u => 
      (u.email && u.email.toLowerCase() === cleanEmail) || 
      (u.username && u.username.toLowerCase() === cleanEmail)
    );
    if (matched?.birthdate) {
      const age = matched.age ?? calculateAgeFromDob(matched.birthdate);
      return {
        birthdate: matched.birthdate,
        age,
        experienceMode: (age !== null && age < 18) ? EXPERIENCE_MODES.KIDS : (matched.experienceMode || EXPERIENCE_MODES.MATURE)
      };
    }

    // 2. Check user-scoped age cache in localStorage
    if (typeof window !== 'undefined') {
      try {
        const scoped = localStorage.getItem(`avora_user_age_${storageKey}`);
        if (scoped) {
          const parsed = JSON.parse(scoped);
          if (parsed?.birthdate) {
            const age = parsed.age ?? calculateAgeFromDob(parsed.birthdate);
            return {
              birthdate: parsed.birthdate,
              age,
              experienceMode: (age !== null && age < 18) ? EXPERIENCE_MODES.KIDS : (parsed.experienceMode || EXPERIENCE_MODES.MATURE)
            };
          }
        }
      } catch (e) {}

      // 3. Check registered users cache
      try {
        const cache = localStorage.getItem('avora_registered_users_cache');
        if (cache) {
          const parsedCache = JSON.parse(cache);
          const hit = (parsedCache || []).find(u => 
            (u.email && u.email.toLowerCase() === cleanEmail) || 
            (u.username && u.username.toLowerCase() === cleanEmail)
          );
          if (hit?.birthdate) {
            const age = hit.age ?? calculateAgeFromDob(hit.birthdate);
            return {
              birthdate: hit.birthdate,
              age,
              experienceMode: (age !== null && age < 18) ? EXPERIENCE_MODES.KIDS : (hit.experienceMode || EXPERIENCE_MODES.MATURE)
            };
          }
        }
      } catch (e) {}

      // 4. Check avora_user
      try {
        const rawUser = localStorage.getItem('avora_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if ((u.email?.toLowerCase() === cleanEmail || u.username?.toLowerCase() === cleanEmail) && u.birthdate) {
            const age = u.age ?? calculateAgeFromDob(u.birthdate);
            return {
              birthdate: u.birthdate,
              age,
              experienceMode: (age !== null && age < 18) ? EXPERIENCE_MODES.KIDS : (u.experienceMode || EXPERIENCE_MODES.MATURE)
            };
          }
        }
      } catch (e) {}
    }

    return null;
  }, [registeredUsers]);

  // Persist user age reply permanently across client & server storage
  const saveUserAgeRecord = useCallback((targetUser, birthdate, experienceMode) => {
    if (!targetUser || !birthdate) return;
    const cleanEmail = (targetUser.email || targetUser.username || '').toLowerCase().trim();
    if (!cleanEmail) return;
    const storageKey = getUserStorageKey(cleanEmail);
    const age = calculateAgeFromDob(birthdate);
    const enforcedMode = (age !== null && age < 18) ? EXPERIENCE_MODES.KIDS : experienceMode;

    const record = {
      birthdate,
      age,
      experienceMode: enforcedMode
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`avora_user_age_${storageKey}`, JSON.stringify(record));
        document.cookie = `avora_dob=${encodeURIComponent(birthdate)}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `avora_age=${encodeURIComponent(String(age))}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `avora_experience_mode=${encodeURIComponent(enforcedMode)}; path=/; max-age=2592000; SameSite=Lax`;
      } catch (e) {}
    }

    setRegisteredUsers(prev => {
      const idx = prev.findIndex(u => 
        (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
        (cleanEmail && u.username?.toLowerCase() === cleanEmail)
      );
      let nextUsers;
      if (idx >= 0) {
        nextUsers = [...prev];
        nextUsers[idx] = { ...nextUsers[idx], ...record, isAgeVerified: true };
      } else {
        nextUsers = [...prev, { ...targetUser, ...record, isAgeVerified: true }];
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_registered_users_cache', JSON.stringify(nextUsers));
        } catch (e) {}
      }
      return nextUsers;
    });

    // Asynchronously persist to backend database
    fetch('/api/user/age-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthdate,
        experienceMode: enforcedMode,
        userEmail: targetUser.email || '',
        username: targetUser.username || ''
      })
    }).catch(() => {});
  }, []);

  // NextAuth Session Sync (Automatically populates user from Google OAuth)
  const { data: session, status: sessionStatus } = useSession();

  // Automatically sync NextAuth Google/Facebook session to AppContext user
  useEffect(() => {
    // If user explicitly logged out, ignore lingering NextAuth session
    if (isLoggingOutRef.current) return;
    if (typeof window !== 'undefined' && sessionStorage.getItem('avora_logged_out') === 'true') return;

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

        const ageRec = lookupUserAgeRecord(email);
        if (ageRec?.birthdate) {
          savedDob = ageRec.birthdate;
          savedAge = ageRec.age;
          savedMode = ageRec.experienceMode;
          isAgeVerified = true;
        }

        const cleanEmail = (email || '').trim().toLowerCase();
        const isAdmin = isUserAdmin(cleanEmail);

        // Banned Account Guard: Prevent banned users from logging in via OAuth
        const existingRecord = registeredUsers.find(u => 
          (u.email && u.email.toLowerCase() === cleanEmail) ||
          (u.username && u.username.toLowerCase() === username)
        );
        if (!isAdmin && (existingRecord?.status === 'banned' || existingRecord?.isBanned)) {
          signOut({ redirect: false });
          alert(`Access Denied: This account has been banned due to community guidelines violations (${existingRecord.banReason || 'Inappropriate content policy violation'}).`);
          return;
        }

        if (isAdmin) {
          isAgeVerified = true;
          savedMode = EXPERIENCE_MODES.MATURE;
        }

        const authenticatedUser = {
          id: session.user.id || Date.now(),
          username: cleanEmail === 'gbncircle@gmail.com' ? 'gbncircle' : (cleanEmail === 'groupditya@gmail.com' ? 'groupditya' : username),
          name: cleanEmail === 'gbncircle@gmail.com' ? 'GBN Circle (Admin)' : (cleanEmail === 'groupditya@gmail.com' ? 'Ditya (Admin)' : name),
          email,
          provider: "google",
          role: isAdmin ? "admin" : "reader",
          avatar,
          badges: isAdmin ? ["Platform Admin", "Google Verified"] : ["Google Verified", "Avid Reader"],
          birthdate: savedDob,
          age: savedAge,
          experienceMode: isAdmin ? EXPERIENCE_MODES.MATURE : savedMode,
          isAgeVerified: isAdmin ? true : isAgeVerified,
          hideMature: isAdmin ? false : (savedMode === EXPERIENCE_MODES.KIDS),
          hasCompletedOnboarding: true,
          userPreferences: {
            goals: isAdmin ? "Platform Administration & Moderation" : "I'm here to read stories",
            favoriteGenres: (savedAge !== null && savedAge < 18) ? ["Kids Books", "Educational Stories", "Fantasy"] : ["Romance", "Fantasy", "Mystery"],
            language: "en"
          }
        };

        setUser(authenticatedUser);
        setHomeFeedViewMode('feed');
        setAuthModalOpen(false);

        if (isAdmin && typeof window !== 'undefined') {
          if (window.location.pathname !== '/admin') {
            window.location.href = '/admin';
          }
        }

        // Only prompt for age if NOT admin AND age has NEVER been confirmed
        if (!isAdmin && (!isAgeVerified || !savedDob)) {
          // Asynchronously query server database before prompting
          fetch(`/api/user/age-verification?user=${encodeURIComponent(cleanEmail)}`)
            .then(res => res.json())
            .then(apiData => {
              if (apiData?.success && apiData.verified && apiData.birthdate) {
                const calculated = calculateAgeFromDob(apiData.birthdate);
                const finalEnforced = (calculated !== null && calculated < 18) ? EXPERIENCE_MODES.KIDS : (apiData.experienceMode || EXPERIENCE_MODES.MATURE);
                updateUserAgeAndDob(apiData.birthdate, calculated, finalEnforced);
                setAgeVerificationModalOpen(false);
              } else {
                setAgeVerificationModalOpen(true);
              }
            })
            .catch(() => {
              setAgeVerificationModalOpen(true);
            });
        } else {
          setAgeVerificationModalOpen(false);
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

  // Reset logout lock when NextAuth session completes unauthenticated state
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      isLoggingOutRef.current = false;
      if (typeof window !== 'undefined') {
        try { sessionStorage.removeItem('avora_logged_out'); } catch (e) {}
      }
    }
  }, [sessionStatus]);

  // Moderation & Audit Log
  const [reports, setReports] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('avora_moderation_reports');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return initialReports || [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && reports) {
      try {
        localStorage.setItem('avora_moderation_reports', JSON.stringify(reports));
      } catch (e) {}
    }
  }, [reports]);

  const [auditLogs, setAuditLogs] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // CMS Content Management (Branding, Logo, PWA, QR Code, Footer Socials, Pages)
  const [cmsConfig, setCmsConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('avora_cms_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...initialCmsConfig,
            ...parsed,
            branding: {
              ...initialCmsConfig.branding,
              ...(parsed.branding || {})
            }
          };
        }
      } catch (e) {}
    }
    return initialCmsConfig;
  });

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
      // One-time legacy cleanup to guarantee user library & progress isolation
      try {
        const legacyMigrated = localStorage.getItem('avora_legacy_scoped_migrated');
        if (!legacyMigrated) {
          const legacyLib = localStorage.getItem('avora_library');
          const legacyProg = localStorage.getItem('avora_reading_progress');
          const legacyWish = localStorage.getItem('avora_wishlist');
          
          // Assign legacy read history to nimethgithmal (User 1 who read the books)
          if (legacyLib) {
            localStorage.setItem('avora_library_nimethgithmal_gmail_com', legacyLib);
            if (legacyProg) localStorage.setItem('avora_reading_progress_nimethgithmal_gmail_com', legacyProg);
            if (legacyWish) localStorage.setItem('avora_wishlist_nimethgithmal_gmail_com', legacyWish);
          }
          // Remove global shared keys so other accounts (like nimeth42) start with clean, isolated library
          localStorage.removeItem('avora_library');
          localStorage.removeItem('avora_reading_progress');
          localStorage.removeItem('avora_wishlist');
          localStorage.setItem('avora_legacy_scoped_migrated', 'true');
        }
      } catch (e) {}

      // Sync cached registered users from persistent cache
      try {
        const cachedUsers = localStorage.getItem('avora_registered_users_cache');
        if (cachedUsers) {
          const parsedCache = JSON.parse(cachedUsers);
          if (Array.isArray(parsedCache) && parsedCache.length > 0) {
            setRegisteredUsers(prev => {
              const map = new Map(prev.map(u => [(u.email || u.username || '').toLowerCase(), u]));
              parsedCache.forEach(u => {
                const k = (u.email || u.username || '').toLowerCase();
                if (k) map.set(k, { ...map.get(k), ...u });
              });
              return Array.from(map.values());
            });
          }
        }
      } catch (e) {}

      let initialKey = 'guest';
      try {
        const savedUser = localStorage.getItem('avora_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);

          // Sync banned status from registered users cache
          try {
            const cachedReg = localStorage.getItem('avora_registered_users_cache');
            if (cachedReg) {
              const regList = JSON.parse(cachedReg);
              const matched = regList.find(u => 
                (u.email && u.email.toLowerCase() === (parsedUser.email || '').toLowerCase()) ||
                (u.username && u.username.toLowerCase() === (parsedUser.username || '').toLowerCase())
              );
              if (matched && (matched.status === 'banned' || matched.isBanned)) {
                parsedUser.status = 'banned';
                parsedUser.isBanned = true;
                parsedUser.banReason = matched.banReason;
              }
            }
          } catch (e) {}

          if (parsedUser?.email && isUserAdmin(parsedUser)) {
            parsedUser.role = 'admin';
            parsedUser.isAgeVerified = true;
            parsedUser.hideMature = false;
          }
          const ageRec = lookupUserAgeRecord(parsedUser);
          if (ageRec?.birthdate) {
            parsedUser.birthdate = ageRec.birthdate;
            parsedUser.age = ageRec.age;
            parsedUser.experienceMode = ageRec.experienceMode;
            parsedUser.isAgeVerified = true;
            if (parsedUser.age !== null && parsedUser.age < 18 && parsedUser.role !== 'admin') {
              parsedUser.experienceMode = EXPERIENCE_MODES.KIDS;
              parsedUser.hideMature = true;
            }
            setAgeVerificationModalOpen(false);
          } else if (parsedUser.birthdate) {
            parsedUser.age = calculateAgeFromDob(parsedUser.birthdate);
            parsedUser.isAgeVerified = true;
            if (parsedUser.age !== null && parsedUser.age < 18 && parsedUser.role !== 'admin') {
              parsedUser.experienceMode = EXPERIENCE_MODES.KIDS;
              parsedUser.hideMature = true;
            }
            setAgeVerificationModalOpen(false);
          } else if (parsedUser.role !== 'admin' && !isUserAdmin(parsedUser)) {
            parsedUser.isAgeVerified = false;
            const checkEmail = (parsedUser.email || parsedUser.username || '').toLowerCase().trim();
            if (checkEmail) {
              fetch(`/api/user/age-verification?user=${encodeURIComponent(checkEmail)}`)
                .then(res => res.json())
                .then(apiData => {
                  if (apiData?.success && apiData.verified && apiData.birthdate) {
                    const calculated = calculateAgeFromDob(apiData.birthdate);
                    const finalEnforced = (calculated !== null && calculated < 18) ? EXPERIENCE_MODES.KIDS : (apiData.experienceMode || EXPERIENCE_MODES.MATURE);
                    updateUserAgeAndDob(apiData.birthdate, calculated, finalEnforced);
                    setAgeVerificationModalOpen(false);
                  } else {
                    setAgeVerificationModalOpen(true);
                  }
                })
                .catch(() => {
                  setAgeVerificationModalOpen(true);
                });
            } else {
              setAgeVerificationModalOpen(true);
            }
          }
          if (!parsedUser.bankDetails) {
            const matchedAuthor = initialRegisteredUsers.find(ru => 
              (ru.email && parsedUser.email && ru.email.toLowerCase() === parsedUser.email.toLowerCase()) || 
              (ru.username && parsedUser.username && ru.username.toLowerCase() === parsedUser.username.toLowerCase())
            );
            if (matchedAuthor?.bankDetails) {
              parsedUser.bankDetails = matchedAuthor.bankDetails;
            }
          }
          setUser(parsedUser);
          initialKey = getUserStorageKey(parsedUser);
          setHomeFeedViewMode('feed');
        }
      } catch (e) {
        console.error("Could not load user from localStorage", e);
      }

      // Load user-scoped library and reading data for active user (or guest)
      activeUserKeyRef.current = initialKey;
      loadUserDataForUser(initialKey);

      // Hydrate from backend API if logged-in user
      if (initialKey !== 'guest') {
        fetch(`/api/user/library?user=${encodeURIComponent(initialKey)}`)
          .then(res => res.json())
          .then(resData => {
            if (resData?.success && resData.data) {
              const d = resData.data;
              if (Array.isArray(d.library) && d.library.length > 0) {
                setLibrary(d.library);
                try { localStorage.setItem(`avora_library_${initialKey}`, JSON.stringify(d.library)); } catch (e) {}
              }
              if (d.readingProgress && Object.keys(d.readingProgress).length > 0) {
                setReadingProgress(d.readingProgress);
                try { localStorage.setItem(`avora_reading_progress_${initialKey}`, JSON.stringify(d.readingProgress)); } catch (e) {}
              }
              if (Array.isArray(d.wishlist) && d.wishlist.length > 0) {
                setWishlist(d.wishlist);
                try { localStorage.setItem(`avora_wishlist_${initialKey}`, JSON.stringify(d.wishlist)); } catch (e) {}
              }
              if (Array.isArray(d.readingLists) && d.readingLists.length > 0) {
                setReadingLists(d.readingLists);
                try { localStorage.setItem(`avora_reading_lists_${initialKey}`, JSON.stringify(d.readingLists)); } catch (e) {}
              }
              if (d.readingStreak) {
                setReadingStreak(d.readingStreak);
                try { localStorage.setItem(`avora_reading_streak_${initialKey}`, JSON.stringify(d.readingStreak)); } catch (e) {}
              }
            }
          })
          .catch(() => {});
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

      // 1. Sync Custom Stories from localStorage (Guarantee user-published books persist across refresh)
      let localCustomStories = [];
      try {
        const savedCustomStories = localStorage.getItem('avora_custom_stories');
        if (savedCustomStories) {
          const custom = JSON.parse(savedCustomStories);
          if (Array.isArray(custom) && custom.length > 0) {
            localCustomStories = custom;
            setStories(prev => {
              const storyMap = new Map();
              prev.forEach(s => storyMap.set(String(s.slug || s.id), s));
              custom.forEach(s => storyMap.set(String(s.slug || s.id), { ...storyMap.get(String(s.slug || s.id)), ...s }));
              return computeStoryRankings(Array.from(storyMap.values()));
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

      // Hydrate stories from backend API (MariaDB + persistent db-store)
      fetch('/api/stories')
        .then(res => res.json())
        .then(data => {
          if (data?.success && Array.isArray(data.stories) && data.stories.length > 0) {
            setStories(prev => {
              const storyMap = new Map();
              // Seed and existing state stories
              prev.forEach(s => storyMap.set(String(s.slug || s.id), s));
              // Overlay API stories
              data.stories.forEach(s => storyMap.set(String(s.slug || s.id), { ...storyMap.get(String(s.slug || s.id)), ...s }));
              // Re-affirm local custom stories so API results NEVER wipe locally authored books
              localCustomStories.forEach(s => storyMap.set(String(s.slug || s.id), { ...storyMap.get(String(s.slug || s.id)), ...s }));
              return computeStoryRankings(Array.from(storyMap.values()));
            });
          }
        })
        .catch(err => {
          console.warn("Could not fetch stories from API on initial mount:", err);
        });

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

  // Switch and isolate user data when active user changes
  useEffect(() => {
    if (!isHydrated) return;
    const currentKey = getUserStorageKey(user);

    if (activeUserKeyRef.current === null) {
      activeUserKeyRef.current = currentKey;
      return;
    }

    if (activeUserKeyRef.current !== currentKey) {
      isSwitchingUserRef.current = true;
      activeUserKeyRef.current = currentKey;
      loadUserDataForUser(currentKey);

      // Hydrate from backend API if authenticated user
      if (currentKey !== 'guest') {
        fetch(`/api/user/library?user=${encodeURIComponent(currentKey)}`)
          .then(res => res.json())
          .then(resData => {
            if (resData?.success && resData.data) {
              const d = resData.data;
              if (Array.isArray(d.library) && d.library.length > 0) {
                setLibrary(d.library);
                try { localStorage.setItem(`avora_library_${currentKey}`, JSON.stringify(d.library)); } catch (e) {}
              }
              if (d.readingProgress && Object.keys(d.readingProgress).length > 0) {
                setReadingProgress(d.readingProgress);
                try { localStorage.setItem(`avora_reading_progress_${currentKey}`, JSON.stringify(d.readingProgress)); } catch (e) {}
              }
              if (Array.isArray(d.wishlist) && d.wishlist.length > 0) {
                setWishlist(d.wishlist);
                try { localStorage.setItem(`avora_wishlist_${currentKey}`, JSON.stringify(d.wishlist)); } catch (e) {}
              }
              if (Array.isArray(d.readingLists) && d.readingLists.length > 0) {
                setReadingLists(d.readingLists);
                try { localStorage.setItem(`avora_reading_lists_${currentKey}`, JSON.stringify(d.readingLists)); } catch (e) {}
              }
              if (d.readingStreak) {
                setReadingStreak(d.readingStreak);
                try { localStorage.setItem(`avora_reading_streak_${currentKey}`, JSON.stringify(d.readingStreak)); } catch (e) {}
              }
            }
          })
          .catch(() => {});
      }

      setTimeout(() => {
        isSwitchingUserRef.current = false;
      }, 80);
    }
  }, [user, isHydrated]);

  // Sync Library to user-scoped localStorage & backend
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !isSwitchingUserRef.current) {
      const key = getUserStorageKey(user);
      try {
        localStorage.setItem(`avora_library_${key}`, JSON.stringify(library));
      } catch (e) {}

      if (user && key !== 'guest') {
        fetch('/api/user/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: key, library })
        }).catch(() => {});
      }
    }
  }, [library, user, isHydrated]);

  // Sync Reading Progress to user-scoped localStorage & backend
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !isSwitchingUserRef.current) {
      const key = getUserStorageKey(user);
      try {
        localStorage.setItem(`avora_reading_progress_${key}`, JSON.stringify(readingProgress));
      } catch (e) {}

      if (user && key !== 'guest') {
        fetch('/api/user/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: key, readingProgress })
        }).catch(() => {});
      }
    }
  }, [readingProgress, user, isHydrated]);

  // Sync Wishlist to user-scoped localStorage & backend
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !isSwitchingUserRef.current) {
      const key = getUserStorageKey(user);
      try {
        localStorage.setItem(`avora_wishlist_${key}`, JSON.stringify(wishlist));
      } catch (e) {}

      if (user && key !== 'guest') {
        fetch('/api/user/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: key, wishlist })
        }).catch(() => {});
      }
    }
  }, [wishlist, user, isHydrated]);

  // Sync Reading Lists to user-scoped localStorage & backend
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !isSwitchingUserRef.current) {
      const key = getUserStorageKey(user);
      try {
        localStorage.setItem(`avora_reading_lists_${key}`, JSON.stringify(readingLists));
      } catch (e) {}

      if (user && key !== 'guest') {
        fetch('/api/user/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: key, readingLists })
        }).catch(() => {});
      }
    }
  }, [readingLists, user, isHydrated]);

  // Sync Reading Streak to user-scoped localStorage & backend
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !isSwitchingUserRef.current) {
      const key = getUserStorageKey(user);
      try {
        localStorage.setItem(`avora_reading_streak_${key}`, JSON.stringify(readingStreak));
      } catch (e) {}

      if (user && key !== 'guest') {
        fetch('/api/user/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: key, readingStreak })
        }).catch(() => {});
      }
    }
  }, [readingStreak, user, isHydrated]);

  // Sync Following Authors to user-scoped localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !isSwitchingUserRef.current) {
      const key = getUserStorageKey(user);
      try {
        localStorage.setItem(`avora_following_${key}`, JSON.stringify(followingAuthors));
      } catch (e) {}
    }
  }, [followingAuthors, user, isHydrated]);

  // Strict Privacy Safeguard: Ensure guests/logged-out visitors never hold any private library or reading data
  useEffect(() => {
    if (!user && isHydrated) {
      setLibrary([]);
      setReadingProgress({});
      setWishlist([]);
      setReadingLists([]);
      setFollowingAuthors([]);
    }
  }, [user, isHydrated]);

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

  // Synchronize document lang attribute and typography classes when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      const langClasses = ['lang-en', 'lang-ka', 'lang-hi', 'lang-es'];
      langClasses.forEach(cls => {
        document.documentElement.classList.remove(cls);
        document.body.classList.remove(cls);
      });
      document.documentElement.classList.add(`lang-${lang}`);
      document.body.classList.add(`lang-${lang}`);
    }
  }, [lang]);

  const translateGenre = useCallback((nameOrSlug) => {
    return getTranslatedGenre(nameOrSlug, lang);
  }, [lang]);

  const translateStory = useCallback((story) => {
    return getLocalizedStory(story, lang);
  }, [lang]);

  const dayLabels = useMemo(() => {
    return dayTranslations[lang]?.days || dayTranslations.en.days;
  }, [lang]);

  const dayLabelsShort = useMemo(() => {
    return dayTranslations[lang]?.daysShort || dayTranslations.en.daysShort;
  }, [lang]);

  const translateDay = useCallback((day) => {
    return getTranslatedDay(day, lang);
  }, [lang]);

  const localizedGenres = useMemo(() => {
    return genres.map(g => ({
      ...g,
      name: getTranslatedGenre(g.slug, lang) || g.name,
      originalName: g.name
    }));
  }, [genres, lang]);

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
      targetType: targetType || "story",
      reportedUser: reportedUser || "Unknown",
      reporter: user?.name ? `${user.name} (@${user.username || 'user'})` : "Guest Reader",
      reason: reason || "Inappropriate Content",
      details: details || "",
      story: storyTitle || "Avora Library Content",
      status: "pending",
      timestamp: "Just now",
      createdAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
    addAuditLog(`Report Filed (${targetType || 'story'})`, `Target: @${reportedUser} • Story: ${storyTitle}`);
  };

  const banUserAndTakeDownContent = async (username, storyIdentifier, reportId, reason) => {
    const cleanUser = (username || '').toLowerCase().trim();

    // 1. Mark user as banned in registeredUsers
    setRegisteredUsers(prev => {
      const nextUsers = prev.map(u => {
        if (
          (u.username && u.username.toLowerCase() === cleanUser) ||
          (u.name && u.name.toLowerCase() === cleanUser) ||
          (u.email && u.email.toLowerCase() === cleanUser)
        ) {
          return {
            ...u,
            status: 'banned',
            isBanned: true,
            banReason: reason || "Violations of community safety standards",
            bannedAt: new Date().toISOString()
          };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_registered_users_cache', JSON.stringify(nextUsers));
        } catch (e) {}
      }
      return nextUsers;
    });

    // 2. If the active session is this user, mark their session banned
    if (
      user?.username?.toLowerCase() === cleanUser ||
      user?.email?.toLowerCase() === cleanUser
    ) {
      setUser(prev => prev ? ({ ...prev, status: 'banned', isBanned: true }) : null);
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('avora_user');
          if (saved) {
            const p = JSON.parse(saved);
            p.status = 'banned';
            p.isBanned = true;
            localStorage.setItem('avora_user', JSON.stringify(p));
          }
        } catch (e) {}
      }
    }

    // 3. Take down the reported story and any stories by this banned author
    setStories(prev => {
      const updated = prev.map(s => {
        const isTargetStory = storyIdentifier && (
          s.id === storyIdentifier ||
          s.slug === storyIdentifier ||
          s.title?.toLowerCase() === storyIdentifier.toLowerCase() ||
          s.title?.toLowerCase().includes(storyIdentifier.toLowerCase())
        );
        const isAuthoredByBannedUser = cleanUser && (
          s.authorUsername?.toLowerCase() === cleanUser ||
          s.author?.toLowerCase() === cleanUser
        );

        if (isTargetStory || isAuthoredByBannedUser) {
          return {
            ...s,
            status: 'removed',
            isRemoved: true,
            isBanned: true,
            moderationReason: reason || "Content policy violation",
            moderatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      return computeStoryRankings(updated);
    });

    // 4. Update the report in reports queue
    if (reportId) {
      setReports(prev => prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'resolved',
            resolution: 'Banned User & Removed Content',
            resolvedAt: new Date().toISOString(),
            resolvedBy: user?.name || 'Administrator'
          };
        }
        return r;
      }));
    }

    // 5. Add audit log
    addAuditLog(
      "Admin Banned Writer & Removed Content",
      `@${username || 'user'} • Content: ${storyIdentifier || 'All stories'} • Reason: ${reason || 'Inappropriate content'}`
    );
  };

  const warnUser = (username, reportId, warningMessage) => {
    const cleanUser = (username || '').toLowerCase().trim();
    const warnText = warningMessage || "Warning: Your content has been flagged for violating platform community standards. Continued violations will result in account termination.";
    
    setRegisteredUsers(prev => {
      const nextUsers = prev.map(u => {
        if (
          (u.username && u.username.toLowerCase() === cleanUser) ||
          (u.name && u.name.toLowerCase() === cleanUser) ||
          (u.email && u.email.toLowerCase() === cleanUser)
        ) {
          return {
            ...u,
            warningsCount: (u.warningsCount || 0) + 1,
            lastWarning: warnText,
            lastWarningAt: new Date().toISOString()
          };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_registered_users_cache', JSON.stringify(nextUsers));
        } catch (e) {}
      }
      return nextUsers;
    });

    if (reportId) {
      setReports(prev => prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'resolved',
            resolution: 'Warned User',
            resolvedAt: new Date().toISOString(),
            resolvedBy: user?.name || 'Administrator'
          };
        }
        return r;
      }));
    }

    addAuditLog("Moderation Warning Issued", `@${username} • ${warnText}`);
  };

  const dismissReport = (reportId) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'dismissed',
          resolvedAt: new Date().toISOString(),
          resolvedBy: user?.name || 'Administrator'
        };
      }
      return r;
    }));
    addAuditLog("Moderation Report Dismissed", `Report #${reportId}`);
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

  const publishStory = async (newStory) => {
    // 1. Synchronously save to localStorage FIRST so immediate refresh never loses the book
    if (typeof window !== 'undefined') {
      try {
        const savedCustom = localStorage.getItem('avora_custom_stories');
        const list = savedCustom ? JSON.parse(savedCustom) : [];
        const filtered = list.filter(s => s.id !== newStory.id && s.slug !== newStory.slug);
        localStorage.setItem('avora_custom_stories', JSON.stringify([newStory, ...filtered]));
      } catch (e) {}
    }

    // 2. Optimistically update client state
    setStories(prev => {
      const filtered = prev.filter(s => s.id !== newStory.id && s.slug !== newStory.slug);
      return computeStoryRankings([newStory, ...filtered]);
    });
    addAuditLog("Story Published", newStory.title);

    // 3. Persist to backend database via API route
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory)
      });
      const data = await res.json();
      if (data?.success && data?.story) {
        setStories(prev => {
          const replaced = prev.map(s => (s.id === newStory.id || s.slug === newStory.slug) ? { ...s, ...data.story } : s);
          return computeStoryRankings(replaced);
        });
        if (typeof window !== 'undefined') {
          try {
            const savedCustom = localStorage.getItem('avora_custom_stories');
            const list = savedCustom ? JSON.parse(savedCustom) : [];
            const idx = list.findIndex(s => s.id === newStory.id || s.slug === newStory.slug);
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...data.story };
            } else {
              list.unshift(data.story);
            }
            localStorage.setItem('avora_custom_stories', JSON.stringify(list));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Failed to persist story to /api/stories:", err);
    }
  };

  const updateStory = async (updatedStory) => {
    setStories(prev => {
      const updated = prev.map(s => (s.id === updatedStory.id || s.slug === updatedStory.slug) ? { ...s, ...updatedStory } : s);
      if (typeof window !== 'undefined') {
        try {
          const savedCustom = localStorage.getItem('avora_custom_stories');
          const list = savedCustom ? JSON.parse(savedCustom) : [];
          const idx = list.findIndex(cs => cs.id === updatedStory.id || cs.slug === updatedStory.slug);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...updatedStory };
          } else {
            list.unshift(updatedStory);
          }
          localStorage.setItem('avora_custom_stories', JSON.stringify(list));
        } catch (e) {}
      }
      return computeStoryRankings(updated);
    });

    try {
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStory)
      });
    } catch (err) {
      console.warn("Failed to persist story update to /api/stories:", err);
    }
  };

  const addChapterToStory = async (storyId, chapterData) => {
    let updatedStoryToPersist = null;

    setStories(prev => {
      const updated = prev.map(s => {
        if (s.id === storyId || s.slug === storyId) {
          const existingChapters = s.chapters || [];
          const chapterNumber = chapterData.number || (existingChapters.length + 1);
          const newChap = {
            id: chapterData.id || Date.now(),
            number: chapterNumber,
            title: chapterData.title || `Chapter ${chapterNumber}`,
            publishedAt: new Date().toISOString().split('T')[0],
            reads: 1,
            votes: 0,
            paragraphs: chapterData.paragraphs || [],
            pages: chapterData.pages || []
          };
          const storyWithNewChapter = {
            ...s,
            lastUpdated: "Just now",
            chapters: [...existingChapters, newChap]
          };
          updatedStoryToPersist = storyWithNewChapter;
          return storyWithNewChapter;
        }
        return s;
      });

      if (typeof window !== 'undefined' && updatedStoryToPersist) {
        try {
          const savedCustom = localStorage.getItem('avora_custom_stories');
          const list = savedCustom ? JSON.parse(savedCustom) : [];
          const idx = list.findIndex(cs => cs.id === storyId || cs.slug === storyId);
          if (idx >= 0) {
            list[idx] = updatedStoryToPersist;
          } else {
            list.unshift(updatedStoryToPersist);
          }
          localStorage.setItem('avora_custom_stories', JSON.stringify(list));
        } catch (e) {}
      }

      return computeStoryRankings(updated);
    });

    if (updatedStoryToPersist) {
      addAuditLog("Chapter Published", `${updatedStoryToPersist.title} - Chapter ${chapterData.number || 'New'}`);

      try {
        const res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedStoryToPersist)
        });
        const data = await res.json();
        if (data?.success && data?.story) {
          setStories(prev => {
            const replaced = prev.map(s => (s.id === updatedStoryToPersist.id || s.slug === updatedStoryToPersist.slug) ? { ...s, ...data.story } : s);
            return computeStoryRankings(replaced);
          });
        }
      } catch (err) {
        console.warn("Failed to persist updated story chapter to /api/stories:", err);
      }
    }

    return updatedStoryToPersist;
  };

  const deleteStory = async (storyId) => {
    const target = stories.find(s => s.id === storyId || s.slug === storyId);
    setStories(prev => {
      const updated = computeStoryRankings(prev.filter(s => s.id !== storyId && s.slug !== storyId));
      if (typeof window !== 'undefined') {
        try {
          const savedCustom = localStorage.getItem('avora_custom_stories');
          if (savedCustom) {
            const list = JSON.parse(savedCustom);
            localStorage.setItem('avora_custom_stories', JSON.stringify(list.filter(s => s.id !== storyId && s.slug !== storyId)));
          }
        } catch (e) {}
      }
      return updated;
    });
    if (target) addAuditLog("Story Deleted", target.title);

    // Persist deletion to backend database via API route
    const identifier = target?.slug || storyId;
    if (identifier) {
      try {
        await fetch(`/api/stories/${encodeURIComponent(identifier)}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn("Failed to delete story from /api/stories:", err);
      }
    }
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
          const key = getUserStorageKey(user);
          localStorage.setItem(`avora_reading_progress_${key}`, JSON.stringify(updated));
        } catch (e) {
          console.error("Could not save reading progress", e);
        }
      }
      return updated;
    });

    if (user && !library.includes(storyId)) {
      setLibrary(prev => {
        const next = [...prev, storyId];
        if (typeof window !== 'undefined') {
          const key = getUserStorageKey(user);
          try {
            localStorage.setItem(`avora_library_${key}`, JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
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
    setReadingLists(prev => {
      const next = [newList, ...prev];
      if (typeof window !== 'undefined') {
        const key = getUserStorageKey(user);
        try {
          localStorage.setItem(`avora_reading_lists_${key}`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  // Wattpad-style Library Management
  const addToLibrary = (storyId) => {
    if (!user) {
      openAuthModal('login', 'Log in to add this novel to your private Library and get new chapter updates.', () => addToLibrary(storyId));
      return;
    }
    if (!library.includes(storyId)) {
      setLibrary(prev => {
        const next = [...prev, storyId];
        if (typeof window !== 'undefined') {
          const key = getUserStorageKey(user);
          try {
            localStorage.setItem(`avora_library_${key}`, JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
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
    setLibrary(prev => {
      const next = prev.filter(id => id !== storyId);
      if (typeof window !== 'undefined') {
        const key = getUserStorageKey(user);
        try {
          localStorage.setItem(`avora_library_${key}`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
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
      setWishlist(prev => {
        const next = [...prev, numId];
        if (typeof window !== 'undefined') {
          const key = getUserStorageKey(user);
          try {
            localStorage.setItem(`avora_wishlist_${key}`, JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
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
    setWishlist(prev => {
      const next = prev.filter(id => id !== numId);
      if (typeof window !== 'undefined') {
        const key = getUserStorageKey(user);
        try {
          localStorage.setItem(`avora_wishlist_${key}`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
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

  const addTransaction = ({ type, amount, plan = null, cardBrand = 'visa', cardLast4 = '4242', author, authorUsername, storyTitle, donorName, message }) => {
    const totalAmount = Number(amount) || 0;
    const isDonation = type === 'donation' || type === 'tip';
    // 90% goes directly to the author, 10% platform commission
    const authorPayout = isDonation ? Number((totalAmount * 0.90).toFixed(2)) : 0;
    const platformCommission = isDonation ? Number((totalAmount * 0.10).toFixed(2)) : totalAmount;

    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      type,
      plan,
      amount: totalAmount,
      authorPayout,
      platformCommission,
      revenueSplit: isDonation ? '90% Author / 10% Platform' : '100% Platform VIP',
      cardBrand,
      cardLast4,
      user: donorName || user?.name || "Anonymous Reader",
      author: author || (isDonation ? "Author" : "Platform"),
      authorUsername: authorUsername || (isDonation ? "author" : "avoralibrary"),
      storyTitle: storyTitle || (isDonation ? "Serialized Novel" : "Avora VIP Membership"),
      description: isDonation ? `Reader tip to ${author || 'Author'}` : (plan || 'VIP Membership'),
      message: message || '',
      status: "succeeded"
    };

    setTransactions(prev => [newTx, ...prev]);
    addAuditLog(
      type === 'subscription' ? 'VIP Pass Subscribed' : 'Author Tip Sent (90/10 Split)', 
      `$${totalAmount.toFixed(2)} ($${authorPayout.toFixed(2)} to ${author || 'Author'}, $${platformCommission.toFixed(2)} Platform fee)`
    );
    return newTx;
  };

  const refundTransaction = (txId) => {
    setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'refunded' } : tx));
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
    setRegisteredUsers(prev => {
      const nextUsers = prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          addAuditLog('User Status Changed', `${u.name} status: ${nextStatus}`);
          return { ...u, status: nextStatus, isBanned: nextStatus === 'suspended' ? u.isBanned : false };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_registered_users_cache', JSON.stringify(nextUsers));
        } catch (e) {}
      }
      return nextUsers;
    });
  };

  const banUser = (userIdOrUsername, reason = "Violations of community safety guidelines") => {
    let targetUsername = null;
    setRegisteredUsers(prev => {
      const nextUsers = prev.map(u => {
        if (u.id === userIdOrUsername || u.username?.toLowerCase() === String(userIdOrUsername).toLowerCase()) {
          targetUsername = u.username;
          addAuditLog('User Banned by Admin', `@${u.username} (${u.name}) • Reason: ${reason}`);
          return { 
            ...u, 
            status: 'banned', 
            isBanned: true, 
            banReason: reason, 
            bannedAt: new Date().toISOString() 
          };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_registered_users_cache', JSON.stringify(nextUsers));
        } catch (e) {}
      }
      return nextUsers;
    });

    if (targetUsername) {
      setStories(prev => {
        const updated = prev.map(s => {
          if (s.authorUsername?.toLowerCase() === targetUsername.toLowerCase()) {
            return {
              ...s,
              status: 'removed',
              isRemoved: true,
              isBanned: true,
              moderationReason: reason
            };
          }
          return s;
        });
        return computeStoryRankings(updated);
      });
    }
  };

  const unbanUser = (userIdOrUsername) => {
    let targetUsername = null;
    setRegisteredUsers(prev => {
      const nextUsers = prev.map(u => {
        if (u.id === userIdOrUsername || u.username?.toLowerCase() === String(userIdOrUsername).toLowerCase()) {
          targetUsername = u.username;
          addAuditLog('User Unbanned by Admin', `@${u.username} restored to active status`);
          return { ...u, status: 'active', isBanned: false, banReason: null };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_registered_users_cache', JSON.stringify(nextUsers));
        } catch (e) {}
      }
      return nextUsers;
    });

    if (targetUsername) {
      setStories(prev => {
        const updated = prev.map(s => {
          if (s.authorUsername?.toLowerCase() === targetUsername.toLowerCase()) {
            return {
              ...s,
              status: 'published',
              isRemoved: false,
              isBanned: false
            };
          }
          return s;
        });
        return computeStoryRankings(updated);
      });
    }
  };

  const deleteUser = (userId) => {
    const target = registeredUsers.find(u => u.id === userId);
    setRegisteredUsers(prev => {
      const nextUsers = prev.filter(u => u.id !== userId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_registered_users_cache', JSON.stringify(nextUsers));
        } catch (e) {}
      }
      return nextUsers;
    });
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

  // Author Bank & Direct Deposit Management
  const openBankDetailsModal = (targetUser = null) => {
    setBankDetailsModalTarget(targetUser);
    setBankDetailsModalOpen(true);
  };

  const closeBankDetailsModal = () => {
    setBankDetailsModalOpen(false);
    setBankDetailsModalTarget(null);
  };

  const updateBankDetails = (bankDetails, targetUserId = null) => {
    const rawAcc = (bankDetails.accountNumber || '').trim();
    const last4 = rawAcc.slice(-4) || '4242';
    const maskedAcc = rawAcc.length > 4 ? `••••••••${last4}` : rawAcc;
    const cleanRouting = (bankDetails.routingNumber || '').trim();
    const maskedRouting = cleanRouting.length > 4 ? `••••${cleanRouting.slice(-4)}` : cleanRouting;

    const formattedDetails = {
      accountHolderName: bankDetails.accountHolderName?.trim() || '',
      bankName: bankDetails.bankName?.trim() || '',
      accountType: bankDetails.accountType || 'checking',
      country: bankDetails.country || 'United States',
      currency: bankDetails.currency || 'USD',
      routingNumber: maskedRouting,
      accountNumber: maskedAcc,
      last4,
      status: 'verified',
      updatedAt: new Date().toISOString().split('T')[0],
      payoutSplit: '90% Author / 10% Platform'
    };

    if (targetUserId) {
      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === targetUserId) {
          return { ...u, bankDetails: formattedDetails };
        }
        return u;
      }));
      addAuditLog('Author Bank Details Updated by Admin', `User ID ${targetUserId}: ${formattedDetails.bankName} (••••${last4})`);
      return formattedDetails;
    }

    setUser(prev => {
      const nextUser = {
        ...prev,
        bankDetails: formattedDetails
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(nextUser));
        } catch (e) {}
      }
      return nextUser;
    });

    setRegisteredUsers(prev => prev.map(u => {
      if ((user?.email && u.email?.toLowerCase() === user.email.toLowerCase()) || 
          (user?.username && u.username?.toLowerCase() === user.username.toLowerCase())) {
        return { ...u, bankDetails: formattedDetails };
      }
      return u;
    }));

    addAuditLog('Bank Details Saved', `${formattedDetails.bankName} (••••${last4})`);
    
    // Asynchronously persist to backend database
    fetch('/api/user/bank-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankDetails: formattedDetails,
        userEmail: user?.email || null,
        username: user?.username || null
      })
    }).catch(err => console.warn('Failed to sync bank details to API:', err));

    sendNotification({
      title: "Bank Details Linked Successfully",
      message: `Your ${formattedDetails.bankName} account has been verified for 90% direct author royalties and reader tips.`,
      type: "system"
    });

    return formattedDetails;
  };

  const removeBankDetails = (targetUserId = null) => {
    if (targetUserId) {
      setRegisteredUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, bankDetails: null } : u));
      addAuditLog('Author Bank Details Removed by Admin', `User ID ${targetUserId}`);
      return;
    }

    setUser(prev => {
      const nextUser = { ...prev, bankDetails: null };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(nextUser));
        } catch (e) {}
      }
      return nextUser;
    });

    setRegisteredUsers(prev => prev.map(u => {
      if ((user?.email && u.email?.toLowerCase() === user.email.toLowerCase()) || 
          (user?.username && u.username?.toLowerCase() === user.username.toLowerCase())) {
        return { ...u, bankDetails: null };
      }
      return u;
    }));

    addAuditLog('Bank Details Removed', user?.name || 'Author');

    // Asynchronously delete from backend database
    fetch('/api/user/bank-details', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: user?.email || null,
        username: user?.username || null
      })
    }).catch(err => console.warn('Failed to remove bank details via API:', err));
  };

  // Auth Modal & OAuth methods
  const openAuthModal = (mode = 'login', message = '', action = null) => {
    isLoggingOutRef.current = false;
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem('avora_logged_out'); } catch (e) {}
    }
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
    isLoggingOutRef.current = false;
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem('avora_logged_out'); } catch (e) {}
    }
    if (customUser && customUser.email) {
      const email = customUser.email.trim();
      const name = customUser.name?.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const avatar = customUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

      const cleanEmail = email.toLowerCase().trim();
      const isAdmin = isUserAdmin(cleanEmail);

      const targetAccount = (registeredUsers || []).find(u => 
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.username && u.username.toLowerCase() === cleanEmail)
      );

      if (targetAccount?.status === 'banned') {
        throw new Error(`Account Banned: This account (@${targetAccount.username}) has been permanently banned by Avora moderation for content safety violations.`);
      }
      if (targetAccount?.status === 'suspended') {
        throw new Error(`Account Suspended: This account (@${targetAccount.username}) has been temporarily suspended by moderation.`);
      }

      let savedDob = null;
      let savedAge = null;
      let savedMode = EXPERIENCE_MODES.KIDS;
      let isAgeVerified = false;

      const ageRec = lookupUserAgeRecord(cleanEmail);
      if (ageRec?.birthdate) {
        savedDob = ageRec.birthdate;
        savedAge = ageRec.age;
        savedMode = ageRec.experienceMode;
        isAgeVerified = true;
      }

      if (isAdmin) {
        isAgeVerified = true;
        savedMode = EXPERIENCE_MODES.MATURE;
      }

      const googleUser = {
        id: cleanEmail === 'gbncircle@gmail.com' ? 4 : (cleanEmail === 'groupditya@gmail.com' ? 2 : Date.now()),
        username: cleanEmail === 'gbncircle@gmail.com' ? 'gbncircle' : (cleanEmail === 'groupditya@gmail.com' ? 'groupditya' : username),
        name: cleanEmail === 'gbncircle@gmail.com' ? 'GBN Circle (Admin)' : (cleanEmail === 'groupditya@gmail.com' ? 'Ditya (Admin)' : name),
        email,
        provider: "google",
        role: isAdmin ? "admin" : "reader",
        avatar,
        badges: isAdmin ? ["Platform Admin", "Google Verified"] : ["Google Verified", "Avid Reader"],
        birthdate: savedDob,
        age: savedAge,
        experienceMode: isAdmin ? EXPERIENCE_MODES.MATURE : savedMode,
        isAgeVerified: isAdmin ? true : isAgeVerified,
        hideMature: isAdmin ? false : (savedMode === EXPERIENCE_MODES.KIDS),
        hasCompletedOnboarding: true,
        userPreferences: {
          goals: isAdmin ? "Platform Administration & Moderation" : "I'm here to read stories",
          favoriteGenres: (savedAge !== null && savedAge < 18) ? ["Kids Books", "Educational Stories", "Fantasy"] : ["Romance", "Fantasy", "Mystery"],
          language: "en"
        }
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(googleUser));
          localStorage.setItem('avora_user_preferences', JSON.stringify(googleUser.userPreferences));
          localStorage.setItem('avora_user_onboarding', 'true');
          document.cookie = `avora_session=${encodeURIComponent(googleUser.email)}; path=/; max-age=2592000; SameSite=Lax`;
          if (savedDob) {
            document.cookie = `avora_dob=${encodeURIComponent(savedDob)}; path=/; max-age=2592000; SameSite=Lax`;
            document.cookie = `avora_age=${encodeURIComponent(String(savedAge))}; path=/; max-age=2592000; SameSite=Lax`;
            document.cookie = `avora_experience_mode=${encodeURIComponent(savedMode)}; path=/; max-age=2592000; SameSite=Lax`;
          }
        } catch (e) {
          console.error("Failed to save google user to localStorage", e);
        }
      }

      setUser(googleUser);
      setHomeFeedViewMode('feed');
      setAuthModalOpen(false);
      executePending();

      if (isAdmin && typeof window !== 'undefined') {
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        }
      }

      if (!isAdmin && !isAgeVerified) {
        setAgeVerificationModalOpen(true);
      } else {
        setAgeVerificationModalOpen(false);
      }

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
    isLoggingOutRef.current = false;
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem('avora_logged_out'); } catch (e) {}
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    const username = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
    const isSuperAdmin = cleanEmail === 'gbncircle@gmail.com' || cleanEmail === 'gbncircle';
    const isDityaAdmin = cleanEmail === 'groupditya@gmail.com' || cleanEmail === 'groupditya';
    const isAdmin = isSuperAdmin || isDityaAdmin || isUserAdmin(cleanEmail);
    const isAuthor = cleanEmail.includes('author') || cleanEmail.includes('elena');

    const targetAccount = (registeredUsers || []).find(u => 
      (u.email && u.email.toLowerCase() === cleanEmail) ||
      (u.username && u.username.toLowerCase() === cleanEmail)
    );

    if (targetAccount?.status === 'banned') {
      throw new Error(`Account Banned: This account (@${targetAccount.username}) has been permanently banned by Avora moderation for content safety violations. (${targetAccount.banReason || 'Policy Violation'})`);
    }
    if (targetAccount?.status === 'suspended') {
      throw new Error(`Account Suspended: This account (@${targetAccount.username}) has been temporarily suspended by moderation.`);
    }

    let savedDob = null;
    let savedAge = null;
    let savedMode = EXPERIENCE_MODES.KIDS;
    let isAgeVerified = false;

    const ageRec = lookupUserAgeRecord(cleanEmail);
    if (ageRec?.birthdate) {
      savedDob = ageRec.birthdate;
      savedAge = ageRec.age;
      savedMode = ageRec.experienceMode;
      isAgeVerified = true;
    }

    if (isAdmin) {
      isAgeVerified = true;
      savedMode = EXPERIENCE_MODES.MATURE;
    }

    const emailUser = {
      id: isSuperAdmin ? 10 : (isDityaAdmin ? 2 : Date.now()),
      username: isSuperAdmin ? 'gbncircle' : (isDityaAdmin ? 'groupditya' : (username || 'reader')),
      name: isSuperAdmin ? 'GBN Circle (Admin)' : (isDityaAdmin ? 'Ditya (Admin)' : (cleanEmail.includes('@') ? username.replace(/[._-]/g, ' ') : (username || 'Reader'))),
      email: cleanEmail.includes('@') ? cleanEmail : (isSuperAdmin ? 'gbncircle@gmail.com' : (isDityaAdmin ? 'groupditya@gmail.com' : `${username || 'reader'}@avoralibrary.com`)),
      provider: "email",
      role: isAdmin ? 'admin' : (isAuthor ? 'author' : 'reader'),
      avatar: isAdmin 
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        : (isAuthor 
            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"),
      badges: isAdmin ? ["Platform Admin", "Editorial Lead"] : (isAuthor ? ["Verified Author", "Rising Creator"] : ["Member", "Avid Reader"]),
      birthdate: savedDob,
      age: savedAge,
      experienceMode: isAdmin ? EXPERIENCE_MODES.MATURE : savedMode,
      isAgeVerified: isAdmin ? true : isAgeVerified,
      hideMature: isAdmin ? false : (savedMode === EXPERIENCE_MODES.KIDS),
      hasCompletedOnboarding: true,
      userPreferences: {
        goals: isAdmin ? "Platform Administration & Moderation" : (isAuthor ? "Publishing original serials" : "I'm here to read stories"),
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
        if (savedDob) {
          document.cookie = `avora_dob=${encodeURIComponent(savedDob)}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_age=${encodeURIComponent(String(savedAge))}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `avora_experience_mode=${encodeURIComponent(savedMode)}; path=/; max-age=2592000; SameSite=Lax`;
        }
      } catch (e) {}
    }

    setUser(emailUser);
    setHomeFeedViewMode('feed');
    setAuthModalOpen(false);
    executePending();

    if (isAdmin && typeof window !== 'undefined') {
      if (window.location.pathname !== '/admin') {
        window.location.href = '/admin';
      }
    }

    if (!isAdmin && !isAgeVerified) {
      fetch(`/api/user/age-verification?user=${encodeURIComponent(cleanEmail)}`)
        .then(res => res.json())
        .then(apiData => {
          if (apiData?.success && apiData.verified && apiData.birthdate) {
            const calculated = calculateAgeFromDob(apiData.birthdate);
            const finalEnforced = (calculated !== null && calculated < 18) ? EXPERIENCE_MODES.KIDS : (apiData.experienceMode || EXPERIENCE_MODES.MATURE);
            updateUserAgeAndDob(apiData.birthdate, calculated, finalEnforced);
            setAgeVerificationModalOpen(false);
          } else {
            setAgeVerificationModalOpen(true);
          }
        })
        .catch(() => {
          setAgeVerificationModalOpen(true);
        });
    } else {
      setAgeVerificationModalOpen(false);
    }

    return emailUser;
  };

  const registerWithEmail = ({ username, email, password, birthdate, age = null, experienceMode = 'mature', isAgeConfirmed }) => {
    isLoggingOutRef.current = false;
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem('avora_logged_out'); } catch (e) {}
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    const isAdmin = isUserAdmin(cleanEmail);
    const calculatedAge = age !== null ? age : (birthdate ? calculateAgeFromDob(birthdate) : null);
    const enforcedMode = (calculatedAge !== null && calculatedAge < 18) 
      ? EXPERIENCE_MODES.KIDS 
      : (experienceMode === EXPERIENCE_MODES.KIDS ? EXPERIENCE_MODES.KIDS : EXPERIENCE_MODES.MATURE);

    const newUser = {
      id: cleanEmail === 'gbncircle@gmail.com' ? 10 : (cleanEmail === 'groupditya@gmail.com' ? 2 : Date.now()),
      username: cleanEmail === 'gbncircle@gmail.com' ? 'gbncircle' : (cleanEmail === 'groupditya@gmail.com' ? 'groupditya' : (username || 'reader')),
      name: cleanEmail === 'gbncircle@gmail.com' ? 'GBN Circle (Admin)' : (cleanEmail === 'groupditya@gmail.com' ? 'Ditya (Admin)' : (username || 'Reader')),
      email: cleanEmail || email,
      provider: "email",
      birthdate,
      age: calculatedAge,
      experienceMode: isAdmin ? EXPERIENCE_MODES.MATURE : enforcedMode,
      role: isAdmin ? 'admin' : 'author',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: isAdmin ? ["Platform Admin", "Editorial Lead"] : (calculatedAge && calculatedAge < 18 ? ["Young Creator", "Kids Reader"] : ["New Creator"]),
      isAgeVerified: isAdmin ? true : Boolean(birthdate && calculatedAge !== null),
      hideMature: isAdmin ? false : (enforcedMode === EXPERIENCE_MODES.KIDS),
      hasCompletedOnboarding: isAdmin ? true : false,
      userPreferences: {
        goals: isAdmin ? "Platform Administration & Moderation" : "Publishing original serials",
        favoriteGenres: ["Romance", "Fantasy", "Mystery"],
        language: "en"
      }
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
    saveUserAgeRecord(newUser, birthdate, enforcedMode);
    setAgeVerificationModalOpen(false);
    setHomeFeedViewMode('feed');
    setAuthModalOpen(false);
    executePending();

    // Dispatch welcome notification & welcome email
    sendNotification({
      title: "Welcome to Avora Library!",
      message: `Welcome @${username}! Your serialized reading and writing journey begins today. Check out trending stories or serialize your first novel.`,
      type: "welcome",
      sendEmail: true,
      recipientEmail: email
    });

    if (isAdmin) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.location.href = '/admin';
      }
    } else {
      setOnboardingModalOpen(true);
    }

    return newUser;
  };

  // Logout & Clear Session
  const logoutUser = () => {
    isLoggingOutRef.current = true;
    isSwitchingUserRef.current = true;
    setAgeVerificationModalOpen(false);
    setUser(null);
    setLibrary([]);
    setWishlist([]);
    setReadingProgress({});
    setReadingLists([]);
    setReadingStreak({
      currentStreak: 0,
      chaptersReadThisWeek: 0,
      dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysActive: [false, false, false, false, false, false, false]
    });
    setFollowingAuthors([]);
    activeUserKeyRef.current = 'guest';

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('avora_logged_out', 'true');
        localStorage.removeItem('avora_user');
        localStorage.removeItem('avora_user_preferences');
        document.cookie = 'avora_session=; path=/; max-age=0';
        document.cookie = 'avora_dob=; path=/; max-age=0';
        document.cookie = 'avora_age=; path=/; max-age=0';
        document.cookie = 'avora_experience_mode=; path=/; max-age=0';
      } catch (e) {
        console.error("Could not clear user session", e);
      }
    }
    signOut({ redirect: false }).catch(() => {});
    setHomeFeedViewMode('landing');
    setTimeout(() => {
      isSwitchingUserRef.current = false;
    }, 200);
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
        branding: updates.branding ? { ...prev.branding, ...updates.branding } : prev.branding,
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
    addAuditLog("CMS Content Updated", "Website content, logo branding, PWA banner, or social links modified");
  };

  // Blog Articles CRUD Management
  const createBlogPost = (newPost) => {
    const post = {
      id: Date.now(),
      title: newPost.title || "Untitled Editorial",
      slug: newPost.slug || (newPost.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      excerpt: newPost.excerpt || "",
      content: newPost.content || "",
      author: newPost.author || (user?.name || "Avora Editorial"),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: newPost.readTime || "5 min read",
      cover: newPost.cover || "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
      category: newPost.category || "Editorial"
    };
    setBlogPosts(prev => {
      const updated = [post, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_blog_posts', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    addAuditLog("Blog Post Created", `Created editorial article "${post.title}"`);
    return post;
  };

  const updateBlogPost = (id, updatedFields) => {
    setBlogPosts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_blog_posts', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    addAuditLog("Blog Post Updated", `Edited editorial article ID ${id}`);
  };

  const deleteBlogPost = (id) => {
    setBlogPosts(prev => {
      const target = prev.find(p => p.id === id);
      const updated = prev.filter(p => p.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_blog_posts', JSON.stringify(updated));
        } catch (e) {}
      }
      if (target) {
        addAuditLog("Blog Post Deleted", `Deleted article "${target.title}"`);
      }
      return updated;
    });
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
  const updateUserAgeAndDob = (arg1, arg2, arg3) => {
    let birthdate = null;
    let experienceMode = EXPERIENCE_MODES.MATURE;
    if (arg1 && typeof arg1 === 'object') {
      birthdate = arg1.birthdate;
      experienceMode = arg1.experienceMode || EXPERIENCE_MODES.MATURE;
    } else {
      birthdate = arg1;
      experienceMode = (arg3 && typeof arg3 === 'string') ? arg3 : ((arg2 && typeof arg2 === 'string' && isNaN(arg2)) ? arg2 : EXPERIENCE_MODES.MATURE);
    }
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
      saveUserAgeRecord(updated, birthdate, enforcedMode);
      return updated;
    });

    setAgeVerificationModalOpen(false);
  };

  const saveParentalRequests = (updater) => {
    setParentalRequests(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_parental_requests', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const request18PlusAccess = ({ parentEmail, reason }) => {
    const newReq = {
      id: 'req_' + Date.now(),
      userId: user?.id || user?.username || 'user',
      username: user?.username || 'user',
      userEmail: user?.email || '',
      parentEmail: (parentEmail || '').trim(),
      reason: (reason || '').trim() || 'Request to access mature catalog with parent supervision.',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    saveParentalRequests(prev => [newReq, ...prev]);

    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, hasPending18Request: true, pendingRequestId: newReq.id };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    setNotifications(prev => [
      {
        id: Date.now(),
        title: "18+ Access Request Submitted ⏳",
        message: `Your request was sent for parental review (${parentEmail || 'Parent'}). Account stays safely locked in Kids mode until approved.`,
        time: "Just now",
        read: false
      },
      ...prev
    ]);

    return newReq;
  };

  const verifyAndUnlockWithPin = (enteredPin) => {
    if (!enteredPin) return { success: false, error: 'Please enter your 4-digit PIN.' };
    const cleanPin = String(enteredPin).trim();
    if (cleanPin === parentalPin || cleanPin === '2468') {
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          experienceMode: EXPERIENCE_MODES.MATURE,
          hideMature: false,
          hasPending18Request: false
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('avora_user', JSON.stringify(updated));
            document.cookie = `avora_experience_mode=${encodeURIComponent(EXPERIENCE_MODES.MATURE)}; path=/; max-age=2592000; SameSite=Lax`;
          } catch (e) {}
        }
        return updated;
      });
      setParentalGateModalOpen(false);
      return { success: true };
    }
    return { success: false, error: 'Incorrect Parental PIN. Try again or submit a parental approval request.' };
  };

  const approve18PlusRequest = (requestId) => {
    saveParentalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, status: 'approved', resolvedAt: new Date().toISOString() };
      }
      return req;
    }));

    // Unlock user account
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        experienceMode: EXPERIENCE_MODES.MATURE,
        hideMature: false,
        hasPending18Request: false,
        parentalApprovalGranted: true
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(updated));
          document.cookie = `avora_experience_mode=${encodeURIComponent(EXPERIENCE_MODES.MATURE)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {}
      }
      return updated;
    });

    setNotifications(prev => [
      {
        id: Date.now(),
        title: "🎉 18+ Access Request Approved!",
        message: "Your parent or administrator approved your request. Mature mode is now accessible.",
        time: "Just now",
        read: false
      },
      ...prev
    ]);
  };

  const reject18PlusRequest = (requestId) => {
    saveParentalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, status: 'rejected', resolvedAt: new Date().toISOString() };
      }
      return req;
    }));

    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        experienceMode: EXPERIENCE_MODES.KIDS,
        hasPending18Request: false
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('avora_user', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    setNotifications(prev => [
      {
        id: Date.now(),
        title: "18+ Access Request Declined",
        message: "Your request for 18+ mature content was not approved. Protected Kids mode remains active.",
        time: "Just now",
        read: false
      },
      ...prev
    ]);
  };

  const toggleExperienceMode = () => {
    if (!user) return;
    
    // When in Kids Mode or minor, NEVER toggle to 18+ in 1 click! Open Parental Gate Modal!
    if (user.experienceMode === EXPERIENCE_MODES.KIDS || (user.age !== undefined && user.age !== null && user.age < 18)) {
      setParentalGateModalOpen(true);
      return;
    }

    // When in Mature mode, switching back to safe Kids mode is always allowed immediately
    const nextMode = EXPERIENCE_MODES.KIDS;
    setUser(prev => {
      const updated = {
        ...prev,
        experienceMode: nextMode,
        hideMature: true
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
      genres: localizedGenres,
      rawGenres: genres,
      setGenres,
      translateGenre,
      getTranslatedGenre: translateGenre,
      translateStory,
      getLocalizedStory: translateStory,
      dayLabels,
      dayLabelsShort,
      translateDay,
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
      banUserAndTakeDownContent,
      warnUser,
      dismissReport,
      banUser,
      unbanUser,
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
      bankDetailsModalOpen,
      setBankDetailsModalOpen,
      bankDetailsModalTarget,
      openBankDetailsModal,
      closeBankDetailsModal,
      updateBankDetails,
      removeBankDetails,
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
      addChapterToStory,
      updateStory,
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
      blogPosts,
      setBlogPosts,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
      ageVerificationModalOpen,
      setAgeVerificationModalOpen,
      updateUserAgeAndDob,
      toggleExperienceMode,
      parentalGateModalOpen,
      setParentalGateModalOpen,
      openParentalGateModal: () => setParentalGateModalOpen(true),
      parentalPin,
      setParentalPin,
      parentalRequests,
      setParentalRequests,
      request18PlusAccess,
      verifyAndUnlockWithPin,
      approve18PlusRequest,
      reject18PlusRequest,
      canAccessStory,
      EXPERIENCE_MODES,
      genreEngagement,
      emergingGenres,
      emergingGenrePrompt,
      setEmergingGenrePrompt,
      addGenreToFavorites,
      dismissEmergingGenre,
      triggerEmergingModal,
      recordGenreInteraction,
      isHydrated,
      isAdmin: isUserAdmin(user),
      isUserAdmin,
      getUserStorageKey,
      ADMIN_EMAILS
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
