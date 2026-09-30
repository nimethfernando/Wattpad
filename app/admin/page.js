'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Flag, 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Star, 
  Edit3, 
  CheckCircle,
  EyeOff,
  UserPlus,
  History,
  Mail,
  UserX,
  UserCheck,
  Layout,
  Globe,
  Share2,
  Sliders,
  Sparkles,
  Layers,
  Search,
  LogIn,
  Calendar,
  Clock,
  Trophy,
  FileText
} from 'lucide-react';

export default function AdminPanel() {
  const { 
    stories, 
    setStories, 
    genres, 
    setGenres, 
    reports, 
    setReports, 
    auditLogs, 
    addAuditLog, 
    user, 
    setUser, 
    blogPosts,
    setBlogPosts,
    contests,
    setContests,
    communitySpaces,
    setCommunitySpaces,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState('stories'); 
  // 'stories' | 'moderation' | 'users' | 'genres' | 'authors' | 'blog' | 'contests' | 'homepage' | 'emails' | 'seo' | 'audit' | 'settings'

  // Settings State
  const [authorSelfPublishing, setAuthorSelfPublishing] = useState(true);
  const [requireStoryApproval, setRequireStoryApproval] = useState(false);
  const [defaultItemsPerPage, setDefaultItemsPerPage] = useState(9);
  const [defaultAdminRows, setDefaultAdminRows] = useState(20);
  const [ageGateEnforced, setAgeGateEnforced] = useState(true);
  const [emailAlertsForReports, setEmailAlertsForReports] = useState(true);

  // Bulk Selection States (Scope 8: Bulk Actions)
  const [selectedStoryIds, setSelectedStoryIds] = useState([]);
  const [selectedReportIds, setSelectedReportIds] = useState([]);

  // Users Management State (Scope 8)
  const [usersList, setUsersList] = useState([
    { id: 1, username: "Elena_Author", name: "Elena Vance", email: "elena@storyvault.com", role: "admin", status: "active", followers: 420 },
    { id: 2, username: "AstraQuill", name: "Astra Quill", email: "astra@storyvault.com", role: "author", status: "active", followers: 890 },
    { id: 3, username: "MayaHeart", name: "Maya Lin", email: "maya@storyvault.com", role: "author", status: "active", followers: 610 },
    { id: 4, username: "JulianCross", name: "Julian Cross", email: "julian@storyvault.com", role: "author", status: "active", followers: 340 },
    { id: 5, username: "SpamBot99", name: "Promo Spammer", email: "promo@badmail.com", role: "reader", status: "suspended", followers: 0 },
    { id: 6, username: "BookWorm99", name: "Alex Reader", email: "alex@gmail.com", role: "reader", status: "active", followers: 15 }
  ]);

  // Homepage Sections & Banners Manager (Scope 8)
  const [homepageSections, setHomepageSections] = useState({
    hero: true,
    trending: true,
    fanfictionSpotlight: true,
    editorsPicks: true,
    genreGrid: true,
    readWatchObsess: true,
    communityReactions: true,
    testimonials: true,
    appInstall: true,
    announcementBanner: true
  });
  const [bannerText, setBannerText] = useState("🎉 The Golden Quill Awards 2026 are officially open for submissions! Enter your serialized novel today.");
  const [siteLogoUrl, setSiteLogoUrl] = useState("/icon.png");

  // Blog Editor State (Scope 5 & Scope 6: admin can create, edit, schedule, delete posts with SEO fields)
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogCategory, setBlogCategory] = useState('Writing Craft');
  const [blogAuthor, setBlogAuthor] = useState('StoryVault Editorial');
  const [blogCover, setBlogCover] = useState('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80');
  const [blogScheduleDate, setBlogScheduleDate] = useState('');
  const [blogMetaDesc, setBlogMetaDesc] = useState('');
  const [blogSavedNotice, setBlogSavedNotice] = useState(false);

  // Contest Creator State (Scope 8)
  const [contestTitle, setContestTitle] = useState('');
  const [contestPrize, setContestPrize] = useState('$5,000 Cash + House Original Development');
  const [contestDeadline, setContestDeadline] = useState('Nov 30, 2026');
  const [contestCategories, setContestCategories] = useState('Fantasy, Sci-Fi, Romance, Thriller');
  const [contestSavedNotice, setContestSavedNotice] = useState(false);

  // Email Templates State (Scope 8)
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: {
      subject: "Welcome to StoryVault — Verify Your Email",
      body: "Hello {{username}},\n\nWelcome to StoryVault! Please confirm your email address to begin publishing serialized fiction and leaving line-by-line reactions.\n\nHappy reading,\nThe StoryVault Editorial Team"
    },
    newChapter: {
      subject: "New Chapter Alert: {{storyTitle}}",
      body: "Hi reader,\n\n{{authorName}} has just published Chapter {{chapterNumber}} of '{{storyTitle}}'! Jump in now and share your inline paragraph thoughts.\n\nRead Now: {{chapterUrl}}"
    },
    reportAlert: {
      subject: "[URGENT] New Moderation Report Submitted",
      body: "Admin Notice:\n\nA new report has been submitted against {{reportedTarget}} by {{reporter}} for: {{reason}}.\n\nPlease review immediately in the StoryVault Admin Console."
    }
  });
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('welcome');
  const [templateSavedNotice, setTemplateSavedNotice] = useState(false);

  // SEO & Social Links State (Scope 8)
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "StoryVault — Serialized Fiction & Community Reading Platform",
    metaDescription: "Discover addictive serialized web novels chapter by chapter. Read, write, comment on paragraphs, and install on mobile as a PWA.",
    keywords: "serialized fiction, wattpad, web novels, books, author publishing, community reading",
    ogImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    twitterHandle: "@StoryVaultOfficial",
    discordUrl: "https://discord.gg/storyvault",
    instagramUrl: "https://instagram.com/storyvault"
  });
  const [seoSavedNotice, setSeoSavedNotice] = useState(false);

  // Genre Form
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreSlug, setNewGenreSlug] = useState('');

  // Author Profile Creator without Login (Scope 5)
  const [fakeAuthorName, setFakeAuthorName] = useState('');
  const [fakeAuthorBio, setFakeAuthorBio] = useState('');
  const [authorCreatedNotice, setAuthorCreatedNotice] = useState(false);

  // Reassign story modal / state
  const [selectedStoryToReassign, setSelectedStoryToReassign] = useState(null);
  const [newAuthorName, setNewAuthorName] = useState('');

  // Story Actions
  const toggleFeatureStory = (storyId) => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const nextState = !s.isEditorsPick;
        addAuditLog(nextState ? "Story Featured" : "Story Unfeatured", s.title);
        return { ...s, isEditorsPick: nextState };
      }
      return s;
    }));
  };

  const toggleHouseOriginal = (storyId) => {
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        const nextState = !s.isOriginal;
        addAuditLog(nextState ? "House Original Granted" : "House Original Revoked", s.title);
        return { ...s, isOriginal: nextState };
      }
      return s;
    }));
  };

  const removeStory = (storyId) => {
    if (confirm('Are you sure you want to unpublish and delete this story?')) {
      const target = stories.find(s => s.id === storyId);
      if (target) addAuditLog("Story Deleted by Admin", target.title);
      setStories(prev => prev.filter(s => s.id !== storyId));
    }
  };

  // Bulk Story Actions (Scope 8)
  const handleSelectAllStories = () => {
    if (selectedStoryIds.length === stories.length) {
      setSelectedStoryIds([]);
    } else {
      setSelectedStoryIds(stories.map(s => s.id));
    }
  };

  const handleBulkFeature = () => {
    setStories(prev => prev.map(s => selectedStoryIds.includes(s.id) ? { ...s, isEditorsPick: true } : s));
    addAuditLog("Bulk Action: Stories Featured", `${selectedStoryIds.length} stories`);
    setSelectedStoryIds([]);
  };

  const handleBulkHouseOriginal = () => {
    setStories(prev => prev.map(s => selectedStoryIds.includes(s.id) ? { ...s, isOriginal: true } : s));
    addAuditLog("Bulk Action: House Originals Assigned", `${selectedStoryIds.length} stories`);
    setSelectedStoryIds([]);
  };

  const handleBulkDeleteStories = () => {
    if (confirm(`Are you sure you want to delete ${selectedStoryIds.length} selected stories?`)) {
      setStories(prev => prev.filter(s => !selectedStoryIds.includes(s.id)));
      addAuditLog("Bulk Action: Stories Deleted", `${selectedStoryIds.length} stories`);
      setSelectedStoryIds([]);
    }
  };

  // Bulk Moderation Actions (Scope 8)
  const handleSelectAllReports = () => {
    if (selectedReportIds.length === reports.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(reports.map(r => r.id));
    }
  };

  const handleBulkDismissReports = () => {
    setReports(prev => prev.filter(r => !selectedReportIds.includes(r.id)));
    addAuditLog("Bulk Action: Reports Dismissed", `${selectedReportIds.length} reports`);
    setSelectedReportIds([]);
  };

  const handleBulkBanUsers = () => {
    const reportedUsers = reports.filter(r => selectedReportIds.includes(r.id)).map(r => r.reportedUser);
    setUsersList(prev => prev.map(u => reportedUsers.includes(u.username) ? { ...u, status: "banned" } : u));
    setReports(prev => prev.filter(r => !selectedReportIds.includes(r.id)));
    addAuditLog("Bulk Action: Users Banned", reportedUsers.join(', '));
    setSelectedReportIds([]);
  };

  const handleResolveReport = (reportId, actionTaken) => {
    const r = reports.find(item => item.id === reportId);
    if (r) addAuditLog(`Moderation Action: ${actionTaken}`, `Target: ${r.reportedUser} (${r.reason})`);
    setReports(prev => prev.filter(item => item.id !== reportId));
  };

  const handleReassignAuthor = (e) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !selectedStoryToReassign) return;
    setStories(prev => prev.map(s => {
      if (s.id === selectedStoryToReassign.id) {
        return { ...s, author: newAuthorName.trim() };
      }
      return s;
    }));
    addAuditLog("Story Reassigned to Author", `${selectedStoryToReassign.title} → ${newAuthorName}`);
    setSelectedStoryToReassign(null);
    setNewAuthorName('');
  };

  const handleAddGenre = (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    const slug = newGenreSlug.trim() || newGenreName.toLowerCase().replace(/\s+/g, '-');
    setGenres(prev => [...prev, { id: Date.now(), name: newGenreName.trim(), slug, icon: "Bookmark", count: 0 }]);
    addAuditLog("Genre Added", newGenreName.trim());
    setNewGenreName('');
    setNewGenreSlug('');
  };

  const handleCreateAuthorProfile = (e) => {
    e.preventDefault();
    if (!fakeAuthorName.trim()) return;
    const newUser = {
      id: Date.now(),
      username: fakeAuthorName.toLowerCase().replace(/\s+/g, '_'),
      name: fakeAuthorName.trim(),
      email: `${fakeAuthorName.toLowerCase().replace(/\s+/g, '')}@storyvault.editorial`,
      role: "author",
      status: "active",
      followers: 100
    };
    setUsersList(prev => [newUser, ...prev]);
    addAuditLog("Author Persona Created (No Login)", fakeAuthorName.trim());
    setAuthorCreatedNotice(true);
    setTimeout(() => {
      setAuthorCreatedNotice(false);
      setFakeAuthorName('');
      setFakeAuthorBio('');
    }, 2500);
  };

  const handleToggleUserStatus = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        addAuditLog(`User Status Changed to ${nextStatus}`, u.username);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleMasquerade = (targetUser) => {
    setUser({
      id: targetUser.id,
      username: targetUser.username,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badges: ["Author Persona"],
      isAgeVerified: true,
      hideMature: false
    });
    addAuditLog("Admin Masquerade (Impersonation)", targetUser.username);
    alert(`Switched active user session to @${targetUser.username} without login credential requirement.`);
  };

  // Blog Creation Action (Scope 5 & Scope 6)
  const handlePublishBlogPost = (e) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;
    const slug = blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newPost = {
      id: Date.now(),
      slug,
      title: blogTitle.trim(),
      category: blogCategory,
      author: blogAuthor,
      date: blogScheduleDate || new Date().toISOString().split('T')[0],
      readTime: "5 min read",
      cover: blogCover,
      excerpt: blogExcerpt || "Exclusive editorial advice from the StoryVault editorial desk."
    };
    setBlogPosts(prev => [newPost, ...prev]);
    addAuditLog("Blog Post Created & Scheduled", blogTitle.trim());
    setBlogSavedNotice(true);
    setTimeout(() => {
      setBlogSavedNotice(false);
      setBlogTitle('');
      setBlogExcerpt('');
    }, 2500);
  };

  // Contest Creation Action (Scope 8)
  const handleCreateContest = (e) => {
    e.preventDefault();
    if (!contestTitle.trim()) return;
    const newContest = {
      id: Date.now(),
      title: contestTitle.trim(),
      tagline: "Official annual competition curated by StoryVault editorial",
      status: "open",
      deadline: contestDeadline,
      prize: contestPrize,
      categories: contestCategories.split(',').map(s => s.trim()),
      entriesCount: 0,
      winners: []
    };
    setContests(prev => [newContest, ...prev]);
    addAuditLog("Writing Contest Created", contestTitle.trim());
    setContestSavedNotice(true);
    setTimeout(() => {
      setContestSavedNotice(false);
      setContestTitle('');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">StoryVault Admin Console</h1>
              <p className="text-xs text-slate-400">Content moderation, user accounts, bulk actions, homepage curation, blog publishing, email templates, and audit logs</p>
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-6 overflow-x-auto">
          {[
            { key: 'stories', label: `Stories & Originals (${stories.length})` },
            { key: 'moderation', label: `Moderation Reports (${reports.length})` },
            { key: 'users', label: `Users & Authors (${usersList.length})` },
            { key: 'genres', label: `Genre Library (${genres.length})` },
            { key: 'authors', label: `Author Persona Creator` },
            { key: 'blog', label: `Blog Editor (${blogPosts.length})` },
            { key: 'contests', label: `Contests & Awards (${contests.length})` },
            { key: 'homepage', label: `Homepage & Banners` },
            { key: 'emails', label: `Email Templates` },
            { key: 'seo', label: `SEO & Socials` },
            { key: 'audit', label: `Audit Log (${auditLogs.length})` },
            { key: 'settings', label: `Platform Settings` }
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: STORIES & BULK ACTIONS */}
        {activeTab === 'stories' && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-bold text-base">Published Serial Novels</h3>
              <div className="flex items-center gap-2">
                <Link href="/write" className="px-4 py-2 rounded-full bg-brand-500 text-white text-xs font-bold hover:bg-brand-600">
                  + Write House Original
                </Link>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedStoryIds.length > 0 && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {selectedStoryIds.length} stories selected
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={handleBulkFeature} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600">
                    Feature All
                  </button>
                  <button onClick={handleBulkHouseOriginal} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700">
                    Set House Original
                  </button>
                  <button onClick={handleBulkDeleteStories} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700">
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-4 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedStoryIds.length === stories.length && stories.length > 0} 
                          onChange={handleSelectAllStories}
                          className="w-4 h-4 accent-purple-600"
                        />
                      </th>
                      <th className="p-4">Title & Author</th>
                      <th className="p-4">Genre</th>
                      <th className="p-4">Reads / Votes</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stories.map(story => (
                      <tr key={story.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            checked={selectedStoryIds.includes(story.id)} 
                            onChange={() => {
                              setSelectedStoryIds(prev => prev.includes(story.id) ? prev.filter(id => id !== story.id) : [...prev, story.id]);
                            }}
                            className="w-4 h-4 accent-purple-600"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={story.cover} alt={story.title} className="w-8 h-11 object-cover rounded-lg" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{story.title}</p>
                              <p className="text-[11px] text-slate-400">By {story.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold">{story.genre}</td>
                        <td className="p-4">
                          <p>{story.reads.toLocaleString()} reads</p>
                          <p className="text-[11px] text-slate-400">{story.votes.toLocaleString()} votes</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {story.isOriginal && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-600">
                                House Original
                              </span>
                            )}
                            {story.isEditorsPick && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-600">
                                Editor's Pick
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedStoryToReassign(story)}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Move Author
                            </button>
                            <button 
                              onClick={() => toggleHouseOriginal(story.id)}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {story.isOriginal ? 'Unset Original' : 'Make Original'}
                            </button>
                            <button 
                              onClick={() => toggleFeatureStory(story.id)}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {story.isEditorsPick ? 'Unfeature' : 'Feature'}
                            </button>
                            <button 
                              onClick={() => removeStory(story.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="Delete Story"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MODERATION REPORTS & BULK ACTIONS */}
        {activeTab === 'moderation' && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Flagged Content & Reports Queue</h3>
              {reports.length > 0 && selectedReportIds.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={handleBulkDismissReports} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100">
                    Dismiss Selected ({selectedReportIds.length})
                  </button>
                  <button onClick={handleBulkBanUsers} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700">
                    Ban Users & Purge
                  </button>
                </div>
              )}
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm">Reports queue is completely clear</p>
                <p className="text-xs text-slate-400">All community comments, serials, and threads comply with platform guidelines.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedReportIds.includes(report.id)}
                        onChange={() => {
                          setSelectedReportIds(prev => prev.includes(report.id) ? prev.filter(id => id !== report.id) : [...prev, report.id]);
                        }}
                        className="w-4 h-4 accent-purple-600 mt-1"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-600">
                            {report.targetType}
                          </span>
                          <span className="font-bold text-sm">Reported: @{report.reportedUser}</span>
                          <span className="text-[10px] text-slate-400">• {report.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Reason: {report.reason}</p>
                        <p className="text-[11px] text-slate-400">Context: {report.story}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleResolveReport(report.id, 'Warned User')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Warn
                      </button>
                      <button 
                        onClick={() => handleResolveReport(report.id, 'Suspended User (7 Days)')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600"
                      >
                        Suspend
                      </button>
                      <button 
                        onClick={() => handleResolveReport(report.id, 'Permanently Banned & Removed')}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
                      >
                        Ban & Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USERS & AUTHORS DIRECTORY (Scope 8) */}
        {activeTab === 'users' && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">User Directory & Author Accounts</h3>
              <span className="text-xs text-slate-400">Click Masquerade to test experience as any user</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Followers</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold">
                        <p className="text-slate-900 dark:text-white">@{u.username}</p>
                        <p className="text-[11px] text-slate-400">{u.name}</p>
                      </td>
                      <td className="p-4 text-slate-500">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                          u.role === 'author' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">{u.followers.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleMasquerade(u)}
                            className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 font-bold text-[10px] hover:underline"
                            title="Masquerade as user"
                          >
                            Masquerade
                          </button>
                          <button 
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              u.status === 'active' ? 'text-rose-500 border border-rose-200 hover:bg-rose-50' : 'text-emerald-500 border border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GENRES */}
        {activeTab === 'genres' && (
          <div className="mt-8 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <h3 className="font-bold text-base">Active Story Genres ({genres.length})</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {genres.map(g => (
                  <div key={g.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs">{g.name}</h4>
                      <p className="text-[10px] text-slate-400">/{g.slug} • {g.count} titles</p>
                    </div>
                    <button 
                      onClick={() => {
                        setGenres(prev => prev.filter(item => item.id !== g.id));
                        addAuditLog("Genre Removed", g.name);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Add New Genre</h3>
              <form onSubmit={handleAddGenre} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Genre Display Name</label>
                  <input 
                    type="text" 
                    value={newGenreName} 
                    onChange={e => setNewGenreName(e.target.value)} 
                    placeholder="e.g. Cyberpunk Romance"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">URL Slug (optional)</label>
                  <input 
                    type="text" 
                    value={newGenreSlug} 
                    onChange={e => setNewGenreSlug(e.target.value)} 
                    placeholder="e.g. cyberpunk-romance"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Save Genre
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: AUTHOR PERSONA CREATOR (Scope 5) */}
        {activeTab === 'authors' && (
          <div className="mt-8 max-w-xl bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h3 className="font-black text-lg">Create Author Profile Without User Login</h3>
              <p className="text-xs text-slate-400 mt-1">
                Admin-curated author personas used to publish house stories, translated works, or historical serials.
              </p>
            </div>

            {authorCreatedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Author persona created and added to masquerade list!
              </div>
            )}

            <form onSubmit={handleCreateAuthorProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Author Persona Pen Name</label>
                <input 
                  type="text" 
                  value={fakeAuthorName} 
                  onChange={e => setFakeAuthorName(e.target.value)} 
                  placeholder="e.g. StoryVault Archives" 
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Author Biography</label>
                <textarea 
                  rows={3}
                  value={fakeAuthorBio} 
                  onChange={e => setFakeAuthorBio(e.target.value)} 
                  placeholder="Curated serialized classics and editorial originals produced by our staff."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                Create Persona Profile
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: BLOG EDITOR (Scope 5 & Scope 6: create, edit, schedule and delete posts, with SEO fields) */}
        {activeTab === 'blog' && (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-black text-lg">Admin Blog & Editorial Publisher</h3>
              <p className="text-xs text-slate-400 mt-1">Draft, schedule, and publish official platform articles with integrated SEO metadata.</p>
            </div>

            {blogSavedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Article published and visible on /blog!
              </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Blog Form */}
              <form onSubmit={handlePublishBlogPost} className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Article Title</label>
                  <input 
                    type="text" 
                    value={blogTitle} 
                    onChange={e => setBlogTitle(e.target.value)} 
                    placeholder="e.g. 5 Rules for Pacing Serialized Plot Twists"
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-bold text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Category</label>
                    <select 
                      value={blogCategory}
                      onChange={e => setBlogCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                    >
                      <option value="Writing Craft">Writing Craft</option>
                      <option value="Platform Updates">Platform Updates</option>
                      <option value="Author Spotlight">Author Spotlight</option>
                      <option value="Contest News">Contest News</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Author Byline</label>
                    <input 
                      type="text" 
                      value={blogAuthor} 
                      onChange={e => setBlogAuthor(e.target.value)} 
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Cover Image URL</label>
                  <input 
                    type="url" 
                    value={blogCover} 
                    onChange={e => setBlogCover(e.target.value)} 
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Scheduled Release Date (Optional)</label>
                  <input 
                    type="date" 
                    value={blogScheduleDate} 
                    onChange={e => setBlogScheduleDate(e.target.value)} 
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Article Excerpt (SEO Meta Description)</label>
                  <textarea 
                    rows={3}
                    value={blogExcerpt} 
                    onChange={e => setBlogExcerpt(e.target.value)} 
                    placeholder="Short summary displayed in Google search results and blog feeds..."
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Publish / Schedule Editorial Post
                </button>
              </form>

              {/* Existing Blog Posts List */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Published Articles ({blogPosts.length})</h4>
                <div className="space-y-3">
                  {blogPosts.map(post => (
                    <div key={post.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 uppercase">{post.category}</span>
                        <h5 className="font-bold mt-0.5 line-clamp-1">{post.title}</h5>
                        <p className="text-[11px] text-slate-400">By {post.author} • {post.date}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setBlogPosts(prev => prev.filter(p => p.id !== post.id));
                          addAuditLog("Blog Post Deleted", post.title);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CONTESTS & FANDOM GROUPS (Scope 8) */}
        {activeTab === 'contests' && (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-black text-lg">Contests & Fandom Spaces Manager</h3>
              <p className="text-xs text-slate-400 mt-1">Create Watty-style annual awards competitions and monitor reader community discussion spaces.</p>
            </div>

            {contestSavedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Contest competition created and open for submissions!
              </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Contest Form */}
              <form onSubmit={handleCreateContest} className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <h4 className="font-bold text-sm uppercase text-slate-400 tracking-wider">Launch New Writing Contest</h4>
                
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Contest Title</label>
                  <input 
                    type="text" 
                    value={contestTitle} 
                    onChange={e => setContestTitle(e.target.value)} 
                    placeholder="e.g. The Neon Horizon Cyberpunk Awards 2026"
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Submission Deadline</label>
                    <input 
                      type="text" 
                      value={contestDeadline} 
                      onChange={e => setContestDeadline(e.target.value)} 
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Prizes & Grants</label>
                    <input 
                      type="text" 
                      value={contestPrize} 
                      onChange={e => setContestPrize(e.target.value)} 
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Eligible Categories (comma-separated)</label>
                  <input 
                    type="text" 
                    value={contestCategories} 
                    onChange={e => setContestCategories(e.target.value)} 
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Publish Writing Contest
                </button>
              </form>

              {/* Active Contests List */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Active Competitions ({contests.length})</h4>
                <div className="space-y-3">
                  {contests.map(c => (
                    <div key={c.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">{c.status.toUpperCase()}</span>
                        <span className="text-slate-400 text-[10px]">Deadline: {c.deadline}</span>
                      </div>
                      <h5 className="font-bold text-sm">{c.title}</h5>
                      <p className="text-slate-500 text-[11px]">{c.prize}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: HOMEPAGE SECTIONS & BANNERS (Scope 8) */}
        {activeTab === 'homepage' && (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-black text-lg">Homepage Sections & Banners Manager</h3>
              <p className="text-xs text-slate-400 mt-1">Toggle the visibility of any section on the public homepage and edit announcement banners.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Sections Toggles */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Section Visibility Toggles</h4>
                {Object.keys(homepageSections).map((secKey) => (
                  <div key={secKey} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                    <span className="font-semibold capitalize">{secKey.replace(/([A-Z])/g, ' $1')}</span>
                    <input 
                      type="checkbox"
                      checked={homepageSections[secKey]}
                      onChange={(e) => {
                        setHomepageSections(prev => ({ ...prev, [secKey]: e.target.checked }));
                        addAuditLog(`Homepage Section Toggled (${secKey})`, e.target.checked ? "Enabled" : "Disabled");
                      }}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Top Banner & Branding Editor */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Announcement Banner Text</h4>
                <textarea 
                  rows={3}
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none font-medium"
                />
                <button 
                  onClick={() => {
                    addAuditLog("Announcement Banner Updated", bannerText);
                    alert('Announcement banner updated!');
                  }}
                  className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Save Banner
                </button>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Site Brand Asset Paths</h4>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Logo URL</label>
                    <input 
                      type="text" 
                      value={siteLogoUrl} 
                      onChange={e => setSiteLogoUrl(e.target.value)} 
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: EMAIL TEMPLATES (Scope 8) */}
        {activeTab === 'emails' && (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-black text-lg">Automated Email Templates</h3>
              <p className="text-xs text-slate-400 mt-1">Configure subjects and message bodies sent during user registration, new chapter drops, and report alerts.</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-2">
                {[
                  { key: 'welcome', label: "Welcome & Email Verification" },
                  { key: 'newChapter', label: "New Chapter Alert to Followers" },
                  { key: 'reportAlert', label: "Admin Moderation Alert" }
                ].map(item => (
                  <button 
                    key={item.key}
                    onClick={() => setSelectedTemplateKey(item.key)}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all ${
                      selectedTemplateKey === item.key ? 'bg-purple-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                {templateSavedNotice && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Email template saved and synced!
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Email Subject Line</label>
                  <input 
                    type="text" 
                    value={emailTemplates[selectedTemplateKey].subject}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmailTemplates(prev => ({
                        ...prev,
                        [selectedTemplateKey]: { ...prev[selectedTemplateKey], subject: val }
                      }));
                    }}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Email Body (Supports Dynamic Placeholders)</label>
                  <textarea 
                    rows={8}
                    value={emailTemplates[selectedTemplateKey].body}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmailTemplates(prev => ({
                        ...prev,
                        [selectedTemplateKey]: { ...prev[selectedTemplateKey], body: val }
                      }));
                    }}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono outline-none leading-relaxed"
                  />
                </div>

                <button 
                  onClick={() => {
                    addAuditLog(`Email Template Updated (${selectedTemplateKey})`, emailTemplates[selectedTemplateKey].subject);
                    setTemplateSavedNotice(true);
                    setTimeout(() => setTemplateSavedNotice(false), 2000);
                  }}
                  className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Save Email Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SEO & SOCIALS (Scope 8) */}
        {activeTab === 'seo' && (
          <div className="mt-8 max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h3 className="font-black text-lg">Global SEO & Social Metadata</h3>
              <p className="text-xs text-slate-400 mt-1">Configure global meta tags, OpenGraph preview cards, and social channels.</p>
            </div>

            {seoSavedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> SEO configuration updated!
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Global Meta Title</label>
                <input 
                  type="text" 
                  value={seoSettings.metaTitle} 
                  onChange={e => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Meta Description</label>
                <textarea 
                  rows={3}
                  value={seoSettings.metaDescription} 
                  onChange={e => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">OpenGraph Image URL (Social Share Card)</label>
                <input 
                  type="url" 
                  value={seoSettings.ogImage} 
                  onChange={e => setSeoSettings({ ...seoSettings, ogImage: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Twitter / X Handle</label>
                  <input 
                    type="text" 
                    value={seoSettings.twitterHandle} 
                    onChange={e => setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })} 
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Discord Community Invite</label>
                  <input 
                    type="text" 
                    value={seoSettings.discordUrl} 
                    onChange={e => setSeoSettings({ ...seoSettings, discordUrl: e.target.value })} 
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  addAuditLog("SEO & Social Metadata Saved", seoSettings.metaTitle);
                  setSeoSavedNotice(true);
                  setTimeout(() => setSeoSavedNotice(false), 2000);
                }}
                className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Save SEO Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 11: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-base">Immutable Admin Security & Audit Trail</h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target / Entity</th>
                    <th className="p-4">Admin Operator</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{log.target}</td>
                      <td className="p-4 font-semibold">{log.admin}</td>
                      <td className="p-4 text-right text-slate-400">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 12: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="mt-8 max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="font-black text-lg">Platform Settings & Email Alerts</h3>
              <p className="text-xs text-slate-400 mt-1">Configure publishing rules, items per page, and moderation notifications</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm">Author Self-Publishing</h4>
                  <p className="text-slate-400 mt-0.5">When enabled, any registered user can publish stories without admin intervention.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={authorSelfPublishing} 
                  onChange={e => {
                    setAuthorSelfPublishing(e.target.checked);
                    addAuditLog("Setting Changed: Author Self-Publishing", e.target.checked ? "Enabled" : "Disabled");
                  }}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm">Require Pre-Publication Review</h4>
                  <p className="text-slate-400 mt-0.5">Hold new author stories in a pending review queue before appearing on the public browse library.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={requireStoryApproval} 
                  onChange={e => {
                    setRequireStoryApproval(e.target.checked);
                    addAuditLog("Setting Changed: Story Review Requirement", e.target.checked ? "Enabled" : "Disabled");
                  }}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm">Enforce 18+ Mature Age Gate</h4>
                  <p className="text-slate-400 mt-0.5">Prompt readers with an interactive confirmation modal before unlocking mature stories.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={ageGateEnforced} 
                  onChange={e => {
                    setAgeGateEnforced(e.target.checked);
                    addAuditLog("Setting Changed: Age Gate Enforcement", e.target.checked ? "Enforced" : "Relaxed");
                  }}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm">Email Alerts for Reports & Contact Messages</h4>
                  <p className="text-slate-400 mt-0.5">Send instant email alerts to administrator inbox when new abuse reports or contact forms are filed.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlertsForReports} 
                  onChange={e => {
                    setEmailAlertsForReports(e.target.checked);
                    addAuditLog("Setting Changed: Email Alerts", e.target.checked ? "Enabled" : "Disabled");
                  }}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Default Cards per Page</label>
                  <input 
                    type="number" 
                    value={defaultItemsPerPage} 
                    onChange={e => setDefaultItemsPerPage(Number(e.target.value))} 
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Default Admin Table Rows</label>
                  <input 
                    type="number" 
                    value={defaultAdminRows} 
                    onChange={e => setDefaultAdminRows(Number(e.target.value))} 
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Reassign Author Modal */}
      {selectedStoryToReassign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-base">Reassign Story Author</h3>
            <p className="text-xs text-slate-400">
              Moving <strong className="text-slate-900 dark:text-white">'{selectedStoryToReassign.title}'</strong> to another creator profile:
            </p>
            <form onSubmit={handleReassignAuthor} className="space-y-3 text-xs">
              <input 
                type="text" 
                value={newAuthorName} 
                onChange={e => setNewAuthorName(e.target.value)} 
                placeholder="New Author Name or Editorial Label"
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none font-bold"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedStoryToReassign(null)}
                  className="px-4 py-2 rounded-full border text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
