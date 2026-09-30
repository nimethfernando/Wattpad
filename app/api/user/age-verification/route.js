import { NextResponse } from 'next/server';
import { calculateAgeFromDob, validateExperienceMode, EXPERIENCE_MODES } from '@/lib/agePolicy';

export async function POST(request) {
  try {
    const body = await request.json();
    const { birthdate, experienceMode } = body;

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
