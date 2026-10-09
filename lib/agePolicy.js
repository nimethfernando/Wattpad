// Avora Library - Core Platform-Level Age Policy & Content Classification System
// Enforces age verification and access control based on Date of Birth (DOB).

export const AGE_RATINGS = {
  KIDS_3: '3+',
  KIDS_7: '7+',
  TEEN_13: '13+',
  TEEN_16: '16+',
  ADULT_18: '18+'
};

export const AGE_THRESHOLDS = {
  '3+': 3,
  '7+': 7,
  '13+': 13,
  '16+': 16,
  '18+': 18
};

export const EXPERIENCE_MODES = {
  KIDS: 'kids',       // Family-friendly, kids books, educational & learning
  MATURE: 'mature'    // Full library including 18+ classified mature content (Requires Age >= 18)
};

// Adult-only genres/categories that must be strictly hidden from under-18 users
export const ADULT_GENRE_SLUGS = [
  'werewolf',
  'horror',
  'new-adult',
  'dark-romance',
  'erotica',
  'mature'
];

/**
 * Calculates exact numeric age from a Date of Birth string (YYYY-MM-DD).
 * @param {string|Date} dobInput
 * @returns {number|null} Age in years, or null if invalid
 */
export function calculateAgeFromDob(dobInput) {
  if (!dobInput) return null;
  const dob = new Date(dobInput);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Normalizes an age rating string into a numeric minimum age threshold.
 * @param {string|number} rating e.g. "18+", "13+", 18
 * @returns {number} Minimum age required (default: 3)
 */
export function parseAgeRating(rating) {
  if (typeof rating === 'number') return rating;
  if (!rating) return 3;
  const clean = String(rating).replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 3 : parsed;
}

/**
 * Determines whether a user has permission to access a story based on DOB age + experience mode.
 * Core platform-level rule:
 * - If user.age < requiredAge: DENIED (No override allowed).
 * - If story is 18+ and user is unauthenticated or user.age < 18: DENIED.
 * - If user is 18+ and has selected "kids" mode: Allowed by age, but flagged as mature content.
 * 
 * @param {Object|null} user The user object containing { birthdate, age, experienceMode }
 * @param {Object|string} storyOrRating Story object or ageRating string
 * @returns {{ canAccess: boolean, reason?: string, requiredAge: number, userAge: number|null }}
 */
export function canUserAccessContent(user, storyOrRating) {
  const ratingStr = typeof storyOrRating === 'string' 
    ? storyOrRating 
    : storyOrRating?.ageRating || (storyOrRating?.maturity === 'mature' ? '18+' : '13+');
  
  const requiredAge = parseAgeRating(ratingStr);

  // Guest / Unauthenticated User Access
  if (!user) {
    if (requiredAge >= 18) {
      return {
        canAccess: false,
        reason: 'LOGIN_REQUIRED_FOR_MATURE',
        requiredAge,
        userAge: null,
        message: 'This story contains 18+ mature content. Please log in with an age-verified account to read.'
      };
    }
    // Guests can view 3+, 7+, 13+ content
    return { canAccess: true, requiredAge, userAge: null };
  }

  // Calculate actual age from verified DOB
  const userAge = user.birthdate ? calculateAgeFromDob(user.birthdate) : (user.age ?? null);

  // If user has no DOB on file and content is 18+
  if (userAge === null && requiredAge >= 18) {
    return {
      canAccess: false,
      reason: 'DOB_REQUIRED',
      requiredAge,
      userAge: null,
      message: 'Age verification required: Please enter your Date of Birth to access 18+ content.'
    };
  }

  // Strict Age Check: Under-age users can NEVER access content rated above their age
  if (userAge !== null && userAge < requiredAge) {
    return {
      canAccess: false,
      reason: 'UNDER_AGE',
      requiredAge,
      userAge,
      message: `Access Restricted: This title is classified as ${ratingStr}. Your account age (${userAge}) does not meet the minimum requirement.`
    };
  }

  // Under-18 users can NEVER access 18+ content regardless of settings
  if (userAge !== null && userAge < 18 && requiredAge >= 18) {
    return {
      canAccess: false,
      reason: 'UNDER_18',
      requiredAge: 18,
      userAge,
      message: 'Access Restricted: 18+ mature content is prohibited for accounts under 18 years of age.'
    };
  }

  return { canAccess: true, requiredAge, userAge };
}

/**
 * Filters a list of stories to only those that the user is legally/age-appropriately permitted to see.
 * Used for Carousels, Shelves, Browse lists, Search results, and Recommendations.
 * 
 * @param {Array} stories
 * @param {Object|null} user
 * @returns {Array}
 */
export function filterStoriesForUser(stories = [], user = null) {
  if (!Array.isArray(stories)) return [];

  const userAge = user?.birthdate ? calculateAgeFromDob(user.birthdate) : (user?.age ?? null);
  const isKidsMode = user?.experienceMode === EXPERIENCE_MODES.KIDS;
  const isUnder18 = userAge !== null && userAge < 18;

  return stories.filter(story => {
    // Exclude any stories taken down by moderation or marked as banned/removed
    if (story.status === 'removed' || story.status === 'banned' || story.isBanned || story.isRemoved) return false;

    const requiredAge = parseAgeRating(story.ageRating || (story.maturity === 'mature' ? '18+' : '13+'));

    // Under-18 users MUST NOT see 18+ content or adult genres
    if (isUnder18 && requiredAge >= 18) return false;

    // Users in Kids / Family mode MUST ONLY see child-appropriate content (3+ and 7+ only, never 13+, 16+, or 18+)
    if (isKidsMode && (requiredAge > 7 || requiredAge >= 13)) return false;
    if ((isUnder18 || isKidsMode) && (story.isMature || story.maturity === 'mature')) return false;

    const storyGenre = (story.genreSlug || story.genre || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
    if ((isUnder18 || isKidsMode) && ADULT_GENRE_SLUGS.includes(storyGenre)) return false;

    // Check specific age threshold if user has age
    if (userAge !== null && userAge < requiredAge) return false;

    // If unauthenticated guest, hide 18+ content from open shelves
    if (!user && (requiredAge >= 18 || story.isMature || story.maturity === 'mature')) return false;

    return true;
  });
}

/**
 * Determines whether a story belongs to the Kids Section.
 * Kids Section content criteria:
 * - Age Rating: 3+ (Kids 3+) or 7+ (Family 7+)
 * - Content Format: Illustrated Picture Books ('picture_book')
 * - Genres: Kids Books, Children, Educational Stories, Fairy Tales, Bedtime Stories
 * - Strictly excludes: 13+, 16+, 18+ titles, mature themes, and adult-flagged content.
 * 
 * @param {Object} story
 * @returns {boolean}
 */
export function isStoryForKids(story) {
  if (!story) return false;
  if (story.isMature || story.maturity === 'mature') return false;
  const rating = story.ageRating || (story.maturity === 'mature' ? '18+' : '13+');
  if (['13+', '16+', '18+'].includes(rating)) return false;
  const reqAge = parseAgeRating(rating);
  if (reqAge > 7) return false;

  if (story.contentType === 'picture_book') return true;
  if (['3+', '7+'].includes(rating)) return true;

  const genre = (story.genreSlug || story.genre || '').toLowerCase();
  if (genre.includes('kid') || genre.includes('child') || genre.includes('fairy') || genre.includes('fable') || genre.includes('education')) return true;

  return reqAge <= 7;
}

/**
 * Filters genres/categories to hide adult-only shelves from under-18 or kids mode users.
 * 
 * @param {Array} genres
 * @param {Object|null} user
 * @returns {Array}
 */
export function filterGenresForUser(genres = [], user = null) {
  if (!Array.isArray(genres)) return [];

  const userAge = user?.birthdate ? calculateAgeFromDob(user.birthdate) : (user?.age ?? null);
  const isKidsMode = user?.experienceMode === EXPERIENCE_MODES.KIDS;
  const isUnder18 = userAge !== null && userAge < 18;

  if (isUnder18 || isKidsMode || !user) {
    return genres.filter(g => {
      const rawText = typeof g === 'string' ? g : (g.slug || g.name || '');
      const slug = (typeof g === 'string' ? g.toLowerCase().replace(/[^a-z0-9]/g, '-') : (g.slug || '')).toLowerCase();
      const name = (typeof g === 'string' ? g : (g.name || '')).toLowerCase();
      // Hide explicit adult genres
      if (ADULT_GENRE_SLUGS.includes(slug) || ADULT_GENRE_SLUGS.some(s => rawText.toLowerCase().includes(s))) return false;
      if (name.includes('mature') || name.includes('erotica') || name.includes('18+') || name.includes('werewolf') || name.includes('dark-romance')) return false;
      return true;
    });
  }

  return genres;
}

/**
 * Validates whether an experience mode is allowed for a given age.
 * Users under 18 CANNOT select 'mature' mode.
 * 
 * @param {number|null} age
 * @param {string} requestedMode
 * @returns {{ allowed: boolean, enforcedMode: string }}
 */
export function validateExperienceMode(age, requestedMode) {
  if (age === null || age < 18) {
    return {
      allowed: requestedMode === EXPERIENCE_MODES.KIDS,
      enforcedMode: EXPERIENCE_MODES.KIDS
    };
  }
  return {
    allowed: true,
    enforcedMode: requestedMode === EXPERIENCE_MODES.KIDS ? EXPERIENCE_MODES.KIDS : EXPERIENCE_MODES.MATURE
  };
}
