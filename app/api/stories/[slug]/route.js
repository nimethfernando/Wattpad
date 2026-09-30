import { NextResponse } from 'next/server';
import { initialStories } from '@/lib/data';
import { canUserAccessContent } from '@/lib/agePolicy';
import { getServerUserContext } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { user, age, experienceMode } = await getServerUserContext();

    const story = initialStories.find(s => s.slug === slug);
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Core Platform-Level Rule: Backend Age Enforcement
    const accessCheck = canUserAccessContent(user, story);

    if (!accessCheck.canAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: Age-Restricted Content',
          code: accessCheck.reason || 'AGE_RESTRICTED',
          requiredAge: accessCheck.requiredAge,
          userAge: accessCheck.userAge,
          message: accessCheck.message,
          storyPreview: {
            title: story.title,
            author: story.author,
            ageRating: story.ageRating,
            genre: story.genre
          }
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Error fetching story detail API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
