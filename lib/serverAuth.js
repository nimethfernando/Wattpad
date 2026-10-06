import { cookies } from 'next/headers';
import { calculateAgeFromDob, canUserAccessContent, EXPERIENCE_MODES } from './agePolicy';

/**
 * Extracts the user's authentication and age context from server cookies and headers.
 * @returns {Promise<{ user: Object|null, age: number|null, experienceMode: string, isAgeVerified: boolean }>}
 */
export async function getServerUserContext() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('avora_session')?.value;
    const dobCookie = cookieStore.get('avora_dob')?.value;
    const ageCookie = cookieStore.get('avora_age')?.value;
    const modeCookie = cookieStore.get('avora_experience_mode')?.value;

    let calculatedAge = null;
    if (dobCookie) {
      calculatedAge = calculateAgeFromDob(dobCookie);
    } else if (ageCookie) {
      const parsed = parseInt(ageCookie, 10);
      calculatedAge = isNaN(parsed) ? null : parsed;
    }

    // Force kids mode for under 18
    const enforcedMode = (calculatedAge !== null && calculatedAge < 18) 
      ? EXPERIENCE_MODES.KIDS 
      : (modeCookie === EXPERIENCE_MODES.KIDS ? EXPERIENCE_MODES.KIDS : EXPERIENCE_MODES.MATURE);

    if (!sessionCookie && !dobCookie) {
      return {
        user: null,
        age: calculatedAge,
        experienceMode: enforcedMode,
        isAgeVerified: Boolean(calculatedAge !== null)
      };
    }

    const userEmail = sessionCookie ? decodeURIComponent(sessionCookie).toLowerCase().trim() : null;
    const isAdmin = Boolean(userEmail && userEmail === 'gbncircle@gmail.com');

    const user = userEmail ? {
      email: userEmail,
      role: isAdmin ? 'admin' : 'reader',
      birthdate: dobCookie || null,
      age: calculatedAge,
      experienceMode: isAdmin ? EXPERIENCE_MODES.MATURE : enforcedMode,
      isAgeVerified: isAdmin ? true : Boolean(calculatedAge !== null)
    } : null;

    return {
      user,
      age: calculatedAge,
      experienceMode: enforcedMode,
      isAgeVerified: Boolean(calculatedAge !== null)
    };
  } catch (err) {
    console.error('Error getting server user context:', err);
    return {
      user: null,
      age: null,
      experienceMode: EXPERIENCE_MODES.KIDS,
      isAgeVerified: false
    };
  }
}
