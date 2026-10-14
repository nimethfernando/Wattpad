'use client';
import { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Heart, 
  Send, 
  Sparkles, 
  Pencil,
  Trash2,
  Check,
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
  onEditComment,
  onDeleteComment,
  onAddReply,
  onEditReply,
  onDeleteReply,
  openAuthModal,
  readerTheme = 'sepia'
}) {
  const [commentInput, setCommentInput] = useState('');
  const [commentSort, setCommentSort] = useState('newest'); // 'newest' | 'likes'
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Comment edit & delete state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Reply edit & delete state
  const [editingReplyKey, setEditingReplyKey] = useState(null); // `${commentId}_${replyId}`
  const [editReplyText, setEditReplyText] = useState('');
  const [confirmDeleteReplyKey, setConfirmDeleteReplyKey] = useState(null);

  if (!isOpen || !paragraph) return null;

  const comments = paragraph.comments || [];
  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === 'likes') return (b.likes || 0) - (a.likes || 0);
    return b.id - a.id;
  });

  const isCommentOwner = (item) => {
    if (!user || !item) return false;
    const authorName = (item.author || '').trim().toLowerCase();
    const userName = (user.name || '').trim().toLowerCase();
    const userHandle = (user.username || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const authorEmail = (item.authorEmail || '').trim().toLowerCase();
    const authorHandle = (item.authorUsername || '').trim().toLowerCase();

    return Boolean(
      (item.userId && user.id && item.userId === user.id) ||
      (authorEmail && userEmail && authorEmail === userEmail) ||
      (authorHandle && userHandle && authorHandle === userHandle) ||
      (userName && authorName === userName) ||
      (userHandle && authorName === userHandle)
    );
  };

  const canModerateComment = (item) => {
    if (!user) return false;
    if (isCommentOwner(item)) return true;
    if (user.role === 'admin' || user.isSuperAdmin || user.isDityaAdmin) return true;
    if (story?.authorUsername && user.username && story.authorUsername.toLowerCase() === user.username.toLowerCase()) return true;
    return false;
  };

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

  const handleStartEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditCommentText(c.text);
    setConfirmDeleteId(null);
    setReplyToId(null);
  };

  const handleSaveEditComment = (commentId) => {
    if (!editCommentText.trim()) return;
    if (onEditComment) {
      onEditComment(commentId, editCommentText.trim());
    } else {
      const target = comments.find(c => c.id === commentId);
      if (target) {
        target.text = editCommentText.trim();
        target.isEdited = true;
      }
    }
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDeleteComment = (commentId) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
    } else {
      const idx = comments.findIndex(c => c.id === commentId);
      if (idx !== -1) {
        comments.splice(idx, 1);
      }
    }
    setConfirmDeleteId(null);
  };

  const handleReplySubmit = (parentCommentId) => {
    if (!replyText.trim()) return;
    if (!user) {
      if (openAuthModal) openAuthModal('login', 'Sign in to reply to comments.');
      return;
    }

    if (onAddReply) {
      onAddReply(parentCommentId, replyText.trim());
    } else {
      const parent = comments.find(c => c.id === parentCommentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push({
          id: Date.now(),
          author: user?.name || "Reader",
          authorUsername: user?.username || null,
          authorEmail: user?.email || null,
          userId: user?.id || null,
          avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
          time: "Just now",
          text: replyText.trim()
        });
      }
    }
    setReplyToId(null);
    setReplyText('');
  };

  const handleStartEditReply = (c, r) => {
    setEditingReplyKey(`${c.id}_${r.id}`);
    setEditReplyText(r.text);
    setConfirmDeleteReplyKey(null);
  };

  const handleSaveEditReply = (commentId, replyId) => {
    if (!editReplyText.trim()) return;
    if (onEditReply) {
      onEditReply(commentId, replyId, editReplyText.trim());
    } else {
      const parent = comments.find(c => c.id === commentId);
      if (parent && parent.replies) {
        const reply = parent.replies.find(r => r.id === replyId);
        if (reply) {
          reply.text = editReplyText.trim();
          reply.isEdited = true;
        }
      }
    }
    setEditingReplyKey(null);
    setEditReplyText('');
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (onDeleteReply) {
      onDeleteReply(commentId, replyId);
    } else {
      const parent = comments.find(c => c.id === commentId);
      if (parent && parent.replies) {
        parent.replies = parent.replies.filter(r => r.id !== replyId);
      }
    }
    setConfirmDeleteReplyKey(null);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />
      <aside className={`comment-drawer theme-${readerTheme} fixed inset-y-0 right-0 w-full sm:w-96 z-50 shadow-2xl border-l flex flex-col transition-transform animate-slide-left ${
        readerTheme === 'dark'
          ? 'bg-slate-900 text-slate-100 border-slate-800'
          : readerTheme === 'sepia'
          ? 'bg-[#faf5eb] text-[#2b1d0c] border-[#ebdcb9]'
          : 'bg-white text-slate-900 border-slate-200'
      }`}>
      {/* Drawer Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        readerTheme === 'sepia'
          ? 'border-[#ebdcb9] bg-[#f4ecd8]/60'
          : readerTheme === 'dark'
          ? 'border-slate-800 bg-slate-900'
          : 'border-slate-100 bg-slate-50/80'
      }`}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-500" />
          <h3 className="font-extrabold text-sm text-current">
            Inline Comments ({comments.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={commentSort}
            onChange={(e) => setCommentSort(e.target.value)}
            style={{
              color: readerTheme === 'sepia' ? '#2b1d0c' : readerTheme === 'dark' ? '#f8fafc' : '#0f172a',
              backgroundColor: readerTheme === 'sepia' ? '#edd9af' : readerTheme === 'dark' ? '#1e293b' : '#f1f5f9'
            }}
            className={`text-xs font-black px-3 py-1.5 rounded-xl outline-none cursor-pointer border shadow-xs transition-colors ${
              readerTheme === 'dark'
                ? 'border-slate-700 hover:border-slate-600'
                : readerTheme === 'sepia'
                ? 'border-[#cfbc99] hover:border-[#bfa780]'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <option value="newest" style={{ color: '#2b1d0c', backgroundColor: '#faf5eb' }}>Newest</option>
            <option value="likes" style={{ color: '#2b1d0c', backgroundColor: '#faf5eb' }}>Most Liked</option>
          </select>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              readerTheme === 'sepia'
                ? 'text-[#7a5c3d] hover:text-[#2b1d0c] hover:bg-black/5'
                : readerTheme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Close comment drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Highlighted Paragraph Quotation */}
      <div className={`p-3 text-xs sm:text-sm italic border-b line-clamp-3 ${
        readerTheme === 'dark'
          ? 'bg-slate-800/60 text-slate-200 border-slate-800'
          : readerTheme === 'sepia'
          ? 'bg-[#f4ecd8] text-[#3d2a14] border-[#ebdcb9]'
          : 'bg-slate-50 text-slate-700 border-slate-200'
      }`}>
        "{paragraph.text}"
      </div>

      {/* Comments List Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {sortedComments.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-xs ${
              readerTheme === 'sepia'
                ? 'bg-[#edd9af]/80 text-[#7a5833]'
                : readerTheme === 'dark'
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className={`font-black text-sm ${
                readerTheme === 'sepia' ? 'text-[#3d2a14]' : readerTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'
              }`}>
                No comments on this paragraph yet.
              </p>
              <p className={`text-xs ${
                readerTheme === 'sepia' ? 'text-[#7a5f42]' : readerTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Be the first reader to react to this line!
              </p>
            </div>
          </div>
        ) : (
          sortedComments.map(c => {
            const isOwner = isCommentOwner(c);
            const canMod = canModerateComment(c);
            const isEditing = editingCommentId === c.id;
            const isConfirmingDelete = confirmDeleteId === c.id;

            return (
              <div key={c.id} className={`space-y-2 p-3.5 rounded-2xl border transition-all ${
                readerTheme === 'dark'
                  ? 'bg-slate-800/40 border-slate-800 text-slate-100'
                  : readerTheme === 'sepia'
                  ? 'bg-[#f4ecd8]/90 border-[#e2d5bd] text-[#2b1d0c]'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              } ${isOwner ? 'ring-1 ring-brand-500/30' : ''}`}>
                
                {/* Comment Author Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={c.avatar} alt={c.author} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 shrink-0" />
                    <span className="font-extrabold text-xs sm:text-sm text-current truncate">{c.author}</span>
                    {isOwner && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 font-extrabold shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.isEdited && (
                      <span className="text-[10px] opacity-50 italic">(edited)</span>
                    )}
                    <span className="text-[11px] opacity-60 font-medium">{c.time}</span>
                  </div>
                </div>

                {/* Comment Body / Inline Edit Mode */}
                {isEditing ? (
                  <div className="pl-8 pt-1 space-y-2">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      rows={3}
                      style={{
                        color: readerTheme === 'sepia' ? '#2b1d0c' : readerTheme === 'dark' ? '#f8fafc' : '#0f172a',
                        backgroundColor: readerTheme === 'sepia' ? '#ffffff' : readerTheme === 'dark' ? '#1e293b' : '#ffffff'
                      }}
                      className={`w-full p-2.5 rounded-xl border text-xs outline-none resize-none focus:ring-2 focus:ring-brand-500/30 shadow-xs ${
                        readerTheme === 'dark'
                          ? 'border-slate-700'
                          : readerTheme === 'sepia'
                          ? 'border-[#cfbc99]'
                          : 'border-slate-300'
                      }`}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditCommentText('');
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!editCommentText.trim()}
                        onClick={() => handleSaveEditComment(c.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : isConfirmingDelete ? (
                  <div className="pl-8 pt-1">
                    <div className="flex items-center justify-between gap-2 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-rose-600 dark:text-rose-400">
                      <span className="text-xs font-bold">Delete this review?</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm pl-8 leading-relaxed opacity-95 whitespace-pre-wrap break-words">
                    {c.text}
                  </p>
                )}

                {/* Reaction and Action bar */}
                {!isEditing && !isConfirmingDelete && (
                  <div className="pl-8 flex items-center justify-between pt-1 text-xs opacity-80 font-semibold flex-wrap gap-2">
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

                    {/* Owner / Moderator Actions: Edit & Delete */}
                    <div className="flex items-center gap-2.5">
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleStartEditComment(c)}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
                          title="Edit your review"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      )}
                      {canMod && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(c.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Nested Replies Stream */}
                {c.replies && c.replies.length > 0 && (
                  <div className="pl-8 pt-2 space-y-2.5 border-l-2 border-black/10 dark:border-white/10 ml-3">
                    {c.replies.map(r => {
                      const isMyReply = isCommentOwner(r);
                      const canModReply = canModerateComment(r);
                      const isEditingReply = editingReplyKey === `${c.id}_${r.id}`;
                      const isConfirmingDeleteReply = confirmDeleteReplyKey === `${c.id}_${r.id}`;

                      return (
                        <div key={r.id} className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <img src={r.avatar} alt={r.author} className="w-5 h-5 rounded-full object-cover shrink-0" />
                              <span className="font-bold text-xs text-current truncate">{r.author}</span>
                              {isMyReply && (
                                <span className="text-[9px] px-1 py-0.2 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 font-extrabold shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {r.isEdited && (
                                <span className="text-[9px] opacity-50 italic">(edited)</span>
                              )}
                              <span className="text-[10px] opacity-60">{r.time}</span>
                            </div>
                          </div>

                          {isEditingReply ? (
                            <div className="pl-6 space-y-2">
                              <input
                                type="text"
                                value={editReplyText}
                                onChange={(e) => setEditReplyText(e.target.value)}
                                style={{
                                  color: readerTheme === 'sepia' ? '#2b1d0c' : readerTheme === 'dark' ? '#f8fafc' : '#0f172a',
                                  backgroundColor: readerTheme === 'sepia' ? '#ffffff' : readerTheme === 'dark' ? '#1e293b' : '#ffffff'
                                }}
                                className={`w-full p-2 rounded-lg border text-xs outline-none ${
                                  readerTheme === 'dark'
                                    ? 'border-slate-700'
                                    : readerTheme === 'sepia'
                                    ? 'border-[#cfbc99]'
                                    : 'border-slate-300'
                                }`}
                                autoFocus
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingReplyKey(null);
                                    setEditReplyText('');
                                  }}
                                  className="px-2 py-0.5 rounded text-[11px] font-medium opacity-70 hover:opacity-100 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={!editReplyText.trim()}
                                  onClick={() => handleSaveEditReply(c.id, r.id)}
                                  className="px-2.5 py-0.5 rounded bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : isConfirmingDeleteReply ? (
                            <div className="pl-6 flex items-center justify-between gap-2 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg text-rose-600 dark:text-rose-400">
                              <span className="text-[11px] font-bold">Delete reply?</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReply(c.id, r.id)}
                                  className="px-2 py-0.5 rounded bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteReplyKey(null)}
                                  className="px-2 py-0.5 rounded text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pl-6">
                              <p className="text-xs leading-relaxed opacity-90 break-words">{r.text}</p>
                              <div className="flex items-center gap-3 pt-1 text-[11px] opacity-75">
                                {isMyReply && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditReply(c, r)}
                                    className="hover:text-brand-500 transition-colors cursor-pointer flex items-center gap-0.5 font-semibold"
                                  >
                                    <Pencil className="w-2.5 h-2.5" /> Edit
                                  </button>
                                )}
                                {canModReply && (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteReplyKey(`${c.id}_${r.id}`)}
                                    className="hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-0.5 font-semibold"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" /> Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                      style={{
                        color: readerTheme === 'sepia' ? '#2b1d0c' : readerTheme === 'dark' ? '#f8fafc' : '#0f172a',
                        backgroundColor: readerTheme === 'sepia' ? '#ffffff' : readerTheme === 'dark' ? '#1e293b' : '#ffffff'
                      }}
                      className={`flex-1 p-2 rounded-lg border text-xs outline-none ${
                        readerTheme === 'dark'
                          ? 'border-slate-700 placeholder:text-slate-500'
                          : readerTheme === 'sepia'
                          ? 'border-[#cfbc99] placeholder:text-[#8a7258]'
                          : 'border-slate-300 placeholder:text-slate-400'
                      }`}
                      onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(c.id)}
                    />
                    <button 
                      onClick={() => handleReplySubmit(c.id)}
                      className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Post Comment Input Bar */}
      <div className={`p-3.5 sm:p-4 border-t shadow-lg ${
        readerTheme === 'sepia'
          ? 'bg-[#f4ecd8] border-[#ebdcb9]'
          : readerTheme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-slate-100/90 border-slate-200'
      }`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          <input 
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={user ? "React or review this line..." : "Sign in to react..."}
            style={{
              color: readerTheme === 'sepia' ? '#2b1d0c' : readerTheme === 'dark' ? '#f8fafc' : '#0f172a',
              backgroundColor: readerTheme === 'sepia' ? '#ffffff' : readerTheme === 'dark' ? '#1e293b' : '#ffffff'
            }}
            className={`flex-1 py-3 px-4 rounded-full border text-xs sm:text-sm font-medium outline-none shadow-sm transition-all focus:ring-2 focus:ring-brand-500/30 ${
              readerTheme === 'dark'
                ? 'border-slate-700 focus:border-brand-500 placeholder:text-slate-500'
                : readerTheme === 'sepia'
                ? 'border-[#cfbc99] focus:border-brand-600 placeholder:text-[#8a7258]'
                : 'border-slate-300 focus:border-brand-500 placeholder:text-slate-400'
            }`}
          />
          <button 
            type="submit"
            disabled={!commentInput.trim()}
            className="p-3 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white shadow-md shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Send Reaction"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
    </>
  );
}
