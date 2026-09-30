'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
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

const AppContext = createContext();

export function AppProvider({ children }) {
  // Multilingual & Theme
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');

  // Authenticated User State (defaults to null for unauthenticated guests)
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Stories & Content State
  const [stories, setStories] = useState(initialStories);
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
    enablePaidFeatures: false,
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
          setUserPreferences(JSON.parse(savedPrefs));
        }
        const savedHidden = localStorage.getItem('avora_hidden_stories');
        if (savedHidden) {
          setHiddenStoryIds(JSON.parse(savedHidden));
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

  // Translation Dictionary
  const t = translations[lang] || translations.en;

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

  const publishStory = (newStory) => {
    setStories(prev => [newStory, ...prev]);
    addAuditLog("Story Published", newStory.title);
  };

  const deleteStory = (storyId) => {
    const target = stories.find(s => s.id === storyId);
    setStories(prev => prev.filter(s => s.id !== storyId));
    if (target) addAuditLog("Story Deleted", target.title);
  };

  const saveReadingProgress = (storyId, chapterId, paragraphIndex = 0, scrollOffset = 0) => {
    const targetStory = stories.find(s => s.id === storyId);
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

  // Financial & Payment Operations
  const openPaymentModal = ({ mode = 'donate', story = null, author = null, plan = null }) => {
    setPaymentModalData({ mode, story, author, plan });
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
      return { ...prev, enablePaidFeatures: next };
    });
  };

  const updateFeatureFlags = (updates) => {
    setFeatureFlags(prev => ({ ...prev, ...updates }));
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

  // 1. Google Authentication
  const loginWithGoogle = async (customUser = null) => {
    const email = customUser?.email || "jordan.reed@gmail.com";
    const name = customUser?.name || (email ? email.split('@')[0].replace(/[._-]/g, ' ') : "Jordan Reed");
    const username = customUser?.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const avatar = customUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

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

    sendNotification({
      title: "Google Sign-In",
      message: `Welcome to Avora Library, ${name}! Signed in via Google.`,
      type: "system",
      sendEmail: true,
      recipientEmail: email
    });
    executePending();
    return googleUser;
  };

  // 2. Facebook Authentication
  const loginWithFacebook = async (customUser = null) => {
    const email = customUser?.email || "alex.vance@facebook.com";
    const name = customUser?.name || (email ? email.split('@')[0].replace(/[._-]/g, ' ') : "Alex Vance");
    const username = customUser?.username || `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')}_fb`;
    const avatar = customUser?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";

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

    sendNotification({
      title: "Facebook Sign-In",
      message: `Welcome to Avora Library, ${name}! Signed in via Facebook.`,
      type: "system",
      sendEmail: true,
      recipientEmail: email
    });
    executePending();
    return facebookUser;
  };

  // 3. Email Authentication
  const loginWithEmail = (email, password) => {
    const username = email.split('@')[0];
    const isAdmin = email.toLowerCase().includes('admin');
    const emailUser = {
      id: Date.now(),
      username,
      name: username,
      email,
      provider: "email",
      role: isAdmin ? 'admin' : 'author',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: isAdmin ? ["Admin", "Editorial Member"] : ["Member"],
      isAgeVerified: true,
      hideMature: false,
      hasCompletedOnboarding: true,
      userPreferences: {
        goals: isAdmin ? "Both reading and writing" : "I'm here to read stories",
        favoriteGenres: ["Romance", "Fantasy", "Werewolf"],
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

  const registerWithEmail = ({ username, email, password, birthdate, isAgeConfirmed }) => {
    const newUser = {
      id: Date.now(),
      username,
      name: username,
      email,
      provider: "email",
      birthdate,
      role: 'author',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: ["New Creator"],
      isAgeVerified: isAgeConfirmed,
      hideMature: false,
      hasCompletedOnboarding: false
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('avora_user', JSON.stringify(newUser));
        document.cookie = `avora_session=${encodeURIComponent(newUser.email)}; path=/; max-age=2592000; SameSite=Lax`;
      } catch (e) {}
    }

    setUser(newUser);
    setHomeFeedViewMode('feed');
    setAuthModalOpen(false);
    executePending();
    setOnboardingModalOpen(true);

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

  return (
    <AppContext.Provider value={{
      lang,
      setLang,
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
      resetCmsConfig
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
