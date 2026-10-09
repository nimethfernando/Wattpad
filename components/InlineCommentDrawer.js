'use client';
import { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Heart, 
  Send, 
  Sparkles, 
  CornerDownRight 
} from 'lucide-react';

export default function InlineCommentDrawer({
  isOpen,
  onClose,
  paragraph,
  story,
  chapter,
  user,
  onAddComment,
  openAuthModal
}) {
  const [commentInput, setCommentInput] = useState('');
  const [commentSort, setCommentSort] = useState('newest'); // 'newest' | 'likes'
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!isOpen || !paragraph) return null;

  const comments = paragraph.comments || [];
  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === 'likes') return (b.likes || 0) - (a.likes || 0);
    return b.id - a.id;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!user) {
      if (openAuthModal) {
        openAuthModal('login', 'Sign in to post inline reactions and join the discussion.');
      }
      return;
    }

    if (onAddComment) {
      onAddComment(commentInput.trim());
    }
    setCommentInput('');
  };

  const handleReplySubmit = (parentCommentId) => {
    if (!replyText.trim()) return;
    if (!user) {
      if (openAuthModal) openAuthModal('login', 'Sign in to reply to comments.');
      return;
    }

    const parent = comments.find(c => c.id === parentCommentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      parent.replies.push({
        id: Date.now(),
        author: user?.name || "Reader",
        avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
        time: "Just now",
        text: replyText.trim()
      });
    }
    setReplyToId(null);
    setReplyText('');
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform animate-slide-left">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-500" />
          <h3 className="font-extrabold text-sm">
            Inline Comments ({comments.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={commentSort}
            onChange={(e) => setCommentSort(e.target.value)}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1.5 rounded-lg outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <option value="newest">Newest</option>
            <option value="likes">Most Liked</option>
          </select>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Highlighted Paragraph Quotation */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm italic text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 line-clamp-3">
        "{paragraph.text}"
      </div>

      {/* Comments List Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No comments on this paragraph yet.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Be the first reader to react to this line!</p>
          </div>
        ) : (
          sortedComments.map(c => (
            <div key={c.id} className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={c.avatar} alt={c.author} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700" />
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">{c.author}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.time}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm pl-8 leading-relaxed">
                {c.text}
              </p>

              {/* Reaction bar */}
              <div className="pl-8 flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      c.likes = (c.likes || 0) + 1;
                    }}
                    className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" /> {c.likes || 0}
                  </button>
                  <button 
                    onClick={() => setReplyToId(replyToId === c.id ? null : c.id)}
                    className="hover:text-brand-500 transition-colors cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Nested Replies Stream */}
              {c.replies && c.replies.length > 0 && (
                <div className="pl-8 pt-2 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                  {c.replies.map(r => (
                    <div key={r.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <img src={r.avatar} alt={r.author} className="w-5 h-5 rounded-full" />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{r.author}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{r.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Input */}
              {replyToId === c.id && (
                <div className="pl-7 pt-2 flex items-center gap-2">
                  <input 
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(c.id)}
                  />
                  <button 
                    onClick={() => handleReplySubmit(c.id)}
                    className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Post Comment Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input 
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder={user ? "React to this line..." : "Sign in to react..."}
          className="flex-1 p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border-none text-xs outline-none px-4"
        />
        <button 
          type="submit"
          className="p-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-transform hover:scale-105 cursor-pointer"
          title="Send Reaction"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
    </>
  );
}

