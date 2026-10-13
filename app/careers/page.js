'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DeletedPageGate, ManagedPageCustomSections } from '@/components/ManagedPageBanner';
import { useApp } from '@/context/AppContext';
import { Briefcase } from 'lucide-react';

export default function CareersPage() {
  const { cmsConfig } = useApp();
  const careersData = cmsConfig?.pagesContent?.careers || {
    title: "Careers at Avora Library",
    subtitle: "Join our mission to empower the next generation of serialized writers and digital readers.",
    contactEmail: "careers@avoralibrary.com",
    openings: []
  };

  const openings = careersData.openings || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <DeletedPageGate pageKey="careers" title={careersData.title || "Careers at Avora Library"}>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
          <div className="text-center space-y-2 mb-10">
            <Briefcase className="w-10 h-10 text-brand-500 mx-auto" />
            <h1 className="text-3xl sm:text-4xl font-black">{careersData.title ?? "Careers at Avora Library"}</h1>
            {careersData.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                {careersData.subtitle}
              </p>
            )}
            {careersData.contactEmail && (
              <p className="text-xs text-brand-500 font-semibold pt-1">
                General inquiries: <a href={`mailto:${careersData.contactEmail}`} className="underline">{careersData.contactEmail}</a>
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Open Positions ({openings.length})
            </h3>

            {openings.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No open positions at this moment. You can send your resume to <a href={`mailto:${careersData.contactEmail || 'careers@avoralibrary.com'}`} className="text-brand-500 underline">{careersData.contactEmail || 'careers@avoralibrary.com'}</a>.
              </div>
            ) : (
              openings.map((job, idx) => (
                <div key={job.id || idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {job.department ? `${job.department} • ` : ''}{job.type || 'Full-time'}
                    </p>
                  </div>
                  <a 
                    href={`mailto:${job.applyEmail || careersData.contactEmail || 'careers@avoralibrary.com'}?subject=${encodeURIComponent(`Application: ${job.title}`)}`} 
                    className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-all text-center self-start sm:self-center shrink-0 shadow-sm"
                  >
                    Apply Now
                  </a>
                </div>
              ))
            )}
          </div>

          <ManagedPageCustomSections pageKey="careers" />
        </main>
      </DeletedPageGate>

      <Footer />
    </div>
  );
}
