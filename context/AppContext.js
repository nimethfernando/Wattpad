'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  initialGenres, 
  initialStories, 
  initialTestimonials, 
  initialContests, 
  initialBlogPosts, 
  initialCommunitySpaces,
  initialReaderReactions
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
    email: "elena@storyvault.com",
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
  const [readingLists, setReadingLists] = useState([
    { id: 1, title: "Favorites of 2026", description: "Must-read serialized masterworks", storyIds: [1, 2], isPublic: true },
    { id: 2, title: "Late Night Atmosphere", description: "Mysterious and supernatural tales", storyIds: [3], isPublic: true }
  ]);
  const [readingProgress, setReadingProgress] = useState({ 1: { chapterId: 101, paragraphIndex: 3 } });

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
    { id: 2, action: "System Initialized", target: "StoryVault Database", admin: "System", time: "Today" }
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
      story: storyTitle || "StoryVault General",
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

  const saveReadingProgress = (storyId, chapterId, paragraphIndex) => {
    setReadingProgress(prev => ({
      ...prev,
      [storyId]: { chapterId, paragraphIndex }
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
      readingLists,
      setReadingLists,
      createReadingList,
      readingProgress,
      saveReadingProgress,
      notifications,
      setNotifications,
      voteChapter,
      reactChapterEmoji,
      addParagraphComment,
      publishStory,
      deleteStory
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
