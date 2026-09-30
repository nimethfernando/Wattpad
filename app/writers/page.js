'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { 
  PenTool, 
  BookOpen, 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Trophy, 
  CheckCircle, 
  ArrowRight, 
  Users, 
  FileText,
  BookmarkCheck,
  Flame
} from 'lucide-react';

export default function WritersPage() {
  const { t } = useApp();

  const resources = [
    {
      id: 1,
      title: "Mastering the Chapter Cliffhanger",
      category: "Narrative Craft",
      desc: "How to structure serial episode endings that guarantee readers unlock the next installment immediately.",
      readTime: "6 min read",
      icon: Flame
    },
    {
      id: 2,
      title: "Pacing Serialized Fiction for Retention",
      category: "Audience Growth",
      desc: "Strategies for releasing 2,000-word chapters on a consistent schedule to optimize the recommendation algorithm.",
      readTime: "8 min read",
      icon: TrendingUp
    },
    {
      id: 3,
      title: "Line-by-Line Community Engagement",
      category: "Reader Community",
      desc: "Transform paragraph reactions into active story plotting feedback without derailing your original vision.",
      readTime: "5 min read",
      icon: Users
    },
    {
      id: 4,
      title: "Copyright, Creative Commons & Rights",
      category: "Legal & Publishing",
      desc: "Understanding copyright options on Avora Library and retaining 100% intellectual property ownership.",
      readTime: "7 min read",
      icon: BookmarkCheck
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-amber-600 to-rose-600 p-8 sm:p-14 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Avora Library Writer Resources & Hub
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Turn Your Serial Fiction Into a Global Phenomenon
            </h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-xl">
              Everything you need to write, publish, and monetize serialized stories. Access craft masterclasses, formatting guides, and community growth playbooks.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link 
                href="/write" 
                className="px-6 py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-lg transition-all"
              >
                Launch Author Studio →
              </Link>
              <Link 
                href="/guidelines" 
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
              >
                Read Author Guidelines
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center w-52 h-52 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 text-center shadow-2xl">
            <PenTool className="w-16 h-16 text-amber-300 mb-2 animate-bounce" />
            <span className="font-black text-xl">100% Free</span>
            <span className="text-xs text-white/80">Keep all your copyright</span>
          </div>
        </div>

        {/* 4 Pillars of Success */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-sm">Write Without Friction</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-saving studio editor with rich formatting, draft mode, and scheduled chapter releases.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-sm">Inline Community Feedback</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Readers comment directly on your paragraphs, providing immediate pulse checks on plot twists.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-sm">Editorial Consideration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Top trending serials are selected for House Originals spotlighting and adaptation development.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-sm">Watty Contest Grants</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Submit ongoing serials to annual awards competitions with official badges and cash prizes.
            </p>
          </div>
        </section>

        {/* Writing Craft Resources */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Writer Playbooks & Tutorials</h2>
              <p className="text-xs text-slate-400 mt-1">Curated guides by successful serialized authors and editors</p>
            </div>
            <Link href="/blog" className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1">
              View All Tutorials <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider text-brand-600">{item.category}</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    <Link href="/blog" className="text-xs font-bold text-brand-500 inline-flex items-center gap-1 hover:underline pt-1">
                      Read Guide →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Writer FAQ Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-xl font-black">Author Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white">Do I keep rights to my stories?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Yes, absolutely. You retain 100% of your copyright and intellectual property rights. You can unpublish or edit your stories at any time.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white">How often should I publish chapters?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Most top serialized authors publish 1 to 2 chapters per week (approx. 1,500–2,500 words). Consistency builds loyal readership.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white">Can I schedule chapters in advance?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Yes! When writing in Author Studio, switch the status to "Schedule Release" and pick your desired date and time.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white">How do I qualify for House Originals?</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Our editorial team monitors active trending stories with high reader engagement, positive reaction ratios, and completed story arcs.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
