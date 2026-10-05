import { NextResponse } from 'next/server';
import { initialStories } from '@/lib/data';
import { canUserAccessContent } from '@/lib/agePolicy';
import { getServerUserContext } from '@/lib/serverAuth';
import { computeStoryRankings } from '@/lib/rankingEngine';
import { getStoryBySlugFromDb, incrementStoryReadsInDb, getStoriesFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function resolveRouteParams(context) {
  if (!context) return {};
  if (context.params && typeof context.params.then === 'function') {
    return await context.params;
  }
  return context.params || {};
}

export async function GET(request, context) {
  try {
    const { slug } = await resolveRouteParams(context);
    const { user } = await getServerUserContext();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    // 1. Fetch DB stories and merge with initialStories
    const dbStories = await getStoriesFromDb().catch(() => []);
    const storiesMap = new Map();
    initialStories.forEach(s => storiesMap.set(String(s.slug || s.id), s));
    dbStories.forEach(s => storiesMap.set(String(s.slug || s.id), { ...storiesMap.get(String(s.slug || s.id)), ...s }));

    const rankedStories = computeStoryRankings(Array.from(storiesMap.values()));
    const story = rankedStories.find(s => s.slug === slug || String(s.id) === String(slug));

    if (!story) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }

    // Backend Age Enforcement Check
    const accessCheck = canUserAccessContent(user, story);
    if (!accessCheck.canAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: Age-Restricted Content',
          code: accessCheck.reason || 'AGE_RESTRICTED',
          requiredAge: accessCheck.requiredAge,
          userAge: accessCheck.userAge,
          message: accessCheck.message
        },
        { status: 403 }
      );
    }

    const chapter = chapterId 
      ? story.chapters?.find(c => String(c.id) === String(chapterId)) || story.chapters?.[0]
      : story.chapters?.[0];

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        slug: story.slug,
        author: story.author,
        ageRating: story.ageRating,
        contentType: story.contentType,
        chaptersCount: story.chapters?.length || 0,
        reads: story.reads,
        ranking: story.ranking,
        globalRank: story.globalRank
      },
      chapter
    });
  } catch (error) {
    console.error('Error fetching reader API:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { slug } = await resolveRouteParams(context);
    const body = await request.json().catch(() => ({}));
    const { chapterId, count = 1 } = body;

    const readIncrement = Math.max(1, Math.min(1000, Number(count) || 1));

    // Persist increment in database and persistent storage
    await incrementStoryReadsInDb(slug, chapterId, readIncrement);

    // Also update seed object in-memory if it exists there
    const seedStory = initialStories.find(s => s.slug === slug || String(s.id) === String(slug));
    if (seedStory) {
      seedStory.reads = (seedStory.reads || 0) + readIncrement;
      if (chapterId && Array.isArray(seedStory.chapters)) {
        const ch = seedStory.chapters.find(c => String(c.id) === String(chapterId));
        if (ch) ch.reads = (ch.reads || 0) + readIncrement;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Read count persisted to database and live ranking updated.',
      reads: (seedStory?.reads || 0) + readIncrement
    });
  } catch (error) {
    console.error('Error recording read:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
