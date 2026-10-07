import { NextResponse } from 'next/server';
import { saveUserLibraryDataToDb, getUserLibraryDataFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User identifier is required' }, { status: 400 });
    }

    const data = await getUserLibraryDataFromDb(user);
    return NextResponse.json({
      success: true,
      data: data || {
        library: [],
        readingProgress: {},
        wishlist: [],
        readingLists: [],
        readingStreak: null
      }
    });
  } catch (err) {
    console.error('Error fetching user library data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user, library, readingProgress, wishlist, readingLists, readingStreak } = body;
    if (!user) {
      return NextResponse.json({ success: false, error: 'User identifier is required' }, { status: 400 });
    }

    await saveUserLibraryDataToDb(user, {
      library: library ?? [],
      readingProgress: readingProgress ?? {},
      wishlist: wishlist ?? [],
      readingLists: readingLists ?? [],
      readingStreak: readingStreak ?? null
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving user library data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
