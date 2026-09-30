'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  BookMarked, 
  Plus, 
  Check, 
  Globe, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';

export default function ReadingListModal({ isOpen, onClose, story }) {
  const { readingLists, setReadingLists, createReadingList, user, openAuthModal } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen || !story) return null;

  const handleToggleStoryInList = (listId) => {
    if (!user) {
      openAuthModal('login', 'Sign in to add stories to your custom reading lists.');
      return;
    }

    setReadingLists(prev => prev.map(list => {
      if (list.id === listId) {
        const hasStory = list.storyIds?.includes(story.id);
        const updatedStoryIds = hasStory 
          ? list.storyIds.filter(id => id !== story.id)
          : [...(list.storyIds || []), story.id];

        setSuccessNotice(hasStory ? `Removed from "${list.title}"` : `Added to "${list.title}"`);
        setTimeout(() => setSuccessNotice(''), 2500);

        return { ...list, storyIds: updatedStoryIds };
      }
      return list;
    }));
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    if (!user) {
      openAuthModal('login', 'Sign in to create personal reading lists.');
      return;
    }

    createReadingList(newListTitle.trim(), newListDesc.trim(), [story.id]);
    setSuccessNotice(`Created list "${newListTitle.trim()}" with "${story.title}"!`);
    setNewListTitle('');
    setNewListDesc('');
    setShowCreateForm(false);
    setTimeout(() => setSuccessNotice(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-brand-500" />
            <h3 className="font-black text-base">Add to Reading List</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Story Preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
          <img src={story.cover} alt={story.title} className="w-10 h-14 object-cover rounded-lg shadow-sm" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{story.title}</h4>
            <p className="text-[11px] text-slate-400">By {story.author}</p>
          </div>
        </div>

        {/* Success toast notice */}
        {successNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Existing Reading Lists */}
        {!showCreateForm ? (
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Choose a List ({readingLists.length})
            </span>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {readingLists.map(list => {
                const isIncluded = list.storyIds?.includes(story.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handleToggleStoryInList(list.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isIncluded 
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block text-slate-900 dark:text-white">{list.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {list.storyIds?.length || 0} stories • {list.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                      isIncluded 
                        ? 'bg-brand-500 border-brand-500 text-white shadow-sm' 
                        : 'border-slate-300 dark:border-slate-700 text-transparent'
                    }`}>
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full py-2.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Reading List</span>
            </button>
          </div>
        ) : (
          /* Create New List Form */
          <form onSubmit={handleCreateList} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">List Title</label>
              <input 
                type="text" 
                placeholder="e.g. Late Night Fantasy Must-Reads" 
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Description (Optional)</label>
              <textarea 
                rows={2}
                placeholder="What connects the books in this curated collection?" 
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                {isPublic ? <Globe className="w-4 h-4 text-brand-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
                <span className="font-bold text-xs">{isPublic ? 'Public Reading List' : 'Private Shelf'}</span>
              </div>
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/25 cursor-pointer"
              >
                Create & Add Story
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

