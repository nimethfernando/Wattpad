'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReportModal from '@/components/ReportModal';
import { useApp } from '@/context/AppContext';
import { 
  Type, 
  Sun, 
  Moon, 
  Heart, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  X, 
  Send, 
  BookOpen, 
  ListFilter, 
  CheckCircle, 
  Sparkles, 
  ShieldAlert, 
  Flag, 
  ThumbsUp, 
  CornerDownRight,
  BookMarked,
  Check,
  Plus
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function ReaderPage() {
  const params = useParams();
  const { slug } = params;
  const router = useRouter();
  const { 
    stories, 
    user, 
    voteChapter, 
    reactChapterEmoji, 
    addParagraphComment, 
    saveReadingProgress, 
    library,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    openAuthModal,
    openPaymentModal,
    featureFlags,
    t 
  } = useApp();

  const story = stories.find(s => s.slug === slug) || stories[0];
  const inLib = isInLibrary(story.id);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const chapter = story.chapters[currentChapterIndex] || story.chapters[0];

  // Reader Customization State
  const [readerTheme, setReaderTheme] = useState('sepia'); // 'light' | 'dark' | 'sepia'
  const [fontSize, setFontSize] = useState(18); // px
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans'
  const [lineSpacing, setLineSpacing] = useState('leading-relaxed'); // 'leading-normal' | 'leading-relaxed' | 'leading-loose'
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);

  // Inline Paragraph Comments & Emojis State
  const [activeParagraph, setActiveParagraph] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentSort, setCommentSort] = useState('newest'); // 'newest' | 'likes'
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Sync reading progress
  useEffect(() => {
    saveReadingProgress(story.id, chapter.id, 0);
  }, [story.id, chapter.id]);

  const handleVote = () => {
    if (!user) {
      openAuthModal('login', `Sign in to vote on Chapter ${chapter.number} and support ${story.author}!`, () => {
        voteChapter(story.id, chapter.id);
        setHasVoted(true);
      });
      return;
    }
    if (!hasVoted) {
      voteChapter(story.id, chapter.id);
      setHasVoted(true);
    }
  };

  const handleEmojiReact = (emoji) => {
    if (!user) {
      openAuthModal('login', `Sign in to react with ${emoji} on Chapter ${chapter.number}!`, () => {
        reactChapterEmoji(story.id, chapter.id, emoji);
      });
      return;
    }
    reactChapterEmoji(story.id, chapter.id, emoji);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'Sign in to post inline reactions and join the community discussion.');
      return;
    }
    if (commentInput.trim() === '' || !activeParagraph) return;
    addParagraphComment(story.id, chapter.id, activeParagraph.id, commentInput.trim());
    
    // Update local active paragraph
    setActiveParagraph(prev => ({
      ...prev,
      comments: [
        {
          id: Date.now(),
          author: user?.name || "Reader",
          avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
          time: "Just now",
          text: commentInput.trim(),
          likes: 0,
          emojis: { "❤️": 1 }
        },
        ...prev.comments
      ]
    }));
    setCommentInput('');
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;
    setActiveParagraph(prev => ({
      ...prev,
      comments: prev.comments.map(c => {
        if (c.id === commentId) {
          const replies = c.replies || [];
          return {
            ...c,
            replies: [
              ...replies,
              {
                id: Date.now(),
                author: user?.name || "Reader",
                time: "Just now",
                text: replyText.trim()
              }
            ]
          };
        }
        return c;
      })
    }));
    setReplyToId(null);
    setReplyText('');
  };

  // Maturity Age Gate Check
  if (story.maturity === 'mature' && !ageConfirmed && !user?.isAgeVerified) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black">Mature Content Warning (18+)</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            This serialized novel has been designated for mature readers by the author and contains intense themes. Please confirm your age to proceed.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button 
              onClick={() => setAgeConfirmed(true)}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-xs"
            >
              I am 18 or older • Continue Reading
            </button>
            <Link 
              href="/browse" 
              className="w-full py-3 rounded-xl border border-slate-700 font-bold text-xs text-slate-400 hover:bg-slate-800"
            >
              Return to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sorted active comments
  const sortedComments = activeParagraph?.comments ? [...activeParagraph.comments].sort((a, b) => {
    if (commentSort === 'likes') return (b.likes || 0) - (a.likes || 0);
    return b.id - a.id;
  }) : [];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      readerTheme === 'dark' ? 'bg-slate-950 text-slate-100' :
      readerTheme === 'sepia' ? 'sepia-reader' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. TOP READER NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-14 flex items-center justify-between border-black/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Link 
            href={`/story/${story.slug}`} 
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:opacity-80 transition-opacity"
          >
            ← {story.title}
          </Link>
          <button 
            onClick={() => setShowChapterDrawer(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <ListFilter className="w-3.5 h-3.5" /> Ch. {chapter.number} / {story.chapters.length}
          </button>

          {/* Add to Library Toggle in Reader Navbar (Wattpad UX) */}
          <button
            onClick={() => inLib ? removeFromLibrary(story.id) : addToLibrary(story.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              inLib
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-700 dark:text-slate-200'
            }`}
            title="Save to Library"
          >
            {inLib ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <BookMarked className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{inLib ? 'In Library' : 'Add to Library'}</span>
          </button>
        </div>

        {/* Reader Customization Settings Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Font Size */}
          <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2 py-1 text-xs font-bold hover:text-brand-500"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] font-mono px-1">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="px-2 py-1 text-xs font-bold hover:text-brand-500"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Theme Mode Buttons */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setReaderTheme('light')} 
              className={`p-1.5 rounded-md text-xs ${readerTheme === 'light' ? 'bg-white shadow text-slate-900 font-bold' : ''}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setReaderTheme('sepia')} 
              className={`p-1.5 rounded-md text-xs ${readerTheme === 'sepia' ? 'bg-[#f4ecd8] shadow text-amber-900 font-bold' : ''}`}
              title="Sepia Paper Theme"
            >
              ☕
            </button>
            <button 
              onClick={() => setReaderTheme('dark')} 
              className={`p-1.5 rounded-md text-xs ${readerTheme === 'dark' ? 'bg-slate-800 shadow text-amber-400 font-bold' : ''}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Family Toggle */}
          <button 
            onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10"
            title="Toggle Font Family"
          >
            {fontFamily === 'serif' ? 'Serif' : 'Sans'}
          </button>

          {/* Report Button */}
          <button 
            onClick={() => setReportModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
            title="Report Chapter"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. MAIN CHAPTER READING CANVAS */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10 text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
            Chapter {chapter.number}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">{chapter.title}</h1>
          <p className="text-xs opacity-70">
            By {story.author} • Published {chapter.publishedAt}
          </p>
        </header>

        {/* PARAGRAPH-LEVEL INLINE COMMENTS FEATURE */}
        <div 
          className={`space-y-6 ${lineSpacing} ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter.paragraphs.map((p) => (
            <div 
              key={p.id}
              onClick={() => setActiveParagraph(p)}
              className="relative group p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <p className="leading-relaxed">{p.text}</p>

              {/* Inline Reaction Badge */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveParagraph(p);
                }}
                className="absolute right-[-15px] sm:right-[-32px] top-2 opacity-60 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-md transition-all hover:scale-105"
                title="View & Post Paragraph Comments"
              >
                <MessageSquare className="w-3 h-3" />
                <span>{p.comments.length}</span>
              </button>
            </div>
          ))}
        </div>

        {/* CHAPTER EMOJI REACTIONS (Scope 3) */}
        <div className="mt-14 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60">Chapter Emoji Reactions</span>
          <div className="flex items-center gap-3">
            {['🔥', '❤️', '😭', '👏', '😱'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiReact(emoji)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:scale-110 transition-transform text-sm font-bold"
              >
                <span>{emoji}</span>
                <span className="text-xs">{chapter.emojis?.[emoji] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CHAPTER VOTE & TIP AUTHOR FOOTER */}
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button 
              onClick={handleVote}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-xl ${
                hasVoted 
                  ? 'bg-rose-500 text-white shadow-rose-500/30' 
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/30 hover:scale-[1.02]'
              }`}
            >
              <Heart className={`w-5 h-5 ${hasVoted ? 'fill-white' : ''}`} />
              <span>{hasVoted ? t.voted : t.vote} ({chapter.votes + (hasVoted ? 1 : 0)})</span>
            </button>

            {featureFlags?.enablePaidFeatures && (
              <button 
                onClick={() => {
                  if (!user) {
                    openAuthModal('login', `Sign in to tip ${story.author} and support their serialized story!`);
                    return;
                  }
                  openPaymentModal({
                    type: 'tip',
                    authorName: story.author,
                    storyTitle: story.title
                  });
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                title="Send a tip to the author"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Tip {story.author}</span>
              </button>
            )}
          </div>

          {/* Chapter Next / Previous Navigation */}
          <div className="flex items-center justify-between w-full pt-4">
            <button 
              onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
              disabled={currentChapterIndex === 0}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold opacity-60 hover:opacity-100 disabled:opacity-20"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </button>
            <button 
              onClick={() => setCurrentChapterIndex(Math.min(story.chapters.length - 1, currentChapterIndex + 1))}
              disabled={currentChapterIndex === story.chapters.length - 1}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-500 disabled:opacity-20"
            >
              Next Chapter <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. PARAGRAPH INLINE COMMENTS SIDE DRAWER */}
      {activeParagraph && (
        <aside className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <h3 className="font-extrabold text-sm">{t.inlineComments} ({activeParagraph.comments.length})</h3>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={commentSort}
                onChange={(e) => setCommentSort(e.target.value)}
                className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-md outline-none"
              >
                <option value="newest">Newest</option>
                <option value="likes">Most Liked</option>
              </select>
              <button 
                onClick={() => setActiveParagraph(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Highlighted Paragraph Quotation */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 text-xs italic text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 line-clamp-3">
            "{activeParagraph.text}"
          </div>

          {/* Inline Comments Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {sortedComments.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p>No comments on this paragraph yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Be the first reader to react to this line!</p>
              </div>
            ) : (
              sortedComments.map(c => (
                <div key={c.id} className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={c.avatar} alt={c.author} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.author}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs pl-7 leading-relaxed">
                    {c.text}
                  </p>

                  {/* Comment Reaction & Reply Bar */}
                  <div className="pl-7 flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          c.likes = (c.likes || 0) + 1;
                          setActiveParagraph({ ...activeParagraph });
                        }}
                        className="flex items-center gap-1 hover:text-rose-500"
                      >
                        <Heart className="w-3 h-3" /> {c.likes || 0}
                      </button>
                      <button 
                        onClick={() => setReplyToId(replyToId === c.id ? null : c.id)}
                        className="hover:text-brand-500 font-semibold"
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="pl-7 pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 mt-2">
                      {c.replies.map(r => (
                        <div key={r.id} className="bg-white dark:bg-slate-800 p-2 rounded-lg text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-200">@{r.author}: </span>
                          <span className="text-slate-600 dark:text-slate-300">{r.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {replyToId === c.id && (
                    <div className="pl-7 pt-2 flex gap-1.5">
                      <input 
                        type="text" 
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border outline-none"
                      />
                      <button 
                        onClick={() => handleAddReply(c.id)}
                        className="px-2.5 py-1 bg-brand-500 text-white rounded-lg font-bold text-[10px]"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Comment Input Box */}
          <form onSubmit={handleAddComment} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input 
              type="text" 
              placeholder={t.addComment}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button 
              type="submit"
              disabled={commentInput.trim() === ''}
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}

      {/* 4. CHAPTERS DRAWER */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start">
          <div className="w-80 bg-white dark:bg-slate-900 h-full p-6 shadow-2xl overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm">All Chapters ({story.chapters.length})</h3>
              <button onClick={() => setShowChapterDrawer(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              {story.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => { setCurrentChapterIndex(idx); setShowChapterDrawer(false); }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    idx === currentChapterIndex 
                      ? 'bg-brand-500 text-white' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Ch. {ch.number}: {ch.title}</span>
                  {idx === currentChapterIndex && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="chapter"
        reportedUser={story.authorUsername}
        storyTitle={`${story.title} - Chapter ${chapter.number}`}
      />

      {/* Global Auth Modal for Facebook & Google Logins */}
      <AuthModal />

    </div>
  );
}
