'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Flag, X, ShieldAlert, CheckCircle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, targetType, reportedUser, storyTitle }) {
  const { submitReport, blockUser } = useApp();
  const [reason, setReason] = useState('Copyright / DMCA Infringement');
  const [details, setDetails] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitReport({
      targetType: targetType || "story",
      reportedUser: reportedUser || "Unknown",
      reason,
      details,
      storyTitle: storyTitle || "Avora Library Content"
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  const handleBlock = () => {
    if (reportedUser) {
      blockUser(reportedUser);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className="w-full max-w-md text-left bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8"
          onClick={(e) => e.stopPropagation()}
        >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">Report {targetType ? targetType.toUpperCase() : 'Content'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Target: {storyTitle || reportedUser}</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Report Submitted</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Our safety & moderation team will review this report within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Report</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-semibold outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Copyright / DMCA Infringement" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Copyright / DMCA Infringement</option>
                <option value="Harassment or Hate Speech" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Harassment or Hate Speech</option>
                <option value="Spam or Unauthorized Advertising" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Spam or Unauthorized Advertising</option>
                <option value="Inappropriate Mature Content without 18+ Gate" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Inappropriate Mature Content without 18+ Gate</option>
                <option value="Plagiarism" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Plagiarism</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Additional Context (Optional)</label>
              <textarea 
                rows={3}
                placeholder="Provide timestamps, paragraph numbers, or external proof..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 outline-none leading-relaxed focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button 
                type="submit"
                className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Dispatch Report to Moderation
              </button>

              {reportedUser && (
                <button 
                  type="button"
                  onClick={handleBlock}
                  className="w-full py-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 font-bold transition-colors"
                >
                  Block @{reportedUser}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  </div>
  );
}
