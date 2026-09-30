import { NextResponse } from 'next/server';
import { initialStories } from '@/lib/data';
import { canUserAccessContent } from '@/lib/agePolicy';
import { getServerUserContext } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { user, age } = await getServerUserContext();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    const story = initialStories.find(s => s.slug === slug);
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
        chaptersCount: story.chapters?.length || 0
      },
      chapter
    });
  } catch (error) {
    console.error('Error fetching reader API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
