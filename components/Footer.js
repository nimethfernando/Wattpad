'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { BookOpen, Globe, Heart } from 'lucide-react';

export default function Footer() {
  const { lang, setLang, t } = useApp();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Column */}
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
              A responsive, serialized storytelling web platform and PWA. Connecting authors and passionate readers worldwide across every chapter.
            </p>
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
              <li><Link href="/contests" className="hover:text-brand-500">{t.contests}</Link></li>
            </ul>
          </div>

          {/* Col 2: Community & Writers */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{t.community}</h4>
            <ul className="space-y-2">
              <li><Link href="/community" className="hover:text-brand-500">Fandom Spaces</Link></li>
              <li><Link href="/write" className="hover:text-brand-500">Author Studio</Link></li>
              <li><Link href="/guidelines" className="hover:text-brand-500">{t.guidelines}</Link></li>
              <li><Link href="/blog" className="hover:text-brand-500">{t.blog}</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Legal & Help</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="hover:text-brand-500">{t.helpCenter}</Link></li>
              <li><Link href="/terms" className="hover:text-brand-500">{t.terms}</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-500">{t.privacy}</Link></li>
              <li><Link href="/dmca" className="hover:text-brand-500">{t.dmca}</Link></li>
              <li><Link href="/content-policy" className="hover:text-brand-500">Content Policy</Link></li>
              <li><Link href="/contact" className="hover:text-brand-500">{t.contactUs}</Link></li>
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
