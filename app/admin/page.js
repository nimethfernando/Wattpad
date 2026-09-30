'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';
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
  CreditCard,
  RefreshCw,
  DollarSign,
  Search,
  Sparkles,
  Database,
  Server,
  Send,
  Activity
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
    registeredUsers, 
    updateUserRole, 
    toggleUserStatus, 
    deleteUser, 
    addUser, 
    transactions, 
    refundTransaction, 
    featureFlags, 
    togglePaidFeatures, 
    updateFeatureFlags,
    announcementBanner,
    setAnnouncementBanner,
    user, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'users' | 'moderation' | 'payments' | 'genres' | 'authors' | 'audit' | 'settings'

  // Pagination States
  const [storyPage, setStoryPage] = useState(1);
  const [storyPageSize, setStoryPageSize] = useState(6);
  const [storySearch, setStorySearch] = useState('');

  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(5);
  const [userSearch, setUserSearch] = useState('');

  const [reportPage, setReportPage] = useState(1);
  const [reportPageSize, setReportPageSize] = useState(5);

  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(5);
  const [txSearch, setTxSearch] = useState('');

  const [genrePage, setGenrePage] = useState(1);
  const [genrePageSize, setGenrePageSize] = useState(8);

  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(6);

  // Settings State
  const [authorSelfPublishing, setAuthorSelfPublishing] = useState(true);
  const [requireStoryApproval, setRequireStoryApproval] = useState(false);
  const [defaultItemsPerPage, setDefaultItemsPerPage] = useState(9);
  const [ageGateEnforced, setAgeGateEnforced] = useState(true);

  // Genre Form
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreSlug, setNewGenreSlug] = useState('');

  // Author Profile Creator (editorial persona)
  const [fakeAuthorName, setFakeAuthorName] = useState('');
  const [fakeAuthorBio, setFakeAuthorBio] = useState('');
  const [authorCreatedNotice, setAuthorCreatedNotice] = useState(false);

  // New User Creation Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('reader');

  // Reassign story modal / state
  const [selectedStoryToReassign, setSelectedStoryToReassign] = useState(null);
  const [newAuthorName, setNewAuthorName] = useState('');

  // Database & Email Notification Dispatcher State
  const [dbInfo, setDbInfo] = useState({ host: '162.241.148.163:3306', database: 'ditya0a7_yourcpaneluser_gbncircle', success: true });
  const [smtpInfo, setSmtpInfo] = useState({ user: 'gnbmailsender@gmail.com', success: true });
  const [testEmailRecipient, setTestEmailRecipient] = useState('gnbmailsender@gmail.com');
  const [testEmailSubject, setTestEmailSubject] = useState('New Serial Chapter Alert: The Shadow Alchemist');
  const [testEmailTitle, setTestEmailTitle] = useState('Chapter 3 Has Been Serialized!');
  const [testEmailMessage, setTestEmailMessage] = useState('Elena Vance just published Chapter 3 of The Shadow Alchemist on Avora Library. Click below to continue reading and leave your reactions.');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [loadingEmailLogs, setLoadingEmailLogs] = useState(false);

  const fetchEmailLogsAndStatus = async () => {
    setLoadingEmailLogs(true);
    try {
      const res = await fetch('/api/email/test');
      const data = await res.json();
      if (data.success) {
        if (data.database) setDbInfo(data.database);
        if (data.email) setSmtpInfo(data.email);
        if (data.recentLogs) setEmailLogs(data.recentLogs);
        if (data.recentContacts) setContactSubmissions(data.recentContacts);
      }
    } catch (e) {
      console.error("Error fetching email logs/status:", e);
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setTestEmailSending(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailRecipient,
          subject: testEmailSubject,
          title: testEmailTitle,
          message: testEmailMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailResult({ type: 'success', message: `Email dispatched successfully to ${testEmailRecipient} (Message ID: ${data.messageId || 'OK'})` });
        fetchEmailLogsAndStatus();
      } else {
        setTestEmailResult({ type: 'error', message: data.error || 'Failed to dispatch email' });
      }
    } catch (e) {
      setTestEmailResult({ type: 'error', message: e.message || 'Network error while dispatching email' });
    } finally {
      setTestEmailSending(false);
    }
  };

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

  const handleResolveReport = (reportId, actionTaken) => {
    const r = reports.find(item => item.id === reportId);
    if (r) addAuditLog(`Moderation Action: ${actionTaken}`, `Target: ${r.reportedUser} (${r.reason})`);
    setReports(prev => prev.filter(item => item.id !== reportId));
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
    addAuditLog("Author Persona Created", fakeAuthorName.trim());
    setAuthorCreatedNotice(true);
    setTimeout(() => {
      setAuthorCreatedNotice(false);
      setFakeAuthorName('');
      setFakeAuthorBio('');
    }, 2500);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole
    });
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  // Filtered & Paginated Lists
  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(storySearch.toLowerCase()) || 
    s.author.toLowerCase().includes(storySearch.toLowerCase()) ||
    s.genre.toLowerCase().includes(storySearch.toLowerCase())
  );
  const paginatedStories = filteredStories.slice((storyPage - 1) * storyPageSize, storyPage * storyPageSize);

  const filteredUsers = (registeredUsers || []).filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice((userPage - 1) * userPageSize, userPage * userPageSize);

  const filteredTransactions = (transactions || []).filter(t =>
    t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.author?.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.cardBrand?.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.type?.toLowerCase().includes(txSearch.toLowerCase())
  );
  const paginatedTransactions = filteredTransactions.slice((txPage - 1) * txPageSize, txPage * txPageSize);

  const paginatedReports = reports.slice((reportPage - 1) * reportPageSize, reportPage * reportPageSize);
  const paginatedGenres = genres.slice((genrePage - 1) * genrePageSize, genrePage * genrePageSize);
  const paginatedAuditLogs = auditLogs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Avora Library Admin Console</h1>
              <p className="text-xs text-slate-400">Content moderation, financial transactions, user roles, feature flags, and audit ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
              featureFlags?.enablePaidFeatures 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            }`}>
              Soft-Launch: {featureFlags?.enablePaidFeatures ? 'Paid Features Enabled' : '100% Free Mode'}
            </span>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'stories' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Stories & Originals ({stories.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            User Moderation ({registeredUsers?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'moderation' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Reports Queue ({reports.length})
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'payments' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Payments & VIP Ledger ({transactions?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('genres')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'genres' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Genre Library ({genres.length})
          </button>
          <button 
            onClick={() => setActiveTab('authors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'authors' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Author Persona
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'settings' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Platform Settings & Feature Flags
          </button>
          <button 
            onClick={() => {
              setActiveTab('email_notifications');
              fetchEmailLogsAndStatus();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'email_notifications' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            DB & Email Dispatcher
          </button>
        </div>

        {/* TAB 1: STORIES & ORIGINALS MANAGEMENT */}
        {activeTab === 'stories' && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by title, author, genre..." 
                  value={storySearch} 
                  onChange={(e) => {
                    setStorySearch(e.target.value);
                    setStoryPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                />
              </div>
              <Link href="/write" className="px-4 py-2 rounded-full bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors">
                + Write Editorial Story
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Title & Author</th>
                      <th className="p-4">Genre</th>
                      <th className="p-4">Reads / Votes</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedStories.map(story => (
                      <tr key={story.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={story.cover} alt={story.title} className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                            <div>
                              <Link href={`/story/${story.slug}`} className="font-bold text-slate-900 dark:text-white hover:text-brand-500 line-clamp-1">
                                {story.title}
                              </Link>
                              <span className="text-[11px] text-slate-400 block">By {story.author}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                          {story.genre}
                        </td>
                        <td className="p-4 text-slate-500">
                          <div>{(story.reads || 0).toLocaleString()} reads</div>
                          <div className="text-[10px] text-slate-400">{(story.votes || 0).toLocaleString()} votes</div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {story.isOriginal && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                Original
                              </span>
                            )}
                            {story.isEditorsPick && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                Editor's Pick
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button 
                              onClick={() => setSelectedStoryToReassign(story)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              Move Author
                            </button>
                            <button 
                              onClick={() => toggleHouseOriginal(story.id)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              {story.isOriginal ? 'Revoke Original' : 'Make Original'}
                            </button>
                            <button 
                              onClick={() => toggleFeatureStory(story.id)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              {story.isEditorsPick ? 'Unfeature' : 'Feature'}
                            </button>
                            <button 
                              onClick={() => removeStory(story.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
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

              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={storyPage}
                  totalItems={filteredStories.length}
                  pageSize={storyPageSize}
                  onPageChange={setStoryPage}
                  onPageSizeChange={(newSize) => {
                    setStoryPageSize(newSize);
                    setStoryPage(1);
                  }}
                  pageSizeOptions={[6, 12, 24]}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER & AUTHOR MODERATION */}
        {activeTab === 'users' && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search users by name, username, email..." 
                  value={userSearch} 
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                />
              </div>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                + Register New User
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Stories</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                            <span className="text-[11px] text-slate-400 block">@{u.username} • {u.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <select 
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs outline-none cursor-pointer"
                          >
                            <option value="reader">Reader</option>
                            <option value="author">Author</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            u.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                          {u.storiesCount || 0}
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {u.joinedDate || 'Recently'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => toggleUserStatus(u.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                u.status === 'active' 
                                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' 
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete user ${u.name}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Delete User"
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

              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={userPage}
                  totalItems={filteredUsers.length}
                  pageSize={userPageSize}
                  onPageChange={setUserPage}
                  onPageSizeChange={(newSize) => {
                    setUserPageSize(newSize);
                    setUserPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MODERATION REPORTS */}
        {activeTab === 'moderation' && (
          <div className="mt-8 space-y-4">
            <h3 className="font-bold text-base">Flagged Content & User Reports Queue</h3>
            {reports.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm">Reports queue is clear</p>
                <p className="text-xs text-slate-400">All community comments and stories meet platform standards.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedReports.map(report => (
                  <div key={report.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                          {report.targetType}
                        </span>
                        <span className="text-xs text-slate-400">Target: {report.story}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Reason: {report.reason}</h4>
                      <p className="text-xs text-slate-500">Reported User: @{report.reportedUser}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button 
                        onClick={() => handleResolveReport(report.id, "Dismissed")}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={() => handleResolveReport(report.id, "Warned User")}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 cursor-pointer"
                      >
                        Warn User
                      </button>
                      <button 
                        onClick={() => handleResolveReport(report.id, "Banned User & Removed Content")}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Ban User & Take Down
                      </button>
                    </div>
                  </div>
                ))}

                <Pagination
                  currentPage={reportPage}
                  totalItems={reports.length}
                  pageSize={reportPageSize}
                  onPageChange={setReportPage}
                  onPageSizeChange={(newSize) => {
                    setReportPageSize(newSize);
                    setReportPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS & VIP LEDGER */}
        {activeTab === 'payments' && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search transactions by author, card, type..." 
                  value={txSearch} 
                  onChange={(e) => {
                    setTxSearch(e.target.value);
                    setTxPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Total Processed:</span>
                <span className="text-xs font-extrabold text-emerald-500">
                  ${(transactions || []).filter(t => t.status === 'succeeded').reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono text-[11px] text-slate-500">
                          {tx.id}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{tx.description}</span>
                          {tx.author && <span className="text-[11px] text-slate-400">Recipient: {tx.author}</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs capitalize">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span>{tx.cardBrand || 'Card'} •••• {tx.cardLast4 || '4242'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                          ${tx.amount?.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            tx.status === 'succeeded' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                              : tx.status === 'refunded'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {tx.date}
                        </td>
                        <td className="p-4 text-right">
                          {tx.status === 'succeeded' && (
                            <button
                              onClick={() => {
                                if (confirm(`Issue full refund of $${tx.amount.toFixed(2)} for ${tx.id}?`)) {
                                  refundTransaction(tx.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10px] font-bold cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={txPage}
                  totalItems={filteredTransactions.length}
                  pageSize={txPageSize}
                  onPageChange={setTxPage}
                  onPageSizeChange={(newSize) => {
                    setTxPageSize(newSize);
                    setTxPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GENRE MANAGEMENT */}
        {activeTab === 'genres' && (
          <div className="mt-8 space-y-6">
            <form onSubmit={handleAddGenre} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-400 mb-1">New Genre Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cyberpunk"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-400 mb-1">Slug (URL Path)</label>
                <input 
                  type="text" 
                  placeholder="e.g. cyberpunk"
                  value={newGenreSlug}
                  onChange={(e) => setNewGenreSlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                + Add Genre
              </button>
            </form>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-sm mb-4">Current Genre Catalog ({genres.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paginatedGenres.map(g => (
                  <div key={g.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{g.name}</span>
                      <span className="text-[10px] text-slate-400">/{g.slug}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setGenres(prev => prev.filter(item => item.id !== g.id));
                        addAuditLog("Genre Deleted", g.name);
                      }}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Delete Genre"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Pagination
                  currentPage={genrePage}
                  totalItems={genres.length}
                  pageSize={genrePageSize}
                  onPageChange={setGenrePage}
                  onPageSizeChange={(newSize) => {
                    setGenrePageSize(newSize);
                    setGenrePage(1);
                  }}
                  pageSizeOptions={[8, 16, 24]}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUTHOR PERSONA CREATOR */}
        {activeTab === 'authors' && (
          <div className="mt-8 max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-lg">Create Author Profile (Editorial Persona)</h3>
            <p className="text-xs text-slate-400">
              Admin can create author profiles (name, photo, bio) without a user login to publish house originals or syndicated titles.
            </p>

            {authorCreatedNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Author persona created! You can now publish stories under this name.
              </div>
            )}

            <form onSubmit={handleCreateAuthorProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Author Public Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lord Byron Classic Vault"
                  value={fakeAuthorName}
                  onChange={(e) => setFakeAuthorName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Biography / Editorial Blurb</label>
                <textarea 
                  rows={3}
                  placeholder="Short bio shown on published stories and chapter headers..."
                  value={fakeAuthorBio}
                  onChange={(e) => setFakeAuthorBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
              >
                Create Author Persona
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: ADMIN AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-base">Security & Admin Audit Trail</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedAuditLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-600 block">{log.action}</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.target}</p>
                  </div>
                  <div className="text-right text-slate-400 text-[11px]">
                    <span className="block font-semibold">Actor: {log.admin}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={auditPage}
              totalItems={auditLogs.length}
              pageSize={auditPageSize}
              onPageChange={setAuditPage}
              onPageSizeChange={(newSize) => {
                setAuditPageSize(newSize);
                setAuditPage(1);
              }}
              pageSizeOptions={[6, 12, 24]}
            />
          </div>
        )}

        {/* TAB 8: SITE SETTINGS & FEATURE FLAGS */}
        {activeTab === 'settings' && (
          <div className="mt-8 max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
            <h3 className="font-black text-lg">Site Settings & Soft-Launch Feature Flags</h3>

            <div className="space-y-4">
              {/* Soft Launch Paid Features Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-amber-500/20">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-sm">Enable Paid Features & VIP Passes</h4>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    When off, the platform is 100% free with no paywalls or donation gates. When enabled, tipping and VIP subscription passes become accessible.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={featureFlags?.enablePaidFeatures || false}
                  onChange={togglePaidFeatures}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm">Author Self-Publishing</h4>
                  <p className="text-slate-400 text-[11px]">Allow any registered member to publish chapters immediately without prior approval.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={authorSelfPublishing}
                  onChange={(e) => setAuthorSelfPublishing(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm">Mandatory Age Gate for Mature Content (18+)</h4>
                  <p className="text-slate-400 text-[11px]">Enforce age confirmation barrier before reading chapters with mature ratings.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={ageGateEnforced}
                  onChange={(e) => setAgeGateEnforced(e.target.checked)}
                  className="w-5 h-5 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <h4 className="font-bold text-sm">Items Per Page (Catalog Pagination)</h4>
                  <p className="text-slate-400 text-[11px]">Default cards per page on Browse and Admin lists (Default 9).</p>
                </div>
                <select 
                  value={defaultItemsPerPage}
                  onChange={(e) => setDefaultItemsPerPage(Number(e.target.value))}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 font-bold outline-none cursor-pointer"
                >
                  <option value={9}>9 cards</option>
                  <option value={12}>12 cards</option>
                  <option value={20}>20 cards</option>
                </select>
              </div>

              {/* Site Announcements Banner Manager */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <h4 className="font-bold text-sm">Site Announcements Banner Manager</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-bold text-slate-400">Display:</span>
                    <input 
                      type="checkbox"
                      checked={announcementBanner?.active || false}
                      onChange={(e) => setAnnouncementBanner(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 accent-brand-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Banner Announcement Text</label>
                    <input 
                      type="text" 
                      value={announcementBanner?.text || ''}
                      onChange={(e) => setAnnouncementBanner(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="e.g. 🏆 Annual Watty Writing Awards are now live!"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Link Label</label>
                      <input 
                        type="text" 
                        value={announcementBanner?.linkText || ''}
                        onChange={(e) => setAnnouncementBanner(prev => ({ ...prev, linkText: e.target.value }))}
                        placeholder="e.g. Learn More →"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Link URL</label>
                      <input 
                        type="text" 
                        value={announcementBanner?.linkUrl || ''}
                        onChange={(e) => setAnnouncementBanner(prev => ({ ...prev, linkUrl: e.target.value }))}
                        placeholder="e.g. /contests"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={announcementBanner?.dismissible || false}
                        onChange={(e) => setAnnouncementBanner(prev => ({ ...prev, dismissible: e.target.checked }))}
                        className="w-4 h-4 accent-brand-500 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-400">Allow users to dismiss the banner</span>
                    </label>

                    <button 
                      type="button"
                      onClick={() => {
                        addAuditLog("Announcement Banner Updated", announcementBanner?.text || 'Updated');
                        alert('Announcement banner updated and published live!');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Publish Banner
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  addAuditLog("Site Settings Updated", "Author Approval & Items Per Page");
                  alert('Settings updated successfully!');
                }}
                className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
              >
                Save Platform Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: MARIADB & GMAIL SMTP NOTIFICATION CENTER */}
        {activeTab === 'email_notifications' && (
          <div className="mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-xl flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  MariaDB &amp; Gmail SMTP Notification Dispatcher
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time database integration and automated reader notification emails via secure SMTP.
                </p>
              </div>
              <button
                onClick={fetchEmailLogsAndStatus}
                disabled={loadingEmailLogs}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEmailLogs ? 'animate-spin' : ''}`} />
                {loadingEmailLogs ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: MariaDB */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">MariaDB Database</h4>
                      <p className="text-[11px] text-slate-400">cPanel Production Cluster</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online &amp; Connected
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Host Endpoint:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{dbInfo.host || '162.241.148.163:3306'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Database Name:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{dbInfo.database || 'ditya0a7_yourcpaneluser_gbncircle'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Managed Tables:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">avora_notifications, avora_email_logs, avora_contact_submissions, avora_subscribers</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Gmail SMTP */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">Gmail SMTP Service</h4>
                      <p className="text-[11px] text-slate-400">Nodemailer TLS Dispatcher</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    SMTP Verified
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Sender Account:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{smtpInfo.user || 'gnbmailsender@gmail.com'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Encryption:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">STARTTLS / SSL Encrypted</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Authentication:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Google App Password Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Notification Dispatcher Console */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-purple-600" />
                    Dispatch Notification &amp; Email
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Broadcast a notification into the MariaDB database and dispatch an HTML email via Gmail SMTP.
                  </p>
                </div>

                {/* Preset Templates */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400 font-semibold">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmailSubject('New Chapter Alert: The Shadow Alchemist');
                      setTestEmailTitle('Chapter 3 Has Been Serialized!');
                      setTestEmailMessage('Elena Vance just published Chapter 3 of The Shadow Alchemist on Avora Library. Click below to dive back in.');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-[11px]"
                  >
                    📖 Chapter Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmailSubject('Welcome to Avora Library! 📚✨');
                      setTestEmailTitle('Welcome to Avora Library!');
                      setTestEmailMessage('Welcome to our serialized reading and writing community. Discover thousands of stories and connect with passionate authors.');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-[11px]"
                  >
                    🎉 Welcome Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmailSubject('Writing Contest Submissions Open');
                      setTestEmailTitle('The Golden Quill Awards 2026');
                      setTestEmailMessage('Submit your original manuscripts to compete for editorial contracts, feature banners, and author stipends.');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-[11px]"
                  >
                    🏆 Contest Alert
                  </button>
                </div>
              </div>

              {testEmailResult && (
                <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
                  testEmailResult.type === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                  <span>{testEmailResult.message}</span>
                  <button onClick={() => setTestEmailResult(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs ml-4">✕</button>
                </div>
              )}

              <form onSubmit={handleSendTestEmail} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Recipient Email Address</label>
                    <input 
                      type="email" 
                      value={testEmailRecipient} 
                      onChange={(e) => setTestEmailRecipient(e.target.value)} 
                      required
                      placeholder="e.g. reader@example.com"
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Email Subject Line</label>
                    <input 
                      type="text" 
                      value={testEmailSubject} 
                      onChange={(e) => setTestEmailSubject(e.target.value)} 
                      required
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Notification Headline</label>
                  <input 
                    type="text" 
                    value={testEmailTitle} 
                    onChange={(e) => setTestEmailTitle(e.target.value)} 
                    required
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Notification Body &amp; Details</label>
                  <textarea 
                    rows={3}
                    value={testEmailMessage} 
                    onChange={(e) => setTestEmailMessage(e.target.value)} 
                    required
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={testEmailSending}
                    className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                  >
                    <Send className={`w-4 h-4 ${testEmailSending ? 'animate-pulse' : ''}`} />
                    {testEmailSending ? 'Sending Notification Email...' : 'Send Notification Email'}
                  </button>
                </div>
              </form>
            </div>

            {/* MariaDB Email Dispatch History */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-sm">MariaDB Dispatch Logs (avora_email_logs)</h4>
                  <p className="text-[11px] text-slate-400">Audit trail of all system emails sent via Gmail SMTP</p>
                </div>
                <span className="text-xs text-slate-400 font-bold">{emailLogs.length} Logged Dispatches</span>
              </div>

              {emailLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No email dispatches recorded yet. Use the console above to send a notification.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5">Recipient</th>
                        <th className="py-2.5">Subject</th>
                        <th className="py-2.5">Template</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{log.recipient}</td>
                          <td className="py-3 max-w-xs truncate text-slate-600 dark:text-slate-400">{log.subject}</td>
                          <td className="py-3 font-mono text-[11px] text-slate-400">{log.template}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'sent' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Inquiries & Contact Form Submissions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-sm">Helpdesk Inquiries (avora_contact_submissions)</h4>
                  <p className="text-[11px] text-slate-400">Incoming support inquiries and reader tickets stored in MariaDB</p>
                </div>
                <span className="text-xs text-slate-400 font-bold">{contactSubmissions.length} Submissions</span>
              </div>

              {contactSubmissions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No submissions in the database yet. Visitors submitting from /contact will appear here automatically.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Email</th>
                        <th className="py-2.5">Subject</th>
                        <th className="py-2.5">Message Snippet</th>
                        <th className="py-2.5">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {contactSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{sub.name}</td>
                          <td className="py-3 text-slate-500 font-mono text-[11px]">{sub.email}</td>
                          <td className="py-3 font-semibold text-purple-600 dark:text-purple-400">{sub.subject}</td>
                          <td className="py-3 max-w-sm truncate text-slate-600 dark:text-slate-400">{sub.message}</td>
                          <td className="py-3 text-slate-400 text-[11px]">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : 'Just now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Move Story Author Modal */}
      {selectedStoryToReassign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-lg">Reassign Story Author</h3>
            <p className="text-xs text-slate-400">Story: <strong>{selectedStoryToReassign.title}</strong></p>
            <form onSubmit={handleReassignAuthor} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">New Author Name / Editorial House</label>
                <input 
                  type="text" 
                  placeholder="e.g. Avora Library Editorial Desk"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedStoryToReassign(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-lg">Register New Platform User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rachel Adams"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. rachel@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Platform Role</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold outline-none cursor-pointer"
                >
                  <option value="reader">Reader</option>
                  <option value="author">Author</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
                >
                  Register User
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
