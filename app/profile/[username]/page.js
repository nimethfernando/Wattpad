'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { 
  User, 
  BookOpen, 
  Heart, 
  Eye, 
  MessageSquare, 
  Award, 
  BookMarked, 
  Calendar, 
  UserCheck, 
  UserPlus, 
  Activity, 
  Share2,
  Send,
  Trophy
} from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const { username } = params;
  const { 
    stories, 
    followingAuthors, 
    followAuthor, 
    readingLists, 
    user, 
    userConversations,
    postConversationMessage,
    openAuthModal,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'conversations' | 'lists' | 'activity'
  const [msgInput, setMsgInput] = useState('');

  const isSelf = user?.username?.toLowerCase() === username?.toLowerCase();
  const isFollowing = followingAuthors.includes(username);

  // Author stories
  const userStories = stories.filter(s => s.authorUsername?.toLowerCase() === username?.toLowerCase() || s.author?.toLowerCase().includes(username?.toLowerCase()));

  // Conversations on this profile
  const profileKey = (username || "elenavance").toLowerCase();
  const conversationsList = userConversations[profileKey] || [];

  const handlePostConversation = (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'Sign in to post a public message on this author\'s wall.');
      return;
    }
    if (!msgInput.trim()) return;
    postConversationMessage(profileKey, msgInput.trim());
    setMsgInput('');
  };

  const matchedStory = stories.find(s => s.authorUsername?.toLowerCase() === username?.toLowerCase());
  const matchedAuthorName = matchedStory ? matchedStory.author : username;
  const matchedAuthorAvatar = matchedStory?.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";

  const profileData = {
    name: isSelf ? user.name : matchedAuthorName,
    username: username || "reader",
    bio: isSelf ? (user.bio || "Passionate reader and storyteller on Avora Library.") : `Author and community storyteller on Avora Library. Check out serialized chapters and reading lists!`,
    avatar: isSelf ? user.avatar : matchedAuthorAvatar,
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    followers: userStories.length > 0 ? 1200 + userStories.length * 450 : 24,
    following: isSelf ? followingAuthors.length : 12,
    badges: isSelf ? (user.badges || ["Avora Member"]) : (userStories.length > 0 ? ["Author", "Storyteller"] : ["Member"]),
    activities: [
      ...(userStories.length > 0 ? [{ id: 1, action: `Published serialized chapter in '${userStories[0].title}'`, time: "Recently" }] : []),
      { id: 2, action: "Joined the Avora Library storytelling community", time: "Active" }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Banner & Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="h-44 sm:h-60 w-full relative">
            <img src={profileData.banner} alt="Profile banner" className="w-full h-full object-cover" />
          </div>

          <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <img 
                src={profileData.avatar} 
                alt={profileData.name} 
                className="w-28 sm:w-36 h-28 sm:h-36 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
              />
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{profileData.name}</h1>
                <p className="text-xs text-slate-400 font-semibold">@{profileData.username}</p>
                <div className="flex items-center gap-1.5 pt-1 justify-center sm:justify-start flex-wrap">
                  {profileData.badges.map((b, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isSelf && (
                <button 
                  onClick={() => followAuthor(profileData.username)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                    isFollowing 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200' 
                      : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? 'Following' : 'Follow Author'}
                </button>
              )}
              {isSelf && (
                <Link href="/write" className="px-5 py-2.5 rounded-full bg-brand-500 text-white text-xs font-bold hover:bg-brand-600">
                  + Write New Chapter
                </Link>
              )}
            </div>
          </div>

          {/* Bio & Stats Bar */}
          <div className="px-6 sm:px-10 py-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="max-w-xl text-slate-600 dark:text-slate-300 leading-relaxed text-center sm:text-left">
              {profileData.bio}
            </p>
            <div className="flex items-center gap-6 font-bold text-slate-700 dark:text-slate-300 shrink-0">
              <span>{profileData.followers.toLocaleString()} Followers</span>
              <span>{profileData.following} Following</span>
              <span>{userStories.length} Published Novels</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 flex-wrap">
          <button 
            onClick={() => setActiveTab('stories')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stories' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Serialized Works ({userStories.length})
          </button>
          <button 
            onClick={() => setActiveTab('conversations')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'conversations' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Conversations ({conversationsList.length})
          </button>
          <button 
            onClick={() => setActiveTab('lists')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lists' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <BookMarked className="w-4 h-4" /> Reading Lists ({readingLists.length})
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'activity' 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" /> Recent Activity
          </button>
        </div>

        {/* TAB 1: USER STORIES */}
        {activeTab === 'stories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userStories.map((story) => (
              <div key={story.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex gap-4 hover:shadow-lg transition-all group">
                <img src={story.cover} alt={story.title} className="w-24 aspect-[3/4] object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-brand-600 uppercase">{story.genre}</span>
                      {story.ranking && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                          #{story.ranking.rank} in {story.ranking.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mt-1 line-clamp-1 group-hover:text-brand-500 transition-colors">{story.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{story.description}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <span>{story.reads.toLocaleString()} reads</span>
                    <Link href={`/story/${story.slug}`} className="font-bold text-brand-500 hover:underline">
                      View Story →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: WATT-PAD STYLE CONVERSATIONS MESSAGE BOARD */}
        {activeTab === 'conversations' && (
          <div className="space-y-6 max-w-3xl">
            {/* Post Message Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-sm mb-3">Leave a public message on {profileData.name}'s board</h3>
              <form onSubmit={handlePostConversation} className="space-y-3">
                <textarea
                  rows={3}
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder={`Write something to @${profileData.username}...`}
                  required
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Post to Board
                  </button>
                </div>
              </form>
            </div>

            {/* Messages Feed */}
            <div className="space-y-4">
              {conversationsList.map((msg) => (
                <div 
                  key={msg.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all ${
                    msg.isAuthorReply 
                      ? 'border-brand-500/40 bg-brand-50/20 dark:bg-brand-950/20 ml-4 sm:ml-8' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <img src={msg.avatar} alt={msg.author} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{msg.author}</span>
                        {msg.isAuthorReply && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-brand-500 text-white">
                            AUTHOR
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-11">
                    {msg.text}
                  </p>
                </div>
              ))}
              {conversationsList.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No public messages yet. Be the first to start a conversation!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: READING LISTS */}
        {activeTab === 'lists' && (
          <div className="grid sm:grid-cols-2 gap-6">
            {readingLists.map((list) => (
              <div key={list.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-brand-600">Reading Collection</span>
                <h4 className="font-black text-lg">{list.title}</h4>
                <p className="text-xs text-slate-500">{list.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: RECENT ACTIVITY (Scope 3) */}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {profileData.activities.map(act => (
              <div key={act.id} className="py-4 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{act.action}</span>
                <span className="text-[11px] text-slate-400">{act.time}</span>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
