'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { BookOpen, Globe, Heart, MessageCircle } from 'lucide-react';

export default function Footer() {
  const { lang, setLang, t, cmsConfig } = useApp();

  const socialLinks = cmsConfig?.socialLinks || {
    instagram: { enabled: true, url: "https://instagram.com/avoralibrary", label: "Instagram" },
    x: { enabled: true, url: "https://x.com/avoralibrary", label: "X (Twitter)" },
    facebook: { enabled: true, url: "https://facebook.com/avoralibrary", label: "Facebook" },
    tiktok: { enabled: true, url: "https://tiktok.com/@avoralibrary", label: "TikTok" },
    discord: { enabled: true, url: "https://discord.gg/avoralibrary", label: "Discord" },
    youtube: { enabled: false, url: "https://youtube.com/@avoralibrary", label: "YouTube" }
  };

  const footerConfig = cmsConfig?.footerConfig || {
    tagline: "A responsive, multilingual serialized storytelling web platform and Progressive Web App (PWA). Connecting authors and passionate readers worldwide.",
    copyrightText: `© ${new Date().getFullYear()} Avora Library Platform. All original rights reserved.`,
    showSocialLinks: true,
    showLanguageSelector: true,
    showLegalLinks: true
  };

  const renderSocialIcon = (key) => {
    switch (key) {
      case 'x':
        return <span className="font-black text-xs">𝕏</span>;
      case 'facebook':
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.76-.22 1.02.04 2.11.72 2.87.65.75 1.66 1.13 2.65 1.05.95-.03 1.87-.52 2.37-1.33.32-.51.48-1.11.47-1.71V.02z"/>
          </svg>
        );
      case 'discord':
        return <MessageCircle className="w-3.5 h-3.5" />;
      case 'youtube':
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      default:
        return <span className="font-black text-xs">{key.substring(0, 2).toUpperCase()}</span>;
    }
  };

  const activeSocials = Object.entries(socialLinks).filter(([_, item]) => item && item.enabled);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          
          {/* Brand & Language Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-slate-900 dark:text-white">
                Avora<span className="text-brand-500">Library</span>
              </span>
            </Link>
            <p className="max-w-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {footerConfig.tagline}
            </p>

            {/* Social Media Links (CMS Managed: Show/Hide & Custom URLs) */}
            {footerConfig.showSocialLinks !== false && activeSocials.length > 0 && (
              <div className="flex items-center gap-2.5 pt-1 text-slate-400 flex-wrap">
                {activeSocials.map(([key, item]) => (
                  <a 
                    key={key}
                    href={item.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center" 
                    title={item.label || key}
                    aria-label={item.label || key}
                  >
                    {renderSocialIcon(key)}
                  </a>
                ))}
              </div>
            )}

            {/* Language Selector */}
            {footerConfig.showLanguageSelector !== false && (
              <div className="flex items-center gap-2 pt-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <select 
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  aria-label="Footer language selector"
                >
                  <option value="en">English (US)</option>
                  <option value="ka">ქართული (GE)</option>
                  <option value="hi">हिन्दी (IN)</option>
                </select>
              </div>
            )}
          </div>

          {/* Col 1: Discovery */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t.browse}</h4>
            <ul className="space-y-2">
              <li><Link href="/browse?sort=trending" className="hover:text-brand-500">{t.trendingNow}</Link></li>
              <li><Link href="/browse?filter=originals" className="hover:text-brand-500">{t.houseOriginals}</Link></li>
              <li><Link href="/browse?filter=picks" className="hover:text-brand-500">{t.mustRead}</Link></li>
              <li><Link href="/browse" className="hover:text-brand-500">{t.genreLibrary}</Link></li>
              <li><Link href="/contests" className="hover:text-brand-500">{t.contests}</Link></li>
            </ul>
          </div>

          {/* Col 2: Community & Writers */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Creators & Fandom</h4>
            <ul className="space-y-2">
              <li><Link href="/community" className="hover:text-brand-500">Fandom Spaces</Link></li>
              <li><Link href="/write" className="hover:text-brand-500">Author Studio</Link></li>
              <li><Link href="/writers" className="hover:text-brand-500 font-semibold text-brand-600 dark:text-brand-400">Writer Hub</Link></li>
              <li><Link href="/guidelines" className="hover:text-brand-500">{t.guidelines}</Link></li>
              <li><Link href="/blog" className="hover:text-brand-500">{t.blog}</Link></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-brand-500">About Avora Library</Link></li>
              <li><Link href="/careers" className="hover:text-brand-500">Careers</Link></li>
              <li><Link href="/press" className="hover:text-brand-500">Press Kit</Link></li>
              <li><Link href="/partnerships" className="hover:text-brand-500">Brand Partnerships</Link></li>
              <li><Link href="/contact" className="hover:text-brand-500">{t.contactUs}</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Legal & Policies</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-brand-500">{t.terms}</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-500">{t.privacy}</Link></li>
              <li><Link href="/dmca" className="hover:text-brand-500">{t.dmca}</Link></li>
              <li><Link href="/content-policy" className="hover:text-brand-500">Content Policy</Link></li>
              <li><Link href="/accessibility" className="hover:text-brand-500">Accessibility</Link></li>
              <li><Link href="/payment-policy" className="hover:text-brand-500">Payment Policy</Link></li>
              <li><Link href="/help" className="hover:text-brand-500">{t.helpCenter}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>{footerConfig.copyrightText || `© ${new Date().getFullYear()} Avora Library Platform. All original rights reserved.`}</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for serialized storytelling &amp; PWA readers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
