import { NextResponse } from 'next/server';
import { initialStories, initialGenres } from '@/lib/data';
import { filterStoriesForUser, filterGenresForUser } from '@/lib/agePolicy';
import { getServerUserContext } from '@/lib/serverAuth';
import { computeStoryRankings } from '@/lib/rankingEngine';
import { getStoriesFromDb, saveStoryToDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, age, experienceMode } = await getServerUserContext();
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const contentType = searchParams.get('type'); // 'story' | 'picture_book'

    // Fetch persistent database stories
    const dbStories = await getStoriesFromDb().catch(() => []);

    // Merge persistent database stories with seed dataset
    const storiesMap = new Map();
    // 1. Load seed stories
    initialStories.forEach(s => storiesMap.set(String(s.slug || s.id), s));
    // 2. Overlay & add DB stories (giving DB priority for updated reads/chapters)
    dbStories.forEach(s => storiesMap.set(String(s.slug || s.id), { ...storiesMap.get(String(s.slug || s.id)), ...s }));

    const allStories = Array.from(storiesMap.values());

    // Core Backend Rule: Filter stories based on user's DOB and age policy
    let accessibleStories = filterStoriesForUser(allStories, user);

    if (genre && genre !== 'all') {
      accessibleStories = accessibleStories.filter(s => 
        s.genreSlug?.toLowerCase() === genre.toLowerCase() || 
        s.genre?.toLowerCase() === genre.toLowerCase()
      );
    }

    if (contentType) {
      accessibleStories = accessibleStories.filter(s => s.contentType === contentType);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      accessibleStories = accessibleStories.filter(s => 
        s.title?.toLowerCase().includes(q) ||
        s.author?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    const sort = searchParams.get('sort'); // 'most_read' | 'trending' | 'newest'

    // Core Dynamic Ranking Engine: Automatically compute live rankings based on reader counts
    accessibleStories = computeStoryRankings(accessibleStories);

    if (sort === 'most_read') {
      accessibleStories.sort((a, b) => (b.reads || 0) - (a.reads || 0));
    } else if (sort === 'trending') {
      accessibleStories.sort((a, b) => ((b.reads || 0) + (b.votes || 0) * 5) - ((a.reads || 0) + (a.votes || 0) * 5));
    } else if (sort === 'newest') {
      accessibleStories.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    }

    const accessibleGenres = filterGenresForUser(initialGenres, user);

    return NextResponse.json({
      success: true,
      userContext: {
        authenticated: Boolean(user),
        age,
        experienceMode,
        isUnder18: age !== null && age < 18
      },
      count: accessibleStories.length,
      stories: accessibleStories,
      genres: accessibleGenres
    });
  } catch (error) {
    console.error('Error fetching stories API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching stories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Story title is required.' },
        { status: 400 }
      );
    }

    const saved = await saveStoryToDb(body);

    return NextResponse.json({
      success: true,
      message: 'Story published and persisted to database.',
      story: saved.story
    });
  } catch (error) {
    console.error('Error creating story API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error saving story.' },
      { status: 500 }
    );
  }
}
