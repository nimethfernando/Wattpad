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
  UserCheck
} from 'lucide-react';

export default function AdminPanel() {
  const { stories, setStories, genres, setGenres, reports, setReports, auditLogs, addAuditLog, user, t } = useApp();
  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'moderation' | 'genres' | 'authors' | 'audit' | 'settings'

  // Settings State
  const [authorSelfPublishing, setAuthorSelfPublishing] = useState(true);
  const [requireStoryApproval, setRequireStoryApproval] = useState(false);
  const [defaultItemsPerPage, setDefaultItemsPerPage] = useState(9);
  const [ageGateEnforced, setAgeGateEnforced] = useState(true);

  // Genre Form
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreSlug, setNewGenreSlug] = useState('');

  // Author Profile Creator (without login)
  const [fakeAuthorName, setFakeAuthorName] = useState('');
  const [fakeAuthorBio, setFakeAuthorBio] = useState('');
  const [authorCreatedNotice, setAuthorCreatedNotice] = useState(false);

  // Reassign story modal / state
  const [selectedStoryToReassign, setSelectedStoryToReassign] = useState(null);
  const [newAuthorName, setNewAuthorName] = useState('');

  // Actions
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
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Avora Library Admin Console</h1>
              <p className="text-xs text-slate-400">Content moderation, author masquerading, originals curation, and audit logging</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'stories' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Stories & House Originals ({stories.length})
          </button>
          <button 
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'moderation' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Moderation Reports ({reports.length})
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
            Author Persona Creator
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Admin Audit Log ({auditLogs.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'settings' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Platform Settings & Email Alerts
          </button>
        </div>

        {/* TAB 1: STORIES & ORIGINALS MANAGEMENT */}
        {activeTab === 'stories' && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Published Serial Novels</h3>
              <Link href="/write" className="px-4 py-2 rounded-full bg-brand-500 text-white text-xs font-bold hover:bg-brand-600">
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
                    {stories.map(story => (
                      <tr key={story.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
                              {story.isOriginal ? 'Remove Original' : 'Make Original'}
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

        {/* TAB 2: MODERATION REPORTS */}
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
                {reports.map(report => (
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
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={() => handleResolveReport(report.id, "Warned User")}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600"
                      >
                        Warn User
                      </button>
                      <button 
                        onClick={() => handleResolveReport(report.id, "Banned User & Removed Content")}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
                      >
                        Ban User & Take Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GENRE MANAGEMENT */}
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
                <label className="block text-xs font-bold text-slate-400 mb-1">Slug URL</label>
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
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0"
              >
                + Add Genre
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {genres.map(g => (
                <div key={g.id} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold">{g.name}</span>
                  <span className="text-[10px] text-slate-400">{g.count} titles</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUTHOR PERSONA CREATOR */}
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
                className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Create Author Persona
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: ADMIN AUDIT LOG (Scope 7) */}
        {activeTab === 'audit' && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-base">Security & Admin Audit Trail</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {auditLogs.map(log => (
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
          </div>
        )}

        {/* TAB 6: SITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="mt-8 max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
            <h3 className="font-black text-lg">Site Settings & Policies</h3>

            <div className="space-y-4">
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
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 font-bold outline-none"
                >
                  <option value={9}>9 cards</option>
                  <option value={12}>12 cards</option>
                  <option value={20}>20 cards</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  addAuditLog("Site Settings Updated", "Author Approval & Items Per Page");
                  alert('Settings updated successfully!');
                }}
                className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Save Platform Settings
              </button>
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
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
