'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { BookOpen, Globe, Heart, MessageCircle } from 'lucide-react';

export default function Footer() {
  const { lang, setLang, t } = useApp();

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
                Story<span className="text-brand-500">Vault</span>
              </span>
            </Link>
            <p className="max-w-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A responsive, multilingual serialized storytelling web platform and Progressive Web App (PWA). Connecting authors and passionate readers worldwide.
            </p>

            {/* Social Media Links (Scope 1) */}
            <div className="flex items-center gap-3 pt-1 text-slate-400">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 transition-colors" title="Twitter / X">
                <span className="font-extrabold text-xs">𝕏</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 transition-colors" title="Instagram">
                <span className="font-extrabold text-xs">IG</span>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 transition-colors" title="Discord Community">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 transition-colors" title="TikTok">
                <span className="font-extrabold text-xs">TT</span>
              </a>
            </div>

            {/* Language Selector */}
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
              <li><Link href="/about" className="hover:text-brand-500">About StoryVault</Link></li>
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
          <p>© {new Date().getFullYear()} StoryVault Platform. All original rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for serialized storytelling & PWA readers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
