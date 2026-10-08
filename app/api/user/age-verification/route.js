import { NextResponse } from 'next/server';
import { calculateAgeFromDob, validateExperienceMode, EXPERIENCE_MODES } from '@/lib/agePolicy';
import { saveUserProfileToDb, getUserProfileFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User identifier is required' }, { status: 400 });
    }

    const profile = await getUserProfileFromDb(user);
    if (profile && profile.birthdate) {
      const calculatedAge = calculateAgeFromDob(profile.birthdate);
      const isUnder18 = calculatedAge !== null && calculatedAge < 18;
      const enforcedMode = (isUnder18 || profile.experienceMode === EXPERIENCE_MODES.KIDS) 
        ? EXPERIENCE_MODES.KIDS 
        : (profile.experienceMode || EXPERIENCE_MODES.MATURE);

      return NextResponse.json({
        success: true,
        verified: true,
        birthdate: profile.birthdate,
        age: calculatedAge,
        experienceMode: enforcedMode,
        isUnder18
      });
    }

    return NextResponse.json({
      success: true,
      verified: false
    });
  } catch (error) {
    console.error('Age verification GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { birthdate, experienceMode, userEmail, email, username } = body;

    if (!birthdate) {
      return NextResponse.json(
        { success: false, error: 'Date of Birth (birthdate) is required.' },
        { status: 400 }
      );
    }

    const calculatedAge = calculateAgeFromDob(birthdate);
    if (calculatedAge === null) {
      return NextResponse.json(
        { success: false, error: 'Invalid Date of Birth provided.' },
        { status: 400 }
      );
    }

    // COPPA Check (minimum 13 for independent account creation)
    const isUnder13 = calculatedAge < 13;

    // Validate and enforce experience mode
    const { allowed, enforcedMode } = validateExperienceMode(calculatedAge, experienceMode);

    const targetEmail = (userEmail || email || '').trim().toLowerCase();
    const targetUsername = (username || (targetEmail ? targetEmail.split('@')[0] : '')).trim().toLowerCase();

    // Persist to user profile database and persistent store
    if (targetEmail || targetUsername) {
      try {
        await saveUserProfileToDb({
          email: targetEmail,
          username: targetUsername,
          birthdate,
          age: calculatedAge,
          experienceMode: enforcedMode
        });
      } catch (dbErr) {
        console.warn('Could not persist profile in age verification POST:', dbErr.message);
      }
    }

    const response = NextResponse.json({
      success: true,
      age: calculatedAge,
      birthdate,
      experienceMode: enforcedMode,
      isUnder18: calculatedAge < 18,
      isUnder13,
      modeEnforced: !allowed,
      message: calculatedAge < 18 
        ? `Age verified (${calculatedAge} years old). Your account is configured for Kids & Family safe browsing.` 
        : `Age verified (${calculatedAge} years old). Full library access unlocked.`
    });

    // Set secure cookies for server-side verification in future API requests
    const cookieOptions = {
      path: '/',
      maxAge: 2592000, // 30 days
      sameSite: 'lax',
      httpOnly: false
    };

    response.cookies.set('avora_dob', birthdate, cookieOptions);
    response.cookies.set('avora_age', String(calculatedAge), cookieOptions);
    response.cookies.set('avora_experience_mode', enforcedMode, cookieOptions);

    return response;
  } catch (error) {
    console.error('Age verification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error processing age verification' },
      { status: 500 }
    );
  }
}
