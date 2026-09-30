import { NextResponse } from 'next/server';
import { initialStories, initialGenres } from '@/lib/data';
import { filterStoriesForUser, filterGenresForUser } from '@/lib/agePolicy';
import { getServerUserContext } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, age, experienceMode } = await getServerUserContext();
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const contentType = searchParams.get('type'); // 'story' | 'picture_book'

    // Core Backend Rule: Filter stories based on user's DOB and age policy
    let accessibleStories = filterStoriesForUser(initialStories, user);

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
        s.title.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
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
