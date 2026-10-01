/**
 * Dynamic Ranking Engine for Avora Library
 * 
 * Automatically calculates and assigns real-time leaderboard ranks based on reader engagement (reads).
 * - Global Rank: #1, #2, #3... across all stories based on total reads descending.
 * - Genre Rank: #1, #2, #3... within each genre/category based on reads descending.
 * - Re-evaluates ranks automatically whenever users read chapters.
 */

export function computeStoryRankings(stories) {
  if (!Array.isArray(stories) || stories.length === 0) return [];

  // 1. Sort globally by reads descending (secondary: votes descending, tertiary: id)
  const sortedGlobal = [...stories].sort((a, b) => {
    const readsA = Number(a.reads) || 0;
    const readsB = Number(b.reads) || 0;
    if (readsB !== readsA) return readsB - readsA;
    const votesA = Number(a.votes) || 0;
    const votesB = Number(b.votes) || 0;
    if (votesB !== votesA) return votesB - votesA;
    return (a.id || 0) - (b.id || 0);
  });

  // Assign global ranks
  const withGlobalRanks = sortedGlobal.map((story, index) => ({
    ...story,
    globalRank: index + 1
  }));

  // 2. Group stories by primary genre/tag for category rankings
  const genreGroups = {};
  withGlobalRanks.forEach(story => {
    const genreKey = (story.genre || story.genreSlug || 'Fiction').toLowerCase().trim();
    if (!genreGroups[genreKey]) {
      genreGroups[genreKey] = [];
    }
    genreGroups[genreKey].push(story);
  });

  // 3. For each genre group, sort by reads descending and assign rank
  const storyRankingsMap = new Map();

  Object.entries(genreGroups).forEach(([genreKey, groupStories]) => {
    const totalInGenre = groupStories.length;
    // groupStories is already in descending order from the global sort
    groupStories.forEach((story, idx) => {
      const genreRank = idx + 1;
      const tagDisplay = story.genre || (genreKey.charAt(0).toUpperCase() + genreKey.slice(1));
      
      storyRankingsMap.set(story.id, {
        rank: genreRank,
        tag: tagDisplay,
        totalInTag: `${totalInGenre} ${totalInGenre === 1 ? 'story' : 'stories'}`,
        globalRank: story.globalRank,
        totalGlobal: withGlobalRanks.length
      });
    });
  });

  // 4. Return stories preserving original order or global rank with dynamic ranking object attached
  return withGlobalRanks.map(story => {
    const dynamicRanking = storyRankingsMap.get(story.id) || {
      rank: 1,
      tag: story.genre || 'Fiction',
      totalInTag: '1 story',
      globalRank: story.globalRank || 1,
      totalGlobal: withGlobalRanks.length
    };

    return {
      ...story,
      ranking: dynamicRanking
    };
  });
}

/**
 * Sorts any list of stories strictly by reads descending.
 */
export function sortStoriesByReads(stories) {
  if (!Array.isArray(stories)) return [];
  return [...stories].sort((a, b) => {
    const readsA = Number(a.reads) || 0;
    const readsB = Number(b.reads) || 0;
    if (readsB !== readsA) return readsB - readsA;
    const votesA = Number(a.votes) || 0;
    const votesB = Number(b.votes) || 0;
    return votesB - votesA;
  });
}

/**
 * Returns the top N most read stories.
 */
export function getTopReadingStories(stories, limit = 5) {
  const ranked = computeStoryRankings(stories);
  return ranked.slice(0, limit);
}

/**
 * Helper to get styling and medals for rank badges.
 */
export function getRankBadgeInfo(rank) {
  if (rank === 1) {
    return {
      medal: "🥇",
      label: "#1 Top Story",
      bgClass: "bg-amber-400/15 border-amber-400/40 text-amber-600 dark:text-amber-400 shadow-sm",
      pillClass: "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black",
      isTop3: true
    };
  }
  if (rank === 2) {
    return {
      medal: "🥈",
      label: "#2 Trending",
      bgClass: "bg-slate-300/20 border-slate-400/40 text-slate-700 dark:text-slate-300",
      pillClass: "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-black",
      isTop3: true
    };
  }
  if (rank === 3) {
    return {
      medal: "🥉",
      label: "#3 Popular",
      bgClass: "bg-amber-700/15 border-amber-700/30 text-amber-800 dark:text-amber-300",
      pillClass: "bg-amber-700 text-white font-black",
      isTop3: true
    };
  }
  return {
    medal: `#${rank}`,
    label: `#${rank}`,
    bgClass: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400",
    pillClass: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold",
    isTop3: false
  };
}
