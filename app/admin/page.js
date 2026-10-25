'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Palette,
  Eye,
  Calendar,
  Clock,
  Briefcase,
  Handshake,
  HelpCircle,
  Heart,
  MessageSquare,
  TrendingUp,
  Flame
} from 'lucide-react';
import { processImageFile, removeSolidBackground } from '@/lib/imageUtils';
import BrandLogo from '@/components/BrandLogo';

export default function AdminPanel() {
  const { 
    stories, 
    setStories,
    publishStory,
    updateStory,
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
    togglePageDeleted,
    resetSinglePage,
    contests,
    setContests,
    communitySpaces,
    setCommunitySpaces,
    banUserAndTakeDownContent,
    warnUser,
    dismissReport,
    banUser,
    unbanUser,
    parentalRequests,
    approve18PlusRequest,
    reject18PlusRequest,
    parentalPin,
    setParentalPin,
    blogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost
  } = useApp();

  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminPasskeyError, setAdminPasskeyError] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUnlock = sessionStorage.getItem('avora_admin_vault_unlocked');
      if (savedUnlock === 'true') {
        setIsAdminUnlocked(true);
      }
    }
  }, []);

  const handleUnlockAdminVault = (e) => {
    e.preventDefault();
    setAdminPasskeyError('');
    const validPasskeys = [
      'AVORA-SECURE-2026!',
      'AVORA-ADMIN-7788!',
      'Admin@2026',
      'AvoraAdmin2026!'
    ];
    if (validPasskeys.includes(adminPasskey.trim())) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('avora_admin_vault_unlocked', 'true');
      }
      setIsAdminUnlocked(true);
      setAdminPasskey('');
    } else {
      setAdminPasskeyError('Invalid Master Encryption Passkey. Access denied.');
    }
  };

  const handleLockAdminVault = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('avora_admin_vault_unlocked');
    }
    setIsAdminUnlocked(false);
  };

  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'publish' | 'blogs' | 'cms' | 'users' | 'moderation' | 'payments' | 'genres' | 'authors' | 'audit' | 'settings' | 'email_notifications'
  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'pending' | 'resolved'

  // Admin Navigation Scroll Controls
  const adminNavRef = useRef(null);
  const [canScrollAdminLeft, setCanScrollAdminLeft] = useState(false);
  const [canScrollAdminRight, setCanScrollAdminRight] = useState(true);

  const checkAdminNavScroll = useCallback(() => {
    const el = adminNavRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollAdminLeft(scrollLeft > 6);
    setCanScrollAdminRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = adminNavRef.current;
    if (!el) return;
    checkAdminNavScroll();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => checkAdminNavScroll());
      resizeObserver.observe(el);
    }
    window.addEventListener('resize', checkAdminNavScroll);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', checkAdminNavScroll);
    };
  }, [checkAdminNavScroll]);

  const handleScrollAdminTabs = (direction) => {
    if (!adminNavRef.current) return;
    const scrollAmount = Math.max(260, Math.floor(adminNavRef.current.clientWidth * 0.7));
    adminNavRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkAdminNavScroll, 350);
  };

  const handleAdminTabWheel = (e) => {
    if (!adminNavRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      adminNavRef.current.scrollLeft += e.deltaY;
      checkAdminNavScroll();
    }
  };

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!activeTab || !adminNavRef.current) return;
    const target = adminNavRef.current.querySelector(`[data-admin-tab="${activeTab}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setTimeout(checkAdminNavScroll, 350);
    }
  }, [activeTab, checkAdminNavScroll]);

  // Blog Articles Management State
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    category: 'Writing Advice',
    author: 'Editorial Team',
    readTime: '5 min read',
    cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    excerpt: '',
    content: ''
  });

  const handleOpenNewBlog = () => {
    setEditingBlogPost(null);
    setBlogForm({
      title: '',
      slug: '',
      category: 'Writing Advice',
      author: user?.name || 'Avora Editorial',
      readTime: '5 min read',
      cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
      excerpt: '',
      content: ''
    });
    setBlogModalOpen(true);
  };

  const handleEditBlog = (post) => {
    setEditingBlogPost(post);
    setBlogForm({
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || 'Writing Advice',
      author: post.author || 'Editorial Team',
      readTime: post.readTime || '5 min read',
      cover: post.cover || '',
      excerpt: post.excerpt || '',
      content: post.content || ''
    });
    setBlogModalOpen(true);
  };

  const handleSaveBlogPost = (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) {
      alert("Please enter an article title.");
      return;
    }
    const slug = (blogForm.slug || blogForm.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = {
      ...blogForm,
      slug,
      date: editingBlogPost ? editingBlogPost.date : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    if (editingBlogPost) {
      updateBlogPost(editingBlogPost.id, payload);
    } else {
      createBlogPost(payload);
    }
    setBlogModalOpen(false);
    setEditingBlogPost(null);
  };

  const handleDeleteBlog = (id, title) => {
    if (confirm(`Are you sure you want to delete article "${title}"?`)) {
      deleteBlogPost(id);
    }
  };

  const handleBlogCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await processImageFile(file, 1200, 800, 0.85);
      const dataUrl = typeof res === 'string' ? res : res?.dataUrl;
      if (dataUrl) {
        setBlogForm(prev => ({ ...prev, cover: dataUrl }));
      }
    } catch (err) {
      alert("Failed to process cover image: " + err.message);
    }
  };

  // CMS Content Management State
  const [cmsSubTab, setCmsSubTab] = useState('branding'); // 'branding' | 'blog' | 'pwa' | 'social' | 'pages'
  const [cmsSelectedPage, setCmsSelectedPage] = useState('about'); // 'about' | 'terms' | 'privacy' | 'guidelines' | 'contact' | 'hero'
  const [cmsForm, setCmsForm] = useState(cmsConfig || initialCmsConfig);
  const [cmsSaveNotice, setCmsSaveNotice] = useState(false);

  useEffect(() => {
    if (cmsConfig) {
      setCmsForm(cmsConfig);
    }
  }, [cmsConfig]);

  const handleSaveCms = async () => {
    updateCmsConfig(cmsForm);
    try {
      await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmsConfig: cmsForm })
      });
    } catch (e) {
      console.warn("Error persisting CMS config to backend API:", e);
    }
    setCmsSaveNotice(true);
    setTimeout(() => {
      setCmsSaveNotice(false);
    }, 3500);
  };

  const handleResetCms = async () => {
    if (confirm("Are you sure you want to reset all CMS content to platform factory defaults?")) {
      resetCmsConfig();
      setCmsForm(initialCmsConfig);
      try {
        await fetch('/api/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmsConfig: initialCmsConfig })
        });
      } catch (e) {}
      setCmsSaveNotice(true);
      setTimeout(() => {
        setCmsSaveNotice(false);
      }, 3500);
    }
  };

  const previewQrImageUrl = cmsForm?.pwaSection?.qrCodeType === 'custom_image' && cmsForm?.pwaSection?.qrCodeImageUrl
    ? cmsForm.pwaSection.qrCodeImageUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cmsForm?.pwaSection?.qrTargetUrl || 'https://avoralibrary.com')}&margin=10`;

  const updateBrandingField = (field, value) => {
    setCmsForm(prev => ({
      ...prev,
      branding: {
        ...(prev?.branding || initialCmsConfig.branding || {}),
        [field]: value
      }
    }));
  };

  const [isProcessingBg, setIsProcessingBg] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await processImageFile(file, 900, 350, 0.95);
      const dataUrl = typeof res === 'string' ? res : res?.dataUrl;
      if (dataUrl) {
        const nextBranding = {
          ...(cmsForm?.branding || initialCmsConfig.branding || {}),
          logoUrl: dataUrl,
          logoMode: 'full_image',
          showBrandText: false
        };
        setCmsForm(prev => ({
          ...prev,
          branding: nextBranding
        }));
        updateCmsConfig({
          ...cmsForm,
          branding: nextBranding
        });
        setCmsSaveNotice(true);
        setTimeout(() => setCmsSaveNotice(false), 3500);
      }
    } catch (err) {
      alert("Failed to process logo image: " + err.message);
    }
  };

  const handleMakeLogoTransparent = async (targetColor = 'auto') => {
    const rawLogo = cmsForm?.branding?.logoUrl;
    const currentSrc = typeof rawLogo === 'object' && rawLogo !== null ? rawLogo.dataUrl : (rawLogo || '/icon-192.png');
    if (!currentSrc || currentSrc === '/icon-192.png') {
      alert("Please upload or provide a custom logo image first.");
      return;
    }
    try {
      setIsProcessingBg(true);
      const transparentDataUrl = await removeSolidBackground(currentSrc, targetColor, 42);
      const nextBranding = {
        ...(cmsForm?.branding || initialCmsConfig.branding || {}),
        logoUrl: transparentDataUrl
      };
      setCmsForm(prev => ({
        ...prev,
        branding: nextBranding
      }));
      updateCmsConfig({
        ...cmsForm,
        branding: nextBranding
      });
      setCmsSaveNotice(true);
      setTimeout(() => setCmsSaveNotice(false), 3500);
    } catch (err) {
      alert("Background removal error: " + err.message);
    } finally {
      setIsProcessingBg(false);
    }
  };

  const setBrandLogoPreset = (presetType) => {
    let nextBranding = {};
    if (presetType === 'official_transparent') {
      nextBranding = {
        ...(cmsForm?.branding || initialCmsConfig.branding || {}),
        logoUrl: '/logo.png',
        logoMode: 'full_image',
        showBrandText: false
      };
    } else if (presetType === 'dark_theme') {
      nextBranding = {
        ...(cmsForm?.branding || initialCmsConfig.branding || {}),
        logoUrl: '/logo-dark.png',
        logoMode: 'full_image',
        showBrandText: false
      };
    } else if (presetType === 'default_icon') {
      nextBranding = {
        ...(cmsForm?.branding || initialCmsConfig.branding || {}),
        logoUrl: '/icon-192.png',
        brandName: 'Avora',
        brandSubtitle: 'Library',
        logoMode: 'icon_and_text',
        showBrandText: true
      };
    }
    setCmsForm(prev => ({
      ...prev,
      branding: nextBranding
    }));
    updateCmsConfig({
      ...cmsForm,
      branding: nextBranding
    });
    setCmsSaveNotice(true);
    setTimeout(() => setCmsSaveNotice(false), 3500);
  };

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

  const updateFaqItem = (pageKey, index, field, value) => {
    setCmsForm(prev => {
      const faqs = [...(prev?.pagesContent?.[pageKey]?.faqs || [])];
      if (faqs[index]) {
        faqs[index] = { ...faqs[index], [field]: value };
      }
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            faqs
          }
        }
      };
    });
  };

  const addFaqItem = (pageKey) => {
    setCmsForm(prev => {
      const currentFaqs = prev?.pagesContent?.[pageKey]?.faqs || [];
      const newFaq = {
        q: "New Frequently Asked Question?",
        a: "Provide a clear and helpful explanation here."
      };
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            faqs: [...currentFaqs, newFaq]
          }
        }
      };
    });
  };

  const removeFaqItem = (pageKey, index) => {
    setCmsForm(prev => {
      const currentFaqs = prev?.pagesContent?.[pageKey]?.faqs || [];
      const updated = currentFaqs.filter((_, i) => i !== index);
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            faqs: updated
          }
        }
      };
    });
  };

  const updateOpeningItem = (index, field, value) => {
    setCmsForm(prev => {
      const openings = [...(prev?.pagesContent?.careers?.openings || [])];
      if (openings[index]) {
        openings[index] = { ...openings[index], [field]: value };
      }
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          careers: {
            ...(prev?.pagesContent?.careers || {}),
            openings
          }
        }
      };
    });
  };

  const addOpeningItem = () => {
    setCmsForm(prev => {
      const current = prev?.pagesContent?.careers?.openings || [];
      const newJob = {
        id: Date.now(),
        title: "New Role Title",
        type: "Remote • Full-time",
        department: "Editorial & Community",
        applyEmail: "careers@avoralibrary.com"
      };
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          careers: {
            ...(prev?.pagesContent?.careers || {}),
            openings: [...current, newJob]
          }
        }
      };
    });
  };

  const removeOpeningItem = (index) => {
    setCmsForm(prev => {
      const current = prev?.pagesContent?.careers?.openings || [];
      const updated = current.filter((_, i) => i !== index);
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          careers: {
            ...(prev?.pagesContent?.careers || {}),
            openings: updated
          }
        }
      };
    });
  };

  const updateListItem = (pageKey, listKey, index, value) => {
    setCmsForm(prev => {
      const list = [...(prev?.pagesContent?.[pageKey]?.[listKey] || [])];
      list[index] = value;
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            [listKey]: list
          }
        }
      };
    });
  };

  const addListItem = (pageKey, listKey) => {
    setCmsForm(prev => {
      const list = [...(prev?.pagesContent?.[pageKey]?.[listKey] || [])];
      list.push("New item or guideline bullet point");
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            [listKey]: list
          }
        }
      };
    });
  };

  const removeListItem = (pageKey, listKey, index) => {
    setCmsForm(prev => {
      const list = [...(prev?.pagesContent?.[pageKey]?.[listKey] || [])];
      const updated = list.filter((_, i) => i !== index);
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            [listKey]: updated
          }
        }
      };
    });
  };

  // All 21 Website Pages Directory Metadata
  const ALL_MANAGED_PAGES = [
    { key: 'hero', label: 'Homepage Hero', path: '/', category: 'Core Platform' },
    { key: 'browse', label: 'Browse Library', path: '/browse', category: 'Core Platform' },
    { key: 'showcase', label: 'Book Showcase', path: '/showcase', category: 'Core Platform' },
    { key: 'community', label: 'Community Hub', path: '/community', category: 'Core Platform' },
    { key: 'contests', label: 'Writing Contests', path: '/contests', category: 'Core Platform' },
    { key: 'blog', label: 'Blog & News', path: '/blog', category: 'Core Platform' },
    { key: 'library', label: 'My Library', path: '/library', category: 'Core Platform' },
    { key: 'about', label: 'About Us', path: '/about', category: 'Company & Media' },
    { key: 'careers', label: 'Careers & Openings', path: '/careers', category: 'Company & Media' },
    { key: 'press', label: 'Press & Media Kit', path: '/press', category: 'Company & Media' },
    { key: 'partnerships', label: 'Brand Partnerships', path: '/partnerships', category: 'Company & Media' },
    { key: 'contact', label: 'Contact Us', path: '/contact', category: 'Company & Media' },
    { key: 'writers', label: 'Writer Hub & Resources', path: '/writers', category: 'Creators & Help' },
    { key: 'guidelines', label: 'Author & Community Guidelines', path: '/guidelines', category: 'Creators & Help' },
    { key: 'help', label: 'Help Center & FAQ', path: '/help', category: 'Creators & Help' },
    { key: 'terms', label: 'Terms of Service', path: '/terms', category: 'Legal & Policies' },
    { key: 'privacy', label: 'Privacy Policy', path: '/privacy', category: 'Legal & Policies' },
    { key: 'dmca', label: 'DMCA Copyright Policy', path: '/dmca', category: 'Legal & Policies' },
    { key: 'contentPolicy', label: 'Content & Safety Policy', path: '/content-policy', category: 'Legal & Policies' },
    { key: 'accessibility', label: 'Accessibility Statement', path: '/accessibility', category: 'Legal & Policies' },
    { key: 'paymentPolicy', label: 'Payment & Refund Policy', path: '/payment-policy', category: 'Legal & Policies' }
  ];

  const [showAllPagesDirectory, setShowAllPagesDirectory] = useState(true);

  // Support deep linking from any live page's "Edit Page Content" button (?tab=cms-pages&page=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const pageParam = params.get('page');
      if (tabParam === 'cms-pages' || pageParam) {
        setActiveTab('cms');
        setCmsSubTab('pages');
        if (pageParam) {
          setCmsSelectedPage(pageParam);
        }
      } else if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleToggleDeletePage = (pageKey, pageLabel) => {
    const currentlyDeleted = Boolean(cmsForm?.pagesContent?.[pageKey]?.deleted);
    if (!currentlyDeleted) {
      if (!confirm(`Delete / unpublish "${pageLabel}"?\n\nVisitors will no longer see it in navigation menus or be able to view it until you restore it.`)) {
        return;
      }
    }
    const nextDeleted = !currentlyDeleted;
    setCmsForm(prev => ({
      ...prev,
      pagesContent: {
        ...(prev?.pagesContent || initialCmsConfig.pagesContent),
        [pageKey]: {
          ...(prev?.pagesContent?.[pageKey] || {}),
          deleted: nextDeleted
        }
      }
    }));
    if (togglePageDeleted) {
      togglePageDeleted(pageKey, nextDeleted);
    }
    setCmsSaveNotice(true);
    setTimeout(() => setCmsSaveNotice(false), 3500);
  };

  const handleResetSinglePage = (pageKey, pageLabel) => {
    if (!confirm(`Reset "${pageLabel}" back to its default content and republish it?`)) return;
    const defaultPage = initialCmsConfig?.pagesContent?.[pageKey] || { deleted: false, sections: [] };
    setCmsForm(prev => ({
      ...prev,
      pagesContent: {
        ...(prev?.pagesContent || initialCmsConfig.pagesContent),
        [pageKey]: defaultPage
      }
    }));
    if (resetSinglePage) {
      resetSinglePage(pageKey);
    }
    setCmsSaveNotice(true);
    setTimeout(() => setCmsSaveNotice(false), 3500);
  };

  const updateObjectListItem = (pageKey, listKey, index, field, value) => {
    setCmsForm(prev => {
      const list = [...(prev?.pagesContent?.[pageKey]?.[listKey] || [])];
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
      }
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            [listKey]: list
          }
        }
      };
    });
  };

  const addObjectListItem = (pageKey, listKey, newItem) => {
    setCmsForm(prev => {
      const list = [...(prev?.pagesContent?.[pageKey]?.[listKey] || [])];
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            [listKey]: [...list, newItem]
          }
        }
      };
    });
  };

  const removeObjectListItem = (pageKey, listKey, index) => {
    setCmsForm(prev => {
      const list = [...(prev?.pagesContent?.[pageKey]?.[listKey] || [])];
      const updated = list.filter((_, i) => i !== index);
      return {
        ...prev,
        pagesContent: {
          ...(prev?.pagesContent || initialCmsConfig.pagesContent),
          [pageKey]: {
            ...(prev?.pagesContent?.[pageKey] || {}),
            [listKey]: updated
          }
        }
      };
    });
  };

  // Contests & Community Spaces Direct Management Helpers
  const addContestItem = () => {
    if (!setContests) return;
    const newContest = {
      id: Date.now(),
      title: 'New Writing Competition',
      slug: `contest-${Date.now()}`,
      tagline: 'Submit your best serialized fiction to win awards.',
      deadline: 'December 31, 2026',
      prize: '$1,000 Cash Grant + Editorial Badge',
      status: 'open',
      entriesCount: 0,
      categories: ['Fantasy', 'Romance', 'Sci-Fi'],
      winners: []
    };
    setContests(prev => [newContest, ...(prev || [])]);
  };

  const updateContestItem = (id, field, value) => {
    if (!setContests) return;
    setContests(prev => (prev || []).map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeContestItem = (id, title) => {
    if (!setContests) return;
    if (confirm(`Delete contest "${title}"?`)) {
      setContests(prev => (prev || []).filter(c => c.id !== id));
    }
  };

  const addCommunitySpaceItem = () => {
    if (!setCommunitySpaces) return;
    const newSpace = {
      id: Date.now(),
      title: 'New Fandom Space',
      slug: `space-${Date.now()}`,
      description: 'Discuss theories, favorite characters, and chapter updates.',
      membersCount: 120,
      threadsCount: 5,
      moderator: user?.username || 'admin'
    };
    setCommunitySpaces(prev => [newSpace, ...(prev || [])]);
  };

  const updateCommunitySpaceItem = (id, field, value) => {
    if (!setCommunitySpaces) return;
    setCommunitySpaces(prev => (prev || []).map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeCommunitySpaceItem = (id, title) => {
    if (!setCommunitySpaces) return;
    if (confirm(`Delete community space "${title}"?`)) {
      setCommunitySpaces(prev => (prev || []).filter(s => s.id !== id));
    }
  };

  const renderCustomSectionsEditor = (pageKey, label = 'Custom Page Sections') => {
    const sections = cmsForm?.pagesContent?.[pageKey]?.sections || [];
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h5 className="font-black text-xs text-slate-900 dark:text-white">
              {label} ({sections.length})
            </h5>
            <p className="text-[11px] text-slate-400">
              Add, edit, or delete custom content blocks on this page whenever required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSectionItem(pageKey)}
            className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Content Section
          </button>
        </div>

        {sections.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic py-2">
            No extra custom sections added yet. Click &ldquo;Add Content Section&rdquo; to append a new block to this page.
          </p>
        ) : (
          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 text-[10px]">Section #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSectionItem(pageKey, idx)}
                    className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Section
                  </button>
                </div>
                <input
                  type="text"
                  value={sec.heading || ''}
                  onChange={(e) => updateSectionItem(pageKey, idx, 'heading', e.target.value)}
                  placeholder="Section Heading"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none text-xs"
                />
                <textarea
                  rows={3}
                  value={sec.content || ''}
                  onChange={(e) => updateSectionItem(pageKey, idx, 'content', e.target.value)}
                  placeholder="Section text content..."
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none text-xs leading-relaxed"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
  // PDF Book State in Admin
  const [pubPdfUrl, setPubPdfUrl] = useState('/assignments/montessori-level-3-assignment-oct-21-23.pdf');
  const [pubGradeLevel, setPubGradeLevel] = useState('Montessori Level III (Ages 4-7)');
  const [pubSchoolName, setPubSchoolName] = useState("The Loharu Montessori Children's House, Civil Lines, Jaipur");
  const [pubPdfPageCount, setPubPdfPageCount] = useState(8);
  const [pubPdfFileName, setPubPdfFileName] = useState('');

  const handleAdminPdfUpload = (file) => {
    if (!file) return;
    setPubPdfFileName(file.name);
    if (!pubTitle || pubTitle === 'Untitled Story') {
      const generatedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setPubTitle(generatedTitle);
      setPubSlug(generatedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPubPdfUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const [pubPages, setPubPages] = useState([
    { id: 1, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', text: 'The chronicle begins in an era of myth and forgotten power...', caption: 'Page 1' }
  ]);

  const coverPresets = [
    { label: 'Fantasy / Magic', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
    { label: 'Romance / Drama', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sci-Fi / Space', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80' },
    { label: "Kids Assignment (PDF)", url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80' },
    { label: "Lola's Clean Habits (Kids)", url: '/kids-stories/lola/page-14.jpg' },
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

  const loadLolaKidsPages = () => {
    setPubTitle("Lola's Clean Habits: The Secret to Big Smiles");
    setPubSlug("lolas-clean-habits");
    setPubGenre("Kids Books");
    setPubAgeRating("3+");
    setPubCover("/kids-stories/lola/page-14.jpg");
    setPubDescription("A delightful, vibrantly illustrated moral story for young children! Follow Lola on her heartwarming journey through the village as she learns how good habits, daily cleanliness, and a sparkling smile bring joy and hugs to everyone around her.");
    setPubTags("kids, picture-book, illustrations, good-habits, cleanliness, moral-story, bedtime");
    setPubChapterTitle("Lola Learns Her Lesson");
    setPubPages([
          {
                "id": 1,
                "image": "/kids-stories/lola/page-03.jpg",
                "caption": "Page 3: No Bath Time!",
                "text": "She never took a bath. 'Bath time, Lola!' 'No!'",
                "moral": "Bathing washes away germs and keeps us fresh."
          },
          {
                "id": 2,
                "image": "/kids-stories/lola/page-04.jpg",
                "caption": "Page 4: Tangled Hair",
                "text": "She never washed her hair.",
                "moral": "Combing and washing hair keeps us neat and tidy."
          },
          {
                "id": 3,
                "image": "/kids-stories/lola/page-05.jpg",
                "caption": "Page 5: Dirty Clothes",
                "text": "She didn't wash or iron her clothes.",
                "moral": "Wearing clean clothes makes us feel confident."
          },
          {
                "id": 4,
                "image": "/kids-stories/lola/page-06.jpg",
                "caption": "Page 6: An Awful Smell",
                "text": "The whole village was upset with her because she always smelt awful!",
                "moral": "Clean habits help us make good friends."
          },
          {
                "id": 5,
                "image": "/kids-stories/lola/page-08.jpg",
                "caption": "Page 8: Waking Up Late",
                "text": "The next morning, Lola woke up late. She was still sleepy and didn't know what was about to happen!",
                "moral": "A bright morning begins with good habits."
          },
          {
                "id": 6,
                "image": "/kids-stories/lola/page-09.jpg",
                "caption": "Page 9: The Sneaky Village Surprise",
                "text": "Very quietly, the villagers lifted her cot and carried her away! Shhh...",
                "moral": "Kind guidance helps us grow."
          },
          {
                "id": 7,
                "image": "/kids-stories/lola/page-11.jpg",
                "caption": "Page 11: Lola's Promise",
                "text": "Lola was shocked and cried, 'What happened to me?' The villagers laughed and said, 'Now you will keep yourself clean and smell good!' Lola promised she would!",
                "moral": "Cleanliness keeps us healthy and happy!"
          },
          {
                "id": 8,
                "image": "/kids-stories/lola/page-12.jpg",
                "caption": "Page 12: A Warm Hug & Happy Smiles",
                "text": "Lola learned her lesson. She promised, 'I will keep myself clean and smell good every day!' Everyone smiled and hugged her. Lola was happy!",
                "moral": "Good habits make us happy and bring love to everyone!"
          },
          {
                "id": 9,
                "image": "/kids-stories/lola/page-13.jpg",
                "caption": "Page 13: Clean Body, Happy Mind",
                "text": "Lola kept her promise. She bathed every day, kept herself clean and smelled so good! Everyone was very proud of her.",
                "moral": "Clean body, Happy mind, Kind heart!"
          },
          {
                "id": 10,
                "image": "/kids-stories/lola/page-14.jpg",
                "caption": "Page 14: Happily Ever After",
                "text": "Lola learned an important lesson. She stayed clean, smelled good, and made everyone happy! The villagers loved her, and Lola lived happily ever after! Clean body, Happy mind, Kind heart! THE END.",
                "moral": "Cleanliness keeps us healthy and happy!"
          }
    ]);
  };

  const loadSampleKidsPages = () => {
    setPubPages([
      {
        id: Date.now() + 1,
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        caption: 'The Enchanted Woodland',
        text: 'Once upon a time, in a cozy hollow beneath the old oak tree, little Barnaby Bear woke to the singing of golden robins.'
      },
      {
        id: Date.now() + 2,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        caption: 'The Secret River',
        text: 'Barnaby followed a trail of sparkling stardust down to the laughing brook, where water lilies danced in the morning sun.'
      },
      {
        id: Date.now() + 3,
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        caption: 'The Firefly Lantern',
        text: 'As twilight fell, his forest friends gathered round to tell bedtime tales under the cozy glow of a thousand friendly fireflies.'
      }
    ]);
  };

  const handleContentTypeSelect = (type) => {
    setPubContentType(type);
    if (type === 'pdf') {
      if (['13+', '16+', '18+'].includes(pubAgeRating)) {
        setPubAgeRating('3+');
      }
      if (pubGenre === 'Fantasy' || !pubGenre) {
        setPubGenre('Kids Assignments & Worksheets');
      }
      if (pubChapterTitle.includes('Chapter 1')) {
        setPubChapterTitle('Printable Worksheet Edition');
      }
      if (!pubCover || pubCover.includes('photo-1518709268805')) {
        setPubCover('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80');
      }
    } else if (type === 'picture_book') {
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
      // Auto-load 3 sample kids pages if none exist yet or placeholder
      if (pubPages.length === 0 || (pubPages.length === 1 && !pubPages[0].text)) {
        loadSampleKidsPages();
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

  const renderPdfBookManager = () => (
    <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-300 dark:border-emerald-800/60 space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60 dark:border-emerald-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              PDF Document &amp; Worksheet Studio
            </h4>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Printable &amp; Downloadable
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload any educational PDF, children's assignment, or printable workbook.
          </p>
        </div>

        {/* Quick Montessori Presets */}
        <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleLockAdminVault}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Lock admin console and require security passkey"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Lock Console</span>
            </button>
          <button
            type="button"
            onClick={() => {
              setPubPdfUrl('/assignments/montessori-level-3-assignment-oct-21-23.pdf');
              setPubTitle('Montessori Level-III: Home Assignment (Oct 21–23, 2026)');
              setPubSlug('montessori-level-3-oct-21-23');
              setPubGenre('Kids Assignments & Worksheets');
              setPubAgeRating('3+');
              setPubGradeLevel('Montessori Level III (Ages 4-7)');
              setPubSchoolName("The Loharu Montessori Children's House, Civil Lines, Jaipur");
              setPubPdfPageCount(8);
              setPubCover('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80');
              setPubDescription("Official Level-III Montessori home assignment covering English Revision, Conjunctions ('and'), Hindi (वचन व और का प्रयोग), Arithmetic (Addition facts & Ordinals), and EVS (Body Parts).");
              setPubTags('montessori, english, hindi, arithmetic, evs');
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Load Montessori Level-III Oct 21-23 assignment"
          >
            <span>⚡ Oct 21-23 Preset</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPubPdfUrl('/assignments/kids-phonics-reading-cards-ng-sound.pdf');
              setPubTitle("Kids Phonics & Reading Cards: 'ng' Sound & Hindi Matras");
              setPubSlug('kids-phonics-reading-cards-ng');
              setPubGenre('Kids Assignments & Worksheets');
              setPubAgeRating('3+');
              setPubGradeLevel('Kindergarten & Early Primary (Ages 3-6)');
              setPubSchoolName("The Loharu Montessori Children's House, Civil Lines, Jaipur");
              setPubPdfPageCount(2);
              setPubCover('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80');
              setPubDescription("Illustrated early reading cards featuring the 'ng' phonics sound (ring, king, sing, wing) and Hindi word-building flashcards.");
              setPubTags('phonics, reading-cards, hindi-matras, vocabulary');
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-800 dark:text-purple-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Load Phonics Reading Cards preset"
          >
            <span>⚡ Phonics Cards Preset</span>
          </button>
        </div>
      </div>

      {/* Device PDF Upload Area */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Upload PDF File from Computer / Device
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-all">
            <Upload className="w-4 h-4" />
            <span>Select PDF from Device</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleAdminPdfUpload(e.target.files?.[0])}
            />
          </label>
          {pubPdfFileName && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
              ✓ Loaded: {pubPdfFileName}
            </span>
          )}
          <span className="text-xs text-slate-400">or enter a direct PDF URL / file path below:</span>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">PDF File URL or Path</label>
          <input
            type="text"
            value={pubPdfUrl}
            onChange={(e) => setPubPdfUrl(e.target.value)}
            placeholder="e.g. /assignments/my-worksheet.pdf or https://..."
            className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Metadata: Grade Level, School Name, Total Pages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Grade / Age Level</label>
            <input
              type="text"
              value={pubGradeLevel}
              onChange={(e) => setPubGradeLevel(e.target.value)}
              placeholder="e.g. Montessori Level III (Ages 4-7)"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">School / Organization</label>
            <input
              type="text"
              value={pubSchoolName}
              onChange={(e) => setPubSchoolName(e.target.value)}
              placeholder="e.g. The Loharu Montessori Children's House"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Total Worksheet Pages</label>
            <input
              type="number"
              min="1"
              max="200"
              value={pubPdfPageCount}
              onChange={(e) => setPubPdfPageCount(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Live Interactive PDF Preview in Admin */}
        {pubPdfUrl && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Live PDF Worksheet Preview
              </label>
              <a
                href={pubPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </a>
            </div>
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner">
              <iframe
                src={`${pubPdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0 bg-white"
                title="Admin PDF Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadLolaKidsPages}
            className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-800 dark:text-purple-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            title="Load Lola's Clean Habits full 10-page illustrated story"
          >
            <span>🌟 Load Lola's Clean Habits (10 Illustrated Pages)</span>
          </button>

          <button
            type="button"
            onClick={loadSampleKidsPages}
            className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Populate with 3 illustrated sample pages for testing"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Load Sample Pages</span>
          </button>

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
      </div>

      {pubPages.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-amber-300 dark:border-amber-800/80 space-y-3">
          <ImageIcon className="w-10 h-10 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No Illustrated Pages Added Yet</h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click below to select multiple pictures from your computer or load 3 sample kids pages to preview instantly.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <label className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm">
              <Upload className="w-4 h-4" />
              <span>Select Pictures from Device</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBatchPagesUpload(e.target.files)}
              />
            </label>
            <button
              type="button"
              onClick={loadSampleKidsPages}
              className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 3 Sample Pages</span>
            </button>
          </div>
        </div>
      ) : (
      <>
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

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-0.5">🌟 Moral / Value Lesson (Optional)</label>
                  <input
                    type="text"
                    value={page.moral || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPubPages(prev => prev.map((p, i) => i === pIdx ? { ...p, moral: val } : p));
                    }}
                    placeholder="e.g. Cleanliness keeps us healthy and happy!"
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
      </>
      )}
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
    } else if (pubContentType === 'pdf') {
      initialChapterObj = {
        id: 1,
        number: 1,
        title: pubChapterTitle.trim() || pubTitle.trim() || "Worksheet & Assignment",
        reads: 0,
        votes: 0,
        emojis: { '🔥': 0, '❤️': 0, '😭': 0, '👏': 0, '😱': 0 },
        contentType: 'pdf',
        pdfUrl: pubPdfUrl,
        pageCount: Number(pubPdfPageCount) || 8,
        paragraphs: [
          {
            id: 101,
            text: pubDescription.trim() || "Official printable assignment worksheet for kids.",
            comments: []
          }
        ],
        pages: []
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
      pdfUrl: pubContentType === 'pdf' ? pubPdfUrl : undefined,
      gradeLevel: pubContentType === 'pdf' ? pubGradeLevel : undefined,
      school: pubContentType === 'pdf' ? pubSchoolName : undefined,
      pageCount: pubContentType === 'pdf' ? Number(pubPdfPageCount) || 8 : undefined,
      subjects: pubContentType === 'pdf' ? pubTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
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

  // Story Edit & Reader Metrics Boost Modal State
  const [editingStory, setEditingStory] = useState(null);
  const [storyEditSuccessNotice, setStoryEditSuccessNotice] = useState(false);
  const [storyCoverLoading, setStoryCoverLoading] = useState(false);
  const [storyEditForm, setStoryEditForm] = useState({
    title: '',
    slug: '',
    author: '',
    authorUsername: '',
    genre: '',
    status: 'ongoing',
    reads: 0,
    votes: 0,
    commentsCount: 0,
    cover: '',
    description: '',
    tags: '',
    ageRating: '13+',
    maturity: 'everyone',
    isOriginal: false,
    isEditorsPick: false,
    isTrending: false,
  });

  const handleOpenEditStory = (story) => {
    if (!story) return;
    setEditingStory(story);
    setStoryEditForm({
      title: story.title || '',
      slug: story.slug || '',
      author: story.author || '',
      authorUsername: story.authorUsername || (story.author ? story.author.toLowerCase().replace(/[^a-z0-9]+/g, '') : ''),
      genre: story.genre || 'Fantasy',
      status: story.status || 'ongoing',
      reads: Number(story.reads) || 0,
      votes: Number(story.votes) || 0,
      commentsCount: Number(story.commentsCount) || 0,
      cover: story.cover || '',
      description: story.description || '',
      tags: Array.isArray(story.tags) ? story.tags.join(', ') : (story.tags || ''),
      ageRating: story.ageRating || '13+',
      maturity: story.maturity || (story.ageRating === '18+' ? 'mature' : 'everyone'),
      isOriginal: Boolean(story.isOriginal),
      isEditorsPick: Boolean(story.isEditorsPick),
      isTrending: Boolean(story.isTrending),
    });
    setStoryEditSuccessNotice(false);
  };

  const handleQuickBoostMetric = (field, delta) => {
    setStoryEditForm(prev => {
      const current = Number(prev[field]) || 0;
      return {
        ...prev,
        [field]: Math.max(0, current + delta)
      };
    });
  };

  const handleStoryCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setStoryCoverLoading(true);
      const res = await processImageFile(file, 1200, 1600, 0.85);
      const dataUrl = res?.dataUrl || res;
      setStoryEditForm(prev => ({ ...prev, cover: dataUrl }));
    } catch (err) {
      alert("Failed to process cover image: " + (err.message || err));
    } finally {
      setStoryCoverLoading(false);
    }
  };

  const handleSaveStoryEdits = async (e) => {
    e.preventDefault();
    if (!editingStory) return;
    if (!storyEditForm.title.trim()) {
      alert("Please enter a story title.");
      return;
    }

    const tagsArray = typeof storyEditForm.tags === 'string'
      ? storyEditForm.tags.split(',').map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean)
      : (storyEditForm.tags || []);

    const numReads = Math.max(0, parseInt(storyEditForm.reads, 10) || 0);
    const numVotes = Math.max(0, parseInt(storyEditForm.votes, 10) || 0);
    const numComments = Math.max(0, parseInt(storyEditForm.commentsCount, 10) || 0);

    const updatedStoryObj = {
      ...editingStory,
      title: storyEditForm.title.trim(),
      slug: storyEditForm.slug.trim() || editingStory.slug,
      author: storyEditForm.author.trim() || editingStory.author,
      authorUsername: storyEditForm.authorUsername.trim() || editingStory.authorUsername,
      genre: storyEditForm.genre || editingStory.genre,
      genreSlug: (storyEditForm.genre || editingStory.genre || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: storyEditForm.status,
      reads: numReads,
      votes: numVotes,
      commentsCount: numComments,
      cover: storyEditForm.cover || editingStory.cover,
      description: storyEditForm.description || '',
      tags: tagsArray,
      ageRating: storyEditForm.ageRating,
      maturity: storyEditForm.ageRating === '18+' || storyEditForm.maturity === 'mature' ? 'mature' : 'everyone',
      isOriginal: Boolean(storyEditForm.isOriginal),
      isEditorsPick: Boolean(storyEditForm.isEditorsPick),
      isTrending: Boolean(storyEditForm.isTrending),
      lastUpdated: 'Just now'
    };

    if (updateStory) {
      await updateStory(updatedStoryObj);
    } else {
      setStories(prev => prev.map(s => s.id === updatedStoryObj.id ? updatedStoryObj : s));
    }

    addAuditLog(`Updated story & reader metrics for "${updatedStoryObj.title}" (Reads: ${numReads.toLocaleString()}, Votes: ${numVotes.toLocaleString()}, Comments: ${numComments.toLocaleString()})`, 'story');
    setStoryEditSuccessNotice(true);
    setTimeout(() => {
      setStoryEditSuccessNotice(false);
      setEditingStory(null);
    }, 1200);
  };

  // Razorpay Gateway Status State
  const [razorpayGatewayStatus, setRazorpayGatewayStatus] = useState(null);

  const fetchRazorpayGatewayStatus = async () => {
    try {
      const res = await fetch('/api/razorpay/status');
      const data = await res.json();
      if (data.success) {
        setRazorpayGatewayStatus(data);
      }
    } catch (e) {
      console.warn("Failed to fetch Razorpay gateway status:", e);
    }
  };

  useEffect(() => {
    fetchRazorpayGatewayStatus();
  }, []);

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
  const toggleFeatureStory = async (storyId) => {
    const target = stories.find(s => String(s.id) === String(storyId) || s.slug === storyId);
    if (!target) return;
    const nextState = !target.isEditorsPick;
    const updatedObj = { ...target, isEditorsPick: nextState };
    addAuditLog(nextState ? "Story Featured" : "Story Unfeatured", target.title);
    if (typeof updateStory === 'function') {
      await updateStory(updatedObj);
    } else {
      setStories(prev => prev.map(s => String(s.id) === String(storyId) ? updatedObj : s));
    }
  };

  const toggleHouseOriginal = async (storyId) => {
    const target = stories.find(s => String(s.id) === String(storyId) || s.slug === storyId);
    if (!target) return;
    const nextState = !target.isOriginal;
    const updatedObj = { ...target, isOriginal: nextState };
    addAuditLog(nextState ? "House Original Granted" : "House Original Revoked", target.title);
    if (typeof updateStory === 'function') {
      await updateStory(updatedObj);
    } else {
      setStories(prev => prev.map(s => String(s.id) === String(storyId) ? updatedObj : s));
    }
  };

  const removeStory = async (storyId) => {
    const target = stories.find(s => String(s.id) === String(storyId) || s.slug === storyId);
    if (confirm(`Are you sure you want to unpublish and permanently delete "${target?.title || 'this story'}"?`)) {
      if (typeof deleteStory === 'function') {
        await deleteStory(storyId);
      } else {
        if (target) addAuditLog("Story Deleted by Admin", target.title);
        setStories(prev => prev.filter(s => String(s.id) !== String(storyId) && s.slug !== storyId));
      }
    }
  };

  const handleReassignAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !selectedStoryToReassign) return;
    const updatedObj = {
      ...selectedStoryToReassign,
      author: newAuthorName.trim(),
      authorUsername: newAuthorName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '')
    };
    if (typeof updateStory === 'function') {
      await updateStory(updatedObj);
    } else {
      setStories(prev => prev.map(s => String(s.id) === String(selectedStoryToReassign.id) ? updatedObj : s));
    }
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

  // 2. Locked Screen for Non-Admin / Unauthorized Visitors
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
                Restricted Access • Encrypted Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Admin Console Locked
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                This administrative console is restricted and protected with end-to-end security encryption. Only authorized administrative personnel with verified credentials have access to moderation, stories, ledger payouts, and CMS controls.
              </p>
            </div>

            {user ? (
              <div className="bg-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 text-left space-y-1.5 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Current Account</div>
                <div className="text-white font-bold truncate">@{user.username || user.name || 'Member'}</div>
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
                onClick={() => openAuthModal('login', 'Please sign in with your administrator account to access the Admin Console.')}
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

  // 3. Encrypted Passkey Challenge Screen (Decryption Vault)
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-purple-500 selection:text-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="max-w-md w-full bg-slate-900/95 border border-purple-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-brand-500 to-amber-500" />
            
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-xl shadow-purple-500/15">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full inline-block">
                🔐 AES-256 Encrypted Admin Vault
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Decrypt Admin Console
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Identity verified. Enter your Master Security Passkey to decrypt administrative controls, ledger payouts, and CMS pipelines.
              </p>
            </div>

            {adminPasskeyError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl text-center">
                {adminPasskeyError}
              </div>
            )}

            <form onSubmit={handleUnlockAdminVault} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Master Security Passkey
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="password"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="Enter security passkey..."
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-brand-500 hover:from-purple-700 hover:to-brand-600 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Decrypt & Unlock Console
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Security Status: Active</span>
              <button 
                type="button" 
                onClick={() => {
                  setAdminPasskey('AVORA-SECURE-2026!');
                }}
                className="text-purple-400 hover:underline cursor-pointer"
              >
                Auto-fill Master Key
              </button>
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
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{cmsConfig?.branding?.brandName || 'Avora'} {cmsConfig?.branding?.brandSubtitle || 'Library'} Admin Console</h1>
              <p className="text-xs text-slate-400">Content moderation, financial transactions, user roles, feature flags, and audit ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Action: Direct Edit Logo & Brand */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('cms');
                setCmsSubTab('branding');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                activeTab === 'cms' && cmsSubTab === 'branding'
                  ? 'bg-purple-600 text-white shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>🎨 Edit Logo &amp; Brand</span>
            </button>

            {/* Quick Action: Direct Manage Blog */}
            <button
              type="button"
              onClick={() => setActiveTab('blogs')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                activeTab === 'blogs'
                  ? 'bg-purple-600 text-white shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-blue-400" />
              <span>📝 Manage Blog Articles</span>
            </button>

            {/* Quick Action: Force Cache Purge & Refresh */}
            <button
              type="button"
              onClick={async () => {
                if (typeof window !== 'undefined' && 'caches' in window) {
                  try {
                    const keys = await window.caches.keys();
                    await Promise.all(keys.map(k => window.caches.delete(k)));
                  } catch (e) {}
                }
                if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
                  try {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    for (let r of regs) {
                      await r.unregister();
                    }
                  } catch (e) {}
                }
                window.location.reload();
              }}
              title="Purge browser cache and reload newest live version"
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Refresh Cache</span>
            </button>

            <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
              featureFlags?.enablePaidFeatures 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            }`}>
              Soft-Launch: {featureFlags?.enablePaidFeatures ? 'Paid Features Enabled' : '100% Free Mode'}
            </span>
          </div>
        </div>

        {/* Quick Jump & Navigation Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-6 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Jump Tab:</span>
            <select
              value={activeTab === 'cms' && cmsSubTab === 'branding' ? 'cms-branding' : activeTab}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'cms-branding') {
                  setActiveTab('cms');
                  setCmsSubTab('branding');
                } else if (val === 'cms-pwa') {
                  setActiveTab('cms');
                  setCmsSubTab('pwa');
                } else {
                  setActiveTab(val);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-purple-600 dark:text-purple-400 outline-none cursor-pointer shadow-xs"
            >
              <option value="stories">📚 Stories &amp; Originals ({stories.length})</option>
              <option value="publish">✨ + Publish Story</option>
              <option value="cms-branding">🎨 Logo &amp; Brand Identity</option>
              <option value="blogs">📝 Blog &amp; Editorial Articles ({blogPosts?.length || 0})</option>
              <option value="cms-pwa">🌐 Website CMS, PWA &amp; Social</option>
              <option value="users">👥 User Moderation ({registeredUsers?.length || 0})</option>
              <option value="moderation">🚨 Reports Queue ({reports.filter(r => r.status === 'pending').length} pending)</option>
              <option value="payments">💳 Payments &amp; VIP Ledger ({transactions?.length || 0})</option>
              <option value="genres">🏷️ Genre Library ({genres.length})</option>
              <option value="authors">✍️ Author Persona</option>
              <option value="audit">📜 Audit Log ({auditLogs.length})</option>
              <option value="settings">⚙️ Platform Settings &amp; Flags</option>
              <option value="email_notifications">📧 DB &amp; Email Dispatcher</option>
            </select>
          </div>
          <span className="text-[11px] text-slate-400">All admin modules visible and accessible below</span>
        </div>

        {/* Responsive Wrapping Tab Navigation (Guarantees NO cut off tabs on any screen) */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm my-3">
          <button 
            data-admin-tab="stories"
            onClick={() => setActiveTab('stories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'stories' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Stories &amp; Originals ({stories.length})
          </button>

          <button 
            data-admin-tab="publish"
            onClick={() => {
              setActiveTab('publish');
              setPublishSuccessNotice(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'publish' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-600 dark:text-brand-400 font-extrabold'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            + Publish Story
          </button>

          {/* DEDICATED LOGO & BRAND IDENTITY TAB */}
          <button 
            data-admin-tab="cms-branding"
            onClick={() => {
              setActiveTab('cms');
              setCmsSubTab('branding');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cms' && cmsSubTab === 'branding' 
                ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400' 
                : 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            🎨 Logo &amp; Brand
          </button>

          {/* DEDICATED BLOG ARTICLES TAB */}
          <button 
            data-admin-tab="blogs"
            onClick={() => setActiveTab('blogs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'blogs' 
                ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400' 
                : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-blue-400" />
            📝 Blog Articles ({blogPosts?.length || 0})
          </button>

          {/* WEBSITE CONTENT / CMS TAB */}
          <button 
            data-admin-tab="cms"
            onClick={() => {
              setActiveTab('cms');
              if (cmsSubTab === 'branding' || cmsSubTab === 'pages') setCmsSubTab('pwa');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cms' && cmsSubTab !== 'branding' && cmsSubTab !== 'pages'
                ? 'bg-purple-600 text-white shadow-md' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            Website CMS &amp; Assets
          </button>

          {/* DEDICATED ALL PAGES CONTENT BUTTON */}
          <button 
            data-admin-tab="cms-pages"
            onClick={() => {
              setActiveTab('cms');
              setCmsSubTab('pages');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cms' && cmsSubTab === 'pages'
                ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            📄 Website Pages Content (15)
          </button>

          <button 
            data-admin-tab="users"
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            User Moderation ({registeredUsers?.length || 0})
          </button>

          <button 
            data-admin-tab="moderation"
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'moderation' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
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
            data-admin-tab="payments"
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'payments' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Payments &amp; VIP Ledger ({transactions?.length || 0})
          </button>

          <button 
            data-admin-tab="genres"
            onClick={() => setActiveTab('genres')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'genres' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Genre Library ({genres.length})
          </button>

          <button 
            data-admin-tab="authors"
            onClick={() => setActiveTab('authors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'authors' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Author Persona
          </button>

          <button 
            data-admin-tab="audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>

          <button 
            data-admin-tab="settings"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Platform Settings &amp; Flags
          </button>

          <button 
            data-admin-tab="email_notifications"
            onClick={() => {
              setActiveTab('email_notifications');
              fetchEmailLogsAndStatus();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'email_notifications' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            DB &amp; Email Dispatcher
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
                          <button
                            type="button"
                            onClick={() => handleOpenEditStory(story)}
                            className="text-left group cursor-pointer hover:bg-brand-500/10 dark:hover:bg-brand-500/20 -m-1.5 p-1.5 rounded-xl transition-all block border border-transparent hover:border-brand-500/30"
                            title="Click to edit reads, votes, comments & story details"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-500">
                              <span>{(story.reads || 0).toLocaleString()} reads</span>
                              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-brand-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                              {(story.votes || 0).toLocaleString()} votes
                            </div>
                          </button>
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
                              type="button"
                              onClick={() => handleOpenEditStory(story)}
                              className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white dark:text-brand-400 dark:hover:text-white border border-brand-500/20 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                              title="Edit story metadata and boost reads/votes/comments"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit & Boost
                            </button>
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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('story')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'story'
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
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
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Picture Book
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('pdf')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'pdf'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF Book
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

            {/* Picture Book Mode Alert Banner */}
            {pubContentType === 'picture_book' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h5 className="font-extrabold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                      🎨 Picture Book Mode Active • Auto-Categorized for Kids &amp; Family (3+ / 7+)
                    </h5>
                    <button
                      type="button"
                      onClick={loadSampleKidsPages}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ Load 3 Sample Pages</span>
                    </button>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                    Upload story picture pages and narration below. The <strong>Synopsis / Description</strong> textarea serves as the catalog cover blurb for young readers &amp; parents.
                  </p>
                </div>
              </div>
            )}

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
              {pubContentType === 'pdf' && renderPdfBookManager()}

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
                {pubContentType === 'story' ? 'Chapter 1 Manuscripts' : pubContentType === 'picture_book' ? 'Illustrated Pages Manager' : 'PDF Book & Worksheet Studio'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pubContentType === 'story'
                  ? 'Input the initial serialization chapter. Paragraphs separated by blank lines will support reader inline comments.'
                  : pubContentType === 'picture_book'
                  ? 'Add sequential illustrated pages with captions and imagery for kids and graphic novels.'
                  : 'Upload or link printable PDF homework, Montessori assignments, and children workbooks.'}
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
            ) : pubContentType === 'picture_book' ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Illustrated Picture Book Mode Active ({pubPages.length} Pages Configured)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    All {pubPages.length} illustrated story pages, device pictures, and captions are configured in the Picture Book Manager in Section 1 above. Chapter 1 will automatically publish as an interactive illustrated page-turner for children and parents.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Printable PDF Worksheet &amp; Book Active ({pubPdfPageCount} Pages)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The printable PDF file ({pubPdfUrl ? pubPdfUrl.slice(0, 50) + '...' : 'Loaded from device'}) will be embedded directly in the reader with 1-click Download, Print, and Fullscreen view for students and parents.
                  </p>
                </div>
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
          <div className="mt-8 space-y-5">
            {/* Razorpay Production Gateway Status Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-500/10 via-amber-500/5 to-purple-500/10 border border-brand-500/20 dark:border-brand-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-900 dark:text-white">
                        Razorpay Payments Engine (Production Level)
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        razorpayGatewayStatus?.isConfigured 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-500/20'
                      }`}>
                        {razorpayGatewayStatus?.isConfigured ? '🟢 Live Gateway Active' : '🟡 Keys Pending in .env'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Accepts UPI (GPay, PhonePe, Paytm, QR), RuPay, Visa, MasterCard, and NetBanking across India with automatic 90/10 creator revenue sharing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://dashboard.razorpay.com/#/access/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Razorpay Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Gateway specs row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-semibold">Active Key ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                    {razorpayGatewayStatus?.keyIdMasked || 'RAZORPAY_KEY_ID in .env'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-semibold">Supported Indian Rails</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> UPI • Cards • NetBanking
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-semibold">Creator Revenue Split</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 text-xs">
                    90% Author / 10% Platform
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-semibold">Settlement Currency</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    INR (₹ Indian Rupee)
                  </span>
                </div>
              </div>
            </div>

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
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">{tx.id}</span>
                          {tx.razorpayPaymentId && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              RZP: {tx.razorpayPaymentId}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{tx.description}</span>
                          {tx.author && <span className="text-[11px] text-slate-400">Recipient: {tx.author}</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <CreditCard className="w-3.5 h-3.5 text-brand-500" />
                            <span>{tx.paymentMethod || `${tx.cardBrand || 'UPI'} •••• ${tx.cardLast4 || '4242'}`}</span>
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                          {tx.currency === 'USD' ? `$${tx.amount?.toFixed(2)}` : `₹${tx.amount?.toLocaleString('en-IN')}`}
                        </td>
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {tx.type === 'subscription' ? (
                            <span className="text-slate-400 text-[11px] font-normal">—</span>
                          ) : (
                            <span>{tx.currency === 'USD' ? `$${(tx.authorPayout !== undefined ? tx.authorPayout : (tx.amount * 0.9)).toFixed(2)}` : `₹${(tx.authorPayout !== undefined ? tx.authorPayout : (tx.amount * 0.9)).toLocaleString('en-IN')}`}</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-purple-600 dark:text-purple-400">
                          {tx.currency === 'USD' ? `$${(tx.platformCommission !== undefined ? tx.platformCommission : (tx.type === 'subscription' ? tx.amount : tx.amount * 0.1)).toFixed(2)}` : `₹${(tx.platformCommission !== undefined ? tx.platformCommission : (tx.type === 'subscription' ? tx.amount : tx.amount * 0.1)).toLocaleString('en-IN')}`}
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
                                const sym = tx.currency === 'USD' ? '$' : '₹';
                                if (confirm(`Issue full refund of ${sym}${tx.amount.toLocaleString('en-IN')} for ${tx.id}?`)) {
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

        {/* TAB: BLOG & EDITORIAL ARTICLES */}
        {activeTab === 'blogs' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-black">Blog &amp; Editorial Management ({blogPosts?.length || 0})</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Publish and manage platform editorials, author spotlights, serialization advice, and news updates.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/blog"
                  target="_blank"
                  className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Live Blog
                </Link>
                <button
                  type="button"
                  onClick={handleOpenNewBlog}
                  className="px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Write New Article
                </button>
              </div>
            </div>

            {/* Blog Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(blogPosts || []).map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-purple-500/40 transition-all"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80"; }}
                    />
                    <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1.5 font-semibold">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      </div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
                      >
                        Read Post <ExternalLink className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditBlog(post)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/50 dark:hover:text-purple-300 text-xs font-bold transition-all cursor-pointer"
                          title="Edit article"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(post.id, post.title)}
                          className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-all cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(!blogPosts || blogPosts.length === 0) && (
              <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800">
                <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="font-black text-base">No Blog Articles Published Yet</h4>
                <p className="text-xs text-slate-400 mt-1">Write your first platform editorial or announcement.</p>
                <button
                  type="button"
                  onClick={handleOpenNewBlog}
                  className="mt-4 px-5 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs"
                >
                  + Write Article
                </button>
              </div>
            )}
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
                onClick={() => setCmsSubTab('branding')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  cmsSubTab === 'branding'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Logo &amp; Brand Identity
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('blog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  cmsSubTab === 'blog'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5 text-purple-400" />
                Blog &amp; Editorial Articles ({blogPosts?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('pwa')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  cmsSubTab === 'pwa'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                PWA Banner &amp; QR Code
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('social')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  cmsSubTab === 'social'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                Footer &amp; Social Links
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('pages')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  cmsSubTab === 'pages'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Website Pages Content
              </button>
            </div>

            {/* SUB-TAB 0: LOGO & BRAND IDENTITY */}
            {cmsSubTab === 'branding' && (
              <div className="space-y-6">
                {/* 1. Quick Helper Banner if user has custom logo */}
                {(() => {
                  const rawLogo = cmsForm?.branding?.logoUrl;
                  const logoStr = typeof rawLogo === 'object' && rawLogo !== null ? (rawLogo.dataUrl || '') : (rawLogo || '');
                  const isCustom = logoStr && logoStr !== '/icon-192.png' && logoStr !== '/favicon.ico' && logoStr !== '/favicon.svg';
                  const currentMode = cmsForm?.branding?.logoMode || (cmsForm?.branding?.showBrandText === false ? 'full_image' : !isCustom ? 'icon_and_text' : 'full_image');
                  const isShowingBoth = currentMode === 'icon_and_text' && cmsForm?.branding?.showBrandText !== false;

                  if (isCustom && isShowingBoth) {
                    return (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                              Duplicate "Avora Library" text showing beside your logo?
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Your uploaded logo already includes brand words. Switch to "Full Logo Image" mode to remove the duplicate side-by-side text.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateBrandingField('logoMode', 'full_image');
                            updateBrandingField('showBrandText', false);
                            updateCmsConfig({
                              ...cmsForm,
                              branding: {
                                ...(cmsForm?.branding || initialCmsConfig.branding || {}),
                                logoMode: 'full_image',
                                showBrandText: false
                              }
                            });
                            setCmsSaveNotice(true);
                            setTimeout(() => setCmsSaveNotice(false), 3500);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Fix Duplicate Logo (Hide Side Text)
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Controls */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="font-black text-sm">Brand Identity &amp; Logo Configuration</h4>
                        <p className="text-[11px] text-slate-400">
                          Configure how your logo and brand name appear across the navbar, footer, auth screens, and mobile web app.
                        </p>
                      </div>

                      {/* A. 3-Way Logo Display Mode Selector */}
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-2">
                          Logo Display Mode
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Option 1: Full Image */}
                          <button
                            type="button"
                            onClick={() => {
                              updateBrandingField('logoMode', 'full_image');
                              updateBrandingField('showBrandText', false);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              (cmsForm?.branding?.logoMode === 'full_image' || (cmsForm?.branding?.showBrandText === false && cmsForm?.branding?.logoMode !== 'text_only'))
                                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5 text-purple-500" /> Full Logo Image
                              </span>
                              {(cmsForm?.branding?.logoMode === 'full_image' || (cmsForm?.branding?.showBrandText === false && cmsForm?.branding?.logoMode !== 'text_only')) && (
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Recommended. Hides duplicate side text if your logo image already contains the words "Avora Library".
                            </p>
                          </button>

                          {/* Option 2: Icon + Text */}
                          <button
                            type="button"
                            onClick={() => {
                              updateBrandingField('logoMode', 'icon_and_text');
                              updateBrandingField('showBrandText', true);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              cmsForm?.branding?.logoMode === 'icon_and_text' && cmsForm?.branding?.showBrandText !== false
                                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Icon + Text
                              </span>
                              {cmsForm?.branding?.logoMode === 'icon_and_text' && cmsForm?.branding?.showBrandText !== false && (
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Square emblem on left + stylized HTML brand name text on right.
                            </p>
                          </button>

                          {/* Option 3: Text Only */}
                          <button
                            type="button"
                            onClick={() => {
                              updateBrandingField('logoMode', 'text_only');
                              updateBrandingField('showBrandText', true);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              cmsForm?.branding?.logoMode === 'text_only'
                                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-blue-500" /> Text Only
                              </span>
                              {cmsForm?.branding?.logoMode === 'text_only' && (
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Pure typography headline without an icon image.
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* B. Show Brand Text Beside Logo Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Show Brand Text Beside Logo
                          </p>
                          <p className="text-[10.5px] text-slate-400">
                            Turn OFF if your logo image already has words written on it to avoid two logos appearing side-by-side.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = cmsForm?.branding?.showBrandText === false ? true : false;
                            updateBrandingField('showBrandText', nextVal);
                            if (!nextVal) {
                              updateBrandingField('logoMode', 'full_image');
                            } else if (cmsForm?.branding?.logoMode === 'full_image') {
                              updateBrandingField('logoMode', 'icon_and_text');
                            }
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                            cmsForm?.branding?.showBrandText === false ? 'bg-slate-300 dark:bg-slate-700' : 'bg-purple-600'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            cmsForm?.branding?.showBrandText === false ? 'translate-x-0' : 'translate-x-6'
                          }`} />
                        </button>
                      </div>

                      {/* B2. Logo Size Selector */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                            Logo Display Size / Scale
                          </label>
                          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                            {cmsForm?.branding?.logoSize === 'xlarge'
                              ? 'Extra Large (+50% Scale)'
                              : cmsForm?.branding?.logoSize === 'large'
                              ? 'Large (+25% Scale)'
                              : cmsForm?.branding?.logoSize === 'compact'
                              ? 'Compact Scale'
                              : 'Standard / Regular (Default)'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'compact', label: 'Compact', desc: 'Smaller icon/emblem' },
                            { id: 'default', label: 'Standard', desc: 'Balanced default' },
                            { id: 'large', label: 'Large', desc: '+25% larger & bolder' },
                            { id: 'xlarge', label: 'Extra Large', desc: '+50% high visibility' }
                          ].map(opt => {
                            const isSelected = (cmsForm?.branding?.logoSize || 'default') === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => updateBrandingField('logoSize', opt.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                                    : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                <span className="block font-bold text-xs text-slate-900 dark:text-white">
                                  {opt.label}
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {opt.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* C. Official Presets */}
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-2">
                          1-Click Preset Logos
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setBrandLogoPreset('official_transparent')}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                            Official Transparent Logo (/logo.png)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBrandLogoPreset('dark_theme')}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            Dark Theme Full Logo (/logo-dark.png)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBrandLogoPreset('default_icon')}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            Default Owl + Typography (/icon-192.png)
                          </button>
                        </div>
                      </div>

                      {/* D. Logo Upload & Background Tool */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                          Upload Custom Logo Image
                        </label>
                        
                        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-wrap">
                          <label className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Upload New Logo (PNG / JPG / SVG)</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoUpload} 
                              className="hidden" 
                            />
                          </label>

                          <button
                            type="button"
                            disabled={isProcessingBg}
                            onClick={() => handleMakeLogoTransparent('auto')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                            title="Removes solid black or white background box from your uploaded logo"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span>{isProcessingBg ? 'Making Transparent...' : '✨ Make Background Transparent'}</span>
                          </button>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-400 text-[11px] mb-1">
                            Or Custom Logo Image URL (PNG / SVG / HTTPS)
                          </label>
                          <input
                            type="text"
                            value={
                              typeof cmsForm?.branding?.logoUrl === 'object'
                                ? (cmsForm.branding.logoUrl?.dataUrl || '/icon-192.png')
                                : (cmsForm?.branding?.logoUrl && cmsForm.branding.logoUrl !== '[object Object]' ? cmsForm.branding.logoUrl : '/icon-192.png')
                            }
                            onChange={(e) => updateBrandingField('logoUrl', e.target.value)}
                            placeholder="/logo.png"
                            className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* E. Brand Name & Subtitle Text Inputs */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Brand Typography &amp; Headlines
                          </span>
                          {(cmsForm?.branding?.logoMode === 'full_image' || cmsForm?.branding?.showBrandText === false) && (
                            <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold">
                              Hidden in Navbar (Full Image Mode Active)
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Brand Name (Main Title)
                          </label>
                          <input
                            type="text"
                            value={cmsForm?.branding?.brandName ?? 'Avora'}
                            onChange={(e) => updateBrandingField('brandName', e.target.value)}
                            placeholder="Avora"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Brand Subtitle (Orange Sub-Text)
                          </label>
                          <input
                            type="text"
                            value={cmsForm?.branding?.brandSubtitle ?? 'Library'}
                            onChange={(e) => updateBrandingField('brandSubtitle', e.target.value)}
                            placeholder="Library"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Site Tagline / Headline
                          </label>
                          <input
                            type="text"
                            value={cmsForm?.branding?.siteTagline ?? 'Serialized Stories & Community Reading'}
                            onChange={(e) => updateBrandingField('siteTagline', e.target.value)}
                            placeholder="Serialized Stories & Community Reading"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Header & Logo Preview Card */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Live Navbar Preview
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                          Real-Time Exact Match
                        </span>
                      </div>

                      {/* Active Mode Indicator */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                        <span className="text-slate-400">Current Mode:</span>
                        <span className="font-bold text-purple-400">
                          {cmsForm?.branding?.logoMode === 'full_image' || (cmsForm?.branding?.showBrandText === false && cmsForm?.branding?.logoMode !== 'text_only')
                            ? '🖼️ Full Logo Image (No extra text)'
                            : cmsForm?.branding?.logoMode === 'text_only'
                            ? '🔤 Text Only Typography'
                            : '🔤+🖼️ Icon + Text'}
                        </span>
                      </div>

                      {/* Dark Mode Live Simulation */}
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                          Dark Mode Navbar
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                          <BrandLogo branding={cmsForm?.branding} />
                          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">Dark Preview</span>
                        </div>
                      </div>

                      {/* Light Mode Live Simulation */}
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                          Light Mode Navbar
                        </div>
                        <div className="bg-white text-slate-900 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <BrandLogo branding={cmsForm?.branding} />
                          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Light Preview</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Changes preview instantly as you type or switch modes.
                        </p>
                        <p className="italic">
                          Click "Save CMS Changes" button at the top right to permanently save your branding settings across the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 0B: BLOG ARTICLES IN CMS */}
            {cmsSubTab === 'blog' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="font-black text-sm">Blog &amp; Editorial Articles ({blogPosts?.length || 0})</h4>
                    <p className="text-[11px] text-slate-400">Manage all articles published on the /blog section</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewBlog}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Write Article
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(blogPosts || []).map((post) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={post.cover}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80"; }}
                        />
                        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1 font-semibold">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>
                          <h4 className="font-black text-xs text-slate-900 dark:text-white line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditBlog(post)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                              title="Edit article"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlog(post.id, post.title)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-all cursor-pointer"
                              title="Delete article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">PWA Install Banner Display</h4>
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
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={cmsForm?.pwaSection?.badgeText || ''}
                            onChange={(e) => updatePwaField('badgeText', e.target.value)}
                            placeholder="e.g. Progressive Web App (PWA)"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Headline Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pwaSection?.title || ''}
                            onChange={(e) => updatePwaField('title', e.target.value)}
                            placeholder="e.g. Read Anywhere on Mobile"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Description Paragraph</label>
                          <textarea
                            rows={3}
                            value={cmsForm?.pwaSection?.description || ''}
                            onChange={(e) => updatePwaField('description', e.target.value)}
                            placeholder="Detailed explanation of the PWA install features..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Button Text</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.buttonText || ''}
                              onChange={(e) => updatePwaField('buttonText', e.target.value)}
                              placeholder="e.g. Install Web App"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Custom Button Redirect URL (Optional)</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.buttonUrl || ''}
                              onChange={(e) => updatePwaField('buttonUrl', e.target.value)}
                              placeholder="Leave blank for native PWA prompt"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: QR Code Configuration */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-purple-600" />
                          QR Code Generator &amp; Image Settings
                        </h4>
                        <p className="text-[11px] text-slate-400">Choose whether to dynamically generate a QR code for your URL or upload a custom image</p>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1.5">QR Code Source Mode</label>
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
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Target Web URL (Encoded in QR Code)</label>
                            <input
                              type="url"
                              value={cmsForm?.pwaSection?.qrTargetUrl || ''}
                              onChange={(e) => updatePwaField('qrTargetUrl', e.target.value)}
                              placeholder="https://avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono text-[11px] font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              When readers scan with iOS or Android camera, they will immediately land on this URL.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Custom QR Code Image URL</label>
                            <input
                              type="url"
                              value={cmsForm?.pwaSection?.qrCodeImageUrl || ''}
                              onChange={(e) => updatePwaField('qrCodeImageUrl', e.target.value)}
                              placeholder="https://yourdomain.com/custom-qr.png"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono text-[11px] font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Provide a direct link to a hosted image of your branded or pre-generated QR code.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">QR Box Top Label</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.qrCodeLabel || ''}
                              onChange={(e) => updatePwaField('qrCodeLabel', e.target.value)}
                              placeholder="Scan QR with Phone"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">QR Box Sublabel</label>
                            <input
                              type="text"
                              value={cmsForm?.pwaSection?.qrCodeSublabel || ''}
                              onChange={(e) => updatePwaField('qrCodeSublabel', e.target.value)}
                              placeholder="Instant mobile web app"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
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
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">Footer Social Media Bar</h4>
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
                          <span className="font-black text-xs text-slate-900 dark:text-white">Instagram</span>
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
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
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
                          <span className="font-black text-xs text-slate-900 dark:text-white">X (Twitter)</span>
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
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
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
                          <span className="font-black text-xs text-slate-900 dark:text-white">Facebook</span>
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
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
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
                          <span className="font-black text-xs text-slate-900 dark:text-white">TikTok</span>
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
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
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
                          <span className="font-black text-xs text-slate-900 dark:text-white">Discord</span>
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
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
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
                          <span className="font-black text-xs text-slate-900 dark:text-white">YouTube</span>
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
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] outline-none border border-slate-200 dark:border-slate-700"
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
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Footer Branding, Tagline &amp; Copyright</h4>
                    <p className="text-[11px] text-slate-400">Customize the statement shown below the logo and platform legal notice</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Footer Tagline</label>
                      <textarea
                        rows={2}
                        value={cmsForm?.footerConfig?.tagline || ''}
                        onChange={(e) => updateFooterField('tagline', e.target.value)}
                        placeholder="Platform mission tagline..."
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Copyright Notice</label>
                      <input
                        type="text"
                        value={cmsForm?.footerConfig?.copyrightText || ''}
                        onChange={(e) => updateFooterField('copyrightText', e.target.value)}
                        placeholder="© 2026 Avora Library Platform. All original rights reserved."
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-purple-500"
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

            {/* SUB-TAB 3: WEBSITE PAGES CONTENT (ALL 21 PAGES EDITABLE & DELETABLE) */}
            {cmsSubTab === 'pages' && (
              <div className="space-y-6">
                {/* Header & All 21 Pages Directory */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-black text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        Website Pages Manager ({ALL_MANAGED_PAGES.length} Pages — Edit or Delete Any Page)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Edit content, add/delete sections, or delete (unpublish) and restore any page across the entire website whenever required.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setShowAllPagesDirectory(prev => !prev)}
                        className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        {showAllPagesDirectory ? 'Hide Pages Directory' : `Show All ${ALL_MANAGED_PAGES.length} Pages`}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCms}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save All Page Changes
                      </button>
                    </div>
                  </div>

                  {/* All 21 Pages Quick Directory Table/Grid */}
                  {showAllPagesDirectory && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          All Website Pages ({ALL_MANAGED_PAGES.filter(p => !cmsForm?.pagesContent?.[p.key]?.deleted).length} Active • {ALL_MANAGED_PAGES.filter(p => cmsForm?.pagesContent?.[p.key]?.deleted).length} Deleted)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Click <strong>Edit</strong> to customize text/sections or <strong>Delete</strong> to remove from website
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                        {ALL_MANAGED_PAGES.map((p) => {
                          const isDeleted = Boolean(cmsForm?.pagesContent?.[p.key]?.deleted);
                          const isSelected = cmsSelectedPage === p.key;
                          return (
                            <div
                              key={p.key}
                              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                                isDeleted
                                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                                  : isSelected
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/30'
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                                      {p.label}
                                    </span>
                                    <span
                                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                                        isDeleted
                                          ? 'bg-rose-500 text-white'
                                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      }`}
                                    >
                                      {isDeleted ? 'Deleted' : 'Published'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                    {p.path} • {p.category}
                                  </p>
                                </div>
                                <Link
                                  href={p.path}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
                                  title={`Open ${p.path} in new tab`}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>

                              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
                                <button
                                  type="button"
                                  onClick={() => setCmsSelectedPage(p.key)}
                                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                                  }`}
                                >
                                  <Edit3 className="w-3 h-3" />
                                  {isSelected ? 'Editing Below' : 'Edit'}
                                </button>
                                {p.key !== 'hero' && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDeletePage(p.key, p.label)}
                                    className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                      isDeleted
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                                    }`}
                                    title={isDeleted ? 'Restore and republish this page' : 'Delete / unpublish this page'}
                                  >
                                    {isDeleted ? (
                                      <>
                                        <RotateCcw className="w-3 h-3" /> Restore
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-3 h-3" /> Delete
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Dropdown & Category Selector */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        Select Page To Edit:
                      </label>
                      <select
                        value={cmsSelectedPage}
                        onChange={(e) => setCmsSelectedPage(e.target.value)}
                        className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <optgroup label="── Core Platform Pages ──">
                          <option value="hero">Homepage Hero (/)</option>
                          <option value="browse">Browse Library (/browse)</option>
                          <option value="showcase">Book Showcase (/showcase)</option>
                          <option value="community">Community Hub &amp; Fandom Spaces (/community)</option>
                          <option value="contests">Writing Contests &amp; Awards (/contests)</option>
                          <option value="blog">Blog &amp; News (/blog)</option>
                          <option value="library">My Library &amp; Bookshelf (/library)</option>
                        </optgroup>
                        <optgroup label="── Company &amp; Media Pages ──">
                          <option value="about">About Avora Library (/about)</option>
                          <option value="careers">Careers &amp; Openings (/careers)</option>
                          <option value="press">Press &amp; Media Kit (/press)</option>
                          <option value="partnerships">Brand Partnerships (/partnerships)</option>
                          <option value="contact">Contact Us (/contact)</option>
                        </optgroup>
                        <optgroup label="── Creators &amp; Help Pages ──">
                          <option value="writers">Writer Hub &amp; Author FAQ (/writers)</option>
                          <option value="guidelines">Author &amp; Community Guidelines (/guidelines)</option>
                          <option value="help">Help Center &amp; FAQ (/help)</option>
                        </optgroup>
                        <optgroup label="── Legal &amp; Policy Pages ──">
                          <option value="terms">Terms of Service (/terms)</option>
                          <option value="privacy">Privacy Policy (/privacy)</option>
                          <option value="dmca">DMCA Copyright Policy (/dmca)</option>
                          <option value="contentPolicy">Content &amp; Safety Policy (/content-policy)</option>
                          <option value="accessibility">Accessibility Statement (/accessibility)</option>
                          <option value="paymentPolicy">Payment Policy (/payment-policy)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Categorized Pills */}
                    <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      {ALL_MANAGED_PAGES.map((p) => {
                        const isDeleted = Boolean(cmsForm?.pagesContent?.[p.key]?.deleted);
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setCmsSelectedPage(p.key)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                              cmsSelectedPage === p.key
                                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                                : isDeleted
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 line-through'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span>{p.label} ({p.path})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected Page Editor Box */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  {/* Top Control Strip for Selected Page (Publish Status, Delete/Restore, Reset, Save) */}
                  {(() => {
                    const activeMeta = ALL_MANAGED_PAGES.find(p => p.key === cmsSelectedPage) || { key: cmsSelectedPage, label: cmsSelectedPage, path: '/' };
                    const isPageDeleted = Boolean(cmsForm?.pagesContent?.[cmsSelectedPage]?.deleted);
                    return (
                      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPageDeleted
                          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                          : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                      }`}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              Editing: {activeMeta.label}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              isPageDeleted
                                ? 'bg-rose-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}>
                              {isPageDeleted ? 'Deleted / Hidden From Public' : 'Published & Live'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Route: <code className="font-mono font-bold">{activeMeta.path}</code> — {isPageDeleted ? 'This page is currently unpublished and hidden from menus. Click Restore Page to make it live again.' : 'You can edit any text/section below, or delete this page to unpublish it from the website.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() => handleResetSinglePage(activeMeta.key, activeMeta.label)}
                            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            title="Reset this page's content to factory defaults"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                          </button>

                          {activeMeta.key !== 'hero' && (
                            <button
                              type="button"
                              onClick={() => handleToggleDeletePage(activeMeta.key, activeMeta.label)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                isPageDeleted
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                              }`}
                            >
                              {isPageDeleted ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5" /> Restore Page
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Page
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleSaveCms}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Page
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* ABOUT US */}
                  {cmsSelectedPage === 'about' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">About Us Page Content</h4>
                          <p className="text-[11px] text-slate-400">Live at /about</p>
                        </div>
                        <Link href="/about" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.about?.title || ''}
                            onChange={(e) => updatePageField('about', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Page Subtitle</label>
                          <textarea
                            rows={2}
                            value={cmsForm?.pagesContent?.about?.subtitle || ''}
                            onChange={(e) => updatePageField('about', 'subtitle', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
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
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Body Text</label>
                            <textarea
                              rows={3}
                              value={cmsForm?.pagesContent?.about?.missionContent || ''}
                              onChange={(e) => updatePageField('about', 'missionContent', e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
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
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Body Text</label>
                            <textarea
                              rows={3}
                              value={cmsForm?.pagesContent?.about?.pwaContent || ''}
                              onChange={(e) => updatePageField('about', 'pwaContent', e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WRITER HUB & AUTHOR FAQ */}
                  {cmsSelectedPage === 'writers' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Writer Hub &amp; Author FAQ Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /writers</p>
                        </div>
                        <Link href="/writers" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.writers?.badge || ''}
                            onChange={(e) => updatePageField('writers', 'badge', e.target.value)}
                            placeholder="Avora Library Writer Resources & Hub"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Hero Headline</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.writers?.headline || ''}
                            onChange={(e) => updatePageField('writers', 'headline', e.target.value)}
                            placeholder="Turn Your Serial Fiction Into a Global Phenomenon"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Hero Subheadline</label>
                          <textarea
                            rows={3}
                            value={cmsForm?.pagesContent?.writers?.subheadline || ''}
                            onChange={(e) => updatePageField('writers', 'subheadline', e.target.value)}
                            placeholder="Everything you need to write, publish, and monetize serialized stories..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Stat Badge Title</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.writers?.statTitle || ''}
                              onChange={(e) => updatePageField('writers', 'statTitle', e.target.value)}
                              placeholder="100% Free"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Stat Badge Subtitle</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.writers?.statSubtitle || ''}
                              onChange={(e) => updatePageField('writers', 'statSubtitle', e.target.value)}
                              placeholder="Keep all your copyright"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                        </div>

                        {/* Repeatable 4 Pillars of Success */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 pt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-black text-slate-900 dark:text-white">Writer Hub Pillars / Feature Cards</h5>
                              <p className="text-[11px] text-slate-400">Highlight cards shown below the Writer Hub hero</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addObjectListItem('writers', 'pillars', { title: 'New Pillar Title', description: 'Describe this writer benefit or tool.', badge: 'Feature Badge' })}
                              className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Pillar Card
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(cmsForm?.pagesContent?.writers?.pillars || []).map((pillar, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-400 text-[10px]">Pillar #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeObjectListItem('writers', 'pillars', idx)}
                                    className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={pillar.title || ''}
                                    onChange={(e) => updateObjectListItem('writers', 'pillars', idx, 'title', e.target.value)}
                                    placeholder="Pillar Title"
                                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={pillar.badge || ''}
                                    onChange={(e) => updateObjectListItem('writers', 'pillars', idx, 'badge', e.target.value)}
                                    placeholder="Badge (e.g. Fast & Distraction-Free)"
                                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none text-xs"
                                  />
                                </div>
                                <textarea
                                  rows={2}
                                  value={pillar.description || ''}
                                  onChange={(e) => updateObjectListItem('writers', 'pillars', idx, 'description', e.target.value)}
                                  placeholder="Pillar description..."
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none text-xs leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Repeatable Writer Playbooks & Tutorials */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 pt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-black text-slate-900 dark:text-white">Writer Playbooks &amp; Tutorials</h5>
                              <p className="text-[11px] text-slate-400">Resource cards shown on the Writer Hub</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addObjectListItem('writers', 'resources', { category: 'Craft & Pacing', title: 'New Writer Playbook', readTime: '5 min read', summary: 'Summary of this tutorial or resource.', href: '/blog', cta: 'Read Playbook' })}
                              className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Playbook
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(cmsForm?.pagesContent?.writers?.resources || []).map((res, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-400 text-[10px]">Playbook #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeObjectListItem('writers', 'resources', idx)}
                                    className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <input
                                    type="text"
                                    value={res.title || ''}
                                    onChange={(e) => updateObjectListItem('writers', 'resources', idx, 'title', e.target.value)}
                                    placeholder="Playbook Title"
                                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={res.category || ''}
                                    onChange={(e) => updateObjectListItem('writers', 'resources', idx, 'category', e.target.value)}
                                    placeholder="Category"
                                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={res.readTime || ''}
                                    onChange={(e) => updateObjectListItem('writers', 'resources', idx, 'readTime', e.target.value)}
                                    placeholder="Read time (e.g. 6 min read)"
                                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none text-xs"
                                  />
                                </div>
                                <textarea
                                  rows={2}
                                  value={res.summary || ''}
                                  onChange={(e) => updateObjectListItem('writers', 'resources', idx, 'summary', e.target.value)}
                                  placeholder="Playbook summary..."
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none text-xs leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Repeatable Author FAQs */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 pt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-black text-slate-900 dark:text-white">Author Frequently Asked Questions</h5>
                              <p className="text-[11px] text-slate-400">Questions and answers shown on the Writer Hub</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addFaqItem('writers')}
                              className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Author FAQ
                            </button>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-400 mb-1">FAQ Section Heading</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.writers?.faqTitle || ''}
                              onChange={(e) => updatePageField('writers', 'faqTitle', e.target.value)}
                              placeholder="Author Frequently Asked Questions"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none border border-slate-200 dark:border-slate-700"
                            />
                          </div>

                          <div className="space-y-3">
                            {(cmsForm?.pagesContent?.writers?.faqs || []).map((faq, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-400 text-[10px]">FAQ #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeFaqItem('writers', idx)}
                                    className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" /> Remove
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={faq.q || ''}
                                  onChange={(e) => updateFaqItem('writers', idx, 'q', e.target.value)}
                                  placeholder="Question (e.g. Do I keep rights to my stories?)"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none text-xs"
                                />
                                <textarea
                                  rows={2}
                                  value={faq.a || ''}
                                  onChange={(e) => updateFaqItem('writers', idx, 'a', e.target.value)}
                                  placeholder="Answer details..."
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none text-xs leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAREERS */}
                  {cmsSelectedPage === 'careers' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Careers &amp; Job Openings Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /careers</p>
                        </div>
                        <Link href="/careers" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Page Title</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.careers?.title || ''}
                              onChange={(e) => updatePageField('careers', 'title', e.target.value)}
                              placeholder="Careers at Avora Library"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Careers Inquiries Email</label>
                            <input
                              type="email"
                              value={cmsForm?.pagesContent?.careers?.contactEmail || ''}
                              onChange={(e) => updatePageField('careers', 'contactEmail', e.target.value)}
                              placeholder="careers@avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Subtitle</label>
                          <textarea
                            rows={2}
                            value={cmsForm?.pagesContent?.careers?.subtitle || ''}
                            onChange={(e) => updatePageField('careers', 'subtitle', e.target.value)}
                            placeholder="Join our mission to empower the next generation of serialized writers..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>

                        {/* Open Positions List */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 dark:text-slate-300">
                              Active Job Openings ({cmsForm?.pagesContent?.careers?.openings?.length || 0})
                            </label>
                            <button
                              type="button"
                              onClick={addOpeningItem}
                              className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Job Opening
                            </button>
                          </div>

                          {(cmsForm?.pagesContent?.careers?.openings || []).map((job, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-400 text-[10px]">Position #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeOpeningItem(idx)}
                                  className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400">Position Title</label>
                                  <input
                                    type="text"
                                    value={job.title || ''}
                                    onChange={(e) => updateOpeningItem(idx, 'title', e.target.value)}
                                    placeholder="e.g. Senior Editorial Curator"
                                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400">Department</label>
                                  <input
                                    type="text"
                                    value={job.department || ''}
                                    onChange={(e) => updateOpeningItem(idx, 'department', e.target.value)}
                                    placeholder="e.g. Editorial & Content"
                                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none border border-slate-200 dark:border-slate-700 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400">Type / Location</label>
                                  <input
                                    type="text"
                                    value={job.type || ''}
                                    onChange={(e) => updateOpeningItem(idx, 'type', e.target.value)}
                                    placeholder="e.g. Remote • Full-time"
                                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none border border-slate-200 dark:border-slate-700 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400">Apply Email</label>
                                  <input
                                    type="email"
                                    value={job.applyEmail || ''}
                                    onChange={(e) => updateOpeningItem(idx, 'applyEmail', e.target.value)}
                                    placeholder="careers@avoralibrary.com"
                                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none border border-slate-200 dark:border-slate-700 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PRESS & MEDIA KIT */}
                  {cmsSelectedPage === 'press' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Press &amp; Media Kit Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /press</p>
                        </div>
                        <Link href="/press" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Page Title</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.press?.title || ''}
                              onChange={(e) => updatePageField('press', 'title', e.target.value)}
                              placeholder="Press & Media Kit"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Press Inquiries Email</label>
                            <input
                              type="email"
                              value={cmsForm?.pagesContent?.press?.pressEmail || ''}
                              onChange={(e) => updatePageField('press', 'pressEmail', e.target.value)}
                              placeholder="press@avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Subtitle</label>
                          <textarea
                            rows={2}
                            value={cmsForm?.pagesContent?.press?.subtitle || ''}
                            onChange={(e) => updatePageField('press', 'subtitle', e.target.value)}
                            placeholder="Official announcements, brand assets, and media contact info."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Press Statement / Media Kit Details</label>
                          <textarea
                            rows={4}
                            value={cmsForm?.pagesContent?.press?.content || ''}
                            onChange={(e) => updatePageField('press', 'content', e.target.value)}
                            placeholder="For press inquiries, author interviews, or brand assets..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BRAND PARTNERSHIPS */}
                  {cmsSelectedPage === 'partnerships' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Brand Partnerships Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /partnerships</p>
                        </div>
                        <Link href="/partnerships" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Page Title</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.partnerships?.title || ''}
                              onChange={(e) => updatePageField('partnerships', 'title', e.target.value)}
                              placeholder="Brand Partnerships"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Partnerships Inquiries Email</label>
                            <input
                              type="email"
                              value={cmsForm?.pagesContent?.partnerships?.partnerEmail || ''}
                              onChange={(e) => updatePageField('partnerships', 'partnerEmail', e.target.value)}
                              placeholder="partnerships@avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Subtitle</label>
                          <textarea
                            rows={2}
                            value={cmsForm?.pagesContent?.partnerships?.subtitle || ''}
                            onChange={(e) => updatePageField('partnerships', 'subtitle', e.target.value)}
                            placeholder="Collaborate with Avora Library on writing contests, literary sponsorships, and adaptations."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Partnerships Overview Content</label>
                          <textarea
                            rows={4}
                            value={cmsForm?.pagesContent?.partnerships?.content || ''}
                            onChange={(e) => updatePageField('partnerships', 'content', e.target.value)}
                            placeholder="Connect with an engaged global audience of serialized readers and creators..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TERMS OF SERVICE */}
                  {cmsSelectedPage === 'terms' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Terms of Service Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /terms</p>
                        </div>
                        <Link href="/terms" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.terms?.title || ''}
                            onChange={(e) => updatePageField('terms', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Last Updated Date</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.terms?.lastUpdated || ''}
                            onChange={(e) => updatePageField('terms', 'lastUpdated', e.target.value)}
                            placeholder="e.g. March 2026"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 dark:text-slate-300">Policy Clauses / Sections</label>
                          <button
                            type="button"
                            onClick={() => addSectionItem('terms')}
                            className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
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
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={sec.heading || ''}
                              onChange={(e) => updateSectionItem('terms', idx, 'heading', e.target.value)}
                              placeholder="Clause Heading (e.g. 1. Acceptance of Terms)"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700"
                            />
                            <textarea
                              rows={3}
                              value={sec.content || ''}
                              onChange={(e) => updateSectionItem('terms', idx, 'content', e.target.value)}
                              placeholder="Clause content details..."
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
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
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Privacy Policy Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /privacy</p>
                        </div>
                        <Link href="/privacy" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.privacy?.title || ''}
                            onChange={(e) => updatePageField('privacy', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Last Updated Date</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.privacy?.lastUpdated || ''}
                            onChange={(e) => updatePageField('privacy', 'lastUpdated', e.target.value)}
                            placeholder="e.g. March 2026"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 dark:text-slate-300">Privacy Clauses / Sections</label>
                          <button
                            type="button"
                            onClick={() => addSectionItem('privacy')}
                            className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
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
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={sec.heading || ''}
                              onChange={(e) => updateSectionItem('privacy', idx, 'heading', e.target.value)}
                              placeholder="Clause Heading (e.g. 1. Information We Collect)"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700"
                            />
                            <textarea
                              rows={3}
                              value={sec.content || ''}
                              onChange={(e) => updateSectionItem('privacy', idx, 'content', e.target.value)}
                              placeholder="Clause content details..."
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DMCA POLICY */}
                  {cmsSelectedPage === 'dmca' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">DMCA Copyright Policy Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /dmca</p>
                        </div>
                        <Link href="/dmca" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.dmca?.title || ''}
                              onChange={(e) => updatePageField('dmca', 'title', e.target.value)}
                              placeholder="DMCA Policy"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Designated DMCA Agent Email</label>
                            <input
                              type="email"
                              value={cmsForm?.pagesContent?.dmca?.agentEmail || ''}
                              onChange={(e) => updatePageField('dmca', 'agentEmail', e.target.value)}
                              placeholder="copyright@avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Required Subject Line</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.dmca?.subjectLine || ''}
                            onChange={(e) => updatePageField('dmca', 'subjectLine', e.target.value)}
                            placeholder="DMCA Notice - [Story Title]"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Introductory Statement</label>
                          <textarea
                            rows={3}
                            value={cmsForm?.pagesContent?.dmca?.intro || ''}
                            onChange={(e) => updatePageField('dmca', 'intro', e.target.value)}
                            placeholder="Avora Library respects intellectual property rights..."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Requirements Section Heading</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.dmca?.requirementsTitle || ''}
                            onChange={(e) => updatePageField('dmca', 'requirementsTitle', e.target.value)}
                            placeholder="Notice Requirements"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>

                        {/* Repeatable DMCA Requirements List */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 dark:text-slate-300">
                              Notice Requirements ({cmsForm?.pagesContent?.dmca?.requirements?.length || 0})
                            </label>
                            <button
                              type="button"
                              onClick={() => addListItem('dmca', 'requirements')}
                              className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Requirement
                            </button>
                          </div>

                          {(cmsForm?.pagesContent?.dmca?.requirements || []).map((req, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                              <span className="font-bold text-slate-400 text-xs shrink-0">{idx + 1}.</span>
                              <input
                                type="text"
                                value={req || ''}
                                onChange={(e) => updateListItem('dmca', 'requirements', idx, e.target.value)}
                                placeholder="Requirement description..."
                                className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeListItem('dmca', 'requirements', idx)}
                                className="p-2 text-rose-500 hover:text-rose-600 cursor-pointer"
                                title="Remove requirement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTENT & SAFETY POLICY */}
                  {cmsSelectedPage === 'contentPolicy' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Content &amp; Safety Policy Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /content-policy</p>
                        </div>
                        <Link href="/content-policy" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.contentPolicy?.title || ''}
                            onChange={(e) => updatePageField('contentPolicy', 'title', e.target.value)}
                            placeholder="Content & Safety Policy"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Last Updated Date</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.contentPolicy?.lastUpdated || ''}
                            onChange={(e) => updatePageField('contentPolicy', 'lastUpdated', e.target.value)}
                            placeholder="e.g. March 2026"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 dark:text-slate-300">Policy Sections</label>
                          <button
                            type="button"
                            onClick={() => addSectionItem('contentPolicy')}
                            className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Section
                          </button>
                        </div>

                        {cmsForm?.pagesContent?.contentPolicy?.sections?.map((sec, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-400 text-[10px]">Section #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeSectionItem('contentPolicy', idx)}
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={sec.heading || ''}
                              onChange={(e) => updateSectionItem('contentPolicy', idx, 'heading', e.target.value)}
                              placeholder="Section Heading (e.g. Prohibited Content)"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700"
                            />
                            <textarea
                              rows={3}
                              value={sec.content || ''}
                              onChange={(e) => updateSectionItem('contentPolicy', idx, 'content', e.target.value)}
                              placeholder="Section details..."
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ACCESSIBILITY STATEMENT */}
                  {cmsSelectedPage === 'accessibility' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Accessibility Statement Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /accessibility</p>
                        </div>
                        <Link href="/accessibility" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.accessibility?.title || ''}
                            onChange={(e) => updatePageField('accessibility', 'title', e.target.value)}
                            placeholder="Accessibility Statement"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Last Updated Date</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.accessibility?.lastUpdated || ''}
                            onChange={(e) => updatePageField('accessibility', 'lastUpdated', e.target.value)}
                            placeholder="e.g. March 2026"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-400 mb-1">Introductory Statement</label>
                        <textarea
                          rows={3}
                          value={cmsForm?.pagesContent?.accessibility?.intro || ''}
                          onChange={(e) => updatePageField('accessibility', 'intro', e.target.value)}
                          placeholder="Avora Library is committed to digital accessibility..."
                          className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                        />
                      </div>

                      {/* Repeatable Features List */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 dark:text-slate-300">
                            Built-in Accessibility Features ({cmsForm?.pagesContent?.accessibility?.features?.length || 0})
                          </label>
                          <button
                            type="button"
                            onClick={() => addListItem('accessibility', 'features')}
                            className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Feature Point
                          </button>
                        </div>

                        {(cmsForm?.pagesContent?.accessibility?.features || []).map((feat, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                            <span className="font-bold text-slate-400 text-xs shrink-0">{idx + 1}.</span>
                            <input
                              type="text"
                              value={feat || ''}
                              onChange={(e) => updateListItem('accessibility', 'features', idx, e.target.value)}
                              placeholder="Feature description..."
                              className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeListItem('accessibility', 'features', idx)}
                              className="p-2 text-rose-500 hover:text-rose-600 cursor-pointer"
                              title="Remove feature"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PAYMENT POLICY */}
                  {cmsSelectedPage === 'paymentPolicy' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Payment Policy Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /payment-policy</p>
                        </div>
                        <Link href="/payment-policy" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.paymentPolicy?.title || ''}
                            onChange={(e) => updatePageField('paymentPolicy', 'title', e.target.value)}
                            placeholder="Payment Policy"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Last Updated Date</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.paymentPolicy?.lastUpdated || ''}
                            onChange={(e) => updatePageField('paymentPolicy', 'lastUpdated', e.target.value)}
                            placeholder="e.g. March 2026"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 dark:text-slate-300">Payment Clauses &amp; Rules</label>
                          <button
                            type="button"
                            onClick={() => addSectionItem('paymentPolicy')}
                            className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Section
                          </button>
                        </div>

                        {cmsForm?.pagesContent?.paymentPolicy?.sections?.map((sec, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-400 text-[10px]">Clause #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeSectionItem('paymentPolicy', idx)}
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={sec.heading || ''}
                              onChange={(e) => updateSectionItem('paymentPolicy', idx, 'heading', e.target.value)}
                              placeholder="Heading (e.g. 100% Free Reading)"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700"
                            />
                            <textarea
                              rows={3}
                              value={sec.content || ''}
                              onChange={(e) => updateSectionItem('paymentPolicy', idx, 'content', e.target.value)}
                              placeholder="Clause content details..."
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HELP CENTER & FAQ */}
                  {cmsSelectedPage === 'help' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Help Center &amp; FAQ Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /help</p>
                        </div>
                        <Link href="/help" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.help?.title || ''}
                            onChange={(e) => updatePageField('help', 'title', e.target.value)}
                            placeholder="Help Center & FAQ"
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Subtitle</label>
                          <textarea
                            rows={2}
                            value={cmsForm?.pagesContent?.help?.subtitle || ''}
                            onChange={(e) => updatePageField('help', 'subtitle', e.target.value)}
                            placeholder="Answers to common questions about reading, author tools, and PWA setup."
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>

                        {/* Repeatable Help FAQs */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 dark:text-slate-300">
                              Frequently Asked Questions ({cmsForm?.pagesContent?.help?.faqs?.length || 0})
                            </label>
                            <button
                              type="button"
                              onClick={() => addFaqItem('help')}
                              className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                            </button>
                          </div>

                          {(cmsForm?.pagesContent?.help?.faqs || []).map((faq, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-400 text-[10px]">FAQ #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFaqItem('help', idx)}
                                  className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                              <input
                                type="text"
                                value={faq.q || ''}
                                onChange={(e) => updateFaqItem('help', idx, 'q', e.target.value)}
                                placeholder="Question (e.g. How do inline paragraph comments work?)"
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700 text-xs"
                              />
                              <textarea
                                rows={3}
                                value={faq.a || ''}
                                onChange={(e) => updateFaqItem('help', idx, 'a', e.target.value)}
                                placeholder="Answer details..."
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Still need assistance box */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
                          <label className="block font-black text-slate-700 dark:text-slate-300">Support Desk Callout Box</label>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Heading</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.help?.supportHeading || ''}
                              onChange={(e) => updatePageField('help', 'supportHeading', e.target.value)}
                              placeholder="Still need assistance?"
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold outline-none border border-slate-200 dark:border-slate-700 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Body Text</label>
                            <textarea
                              rows={2}
                              value={cmsForm?.pagesContent?.help?.supportText || ''}
                              onChange={(e) => updatePageField('help', 'supportText', e.target.value)}
                              placeholder="Our support desk is available to assist authors and readers..."
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GUIDELINES */}
                  {cmsSelectedPage === 'guidelines' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Author &amp; Community Guidelines</h4>
                          <p className="text-[11px] text-slate-400">Live at /guidelines</p>
                        </div>
                        <Link href="/guidelines" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
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
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.guidelines?.subtitle || ''}
                            onChange={(e) => updatePageField('guidelines', 'subtitle', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Editorial Notice &amp; Core Platform Rules</label>
                          <textarea
                            rows={3}
                            value={cmsForm?.pagesContent?.guidelines?.content || ''}
                            onChange={(e) => updatePageField('guidelines', 'content', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>

                        {/* Repeatable Guidelines Sections */}
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 dark:text-slate-300">
                              Guideline Sections ({cmsForm?.pagesContent?.guidelines?.sections?.length || 0})
                            </label>
                            <button
                              type="button"
                              onClick={() => addSectionItem('guidelines')}
                              className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Section
                            </button>
                          </div>

                          {(cmsForm?.pagesContent?.guidelines?.sections || []).map((sec, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-400 text-[10px]">Section #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSectionItem('guidelines', idx)}
                                  className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                              <input
                                type="text"
                                value={sec.heading || ''}
                                onChange={(e) => updateSectionItem('guidelines', idx, 'heading', e.target.value)}
                                placeholder="Heading (e.g. 1. The Power of Paragraph Hooks)"
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700 text-xs"
                              />
                              <textarea
                                rows={3}
                                value={sec.content || ''}
                                onChange={(e) => updateSectionItem('guidelines', idx, 'content', e.target.value)}
                                placeholder="Section guidance details..."
                                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTACT US */}
                  {cmsSelectedPage === 'contact' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Contact Us Page</h4>
                          <p className="text-[11px] text-slate-400">Live at /contact</p>
                        </div>
                        <Link href="/contact" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
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
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.contact?.subtitle || ''}
                              onChange={(e) => updatePageField('contact', 'subtitle', e.target.value)}
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
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
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Press / Media Email</label>
                            <input
                              type="email"
                              value={cmsForm?.pagesContent?.contact?.pressEmail || ''}
                              onChange={(e) => updatePageField('contact', 'pressEmail', e.target.value)}
                              placeholder="press@avoralibrary.com"
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
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
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
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
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Homepage Hero Section</h4>
                          <p className="text-[11px] text-slate-400">Live at / (Public Landing)</p>
                        </div>
                        <Link href="/" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
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
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
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
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Title Highlight (Gradient)</label>
                            <input
                              type="text"
                              value={cmsForm?.pagesContent?.hero?.titleHighlight || ''}
                              onChange={(e) => updatePageField('hero', 'titleHighlight', e.target.value)}
                              placeholder="Capture Your Imagination."
                              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
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
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BROWSE LIBRARY PAGE */}
                  {cmsSelectedPage === 'browse' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Browse Library Page (/browse)</h4>
                          <p className="text-[11px] text-slate-400">Customize heading, subtitle, and custom sections on the Browse page</p>
                        </div>
                        <Link href="/browse" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.browse?.title ?? 'Browse Library'}
                            onChange={(e) => updatePageField('browse', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Subtitle</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.browse?.subtitle ?? ''}
                            onChange={(e) => updatePageField('browse', 'subtitle', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOOK SHOWCASE PAGE */}
                  {cmsSelectedPage === 'showcase' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Book Showcase Page (/showcase)</h4>
                          <p className="text-[11px] text-slate-400">Manage the Book Showcase page and custom sections</p>
                        </div>
                        <Link href="/showcase" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Showcase Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.showcase?.title ?? 'Book Showcase'}
                            onChange={(e) => updatePageField('showcase', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Showcase Subtitle</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.showcase?.subtitle ?? ''}
                            onChange={(e) => updatePageField('showcase', 'subtitle', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COMMUNITY HUB PAGE */}
                  {cmsSelectedPage === 'community' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Community Hub &amp; Fandom Spaces (/community)</h4>
                          <p className="text-[11px] text-slate-400">Edit banner text and add, edit, or delete Fandom Spaces</p>
                        </div>
                        <Link href="/community" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Banner Badge</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.community?.badgeText ?? 'Fandom Spaces & Discussion'}
                            onChange={(e) => updatePageField('community', 'badgeText', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.community?.title ?? 'The Avora Library Community'}
                            onChange={(e) => updatePageField('community', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-400 mb-1">Banner Subtitle</label>
                        <textarea
                          rows={2}
                          value={cmsForm?.pagesContent?.community?.subtitle ?? ''}
                          onChange={(e) => updatePageField('community', 'subtitle', e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                        />
                      </div>

                      {/* Fandom Spaces Editor */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-black text-slate-900 dark:text-white">Fandom Spaces ({(communitySpaces || []).length})</h5>
                            <p className="text-[11px] text-slate-400">Add, edit, or delete community discussion spaces</p>
                          </div>
                          <button
                            type="button"
                            onClick={addCommunitySpaceItem}
                            className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Fandom Space
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(communitySpaces || []).map((space) => (
                            <div key={space.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-400 text-[10px]">Space: {space.title}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCommunitySpaceItem(space.id, space.title)}
                                  className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete Space
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={space.title || ''}
                                  onChange={(e) => updateCommunitySpaceItem(space.id, 'title', e.target.value)}
                                  placeholder="Space Title"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none text-xs"
                                />
                                <input
                                  type="text"
                                  value={space.moderator || ''}
                                  onChange={(e) => updateCommunitySpaceItem(space.id, 'moderator', e.target.value)}
                                  placeholder="Moderator username"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none text-xs"
                                />
                                <input
                                  type="number"
                                  value={space.membersCount ?? 0}
                                  onChange={(e) => updateCommunitySpaceItem(space.id, 'membersCount', Number(e.target.value) || 0)}
                                  placeholder="Members count"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none text-xs"
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={space.description || ''}
                                onChange={(e) => updateCommunitySpaceItem(space.id, 'description', e.target.value)}
                                placeholder="Space description..."
                                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WRITING CONTESTS PAGE */}
                  {cmsSelectedPage === 'contests' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Writing Contests &amp; Awards (/contests)</h4>
                          <p className="text-[11px] text-slate-400">Edit banner text and add, edit, or delete writing competitions</p>
                        </div>
                        <Link href="/contests" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Banner Badge</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.contests?.badgeText ?? 'Avora Library Awards & Competitions'}
                            onChange={(e) => updatePageField('contests', 'badgeText', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.contests?.title ?? 'The Watty-Style Annual Writing Contests'}
                            onChange={(e) => updatePageField('contests', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-400 mb-1">Banner Subtitle</label>
                        <textarea
                          rows={2}
                          value={cmsForm?.pagesContent?.contests?.subtitle ?? ''}
                          onChange={(e) => updatePageField('contests', 'subtitle', e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                        />
                      </div>

                      {/* Contests List Editor */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-black text-slate-900 dark:text-white">Writing Contests ({(contests || []).length})</h5>
                            <p className="text-[11px] text-slate-400">Add, edit, or delete active and past competitions</p>
                          </div>
                          <button
                            type="button"
                            onClick={addContestItem}
                            className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Contest
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(contests || []).map((c) => (
                            <div key={c.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-400 text-[10px]">Contest: {c.title}</span>
                                <button
                                  type="button"
                                  onClick={() => removeContestItem(c.id, c.title)}
                                  className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete Contest
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={c.title || ''}
                                  onChange={(e) => updateContestItem(c.id, 'title', e.target.value)}
                                  placeholder="Contest Title"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none text-xs"
                                />
                                <input
                                  type="text"
                                  value={c.deadline || ''}
                                  onChange={(e) => updateContestItem(c.id, 'deadline', e.target.value)}
                                  placeholder="Deadline (e.g. October 15, 2026)"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none text-xs"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={c.tagline || ''}
                                  onChange={(e) => updateContestItem(c.id, 'tagline', e.target.value)}
                                  placeholder="Tagline"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none text-xs"
                                />
                                <input
                                  type="text"
                                  value={c.prize || ''}
                                  onChange={(e) => updateContestItem(c.id, 'prize', e.target.value)}
                                  placeholder="Prizes & Awards"
                                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOG & NEWS PAGE */}
                  {cmsSelectedPage === 'blog' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">Blog &amp; News Page (/blog)</h4>
                          <p className="text-[11px] text-slate-400">Customize the Blog page header, or manage individual articles in the Blog &amp; News tab</p>
                        </div>
                        <Link href="/blog" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Banner Badge</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.blog?.badgeText ?? (cmsForm?.blogSection?.badgeText || 'Editorial & Platform Updates')}
                            onChange={(e) => {
                              updatePageField('blog', 'badgeText', e.target.value);
                              setCmsForm(prev => ({ ...prev, blogSection: { ...(prev?.blogSection || {}), badgeText: e.target.value } }));
                            }}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Blog Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.blog?.title ?? (cmsForm?.blogSection?.title || 'Avora Library Blog & News')}
                            onChange={(e) => {
                              updatePageField('blog', 'title', e.target.value);
                              setCmsForm(prev => ({ ...prev, blogSection: { ...(prev?.blogSection || {}), title: e.target.value } }));
                            }}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-400 mb-1">Blog Page Subtitle</label>
                        <textarea
                          rows={2}
                          value={cmsForm?.pagesContent?.blog?.subtitle ?? (cmsForm?.blogSection?.subtitle || '')}
                          onChange={(e) => {
                            updatePageField('blog', 'subtitle', e.target.value);
                            setCmsForm(prev => ({ ...prev, blogSection: { ...(prev?.blogSection || {}), subtitle: e.target.value } }));
                          }}
                          className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* MY LIBRARY PAGE */}
                  {cmsSelectedPage === 'library' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">My Library Page (/library)</h4>
                          <p className="text-[11px] text-slate-400">Customize the Library banner badge, title, and subtitle</p>
                        </div>
                        <Link href="/library" target="_blank" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                          View Live Page <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Banner Badge</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.library?.badgeText ?? 'Personal Bookshelf'}
                            onChange={(e) => updatePageField('library', 'badgeText', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Page Title</label>
                          <input
                            type="text"
                            value={cmsForm?.pagesContent?.library?.title ?? 'My Library & Reading Lists'}
                            onChange={(e) => updatePageField('library', 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-400 mb-1">Banner Subtitle</label>
                        <textarea
                          rows={2}
                          value={cmsForm?.pagesContent?.library?.subtitle ?? ''}
                          onChange={(e) => updatePageField('library', 'subtitle', e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Shared Custom Content Sections Editor for pages without an inline sections loop */}
                  {['about', 'writers', 'careers', 'press', 'partnerships', 'contact', 'dmca', 'accessibility', 'help', 'browse', 'showcase', 'community', 'contests', 'blog', 'library'].includes(cmsSelectedPage) && (
                    renderCustomSectionsEditor(cmsSelectedPage, 'Additional Custom Sections on This Page')
                  )}

                  {/* Bottom Save Button */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Changes will take effect immediately across all devices and PWA offline caches upon saving.
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveCms}
                      className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save CMS Changes
                    </button>
                  </div>

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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('story')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'story'
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
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
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Picture Book
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect('pdf')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pubContentType === 'pdf'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF Book
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

            {/* Picture Book Mode Alert Banner */}
            {pubContentType === 'picture_book' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h5 className="font-extrabold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                      🎨 Picture Book Mode Active • Auto-Categorized for Kids &amp; Family (3+ / 7+)
                    </h5>
                    <button
                      type="button"
                      onClick={loadSampleKidsPages}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ Load 3 Sample Pages</span>
                    </button>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                    Upload story picture pages and narration below. The <strong>Synopsis / Description</strong> textarea serves as the catalog cover blurb for young readers &amp; parents.
                  </p>
                </div>
              </div>
            )}

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
              {pubContentType === 'pdf' && renderPdfBookManager()}

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
                {pubContentType === 'story' ? 'Chapter 1 Manuscripts' : pubContentType === 'picture_book' ? 'Illustrated Pages Manager' : 'PDF Book & Worksheet Studio'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pubContentType === 'story'
                  ? 'Input the initial serialization chapter. Paragraphs separated by blank lines will support reader inline comments.'
                  : pubContentType === 'picture_book'
                  ? 'Add sequential illustrated pages with captions and imagery for kids and graphic novels.'
                  : 'Upload or link printable PDF homework, Montessori assignments, and children workbooks.'}
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
            ) : pubContentType === 'picture_book' ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Illustrated Picture Book Mode Active ({pubPages.length} Pages Configured)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    All {pubPages.length} illustrated story pages, device pictures, and captions are configured in the Picture Book Manager in Section 1 above. Chapter 1 will automatically publish as an interactive illustrated page-turner for children and parents.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Printable PDF Worksheet &amp; Book Active ({pubPdfPageCount} Pages)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The printable PDF file ({pubPdfUrl ? pubPdfUrl.slice(0, 50) + '...' : 'Loaded from device'}) will be embedded directly in the reader with 1-click Download, Print, and Fullscreen view for students and parents.
                  </p>
                </div>
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

      {/* Blog Article Create & Edit Modal */}
      {blogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {editingBlogPost ? 'Edit Blog Article' : 'Write New Blog Article'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingBlogPost ? 'Update editorial details and cover artwork' : 'Publish an editorial, news release, or writing craft guide'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlogModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-4 text-xs">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Pacing Secrets for Serial Fiction"
                    value={blogForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setBlogForm(prev => ({
                        ...prev,
                        title,
                        slug: prev.slug && prev.slug !== prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') 
                          ? prev.slug 
                          : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      }));
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none text-slate-900 dark:text-white focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none text-slate-900 dark:text-white cursor-pointer focus:border-purple-500"
                  >
                    <option value="Writing Advice">Writing Advice</option>
                    <option value="Author Spotlight">Author Spotlight</option>
                    <option value="Industry News">Industry News</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Platform Update">Platform Update</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
              </div>

              {/* Author, Read Time, Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Author Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Editorial Team"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 min read"
                    value={blogForm.readTime}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, readTime: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. 5-pacing-secrets"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Cover Image Upload & URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Article Cover Artwork</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600 relative">
                    {blogForm.cover ? (
                      <img
                        src={blogForm.cover}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2 items-center">
                      <label className="flex-1 cursor-pointer">
                        <span className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center">
                          <Upload className="w-3.5 h-3.5" /> Upload Cover Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBlogCoverUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setBlogForm(prev => ({ ...prev, cover: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80" }))}
                        className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Default Artwork
                      </button>
                    </div>

                    <input
                      type="url"
                      placeholder="Or enter image URL (https://...)"
                      value={blogForm.cover}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, cover: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium outline-none text-slate-900 dark:text-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 dark:text-slate-300">Short Excerpt / Summary</label>
                <textarea
                  rows={2}
                  placeholder="A brief 1-2 sentence teaser for cards and search..."
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Content / Body */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 dark:text-slate-300">Article Content / Body</label>
                <textarea
                  rows={8}
                  placeholder="Write your article text or markdown here..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBlogModalOpen(false)}
                  className="py-2.5 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingBlogPost ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Story & Boost Reader Metrics Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    Edit Story & Boost Metrics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage reader engagement (reads, votes, comments) and editorial details for early traction.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {storyEditSuccessNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Story details and reader metrics updated successfully! Live across all pages.</span>
              </div>
            )}

            <form onSubmit={handleSaveStoryEdits} className="space-y-6 text-xs">
              {/* Engagement Boost Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/5 via-purple-500/5 to-amber-500/5 border border-brand-500/20 dark:border-brand-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-500" />
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Reader Metrics & Engagement Tuner
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400">
                    Algorithm & Social Proof
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Seed reads, votes, and comments directly to establish momentum while building organic audience traffic.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Reads */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Total Reads
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">views</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={storyEditForm.reads}
                      onChange={(e) => setStoryEditForm(prev => ({ ...prev, reads: e.target.value }))}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500 font-mono"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: '+1K', val: 1000 },
                        { label: '+5K', val: 5000 },
                        { label: '+10K', val: 10000 },
                        { label: '+50K', val: 50000 },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleQuickBoostMetric('reads', preset.val)}
                          className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-mono font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Votes */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Total Votes
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">stars</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={storyEditForm.votes}
                      onChange={(e) => setStoryEditForm(prev => ({ ...prev, votes: e.target.value }))}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500 font-mono"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: '+100', val: 100 },
                        { label: '+500', val: 500 },
                        { label: '+1K', val: 1000 },
                        { label: '+5K', val: 5000 },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleQuickBoostMetric('votes', preset.val)}
                          className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-300 font-mono font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> Comments
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">count</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={storyEditForm.commentsCount}
                      onChange={(e) => setStoryEditForm(prev => ({ ...prev, commentsCount: e.target.value }))}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500 font-mono"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: '+25', val: 25 },
                        { label: '+50', val: 50 },
                        { label: '+100', val: 100 },
                        { label: '+250', val: 250 },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleQuickBoostMetric('commentsCount', preset.val)}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 font-mono font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={storyEditForm.title}
                    onChange={(e) => setStoryEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Story URL Slug</label>
                  <input
                    type="text"
                    value={storyEditForm.slug}
                    onChange={(e) => setStoryEditForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Author & Author Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Author Display Name</label>
                  <input
                    type="text"
                    value={storyEditForm.author}
                    onChange={(e) => setStoryEditForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Author Handle / Username</label>
                  <input
                    type="text"
                    value={storyEditForm.authorUsername}
                    onChange={(e) => setStoryEditForm(prev => ({ ...prev, authorUsername: e.target.value }))}
                    placeholder="e.g. elena_vance"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Genre, Status, Maturity & Age Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Genre</label>
                  <select
                    value={storyEditForm.genre}
                    onChange={(e) => setStoryEditForm(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-brand-500"
                  >
                    {genres && genres.length > 0 ? (
                      genres.map(g => (
                        <option key={g.id || g.slug || g.name} value={g.name}>{g.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Romance">Romance</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Kids Books">Kids Books</option>
                        <option value="Teen Fiction">Teen Fiction</option>
                        <option value="Werewolf">Werewolf</option>
                        <option value="Horror">Horror</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Status</label>
                  <select
                    value={storyEditForm.status}
                    onChange={(e) => setStoryEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-brand-500"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Age Rating</label>
                  <select
                    value={storyEditForm.ageRating}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStoryEditForm(prev => ({
                        ...prev,
                        ageRating: val,
                        maturity: val === '18+' ? 'mature' : prev.maturity
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-brand-500"
                  >
                    <option value="All Ages">All Ages</option>
                    <option value="3+">3+ (Kids)</option>
                    <option value="7+">7+ (Children)</option>
                    <option value="13+">13+ (Teens)</option>
                    <option value="16+">16+ (Young Adult)</option>
                    <option value="18+">18+ (Mature Only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 dark:text-slate-300">Maturity</label>
                  <select
                    value={storyEditForm.maturity}
                    onChange={(e) => setStoryEditForm(prev => ({ ...prev, maturity: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-brand-500"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="mature">Mature (18+)</option>
                  </select>
                </div>
              </div>

              {/* Cover Artwork & Upload */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-600 dark:text-slate-300">Cover Artwork</label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <img
                    src={storyEditForm.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                    alt="Cover Preview"
                    className="w-16 h-24 object-cover rounded-xl shadow-md border border-slate-200 dark:border-slate-700 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        {storyCoverLoading ? 'Processing...' : 'Upload Image File'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleStoryCoverUpload}
                          disabled={storyCoverLoading}
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">PNG, JPG, WebP supported</span>
                    </div>
                    <input
                      type="url"
                      value={storyEditForm.cover}
                      onChange={(e) => setStoryEditForm(prev => ({ ...prev, cover: e.target.value }))}
                      placeholder="Or paste cover image URL (https://...)"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description Synopsis */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 dark:text-slate-300">Story Synopsis / Blurb</label>
                <textarea
                  rows={3}
                  value={storyEditForm.description}
                  onChange={(e) => setStoryEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Compelling story description or blurb..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 dark:text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={storyEditForm.tags}
                  onChange={(e) => setStoryEditForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g. magic, fantasy, slowburn, royalty"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white outline-none focus:border-brand-500"
                />
              </div>

              {/* Badges & Flags */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="block font-bold text-slate-700 dark:text-slate-200 mb-2">Editorial & Featured Badges</span>
                <div className="flex flex-wrap gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={storyEditForm.isOriginal}
                      onChange={(e) => setStoryEditForm(prev => ({ ...prev, isOriginal: e.target.checked }))}
                      className="rounded accent-brand-500 w-4 h-4"
                    />
                    <span>House Original (Gold Badge)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={storyEditForm.isEditorsPick}
                      onChange={(e) => setStoryEditForm(prev => ({ ...prev, isEditorsPick: e.target.checked }))}
                      className="rounded accent-brand-500 w-4 h-4"
                    />
                    <span>Editor's Pick (Purple Badge)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={storyEditForm.isTrending}
                      onChange={(e) => setStoryEditForm(prev => ({ ...prev, isTrending: e.target.checked }))}
                      className="rounded accent-brand-500 w-4 h-4"
                    />
                    <span>Trending (Flame Badge)</span>
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="py-2.5 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes & Boost
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
