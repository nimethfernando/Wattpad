import { NextResponse } from 'next/server';
import { initialStories } from '@/lib/data';
import { canUserAccessContent } from '@/lib/agePolicy';
import { getServerUserContext } from '@/lib/serverAuth';
import { computeStoryRankings } from '@/lib/rankingEngine';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { user, age } = await getServerUserContext();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    const rankedStories = computeStoryRankings(initialStories);
    const story = rankedStories.find(s => s.slug === slug);
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
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const { chapterId, count = 1 } = body;

    const story = initialStories.find(s => s.slug === slug);
    if (!story) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }

    const readIncrement = Math.max(1, Math.min(1000, Number(count) || 1));
    story.reads = (story.reads || 0) + readIncrement;

    if (chapterId && Array.isArray(story.chapters)) {
      const ch = story.chapters.find(c => String(c.id) === String(chapterId));
      if (ch) {
        ch.reads = (ch.reads || 0) + readIncrement;
      }
    }

    const rankedStories = computeStoryRankings(initialStories);
    const updatedStory = rankedStories.find(s => s.slug === slug);

    return NextResponse.json({
      success: true,
      message: 'Read recorded and rankings updated',
      reads: updatedStory.reads,
      ranking: updatedStory.ranking,
      globalRank: updatedStory.globalRank
    });
  } catch (error) {
    console.error('Error recording read:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

