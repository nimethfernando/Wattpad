import { NextResponse } from 'next/server';
import { initialStories } from '@/lib/data';
import { canUserAccessContent } from '@/lib/agePolicy';
import { getServerUserContext } from '@/lib/serverAuth';
import { getStoryBySlugFromDb, saveStoryToDb, deleteStoryFromDb, getDeletedStoriesFromDb } from '@/lib/db';

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

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
    }

    const deletedSet = new Set(getDeletedStoriesFromDb());
    if (deletedSet.has(String(slug))) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }

    // 1. Try DB first
    let story = await getStoryBySlugFromDb(slug).catch(() => null);

    // 2. Fall back to seed initialStories
    if (!story) {
      story = initialStories.find(s => s.slug === slug || String(s.id) === String(slug));
      if (story && (deletedSet.has(String(story.id)) || deletedSet.has(String(story.slug)))) {
        story = null;
      }
    }

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
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const { slug } = await resolveRouteParams(context);
    const body = await request.json();

    const updatedStory = {
      ...body,
      slug: slug || body.slug
    };

    const saved = await saveStoryToDb(updatedStory);

    return NextResponse.json({
      success: true,
      message: 'Story updated successfully',
      story: saved.story
    });
  } catch (error) {
    console.error('Error updating story API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { slug } = await resolveRouteParams(context);
    const { searchParams } = new URL(request.url);
    const extraId = searchParams.get('id');

    if (!slug && !extraId) {
      return NextResponse.json({ success: false, error: 'Slug or ID is required for deletion' }, { status: 400 });
    }

    const result = await deleteStoryFromDb(slug || extraId, extraId);

    return NextResponse.json({
      success: true,
      message: `Story "${slug || extraId}" deleted successfully`,
      deletedStories: result?.deletedStories || []
    });
  } catch (error) {
    console.error('Error deleting story API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
