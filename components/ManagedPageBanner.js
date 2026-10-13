'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Edit3, Trash2, RotateCcw, EyeOff, ShieldCheck, Home, Sparkles } from 'lucide-react';

export function ManagedPageBanner({ pageKey, title }) {
  const { isAdmin, cmsConfig, togglePageDeleted } = useApp();
  if (!isAdmin || !pageKey) return null;

  const pageData = cmsConfig?.pagesContent?.[pageKey] || {};
  const isDeleted = Boolean(pageData.deleted);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3" /> Admin Page Control
          </span>
          <span className="font-bold text-slate-200">{title || pageKey}</span>
          {isDeleted ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Deleted / Hidden from Public
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live &amp; Published
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin?tab=cms-pages&page=${encodeURIComponent(pageKey)}`}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Page Content</span>
          </Link>

          {isDeleted ? (
            <button
              type="button"
              onClick={() => togglePageDeleted(pageKey, false)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Page</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete / unpublish the "${title || pageKey}" page from the website? You can restore it anytime from the Admin Panel.`)) {
                  togglePageDeleted(pageKey, true);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Page</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeletedPageGate({ pageKey, title, children }) {
  const { isAdmin, cmsConfig, togglePageDeleted } = useApp();
  const pageData = cmsConfig?.pagesContent?.[pageKey] || {};
  const isDeleted = Boolean(pageData.deleted);

  if (isDeleted && !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <EyeOff className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Page Unavailable</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This page has been removed or unpublished by the platform administrator.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ManagedPageBanner pageKey={pageKey} title={title || pageData.title || pageKey} />
      {isDeleted && isAdmin && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-100 px-4 py-3 text-xs">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-semibold flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Admin Preview:</strong> This page is currently <strong>DELETED / HIDDEN</strong> for regular visitors and navigation menus.
              </span>
            </p>
            <button
              type="button"
              onClick={() => togglePageDeleted(pageKey, false)}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore Page to Public
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

export function ManagedPageCustomSections({ pageKey }) {
  const { cmsConfig } = useApp();
  const sections = cmsConfig?.pagesContent?.[pageKey]?.sections;
  if (!Array.isArray(sections) || sections.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      {sections.map((sec, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm"
        >
          {sec.heading && (
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{sec.heading}</span>
            </h3>
          )}
          {sec.content && (
            <p className="whitespace-pre-line">{sec.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}

