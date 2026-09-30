'use client';
import { createContext, useContext, useState, useEffect } from 'react';
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
  initialFeatureFlags
} from '@/lib/data';
import { translations } from '@/lib/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Multilingual & Theme
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');

  // Authenticated User State
  const [user, setUser] = useState({
    id: 1,
    username: "Elena_Author",
    name: "Elena Vance",
    email: "elena@avoralibrary.com",
    role: "admin", // 'reader' | 'author' | 'admin'
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    badges: ["Top Author", "Rising Writer", "Editorial Member"],
    isAgeVerified: true,
    hideMature: false
  });

  // Stories & Content State
  const [stories, setStories] = useState(initialStories);
  const [genres, setGenres] = useState(initialGenres);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [contests, setContests] = useState(initialContests);
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [communitySpaces, setCommunitySpaces] = useState(initialCommunitySpaces);
  const [readerReactions, setReaderReactions] = useState(initialReaderReactions);

  // Social & Community State
  const [followingAuthors, setFollowingAuthors] = useState(['elenavance', 'astraquill']);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [library, setLibrary] = useState([1, 2]); // Wattpad Personal Library
  const [readingLists, setReadingLists] = useState([
    { id: 1, title: "Favorites of 2026", description: "Must-read serialized masterworks", storyIds: [1, 2], isPublic: true },
    { id: 2, title: "Late Night Atmosphere", description: "Mysterious and supernatural tales", storyIds: [3], isPublic: true }
  ]);

  // Reading Progress & Streaks
  const [readingProgress, setReadingProgress] = useState(initialReadingProgress || {});
  const [readingStreak, setReadingStreak] = useState(initialReadingStreak || {
    currentStreak: 5,
    chaptersReadThisWeek: 14,
    dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    daysActive: [true, true, true, true, true, false, false]
  });

  // Dual-State Home Feed View Mode: 'feed' or 'landing'
  const [homeFeedViewMode, setHomeFeedViewMode] = useState('feed');

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
  const [userConversations, setUserConversations] = useState({
    elenavance: [
      { 
        id: 1, 
        author: "BookLover99", 
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", 
        text: "Loving Chapter 2 of The Shadow Alchemist! When is Keith's backstory revealed?", 
        time: "2 hours ago" 
      },
      { 
        id: 2, 
        author: "Elena Vance", 
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", 
        text: "Thank you so much! Chapter 3 drops this Friday with a huge revelation about the grimoire.", 
        time: "1 hour ago",
        isAuthorReply: true
      }
    ]
  });

  // Auth Modal State (Facebook, Google, Email)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Moderation & Audit Log
  const [reports, setReports] = useState([
    {
      id: 1,
      targetType: "comment",
      reportedUser: "SpamBot99",
      reason: "Unsolicited promotional links in paragraph reaction",
      story: "The Shadow Alchemist • Ch. 1",
      status: "pending",
      timestamp: "10 mins ago"
    }
  ]);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: "House Original Assigned", target: "The Shadow Alchemist", admin: "Elena Vance", time: "1 hour ago" },
    { id: 2, action: "System Initialized", target: "Avora Library Database", admin: "System", time: "Today" }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Chapter Alert", message: "Elena Vance published Chapter 2 of 'The Shadow Alchemist'", time: "1 hour ago", read: false },
    { id: 2, title: "Paragraph Reply", message: "LoreHunter replied to your reaction on Chapter 1", time: "3 hours ago", read: false },
    { id: 3, title: "Contest Announcement", message: "The Golden Quill Awards 2026 submissions are open!", time: "1 day ago", read: true }
  ]);

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

  // Sync Reading Progress from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('avora_reading_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          setReadingProgress(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Could not load reading progress from localStorage", e);
      }
    }
  }, []);

  // Translation Dictionary
  const t = translations[lang] || translations.en;

  // Actions
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const followAuthor = (authorUsername) => {
    setFollowingAuthors(prev => {
      const isFollowing = prev.includes(authorUsername);
      const updated = isFollowing ? prev.filter(u => u !== authorUsername) : [...prev, authorUsername];
      if (!isFollowing) {
        setNotifications(n => [
          { id: Date.now(), title: "Follow Success", message: `You are now following @${authorUsername}. You will receive alerts when new chapters drop.`, time: "Just now", read: false },
          ...n
        ]);
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
  const loginWithGoogle = async () => {
    const googleUser = {
      id: 88,
      username: "jordan_reed",
      name: "Jordan Reed",
      email: "jordan.reed@gmail.com",
      provider: "google",
      role: "reader",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      badges: ["Google Verified", "Avid Reader"],
      isAgeVerified: true,
      hideMature: false
    };
    setUser(googleUser);
    setAuthModalOpen(false);
    setNotifications(prev => [
      { id: Date.now(), title: "Google Sign-In", message: "Welcome back, Jordan! Signed in via Google.", time: "Just now", read: false },
      ...prev
    ]);
    executePending();
  };

  // 2. Facebook Authentication
  const loginWithFacebook = async () => {
    const facebookUser = {
      id: 99,
      username: "alex_vance_fb",
      name: "Alex Vance",
      email: "alex.vance@facebook.com",
      provider: "facebook",
      role: "author",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      badges: ["Facebook Verified", "Rising Author"],
      isAgeVerified: true,
      hideMature: false
    };
    setUser(facebookUser);
    setAuthModalOpen(false);
    setNotifications(prev => [
      { id: Date.now(), title: "Facebook Sign-In", message: "Welcome back, Alex! Signed in via Facebook.", time: "Just now", read: false },
      ...prev
    ]);
    executePending();
  };

  // 3. Email Authentication
  const loginWithEmail = (email, password) => {
    const emailUser = {
      id: Date.now(),
      username: email.split('@')[0],
      name: email.split('@')[0],
      email,
      provider: "email",
      role: email.includes('admin') ? 'admin' : 'author',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: ["Member"],
      isAgeVerified: true,
      hideMature: false
    };
    setUser(emailUser);
    setAuthModalOpen(false);
    executePending();
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
      hideMature: false
    };
    setUser(newUser);
    setAuthModalOpen(false);
    executePending();
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
      userConversations,
      postConversationMessage,
      announcementBanner,
      setAnnouncementBanner,
      bannerDismissed,
      setBannerDismissed
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
