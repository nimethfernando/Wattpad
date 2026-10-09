'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';
import { useApp } from '@/context/AppContext';
import { initialCmsConfig } from '@/lib/data';
import { 
  ShieldCheck,
  Lock,
  ShieldAlert,
  X, 
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
  Activity,
  Globe,
  Smartphone,
  QrCode,
  ExternalLink,
  Save,
  RotateCcw,
  Share2,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Building2,
  Upload,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { processImageFile } from '@/lib/imageUtils';

export default function AdminPanel() {
  const { 
    stories, 
    setStories,
    publishStory,
    deleteStory, 
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
    isHydrated,
    openAuthModal,
    openBankDetailsModal,
    t,
    cmsConfig,
    updateCmsConfig,
    resetCmsConfig,
    banUserAndTakeDownContent,
    warnUser,
    dismissReport,
    banUser,
    unbanUser,
    parentalRequests,
    approve18PlusRequest,
    reject18PlusRequest,
    parentalPin,
    setParentalPin
  } = useApp();

  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'users' | 'moderation' | 'payments' | 'genres' | 'authors' | 'audit' | 'settings' | 'email_notifications' | 'cms'
  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'pending' | 'resolved'

  // CMS Content Management State
  const [cmsSubTab, setCmsSubTab] = useState('pwa'); // 'pwa' | 'social' | 'pages'
  const [cmsSelectedPage, setCmsSelectedPage] = useState('about'); // 'about' | 'terms' | 'privacy' | 'guidelines' | 'contact' | 'hero'
  const [cmsForm, setCmsForm] = useState(cmsConfig || initialCmsConfig);
  const [cmsSaveNotice, setCmsSaveNotice] = useState(false);

  useEffect(() => {
    if (cmsConfig) {
      setCmsForm(cmsConfig);
    }
  }, [cmsConfig]);

  const handleSaveCms = () => {
    updateCmsConfig(cmsForm);
    setCmsSaveNotice(true);
    setTimeout(() => {
      setCmsSaveNotice(false);
    }, 3500);
  };

  const handleResetCms = () => {
    if (confirm("Are you sure you want to reset all CMS content to platform factory defaults?")) {
      resetCmsConfig();
      setCmsForm(initialCmsConfig);
      setCmsSaveNotice(true);
      setTimeout(() => {
        setCmsSaveNotice(false);
      }, 3500);
    }
  };

  const previewQrImageUrl = cmsForm?.pwaSection?.qrCodeType === 'custom_image' && cmsForm?.pwaSection?.qrCodeImageUrl
    ? cmsForm.pwaSection.qrCodeImageUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cmsForm?.pwaSection?.qrTargetUrl || 'https://avoralibrary.com')}&margin=10`;

  const updatePwaField = (field, value) => {
    setCmsForm(prev => ({
      ...prev,
      pwaSection: {
        ...(prev?.pwaSection || initialCmsConfig.pwaSection),
        [field]: value
      }
    }));
  };

  const updateSocialChannel = (channelKey, field, value) => {
    setCmsForm(prev => ({
      ...prev,
      socialLinks: {
        ...(prev?.socialLinks || initialCmsConfig.socialLinks),
        [channelKey]: {
          ...(prev?.socialLinks?.[channelKey] || {}),
          [field]: value
        }
      }
    }));
  };

  const updateFooterField = (field, value) => {
    setCmsForm(prev => ({
      ...prev,
      footerConfig: {
        ...(prev?.footerConfig || initialCmsConfig.footerConfig),
        [field]: value
      }
    }));
  };

  const updatePageField = (pageKey, field, value) => {
    setCmsForm(prev => ({
      ...prev,
      pagesContent: {
        ...(prev?.pagesContent || initialCmsConfig.pagesContent),
        [pageKey]: {
          ...(prev?.pagesContent?.[pageKey] || {}),
          [field]: value
        }
      }
    }));
  };

  const updateSectionItem = (pageKey, index, field, value) => {
    setCmsForm(prev => {
      const sections = [...(prev?.pagesContent?.[pageKey]?.sections || [])];
      if (sections[index]) {
        sections[index] = { ...sections[index], [field]: value };
      }
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            sections
          }
        }
      };
    });
  };

  const addSectionItem = (pageKey) => {
    setCmsForm(prev => {
      const currentSections = prev?.pagesContent?.[pageKey]?.sections || [];
      const newSec = {
        heading: `${currentSections.length + 1}. New Policy Clause`,
        content: "Details and terms regarding this policy section."
      };
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            sections: [...currentSections, newSec]
          }
        }
      };
    });
  };

  const removeSectionItem = (pageKey, index) => {
    setCmsForm(prev => {
      const currentSections = prev?.pagesContent?.[pageKey]?.sections || [];
      const updated = currentSections.filter((_, i) => i !== index);
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            sections: updated
          }
        }
      };
    });
  };

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

  // Direct Admin Story Publishing State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSuccessNotice, setPublishSuccessNotice] = useState(null);

  const [pubTitle, setPubTitle] = useState('');
  const [pubSlug, setPubSlug] = useState('');
  const [pubAuthor, setPubAuthor] = useState(user?.name || 'Avora Editorial Desk');
  const [pubAuthorUsername, setPubAuthorUsername] = useState('avora_editorial');
  const [pubAuthorAvatar, setPubAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [pubGenre, setPubGenre] = useState('Fantasy');
  const [pubCover, setPubCover] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
  const [pubDescription, setPubDescription] = useState('');
  const [pubAgeRating, setPubAgeRating] = useState('13+');
  const [pubContentType, setPubContentType] = useState('story'); // 'story' | 'picture_book'
  const [pubLanguage, setPubLanguage] = useState('en');
  const [pubStatus, setPubStatus] = useState('ongoing'); // 'ongoing' | 'completed'
  const [pubMood, setPubMood] = useState('Adventurous');
  const [pubTrope, setPubTrope] = useState('Enemies to Lovers');
  const [pubTags, setPubTags] = useState('fantasy, magic, serialized');
  const [pubIsOriginal, setPubIsOriginal] = useState(true);
  const [pubIsEditorsPick, setPubIsEditorsPick] = useState(false);
  const [pubIsTrending, setPubIsTrending] = useState(false);

  // Initial Chapter / Pages State
  const [pubChapterTitle, setPubChapterTitle] = useState('Chapter 1: The Beginning');
  const [pubChapterBody, setPubChapterBody] = useState('');
  const [pubPages, setPubPages] = useState([
    { id: 1, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', text: 'The chronicle begins in an era of myth and forgotten power...', caption: 'Page 1' }
  ]);

  const coverPresets = [
    { label: 'Fantasy / Magic', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
    { label: 'Romance / Drama', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sci-Fi / Space', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80' },
    { label: 'Kids / Illustrated', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80' },
    { label: 'Mystery / Detective', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Adventure / Quest', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setPubTitle(val);
    const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setPubSlug(generated);
  };

  const handleContentTypeSelect = (type) => {
    setPubContentType(type);
    if (type === 'picture_book') {
      // Suggest kid-friendly rating and category when picture book format is picked
      if (['13+', '16+', '18+'].includes(pubAgeRating)) {
        setPubAgeRating('3+');
      }
      if (pubGenre === 'Fantasy' || !pubGenre) {
        setPubGenre('Kids Books');
      }
      if (pubChapterTitle.includes('Chapter 1')) {
        setPubChapterTitle('Illustrated Edition: Bedtime Adventure');
      }
    }
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;
    try {
      const res = await processImageFile(file, 800, 1067, 0.85);
      setPubCover(res.dataUrl);
    } catch (err) {
      alert(err.message || 'Failed to process cover image.');
    }
  };

  const handleBatchPagesUpload = async (files) => {
    if (!files || files.length === 0) return;
    try {
      const newPages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await processImageFile(file, 1200, 900, 0.85);
        newPages.push({
          id: Date.now() + i + Math.random(),
          image: res.dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          text: ''
        });
      }
      setPubPages(prev => {
        // If only 1 initial placeholder exists, replace it
        if (prev.length === 1 && (!prev[0].text || prev[0].text.includes('chronicle begins in an era'))) {
          return newPages;
        }
        return [...prev, ...newPages];
      });
    } catch (err) {
      alert(err.message || 'Failed to upload picture book images.');
    }
  };

  const handleSinglePageUpload = async (index, file) => {
    if (!file) return;
    try {
      const res = await processImageFile(file, 1200, 900, 0.85);
      setPubPages(prev => prev.map((p, i) => i === index ? { ...p, image: res.dataUrl } : p));
    } catch (err) {
      alert(err.message || 'Failed to upload page illustration.');
    }
  };

  const movePage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= pubPages.length) return;
    setPubPages(prev => {
      const copy = [...prev];
      const item = copy.splice(fromIdx, 1)[0];
      copy.splice(toIdx, 0, item);
      return copy;
    });
  };

  const renderPictureBookPagesManager = () => (
    <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800/60 space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60 dark:border-amber-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Picture Book Pages &amp; Illustrations ({pubPages.length} Pages)
            </h4>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              🧒 Kids Section Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload sequential picture pages from your device or provide image URLs.
          </p>
        </div>

        {/* Upload Multiple Pages Button */}
        <label className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 cursor-pointer transition-all shrink-0">
          <Upload className="w-4 h-4" />
          <span>Upload Pictures from Device</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleBatchPagesUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Pages List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {pubPages.map((page, pIdx) => (
          <div key={page.id || pIdx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-black">
                  Page {pIdx + 1}
                </span>
                {page.caption && (
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                    • {page.caption}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pIdx === 0}
                  onClick={() => movePage(pIdx, pIdx - 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={pIdx === pubPages.length - 1}
                  onClick={() => movePage(pIdx, pIdx + 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                {pubPages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPubPages(prev => prev.filter((_, i) => i !== pIdx))}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer ml-1"
                    title="Remove Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              {/* Thumbnail Preview */}
              <div className="sm:col-span-4 aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative group">
                <img
                  src={page.image}
                  alt={`Page ${pIdx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-1">
                  <Upload className="w-4 h-4" />
                  <span>Change Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSinglePageUpload(pIdx, e.target.files?.[0])}
                  />
                </label>
              </div>

              {/* Page text & caption */}
              <div className="sm:col-span-8 space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-bold text-slate-500">Page Image (URL or Device Upload)</label>
                    <label className="text-[11px] font-bold text-brand-500 hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSinglePageUpload(pIdx, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={page.image}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, image: val } : p));
                    }}
                    placeholder="https://... or upload from device"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Caption / Scene Title (Optional)</label>
                  <input
                    type="text"
                    value={page.caption || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, caption: val } : p));
                    }}
                    placeholder="e.g. Page 1: In the Enchanted Forest"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Page Story Narrative / Dialogue</label>
                  <textarea
                    rows={2}
                    value={page.text || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, text: val } : p));
                    }}
                    placeholder="Story text for this illustrated page..."
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs outline-none border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Page Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setPubPages(prev => [
            ...prev,
            { id: Date.now() + Math.random(), image: pubCover, text: '', caption: `Page ${prev.length + 1}` }
          ])}
          className="px-4 py-2 rounded-xl border border-dashed border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> + Add Another Blank Page
        </button>

        <label className="px-4 py-2 rounded-xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-brand-500" /> + Add More Pictures from Device
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleBatchPagesUpload(e.target.files)}
          />
        </label>
      </div>
    </div>
  );

  const getMinAgeFromRating = (rating) => {
    switch (rating) {
      case '3+': return 3;
      case '7+': return 7;
      case '13+': return 13;
      case '16+': return 16;
      case '18+': return 18;
      default: return 13;
    }
  };

  const getTargetAudienceFromRating = (rating) => {
    switch (rating) {
      case '3+': return 'Kids (3-6)';
      case '7+': return 'Middle Grade (7-12)';
      case '13+': return 'Teen & YA';
      case '16+': return 'Young Adult (16+)';
      case '18+': return 'Adult (18+)';
      default: return 'General Audience';
    }
  };

  const handleAdminPublishStory = async (e) => {
    e.preventDefault();
    if (!pubTitle.trim() || !pubDescription.trim()) {
      alert("Please provide at least a Title and Synopsis for the story.");
      return;
    }

    const newId = Date.now();
    const finalSlug = (pubSlug.trim() || pubTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + Math.floor(100 + Math.random() * 900);
    const minAge = getMinAgeFromRating(pubAgeRating);
    const targetAudience = getTargetAudienceFromRating(pubAgeRating);
    const maturity = pubAgeRating === '18+' ? 'mature' : 'everyone';

    let initialChapterObj;
    if (pubContentType === 'picture_book') {
      initialChapterObj = {
        id: 1,
        number: 1,
        title: pubChapterTitle.trim() || "Illustrated Edition",
        reads: 0,
        votes: 0,
        emojis: { '🔥': 0, '❤️': 0, '😭': 0, '👏': 0, '😱': 0 },
        pages: pubPages.length > 0 ? pubPages : [
          { id: 1, image: pubCover, text: pubChapterBody || "The illustrated chronicle begins here.", caption: "Page 1" }
        ]
      };
    } else {
      const paragraphTexts = pubChapterBody.trim() 
        ? pubChapterBody.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
        : ["The story begins in silence, waiting for the first word to breathe life into its world..."];

      initialChapterObj = {
        id: 1,
        number: 1,
        title: pubChapterTitle.trim() || "Chapter 1: The Beginning",
        reads: 0,
        votes: 0,
        emojis: { '🔥': 0, '❤️': 0, '😭': 0, '👏': 0, '😱': 0 },
        paragraphs: paragraphTexts.map((text, idx) => ({
          id: 100 + idx + 1,
          text,
          comments: []
        }))
      };
    }

    const parsedTags = pubTags.split(',').map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean);

    const newStory = {
      id: newId,
      slug: finalSlug,
      title: pubTitle.trim(),
      author: pubAuthor.trim() || (user?.name || "Avora Editorial Desk"),
      authorUsername: pubAuthorUsername.trim() || "avora_editorial",
      authorAvatar: pubAuthorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      genre: pubGenre,
      genreSlug: pubGenre.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      cover: pubCover.trim() || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      description: pubDescription.trim(),
      status: pubStatus,
      language: pubLanguage,
      maturity,
      ageRating: pubAgeRating,
      minAge,
      contentType: pubContentType,
      targetAudience,
      mood: pubMood,
      trope: pubTrope,
      length: "Serialized Novel",
      isOriginal: pubIsOriginal,
      isEditorsPick: pubIsEditorsPick,
      isTrending: pubIsTrending,
      isFanfiction: false,
      reads: 0,
      votes: 0,
      commentsCount: 0,
      lastUpdated: "Just now",
      tags: parsedTags.length > 0 ? parsedTags : [pubGenre.toLowerCase()],
      ranking: { rank: 1, tag: pubGenre, totalInTag: "1.2K stories" },
      copyright: "All Rights Reserved (Published via Avora Admin)",
      chapters: [initialChapterObj]
    };

    if (typeof publishStory === 'function') {
      await publishStory(newStory);
    } else {
      setStories(prev => [newStory, ...prev]);
      addAuditLog("Admin Published Story", newStory.title);
    }

    setPublishSuccessNotice({
      title: newStory.title,
      slug: newStory.slug,
      genre: newStory.genre,
      ageRating: newStory.ageRating,
      author: newStory.author
    });

    // Reset editable text fields
    setPubTitle('');
    setPubSlug('');
    setPubDescription('');
    setPubChapterBody('');
  };

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

  const handleResolveReport = async (reportId, actionType) => {
    const report = reports.find(item => item.id === reportId);
    if (!report) return;

    if (actionType === 'dismiss' || actionType === 'Dismissed') {
      dismissReport(reportId);
    } else if (actionType === 'warn' || actionType === 'Warned User') {
      const customMsg = prompt(
        `Enter warning message to issue to writer @${report.reportedUser}:`,
        `Your content "${report.story}" has received reader complaints regarding: "${report.reason}". Continued policy violations will result in account termination.`
      );
      if (customMsg !== null && customMsg.trim()) {
        warnUser(report.reportedUser, reportId, customMsg.trim());
      }
    } else if (actionType === 'ban' || actionType === 'Banned User & Removed Content') {
      const confirmed = confirm(
        `⚠️ CONFIRM WRITER BAN & CONTENT TAKEDOWN:\n\n` +
        `• Target Writer: @${report.reportedUser}\n` +
        `• Target Content: "${report.story}"\n` +
        `• Violation: ${report.reason}\n\n` +
        `This will:\n` +
        `1. Ban @${report.reportedUser} permanently.\n` +
        `2. Prevent the writer from logging in or creating stories.\n` +
        `3. Remove "${report.story}" and all their stories from public browsing & reading.\n\n` +
        `Proceed with Ban & Takedown?`
      );
      if (confirmed) {
        await banUserAndTakeDownContent(
          report.reportedUser,
          report.story,
          reportId,
          report.reason || "Severe violation of platform content & safety policy"
        );
      }
    }
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

  const filteredReports = (reports || []).filter(r => {
    if (reportFilter === 'pending') return r.status === 'pending';
    if (reportFilter === 'resolved') return r.status === 'resolved' || r.status === 'dismissed';
    return true;
  });
  const paginatedReports = filteredReports.slice((reportPage - 1) * reportPageSize, reportPage * reportPageSize);
  const paginatedGenres = genres.slice((genrePage - 1) * genrePageSize, genrePage * genrePageSize);
  const cleanUserEmail = (user?.email || '').toLowerCase().trim();
  const hasAdminAccess = cleanUserEmail === 'gbncircle@gmail.com';

  // 1. Verification Loading Screen while session hydrates
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">Verifying Administrator Access</h3>
            <p className="text-xs text-slate-400">Please wait while security credentials are validated...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Locked Screen for Non-Admin / Unauthorized Visitors (ONLY gbncircle@gmail.com is allowed)
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-rose-500 selection:text-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />
            
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full inline-block">
                Restricted Access • Admin Only
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Admin Console Locked
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                This administrative console is restricted and locked. Only authorized administrator (<strong className="text-slate-200">gbncircle@gmail.com</strong>) has access to moderation, stories, ledger payouts, and CMS controls.
              </p>
            </div>

            {user ? (
              <div className="bg-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 text-left space-y-1.5 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Current Account</div>
                <div className="text-white font-bold truncate">{user.email || user.username}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">
                    Role: {user.role || 'reader'}
                  </span>
                  <span className="text-[10px] text-rose-400 font-semibold">Access Not Authorized</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-2xl p-3.5 text-xs text-slate-400 border border-slate-800">
                🔒 No active administrator session detected.
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => openAuthModal('login', 'Please sign in with administrator account gbncircle@gmail.com to access the Admin Console.')}
                className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Sign In as Administrator
              </button>
              <Link
                href="/"
                className="w-full py-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all text-center"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-6 overflow-x-auto no-scrollbar scrollbar-none">
          <button 
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'stories' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Stories & Originals ({stories.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab('publish');
              setPublishSuccessNotice(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'publish' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-brand-600 dark:text-brand-400 font-extrabold'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            + Publish Story
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
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'moderation' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>Reports Queue</span>
            {reports.filter(r => r.status === 'pending').length > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {reports.filter(r => r.status === 'pending').length} pending
              </span>
            ) : (
              <span className="text-[10px] opacity-75">({reports.length})</span>
            )}
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
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'cms' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            CMS & Website Content
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setShowPublishModal(true);
                    setPublishSuccessNotice(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/25 cursor-pointer hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish New Story
                </button>
                <Link href="/write" className="px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">
                  Writer Studio ↗
                </Link>
              </div>
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
                            {(story.status === 'removed' || story.isBanned || story.isRemoved) && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800" title={story.moderationReason || 'Content Removed by Moderation'}>
                                Taken Down
                              </span>
                            )}
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


        {/* TAB: DIRECT ADMIN STORY PUBLISHER */}
        {activeTab === 'publish' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-700 via-brand-600 to-amber-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" /> In-Dashboard Publishing
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">Direct Admin Story Publishing Suite</h2>
                <p className="text-xs sm:text-sm text-white/90 max-w-xl mt-1">
                  Populate the Avora Library catalog directly with customized age ratings, tropes, serial chapters, and illustrated picture books.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('stories')}
                className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer whitespace-nowrap"
              >
                ← Back to Stories
              </button>
            </div>

            
        {/* PUBLISH SUCCESS NOTIFICATION BANNER */}
        {publishSuccessNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                  Published to Production
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  "{publishSuccessNotice.title}" is Live on Avora Library!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  By {publishSuccessNotice.author} • {publishSuccessNotice.genre} • Rating: {publishSuccessNotice.ageRating}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/story/${publishSuccessNotice.slug}`}
                className="px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" /> View Story Page
              </Link>
              <Link
                href={`/read/${publishSuccessNotice.slug}`}
                className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Reader View
              </Link>
              <button
                type="button"
                onClick={() => setPublishSuccessNotice(null)}
                className="px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                + Publish Another Story
              </button>
            </div>
          </div>
        )}

        {/* ADMIN QUICK PUBLISHING SUITE */}
        <form onSubmit={handleAdminPublishStory} className="space-y-8">
          
          {/* Section 1: Core Story Metadata */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-500" /> Story Information &amp; Taxonomy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Define core catalog details, age access policy, and content formats.</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                Editorial CMS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Story Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Kingdom of Starlight"
                  value={pubTitle}
                  onChange={handleTitleChange}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  URL Slug: <span className="font-mono text-brand-600 dark:text-brand-400">/story/{pubSlug || 'story-title'}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Primary Genre <span className="text-rose-500">*</span>
                </label>
                <select
                  value={pubGenre}
                  onChange={(e) => setPubGenre(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {genres.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Age Rating & Format Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Content Age Rating (Strict Backend Policy)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['3+', '7+', '13+', '16+', '18+'].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setPubAgeRating(rating)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        pubAgeRating === rating
                          ? rating === '18+'
                            ? 'bg-rose-500 text-white ring-2 ring-rose-500 shadow-md'
                            : rating === '16+'
                            ? 'bg-amber-500 text-white ring-2 ring-amber-500 shadow-md'
                            : 'bg-emerald-500 text-white ring-2 ring-emerald-500 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {pubAgeRating === '3+' && '🧒 Kids 3+ (Visible to minors under 18)'}
                  {pubAgeRating === '7+' && '🧒 Family 7+ (Visible to minors under 18)'}
                  {pubAgeRating === '13+' && '📚 Teens 13+ (Requires age 13+)'}
                  {pubAgeRating === '16+' && '🔥 Young Adult 16+ (Requires age 16+)'}
                  {pubAgeRating === '18+' && '🔞 Mature 18+ (Strictly blocked for minors)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Content Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('story')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'story'
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Serialized Text
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('picture_book')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'picture_book'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Picture Book
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Story Language &amp; Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={pubLanguage}
                    onChange={(e) => setPubLanguage(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="en">English (EN)</option>
                    <option value="ka">Georgian (KA)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="es">Spanish (ES)</option>
                  </select>
                  <select
                    value={pubStatus}
                    onChange={(e) => setPubStatus(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description & Tags */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    {pubContentType === 'picture_book' ? (
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold">
                        <span>🎨 Picture Book Synopsis &amp; Blurb</span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full font-black text-amber-700 dark:text-amber-300">Catalog Preview</span>
                      </span>
                    ) : (
                      'Synopsis / Story Description'
                    )} <span className="text-rose-500">*</span>
                  </label>
                  {pubContentType === 'picture_book' && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      🧒 Auto-categorized for Kids &amp; Family Section
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    pubContentType === 'picture_book'
                      ? "Describe the characters, bedtime adventure, and moral theme for young readers and parents..."
                      : "Hook readers with a gripping summary of the conflict, characters, and stakes..."
                  }
                  value={pubDescription}
                  onChange={(e) => setPubDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* DEDICATED PICTURE BOOK UPLOAD CENTER IN SECTION 1 */}
              {pubContentType === 'picture_book' && renderPictureBookPagesManager()}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. fantasy, magic, royalty"
                    value={pubTags}
                    onChange={(e) => setPubTags(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Story Trope</label>
                  <select
                    value={pubTrope}
                    onChange={(e) => setPubTrope(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Enemies to Lovers">Enemies to Lovers</option>
                    <option value="Slow Burn">Slow Burn</option>
                    <option value="Chosen One">Chosen One</option>
                    <option value="Found Family">Found Family</option>
                    <option value="Second Chance">Second Chance</option>
                    <option value="Fake Dating">Fake Dating</option>
                    <option value="Time Travel">Time Travel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Mood</label>
                  <select
                    value={pubMood}
                    onChange={(e) => setPubMood(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Adventurous">Adventurous</option>
                    <option value="Heartwarming">Heartwarming</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Mysterious">Mysterious</option>
                    <option value="Dark & Gritty">Dark &amp; Gritty</option>
                    <option value="Inspiring">Inspiring</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Author Attribution & Cover Visuals */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-500" /> Cover Artwork &amp; Creator Persona
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select high-definition cover art and configure publisher attribution.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Cover Preview */}
              <div className="w-36 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative group">
                <img
                  src={pubCover}
                  alt="Story Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-black/60 text-white backdrop-blur-md">
                  Preview
                </span>
              </div>

              {/* Cover Presets & Inputs */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Quick 1-Click Cover Presets (Curated High-Res)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {coverPresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPubCover(preset.url)}
                        className={`p-2 text-left rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          pubCover === preset.url
                            ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Cover Image (URL or Device Upload)
                    </label>
                    <label className="text-xs font-bold text-brand-500 hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload Cover from Device
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or upload from device"
                    value={pubCover}
                    onChange={(e) => setPubCover(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Author Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Avora Editorial Desk"
                      value={pubAuthor}
                      onChange={(e) => setPubAuthor(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Author Username</label>
                    <input
                      type="text"
                      placeholder="e.g. avora_editorial"
                      value={pubAuthorUsername}
                      onChange={(e) => setPubAuthorUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Editorial Flags */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={pubIsOriginal}
                      onChange={(e) => setPubIsOriginal(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>🌟 Mark as House Original</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={pubIsEditorsPick}
                      onChange={(e) => setPubIsEditorsPick(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>💎 Editor's Pick Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={pubIsTrending}
                      onChange={(e) => setPubIsTrending(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>🔥 Feature in Trending Shelf</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Initial Chapter or Illustrated Pages */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                {pubContentType === 'story' ? 'Chapter 1 Manuscripts' : 'Illustrated Pages Manager'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pubContentType === 'story'
                  ? 'Input the initial serialization chapter. Paragraphs separated by blank lines will support reader inline comments.'
                  : 'Add sequential illustrated pages with captions and imagery for kids and graphic novels.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Chapter / Section Title
              </label>
              <input
                type="text"
                value={pubChapterTitle}
                onChange={(e) => setPubChapterTitle(e.target.value)}
                placeholder="e.g. Chapter 1: The Glass Needle"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
              />
            </div>

            {pubContentType === 'story' ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Chapter Text Content
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste or write the chapter manuscript here...\n\nSeparate each paragraph with an empty line so readers can quote and comment on specific sentences."
                  value={pubChapterBody}
                  onChange={(e) => setPubChapterBody(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {pubPages.map((page, pIdx) => (
                  <div key={page.id || pIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Page {pIdx + 1}</span>
                      {pubPages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPubPages(prev => prev.filter((_, i) => i !== pIdx))}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          Remove Page
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Page Image URL</label>
                        <input
                          type="url"
                          value={page.image}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, image: val } : p));
                          }}
                          placeholder="https://..."
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-xs font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Page Text / Caption</label>
                        <input
                          type="text"
                          value={page.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, text: val } : p));
                          }}
                          placeholder="Text narrative for this page..."
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPubPages(prev => [
                    ...prev,
                    { id: prev.length + 1, image: pubCover, text: 'And so the story continues...', caption: `Page ${prev.length + 1}` }
                  ])}
                  className="px-4 py-2 rounded-xl border border-dashed border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-bold transition-all cursor-pointer"
                >
                  + Add Another Illustrated Page
                </button>
              </div>
            )}
          </div>

          {/* Submission CTA Bar */}
          <div className="flex items-center justify-between gap-4 p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl shadow-xl">
            <div>
              <h4 className="font-extrabold text-sm">Ready to Publish to Live Catalog?</h4>
              <p className="text-xs text-white/70 dark:text-slate-600">The novel will immediately populate the home feed, genre directory, and search indexing.</p>
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-lg shadow-brand-500/30 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              🚀 Publish Story Directly
            </button>
          </div>

        </form>

          </div>
        )}

                {/* TAB 2: USER & AUTHOR MODERATION */}
        {activeTab === 'users' && (
          <div className="mt-8 space-y-6">

            {/* PARENTAL 18+ ACCESS REQUESTS MANAGEMENT CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Parental 18+ Access Requests &amp; Minor Safety
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review requests from minors/kids asking for 18+ catalog access with parent or guardian permission.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Master Parent PIN:</span>
                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {parentalPin || '2468'}
                  </span>
                </div>
              </div>

              {/* Requests List */}
              {(!parentalRequests || parentalRequests.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  No 18+ approval requests submitted yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {parentalRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            @{req.username}
                          </span>
                          <span className="text-slate-400">({req.userEmail || 'No email'})</span>
                          <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                            req.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Parent Email:</strong> <span className="font-mono">{req.parentEmail}</span>
                        </p>
                        <p className="text-slate-500 italic text-[11px]">
                          "{req.reason || 'No specific reason given'}"
                        </p>
                        <span className="text-[10px] text-slate-400 block">
                          Submitted: {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => approve18PlusRequest(req.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                            >
                              ✅ Approve 18+ Access
                            </button>
                            <button
                              type="button"
                              onClick={() => reject18PlusRequest(req.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                            >
                              ❌ Decline
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold">
                            {req.status === 'approved' ? 'Access Granted' : 'Request Declined'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                      <th className="p-4">Bank / Payout</th>
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
                            u.status === 'banned' || u.isBanned
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                              : u.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {u.status === 'banned' || u.isBanned ? 'BANNED' : u.status}
                          </span>
                          {(u.status === 'banned' || u.isBanned) && u.banReason && (
                            <span className="block text-[10px] text-rose-500 dark:text-rose-400 mt-0.5 max-w-[140px] truncate font-medium" title={u.banReason}>
                              {u.banReason}
                            </span>
                          )}
                          {u.warningsCount > 0 && !(u.status === 'banned' || u.isBanned) && (
                            <span className="block text-[10px] text-amber-500 mt-0.5 font-medium">
                              ⚠️ {u.warningsCount} {u.warningsCount === 1 ? 'warning' : 'warnings'}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {u.bankDetails ? (
                            <button
                              type="button"
                              onClick={() => openBankDetailsModal(u)}
                              className="text-left group cursor-pointer"
                              title="Click to view or edit bank details"
                            >
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 group-hover:border-emerald-400 transition-all">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {u.bankDetails.bankName} ({u.bankDetails.accountNumber})
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                90% Payout • {u.bankDetails.currency} (Edit)
                              </span>
                            </button>
                          ) : (
                            u.role === 'author' || u.role === 'admin' ? (
                              <button
                                type="button"
                                onClick={() => openBankDetailsModal(u)}
                                className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Building2 className="w-3 h-3" />
                                <span>+ Link Bank</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                          {u.storiesCount || 0}
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {u.joinedDate || 'Recently'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.status === 'banned' || u.isBanned ? (
                              <button 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to unban writer @${u.username}? This will restore active account status.`)) {
                                    unbanUser(u.id);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-300 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                              >
                                Unban Writer
                              </button>
                            ) : (
                              <>
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
                                    const reason = prompt(`Enter reason for permanently banning writer @${u.username} and taking down their works:`, "Posting inappropriate content violating community standards");
                                    if (reason !== null && reason.trim()) {
                                      banUser(u.id, reason.trim());
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-rose-300 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Ban Writer & Remove Works"
                                >
                                  Ban
                                </button>
                              </>
                            )}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Flagged Content & Moderation Queue</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Review reported content, issue warnings, or permanently ban offending writers and take down their works.</p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => { setReportFilter('all'); setReportPage(1); }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${reportFilter === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  All ({reports.length})
                </button>
                <button
                  onClick={() => { setReportFilter('pending'); setReportPage(1); }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${reportFilter === 'pending' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Pending ({reports.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => { setReportFilter('resolved'); setReportPage(1); }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${reportFilter === 'resolved' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Resolved ({reports.filter(r => r.status !== 'pending').length})
                </button>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm">Reports queue is clear</p>
                <p className="text-xs text-slate-400">All community comments and stories meet platform standards.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedReports.map(report => {
                  const isPending = report.status === 'pending';
                  const isResolvedBan = report.resolution === 'Banned User & Removed Content';
                  const isDismissed = report.status === 'dismissed';

                  return (
                    <div key={report.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-sm">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isPending 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : isResolvedBan
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-300'
                              : isDismissed
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {isPending ? 'Pending Review' : (report.resolution || report.status.toUpperCase())}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Target: <strong className="text-slate-900 dark:text-white">{report.story}</strong>
                          </span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Writer: <strong className="text-purple-600 dark:text-purple-400">@{report.reportedUser}</strong>
                          </span>
                          {report.createdAt && (
                            <>
                              <span className="text-[11px] text-slate-400">•</span>
                              <span className="text-[11px] text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>Reason: {report.reason}</span>
                          </h4>
                          {report.details && (
                            <div className="mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                              "{report.details}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Reported by: <strong className="text-slate-600 dark:text-slate-300">@{report.reporter || 'community_reader'}</strong></span>
                          {report.resolvedAt && (
                            <span>• Resolved: {new Date(report.resolvedAt).toLocaleDateString()} by {report.resolvedBy || 'Admin'}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        {isPending ? (
                          <>
                            <button 
                              onClick={() => handleResolveReport(report.id, "dismiss")}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                              Dismiss Report
                            </button>
                            <button 
                              onClick={() => handleResolveReport(report.id, "warn")}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                            >
                              Warn Writer
                            </button>
                            <button 
                              onClick={() => handleResolveReport(report.id, "ban")}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors cursor-pointer shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Ban Writer & Take Down
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">
                              Resolved: <strong className="text-slate-700 dark:text-slate-200">{report.resolution || report.status}</strong>
                            </span>
                            {report.resolution !== 'Banned User & Removed Content' && (
                              <button 
                                onClick={() => handleResolveReport(report.id, "ban")}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 transition-colors cursor-pointer"
                              >
                                Escalate to Ban
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <Pagination
                  currentPage={reportPage}
                  totalItems={filteredReports.length}
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

              {/* Financial KPI Summary Cards */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center gap-1.5">
                  <span className="text-slate-400">Total Volume:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    ${(transactions || []).filter(t => t.status === 'succeeded').reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-center gap-1.5">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">Author Payouts (90%):</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${(transactions || []).filter(t => t.status === 'succeeded').reduce((sum, t) => sum + (t.authorPayout !== undefined ? t.authorPayout : (t.type === 'subscription' ? 0 : (t.amount || 0) * 0.9)), 0).toFixed(2)}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-xs flex items-center gap-1.5">
                  <span className="text-purple-700 dark:text-purple-300 font-bold">Platform Net (10% + VIP):</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">
                    ${(transactions || []).filter(t => t.status === 'succeeded').reduce((sum, t) => sum + (t.platformCommission !== undefined ? t.platformCommission : (t.type === 'subscription' ? (t.amount || 0) : (t.amount || 0) * 0.1)), 0).toFixed(2)}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold">Bank Payout Accounts:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {(registeredUsers || []).filter(u => u.bankDetails).length} Verified
                  </span>
                </div>
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
                      <th className="p-4">Gross Amount</th>
                      <th className="p-4">Author (90%)</th>
                      <th className="p-4">Platform (10%)</th>
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
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {tx.type === 'subscription' ? (
                            <span className="text-slate-400 text-[11px] font-normal">—</span>
                          ) : (
                            <span>${(tx.authorPayout !== undefined ? tx.authorPayout : (tx.amount * 0.9)).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-purple-600 dark:text-purple-400">
                          ${(tx.platformCommission !== undefined ? tx.platformCommission : (tx.type === 'subscription' ? tx.amount : tx.amount * 0.1)).toFixed(2)}
                          {tx.type === 'subscription' && <span className="text-[10px] text-purple-400 block font-normal">VIP Pass</span>}
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

        {/* TAB: CMS & WEBSITE CONTENT MANAGEMENT */}
        {activeTab === 'cms' && (
          <div className="mt-8 space-y-6">
            {/* Header & Global Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-black">Website Content Management System (CMS)</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage the Progressive Web App (PWA) banner, QR code generator, footer social media links, and public website pages.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetCms}
                  className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-all"
                  title="Reset all CMS fields to original defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveCms}
                  className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save CMS Changes
                </button>
              </div>
            </div>

            {/* Save Confirmation Notification */}
            {cmsSaveNotice && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                CMS Changes Saved & Published Live! All changes reflect immediately across the homepage, PWA banner, footer, and informational pages.
              </div>
            )}

            {/* CMS Sub-Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setCmsSubTab('pwa')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  cmsSubTab === 'pwa'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                PWA Banner & QR Code
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('social')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  cmsSubTab === 'social'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                Footer & Social Links
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('pages')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  cmsSubTab === 'pages'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Website Pages Content
              </button>
            </div>

            {/* SUB-TAB 1: PWA BANNER & QR CODE */}
            {cmsSubTab === 'pwa' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Controls */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Card 1: Visibility & Basic Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm">PWA Install Banner Display</h4>
                          <p className="text-[11px] text-slate-400">Control visibility of the "Read Anywhere on Mobile" card on the homepage</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updatePwaField('enabled', !cmsForm?.pwaSection?.enabled)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                              cmsForm?.pwaSection?.enabled !== false
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {cmsForm?.pwaSection?.enabled !== false ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" /> Shown on Site
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" /> Removed / Hidden
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={cmsForm?.pwaSection?.badgeText || ''}
                            onChange={(e) => updatePwaField('badgeText', e.target.value)}
                            placeholder="e.g. Progressive Web App (PWA)"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Headline Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pwaSection?.title || ''}
                            onChange={(e) => updatePwaField('title', e.target.value)}
                            placeholder="e.g. Read Anywhere on Mobile"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Description Paragraph</label>
                          <textarea
                            rows={3}
                            value={cmsForm?.pwaSection?.description || ''}
                            onChange={(e) => updatePwaField('description', e.target.value)}
                            placeholder="Detailed explanation of the PWA install features..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Button Text</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.buttonText || ''}
                              onChange={(e) => updatePwaField('buttonText', e.target.value)}
                              placeholder="e.g. Install Web App"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Custom Button Redirect URL (Optional)</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.buttonUrl || ''}
                              onChange={(e) => updatePwaField('buttonUrl', e.target.value)}
                              placeholder="Leave blank for native PWA prompt"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: QR Code Configuration */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-black text-sm flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-purple-600" />
                          QR Code Generator &amp; Image Settings
                        </h4>
                        <p className="text-[11px] text-slate-400">Choose whether to dynamically generate a QR code for your URL or upload a custom image</p>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1.5">QR Code Source Mode</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updatePwaField('qrCodeType', 'dynamic')}
                              className={`py-2 px-3 rounded-xl font-bold transition-all text-center ${
                                cmsForm?.pwaSection?.qrCodeType !== 'custom_image'
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              Dynamic URL Generator
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePwaField('qrCodeType', 'custom_image')}
                              className={`py-2 px-3 rounded-xl font-bold transition-all text-center ${
                                cmsForm?.pwaSection?.qrCodeType === 'custom_image'
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              Custom Image URL
                            </button>
                          </div>
                        </div>

                        {cmsForm?.pwaSection?.qrCodeType !== 'custom_image' ? (
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Target Web URL (Encoded in QR Code)</label>
                            <input
                              type="url"
                              value={cmsForm?.pwaSection?.qrTargetUrl || ''}
                              onChange={(e) => updatePwaField('qrTargetUrl', e.target.value)}
                              placeholder="https://avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              When readers scan with iOS or Android camera, they will immediately land on this URL.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Custom QR Code Image URL</label>
                            <input
                              type="url"
                              value={cmsForm?.pwaSection?.qrCodeImageUrl || ''}
                              onChange={(e) => updatePwaField('qrCodeImageUrl', e.target.value)}
                              placeholder="https://yourdomain.com/custom-qr.png"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Provide a direct link to a hosted image of your branded or pre-generated QR code.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">QR Box Top Label</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.qrCodeLabel || ''}
                              onChange={(e) => updatePwaField('qrCodeLabel', e.target.value)}
                              placeholder="Scan QR with Phone"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">QR Box Sublabel</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.qrCodeSublabel || ''}
                              onChange={(e) => updatePwaField('qrCodeSublabel', e.target.value)}
                              placeholder="Instant mobile web app"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Card Preview matching user screenshot */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Homepage Preview</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        cmsForm?.pwaSection?.enabled !== false 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {cmsForm?.pwaSection?.enabled !== false ? '● Visible' : '○ Hidden on Site'}
                      </span>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                      {/* Exact PWA Card replica */}
                      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-brand-950 text-white p-6 sm:p-8 flex flex-col gap-6">
                        <div className="space-y-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            <Smartphone className="w-3.5 h-3.5" /> {cmsForm?.pwaSection?.badgeText || "Progressive Web App (PWA)"}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black leading-tight">
                            {cmsForm?.pwaSection?.title || "Read Anywhere on Mobile"}
                          </h3>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            {cmsForm?.pwaSection?.description || "Install Avora Library directly to your phone screen as a lightweight web app (PWA)..."}
                          </p>
                          <div className="pt-2">
                            <span className="inline-block px-5 py-2.5 rounded-full bg-brand-500 font-bold text-xs shadow-md shadow-brand-500/30">
                              {cmsForm?.pwaSection?.buttonText || "Install Web App"}
                            </span>
                          </div>
                        </div>

                        {/* QR Code Box */}
                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center mx-auto w-full max-w-[200px]">
                          <div className="w-28 h-28 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner overflow-hidden relative">
                            <img
                              src={previewQrImageUrl}
                              alt="PWA QR Preview"
                              className="w-24 h-24 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.qr-fallback-admin');
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                            <div className="qr-fallback-admin hidden flex items-center justify-center w-24 h-24">
                              <QrCode className="w-20 h-20 text-slate-900" />
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-200 mt-2">{cmsForm?.pwaSection?.qrCodeLabel || "Scan QR with Phone"}</span>
                          <span className="text-[9px] text-slate-400">{cmsForm?.pwaSection?.qrCodeSublabel || "Instant mobile web app"}</span>
                        </div>
                      </div>

                      {/* If disabled, show watermark overlay */}
                      {cmsForm?.pwaSection?.enabled === false && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center text-white">
                          <EyeOff className="w-10 h-10 text-rose-400 mb-2" />
                          <h5 className="font-black text-sm">Banner is Currently Removed</h5>
                          <p className="text-xs text-slate-300 mt-1 max-w-xs">
                            This banner is removed from the homepage. Turn on "PWA Install Banner Display" to restore it.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">💡 Quick Tip</p>
                      <p>
                        Scanning the QR code on a real mobile device opens the site directly in Safari or Chrome, prompting the user to install Avora Library to their Home Screen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: FOOTER & SOCIAL MEDIA CHANNELS */}
            {cmsSubTab === 'social' && (
              <div className="space-y-6">
                {/* Global Footer Controls */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="font-black text-sm">Footer Social Media Bar</h4>
                      <p className="text-[11px] text-slate-400">Toggle individual platforms on or off, and update their destination links</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateFooterField('showSocialLinks', !cmsForm?.footerConfig?.showSocialLinks)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        cmsForm?.footerConfig?.showSocialLinks !== false
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cmsForm?.footerConfig?.showSocialLinks !== false ? 'Social Links Bar: Active' : 'Social Links Bar: Hidden'}
                    </button>
                  </div>

                  {/* Channel Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {/* Instagram */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-black text-xs">
                            IG
                          </span>
                          <span className="font-black text-xs">Instagram</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSocialChannel('instagram', 'enabled', !cmsForm?.socialLinks?.instagram?.enabled)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            cmsForm?.socialLinks?.instagram?.enabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {cmsForm?.socialLinks?.instagram?.enabled ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Profile URL</label>
                        <input
                          type="url"
                          value={cmsForm?.socialLinks?.instagram?.url || ''}
                          onChange={(e) => updateSocialChannel('instagram', 'url', e.target.value)}
                          placeholder="https://instagram.com/yourprofile"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      {cmsForm?.socialLinks?.instagram?.url && (
                        <a
                          href={cmsForm.socialLinks.instagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Test Link
                        </a>
                      )}
                    </div>

                    {/* X (Twitter) */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-black text-xs">
                            𝕏
                          </span>
                          <span className="font-black text-xs">X (Twitter)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSocialChannel('x', 'enabled', !cmsForm?.socialLinks?.x?.enabled)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            cmsForm?.socialLinks?.x?.enabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {cmsForm?.socialLinks?.x?.enabled ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Profile URL</label>
                        <input
                          type="url"
                          value={cmsForm?.socialLinks?.x?.url || ''}
                          onChange={(e) => updateSocialChannel('x', 'url', e.target.value)}
                          placeholder="https://x.com/yourhandle"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      {cmsForm?.socialLinks?.x?.url && (
                        <a
                          href={cmsForm.socialLinks.x.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Test Link
                        </a>
                      )}
                    </div>

                    {/* Facebook */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                            FB
                          </span>
                          <span className="font-black text-xs">Facebook</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSocialChannel('facebook', 'enabled', !cmsForm?.socialLinks?.facebook?.enabled)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            cmsForm?.socialLinks?.facebook?.enabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {cmsForm?.socialLinks?.facebook?.enabled ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Page URL</label>
                        <input
                          type="url"
                          value={cmsForm?.socialLinks?.facebook?.url || ''}
                          onChange={(e) => updateSocialChannel('facebook', 'url', e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      {cmsForm?.socialLinks?.facebook?.url && (
                        <a
                          href={cmsForm.socialLinks.facebook.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Test Link
                        </a>
                      )}
                    </div>

                    {/* TikTok */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xs">
                            TT
                          </span>
                          <span className="font-black text-xs">TikTok</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSocialChannel('tiktok', 'enabled', !cmsForm?.socialLinks?.tiktok?.enabled)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            cmsForm?.socialLinks?.tiktok?.enabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {cmsForm?.socialLinks?.tiktok?.enabled ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Profile URL</label>
                        <input
                          type="url"
                          value={cmsForm?.socialLinks?.tiktok?.url || ''}
                          onChange={(e) => updateSocialChannel('tiktok', 'url', e.target.value)}
                          placeholder="https://tiktok.com/@youraccount"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      {cmsForm?.socialLinks?.tiktok?.url && (
                        <a
                          href={cmsForm.socialLinks.tiktok.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Test Link
                        </a>
                      )}
                    </div>

                    {/* Discord */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                            DC
                          </span>
                          <span className="font-black text-xs">Discord</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSocialChannel('discord', 'enabled', !cmsForm?.socialLinks?.discord?.enabled)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            cmsForm?.socialLinks?.discord?.enabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {cmsForm?.socialLinks?.discord?.enabled ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Server Invite URL</label>
                        <input
                          type="url"
                          value={cmsForm?.socialLinks?.discord?.url || ''}
                          onChange={(e) => updateSocialChannel('discord', 'url', e.target.value)}
                          placeholder="https://discord.gg/yourinvite"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      {cmsForm?.socialLinks?.discord?.url && (
                        <a
                          href={cmsForm.socialLinks.discord.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Test Link
                        </a>
                      )}
                    </div>

                    {/* YouTube */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-xs">
                            YT
                          </span>
                          <span className="font-black text-xs">YouTube</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSocialChannel('youtube', 'enabled', !cmsForm?.socialLinks?.youtube?.enabled)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            cmsForm?.socialLinks?.youtube?.enabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {cmsForm?.socialLinks?.youtube?.enabled ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Channel URL</label>
                        <input
                          type="url"
                          value={cmsForm?.socialLinks?.youtube?.url || ''}
                          onChange={(e) => updateSocialChannel('youtube', 'url', e.target.value)}
                          placeholder="https://youtube.com/@yourchannel"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      {cmsForm?.socialLinks?.youtube?.url && (
                        <a
                          href={cmsForm.socialLinks.youtube.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Test Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Tagline & Legal Information Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-black text-sm">Footer Branding, Tagline &amp; Copyright</h4>
                    <p className="text-[11px] text-slate-400">Customize the statement shown below the logo and platform legal notice</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-400 mb-1">Footer Tagline</label>
                      <textarea
                        rows={2}
                        value={cmsForm?.footerConfig?.tagline || ''}
                        onChange={(e) => updateFooterField('tagline', e.target.value)}
                        placeholder="Platform mission tagline..."
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-400 mb-1">Copyright Notice</label>
                      <input
                        type="text"
                        value={cmsForm?.footerConfig?.copyrightText || ''}
                        onChange={(e) => updateFooterField('copyrightText', e.target.value)}
                        placeholder="© 2026 Avora Library Platform. All original rights reserved."
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">Language Selector in Footer</p>
                          <p className="text-[10px] text-slate-400">English, Georgian, Hindi</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateFooterField('showLanguageSelector', !cmsForm?.footerConfig?.showLanguageSelector)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            cmsForm?.footerConfig?.showLanguageSelector !== false
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {cmsForm?.footerConfig?.showLanguageSelector !== false ? 'Shown' : 'Hidden'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">Legal Navigation Links</p>
                          <p className="text-[10px] text-slate-400">Terms, Privacy, Guidelines</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateFooterField('showLegalLinks', !cmsForm?.footerConfig?.showLegalLinks)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            cmsForm?.footerConfig?.showLegalLinks !== false
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {cmsForm?.footerConfig?.showLegalLinks !== false ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: WEBSITE PAGES CONTENT */}
            {cmsSubTab === 'pages' && (
              <div className="space-y-6">
                {/* Page Selector Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                  {[
                    { key: 'about', label: 'About Us (/about)' },
                    { key: 'terms', label: 'Terms of Service (/terms)' },
                    { key: 'privacy', label: 'Privacy Policy (/privacy)' },
                    { key: 'guidelines', label: 'Guidelines (/guidelines)' },
                    { key: 'contact', label: 'Contact Us (/contact)' },
                    { key: 'hero', label: 'Homepage Hero (/)' }
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setCmsSelectedPage(p.key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        cmsSelectedPage === p.key
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Selected Page Editor */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  {/* ABOUT US */}
                  {cmsSelectedPage === 'about' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm">About Us Page Content</h4>
                          <p className="text-[11px] text-slate-400">Live at /about</p>
                        </div>
                        <Link href="/about" target="_blank" className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.about?.title || ''}
                            onChange={(e) => updatePageField('about', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Subtitle</label>
                          <textarea
                            rows={2}
                            value={cmsForm?.pagesContent?.about?.subtitle || ''}
                            onChange={(e) => updatePageField('about', 'subtitle', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                          />
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                          <label className="block font-black text-slate-700 dark:text-slate-300">Mission Section</label>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Heading</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.about?.missionTitle || ''}
                              onChange={(e) => updatePageField('about', 'missionTitle', e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-semibold outline-none border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Body Text</label>
                            <textarea
                              rows={3}
                              value={cmsForm?.pagesContent?.about?.missionContent || ''}
                              onChange={(e) => updatePageField('about', 'missionContent', e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                          <label className="block font-black text-slate-700 dark:text-slate-300">Mobile-First PWA Section</label>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Heading</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.about?.pwaTitle || ''}
                              onChange={(e) => updatePageField('about', 'pwaTitle', e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-semibold outline-none border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Body Text</label>
                            <textarea
                              rows={3}
                              value={cmsForm?.pagesContent?.about?.pwaContent || ''}
                              onChange={(e) => updatePageField('about', 'pwaContent', e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TERMS OF SERVICE */}
                  {cmsSelectedPage === 'terms' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm">Terms of Service Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /terms</p>
                        </div>
                        <Link href="/terms" target="_blank" className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.terms?.title || ''}
                            onChange={(e) => updatePageField('terms', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Last Updated Date</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.terms?.lastUpdated || ''}
                            onChange={(e) => updatePageField('terms', 'lastUpdated', e.target.value)}
                            placeholder="e.g. March 2026"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 dark:text-slate-300">Policy Clauses / Sections</label>
                          <button
                            type="button"
                            onClick={() => addSectionItem('terms')}
                            className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-1 hover:bg-purple-200"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Clause
                          </button>
                        </div>

                        {cmsForm?.pagesContent?.terms?.sections?.map((sec, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-400 text-[10px]">Clause {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeSectionItem('terms', idx)}
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={sec.heading || ''}
                              onChange={(e) => updateSectionItem('terms', idx, 'heading', e.target.value)}
                              placeholder="Clause Heading (e.g. 1. Acceptance of Terms)"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-bold outline-none border border-slate-200 dark:border-slate-700"
                            />
                            <textarea
                              rows={3}
                              value={sec.content || ''}
                              onChange={(e) => updateSectionItem('terms', idx, 'content', e.target.value)}
                              placeholder="Clause content details..."
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PRIVACY POLICY */}
                  {cmsSelectedPage === 'privacy' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm">Privacy Policy Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /privacy</p>
                        </div>
                        <Link href="/privacy" target="_blank" className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.privacy?.title || ''}
                            onChange={(e) => updatePageField('privacy', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Last Updated Date</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.privacy?.lastUpdated || ''}
                            onChange={(e) => updatePageField('privacy', 'lastUpdated', e.target.value)}
                            placeholder="e.g. March 2026"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 dark:text-slate-300">Privacy Clauses / Sections</label>
                          <button
                            type="button"
                            onClick={() => addSectionItem('privacy')}
                            className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-1 hover:bg-purple-200"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Clause
                          </button>
                        </div>

                        {cmsForm?.pagesContent?.privacy?.sections?.map((sec, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-400 text-[10px]">Clause {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeSectionItem('privacy', idx)}
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={sec.heading || ''}
                              onChange={(e) => updateSectionItem('privacy', idx, 'heading', e.target.value)}
                              placeholder="Clause Heading (e.g. 1. Information We Collect)"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-bold outline-none border border-slate-200 dark:border-slate-700"
                            />
                            <textarea
                              rows={3}
                              value={sec.content || ''}
                              onChange={(e) => updateSectionItem('privacy', idx, 'content', e.target.value)}
                              placeholder="Clause content details..."
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GUIDELINES */}
                  {cmsSelectedPage === 'guidelines' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm">Author &amp; Community Guidelines</h4>
                          <p className="text-[11px] text-slate-400">Live at /guidelines</p>
                        </div>
                        <Link href="/guidelines" target="_blank" className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.guidelines?.title || ''}
                            onChange={(e) => updatePageField('guidelines', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.guidelines?.subtitle || ''}
                            onChange={(e) => updatePageField('guidelines', 'subtitle', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Editorial Notice &amp; Core Platform Rules</label>
                          <textarea
                            rows={4}
                            value={cmsForm?.pagesContent?.guidelines?.content || ''}
                            onChange={(e) => updatePageField('guidelines', 'content', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTACT US */}
                  {cmsSelectedPage === 'contact' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm">Contact Us Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /contact</p>
                        </div>
                        <Link href="/contact" target="_blank" className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.contact?.title || ''}
                              onChange={(e) => updatePageField('contact', 'title', e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.contact?.subtitle || ''}
                              onChange={(e) => updatePageField('contact', 'subtitle', e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Support Email</label>
                            <input
                              type="email"
                              value={cmsForm?.pagesContent?.contact?.supportEmail || ''}
                              onChange={(e) => updatePageField('contact', 'supportEmail', e.target.value)}
                              placeholder="support@avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Press / Media Email</label>
                            <input
                              type="email"
                              value={cmsForm?.pagesContent?.contact?.pressEmail || ''}
                              onChange={(e) => updatePageField('contact', 'pressEmail', e.target.value)}
                              placeholder="press@avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Office / Mailing Address</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.contact?.officeAddress || ''}
                            onChange={(e) => updatePageField('contact', 'officeAddress', e.target.value)}
                            placeholder="Avora Library Inc., 100 Storyteller Way, San Francisco, CA"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HOMEPAGE HERO */}
                  {cmsSelectedPage === 'hero' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm">Homepage Hero Section</h4>
                          <p className="text-[11px] text-slate-400">Live at / (Public Landing)</p>
                        </div>
                        <Link href="/" target="_blank" className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.hero?.badge || ''}
                            onChange={(e) => updatePageField('hero', 'badge', e.target.value)}
                            placeholder="Original Serialized Fiction & Community"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Title Prefix</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.hero?.titlePrefix || ''}
                              onChange={(e) => updatePageField('hero', 'titlePrefix', e.target.value)}
                              placeholder="Stories That"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Title Highlight (Gradient)</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.hero?.titleHighlight || ''}
                              onChange={(e) => updatePageField('hero', 'titleHighlight', e.target.value)}
                              placeholder="Capture Your Imagination."
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Hero Subtitle</label>
                          <textarea
                            rows={3}
                            value={cmsForm?.pagesContent?.hero?.subtitle || ''}
                            onChange={(e) => updatePageField('hero', 'subtitle', e.target.value)}
                            placeholder="Platform description..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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


      {/* QUICK PUBLISH STORY MODAL */}
      {showPublishModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPublishModal(false)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-auto overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Admin Direct Story Publisher</h3>
                  <p className="text-xs text-slate-400">Populate the platform with new novels, age ratings, and chapters.</p>
                </div>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
        {/* PUBLISH SUCCESS NOTIFICATION BANNER */}
        {publishSuccessNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                  Published to Production
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  "{publishSuccessNotice.title}" is Live on Avora Library!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  By {publishSuccessNotice.author} • {publishSuccessNotice.genre} • Rating: {publishSuccessNotice.ageRating}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/story/${publishSuccessNotice.slug}`}
                className="px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" /> View Story Page
              </Link>
              <Link
                href={`/read/${publishSuccessNotice.slug}`}
                className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Reader View
              </Link>
              <button
                type="button"
                onClick={() => setPublishSuccessNotice(null)}
                className="px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                + Publish Another Story
              </button>
            </div>
          </div>
        )}

        {/* ADMIN QUICK PUBLISHING SUITE */}
        <form onSubmit={handleAdminPublishStory} className="space-y-8">
          
          {/* Section 1: Core Story Metadata */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-500" /> Story Information &amp; Taxonomy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Define core catalog details, age access policy, and content formats.</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                Editorial CMS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Story Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Kingdom of Starlight"
                  value={pubTitle}
                  onChange={handleTitleChange}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  URL Slug: <span className="font-mono text-brand-600 dark:text-brand-400">/story/{pubSlug || 'story-title'}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Primary Genre <span className="text-rose-500">*</span>
                </label>
                <select
                  value={pubGenre}
                  onChange={(e) => setPubGenre(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {genres.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Age Rating & Format Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Content Age Rating (Strict Backend Policy)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['3+', '7+', '13+', '16+', '18+'].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setPubAgeRating(rating)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        pubAgeRating === rating
                          ? rating === '18+'
                            ? 'bg-rose-500 text-white ring-2 ring-rose-500 shadow-md'
                            : rating === '16+'
                            ? 'bg-amber-500 text-white ring-2 ring-amber-500 shadow-md'
                            : 'bg-emerald-500 text-white ring-2 ring-emerald-500 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {pubAgeRating === '3+' && '🧒 Kids 3+ (Visible to minors under 18)'}
                  {pubAgeRating === '7+' && '🧒 Family 7+ (Visible to minors under 18)'}
                  {pubAgeRating === '13+' && '📚 Teens 13+ (Requires age 13+)'}
                  {pubAgeRating === '16+' && '🔥 Young Adult 16+ (Requires age 16+)'}
                  {pubAgeRating === '18+' && '🔞 Mature 18+ (Strictly blocked for minors)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Content Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('story')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'story'
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Serialized Text
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('picture_book')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'picture_book'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Picture Book
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Story Language &amp; Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={pubLanguage}
                    onChange={(e) => setPubLanguage(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="en">English (EN)</option>
                    <option value="ka">Georgian (KA)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="es">Spanish (ES)</option>
                  </select>
                  <select
                    value={pubStatus}
                    onChange={(e) => setPubStatus(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description & Tags */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    {pubContentType === 'picture_book' ? (
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold">
                        <span>🎨 Picture Book Synopsis &amp; Blurb</span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full font-black text-amber-700 dark:text-amber-300">Catalog Preview</span>
                      </span>
                    ) : (
                      'Synopsis / Story Description'
                    )} <span className="text-rose-500">*</span>
                  </label>
                  {pubContentType === 'picture_book' && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      🧒 Auto-categorized for Kids &amp; Family Section
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    pubContentType === 'picture_book'
                      ? "Describe the characters, bedtime adventure, and moral theme for young readers and parents..."
                      : "Hook readers with a gripping summary of the conflict, characters, and stakes..."
                  }
                  value={pubDescription}
                  onChange={(e) => setPubDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* DEDICATED PICTURE BOOK UPLOAD CENTER IN MODAL */}
              {pubContentType === 'picture_book' && renderPictureBookPagesManager()}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. fantasy, magic, royalty"
                    value={pubTags}
                    onChange={(e) => setPubTags(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Story Trope</label>
                  <select
                    value={pubTrope}
                    onChange={(e) => setPubTrope(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Enemies to Lovers">Enemies to Lovers</option>
                    <option value="Slow Burn">Slow Burn</option>
                    <option value="Chosen One">Chosen One</option>
                    <option value="Found Family">Found Family</option>
                    <option value="Second Chance">Second Chance</option>
                    <option value="Fake Dating">Fake Dating</option>
                    <option value="Time Travel">Time Travel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Mood</label>
                  <select
                    value={pubMood}
                    onChange={(e) => setPubMood(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Adventurous">Adventurous</option>
                    <option value="Heartwarming">Heartwarming</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Mysterious">Mysterious</option>
                    <option value="Dark & Gritty">Dark &amp; Gritty</option>
                    <option value="Inspiring">Inspiring</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Author Attribution & Cover Visuals */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-500" /> Cover Artwork &amp; Creator Persona
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select high-definition cover art and configure publisher attribution.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Cover Preview */}
              <div className="w-36 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative group">
                <img
                  src={pubCover}
                  alt="Story Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-black/60 text-white backdrop-blur-md">
                  Preview
                </span>
              </div>

              {/* Cover Presets & Inputs */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Quick 1-Click Cover Presets (Curated High-Res)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {coverPresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPubCover(preset.url)}
                        className={`p-2 text-left rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          pubCover === preset.url
                            ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Cover Image (URL or Device Upload)
                    </label>
                    <label className="text-xs font-bold text-brand-500 hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload Cover from Device
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or upload from device"
                    value={pubCover}
                    onChange={(e) => setPubCover(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Author Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Avora Editorial Desk"
                      value={pubAuthor}
                      onChange={(e) => setPubAuthor(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Author Username</label>
                    <input
                      type="text"
                      placeholder="e.g. avora_editorial"
                      value={pubAuthorUsername}
                      onChange={(e) => setPubAuthorUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Editorial Flags */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={pubIsOriginal}
                      onChange={(e) => setPubIsOriginal(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>🌟 Mark as House Original</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={pubIsEditorsPick}
                      onChange={(e) => setPubIsEditorsPick(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>💎 Editor's Pick Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={pubIsTrending}
                      onChange={(e) => setPubIsTrending(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>🔥 Feature in Trending Shelf</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Initial Chapter or Illustrated Pages */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                {pubContentType === 'story' ? 'Chapter 1 Manuscripts' : 'Illustrated Pages Manager'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pubContentType === 'story'
                  ? 'Input the initial serialization chapter. Paragraphs separated by blank lines will support reader inline comments.'
                  : 'Add sequential illustrated pages with captions and imagery for kids and graphic novels.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Chapter / Section Title
              </label>
              <input
                type="text"
                value={pubChapterTitle}
                onChange={(e) => setPubChapterTitle(e.target.value)}
                placeholder="e.g. Chapter 1: The Glass Needle"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
              />
            </div>

            {pubContentType === 'story' ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Chapter Text Content
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste or write the chapter manuscript here...\n\nSeparate each paragraph with an empty line so readers can quote and comment on specific sentences."
                  value={pubChapterBody}
                  onChange={(e) => setPubChapterBody(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {pubPages.map((page, pIdx) => (
                  <div key={page.id || pIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Page {pIdx + 1}</span>
                      {pubPages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPubPages(prev => prev.filter((_, i) => i !== pIdx))}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          Remove Page
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Page Image URL</label>
                        <input
                          type="url"
                          value={page.image}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, image: val } : p));
                          }}
                          placeholder="https://..."
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-xs font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Page Text / Caption</label>
                        <input
                          type="text"
                          value={page.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, text: val } : p));
                          }}
                          placeholder="Text narrative for this page..."
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPubPages(prev => [
                    ...prev,
                    { id: prev.length + 1, image: pubCover, text: 'And so the story continues...', caption: `Page ${prev.length + 1}` }
                  ])}
                  className="px-4 py-2 rounded-xl border border-dashed border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-xs font-bold transition-all cursor-pointer"
                >
                  + Add Another Illustrated Page
                </button>
              </div>
            )}
          </div>

          {/* Submission CTA Bar */}
          <div className="flex items-center justify-between gap-4 p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl shadow-xl">
            <div>
              <h4 className="font-extrabold text-sm">Ready to Publish to Live Catalog?</h4>
              <p className="text-xs text-white/70 dark:text-slate-600">The novel will immediately populate the home feed, genre directory, and search indexing.</p>
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-lg shadow-brand-500/30 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              🚀 Publish Story Directly
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
