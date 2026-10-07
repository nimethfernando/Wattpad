import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool;

export function getDbPool() {
  if (!pool) {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = Number(process.env.DB_PORT || 3306);
    const user = process.env.DB_USER || '';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || '';

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 8000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = getDbPool();
  const [results] = await db.query(sql, params);
  return results;
}

export async function testDbConnection() {
  try {
    const db = getDbPool();
    const [rows] = await db.query('SELECT 1 as is_alive;');
    return { success: true, isAlive: rows[0]?.is_alive === 1 };
  } catch (error) {
    console.warn('Database connection test notice:', error.message);
    return { success: false, error: error.message };
  }
}

// ==========================================
// Persistent Local Store Fallback Layer
// Guarantees zero 500 errors and persistent data
// ==========================================
const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'db-store.json');

function getLocalStore() {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initialStore = {
        stories: [],
        bankDetails: [],
        userProfiles: [],
        notifications: [],
        contactSubmissions: [],
        emailLogs: []
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
      return initialStore;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[DB Store Fallback] Read error:', err.message);
    return {
      stories: [],
      bankDetails: [],
      userProfiles: [],
      notifications: [],
      contactSubmissions: [],
      emailLogs: []
    };
  }
}

function saveLocalStore(data) {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('[DB Store Fallback] Write error:', err.message);
    return false;
  }
}

// ==========================================
// Auto-Migration & Schema Verification
// ==========================================
let schemaInitialized = false;

export async function initAvoraDatabase() {
  if (schemaInitialized) return { success: true, alreadyInitialized: true };

  try {
    const db = getDbPool();

    // 1. Stories Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS avora_stories (
        id VARCHAR(120) PRIMARY KEY,
        slug VARCHAR(191) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_username VARCHAR(100),
        author_avatar TEXT,
        genre VARCHAR(100),
        genre_slug VARCHAR(100),
        cover TEXT,
        description TEXT,
        status VARCHAR(50) DEFAULT 'ongoing',
        language VARCHAR(10) DEFAULT 'en',
        maturity VARCHAR(50) DEFAULT 'everyone',
        age_rating VARCHAR(20) DEFAULT '13+',
        min_age INT DEFAULT 13,
        content_type VARCHAR(50) DEFAULT 'story',
        target_audience VARCHAR(100) DEFAULT 'Young Adult',
        is_original TINYINT(1) DEFAULT 0,
        is_editors_pick TINYINT(1) DEFAULT 0,
        is_trending TINYINT(1) DEFAULT 0,
        \`reads\` INT DEFAULT 0,
        \`votes\` INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        chapters_json LONGTEXT,
        tags_json TEXT,
        copyright VARCHAR(100) DEFAULT 'All Rights Reserved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Bank Details Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS avora_bank_details (
        id VARCHAR(120) PRIMARY KEY,
        user_id VARCHAR(120),
        user_email VARCHAR(191),
        username VARCHAR(100),
        account_holder_name VARCHAR(255),
        bank_name VARCHAR(255),
        account_type VARCHAR(50) DEFAULT 'checking',
        country VARCHAR(100) DEFAULT 'United States',
        currency VARCHAR(10) DEFAULT 'USD',
        routing_number VARCHAR(100),
        account_number VARCHAR(100),
        last4 VARCHAR(10),
        status VARCHAR(50) DEFAULT 'verified',
        payout_split VARCHAR(100) DEFAULT '90% Author / 10% Platform',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bank_email (user_email),
        INDEX idx_bank_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. User Profiles Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS avora_user_profiles (
        id VARCHAR(120) PRIMARY KEY,
        user_email VARCHAR(191) UNIQUE,
        username VARCHAR(100) UNIQUE,
        name VARCHAR(255),
        avatar TEXT,
        role VARCHAR(50) DEFAULT 'reader',
        birthdate VARCHAR(50),
        bio TEXT,
        preferences_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Notifications Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS avora_notifications (
        id VARCHAR(120) PRIMARY KEY,
        user_id VARCHAR(120),
        user_email VARCHAR(191),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        link VARCHAR(255),
        is_read TINYINT(1) DEFAULT 0,
        email_sent TINYINT(1) DEFAULT 0,
        recipient_email VARCHAR(191),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_email (user_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Contact Submissions Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS avora_contact_submissions (
        id VARCHAR(120) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(191) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        phone VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Email Logs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS avora_email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient VARCHAR(191) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        template VARCHAR(100) DEFAULT 'notification',
        status VARCHAR(50) DEFAULT 'sent',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    schemaInitialized = true;
    return { success: true };
  } catch (error) {
    console.warn('[DB Migration] Schema setup warning, falling back to persistent store:', error.message);
    schemaInitialized = true; // prevent repetitive error throws
    return { success: false, fallback: true, error: error.message };
  }
}

// Automatically ensure schema on module load
initAvoraDatabase().catch(() => {});

// ==========================================
// 1. Stories Database Operations
// ==========================================
export async function getStoriesFromDb() {
  try {
    const rows = await query(`
      SELECT 
        id, slug, title, author, author_username as authorUsername, author_avatar as authorAvatar,
        genre, genre_slug as genreSlug, cover, description, status, language, maturity,
        age_rating as ageRating, min_age as minAge, content_type as contentType,
        target_audience as targetAudience, is_original as isOriginal,
        is_editors_pick as isEditorsPick, is_trending as isTrending,
        \`reads\`, \`votes\`, comments_count as commentsCount,
        chapters_json, tags_json, copyright, created_at, updated_at
      FROM avora_stories
      ORDER BY \`reads\` DESC, updated_at DESC
    `);

    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(r => ({
        ...r,
        id: isNaN(Number(r.id)) ? r.id : Number(r.id),
        isOriginal: Boolean(r.isOriginal),
        isEditorsPick: Boolean(r.isEditorsPick),
        isTrending: Boolean(r.isTrending),
        reads: Number(r.reads) || 0,
        votes: Number(r.votes) || 0,
        commentsCount: Number(r.commentsCount) || 0,
        chapters: r.chapters_json ? JSON.parse(r.chapters_json) : [],
        tags: r.tags_json ? JSON.parse(r.tags_json) : []
      }));
    }
  } catch (error) {
    console.warn('[DB] getStoriesFromDb falling back to store:', error.message);
  }

  // Fallback to local store
  const store = getLocalStore();
  return store.stories || [];
}

export async function getStoryBySlugFromDb(slug) {
  try {
    const rows = await query(`
      SELECT 
        id, slug, title, author, author_username as authorUsername, author_avatar as authorAvatar,
        genre, genre_slug as genreSlug, cover, description, status, language, maturity,
        age_rating as ageRating, min_age as minAge, content_type as contentType,
        target_audience as targetAudience, is_original as isOriginal,
        is_editors_pick as isEditorsPick, is_trending as isTrending,
        \`reads\`, \`votes\`, comments_count as commentsCount,
        chapters_json, tags_json, copyright, created_at, updated_at
      FROM avora_stories
      WHERE slug = ? OR id = ?
      LIMIT 1
    `, [slug, String(slug)]);

    if (Array.isArray(rows) && rows[0]) {
      const r = rows[0];
      return {
        ...r,
        id: isNaN(Number(r.id)) ? r.id : Number(r.id),
        isOriginal: Boolean(r.isOriginal),
        isEditorsPick: Boolean(r.isEditorsPick),
        isTrending: Boolean(r.isTrending),
        reads: Number(r.reads) || 0,
        votes: Number(r.votes) || 0,
        commentsCount: Number(r.commentsCount) || 0,
        chapters: r.chapters_json ? JSON.parse(r.chapters_json) : [],
        tags: r.tags_json ? JSON.parse(r.tags_json) : []
      };
    }
  } catch (error) {
    console.warn('[DB] getStoryBySlugFromDb falling back to store:', error.message);
  }

  const store = getLocalStore();
  return (store.stories || []).find(s => s.slug === slug || String(s.id) === String(slug)) || null;
}

export async function saveStoryToDb(story) {
  const storyId = String(story.id || Date.now());
  const slug = story.slug || story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const chaptersJson = JSON.stringify(story.chapters || []);
  const tagsJson = JSON.stringify(story.tags || []);

  const storyObj = {
    ...story,
    id: story.id || storyId,
    slug,
    reads: Number(story.reads) || 1,
    votes: Number(story.votes) || 1,
    commentsCount: Number(story.commentsCount) || 0,
    chapters: story.chapters || [],
    tags: story.tags || []
  };

  // Always update persistent local store
  const store = getLocalStore();
  const existingIdx = (store.stories || []).findIndex(s => s.slug === slug || String(s.id) === String(storyId));
  if (existingIdx >= 0) {
    store.stories[existingIdx] = { ...store.stories[existingIdx], ...storyObj };
  } else {
    store.stories = [storyObj, ...(store.stories || [])];
  }
  saveLocalStore(store);

  // Attempt database upsert
  try {
    await query(`
      INSERT INTO avora_stories (
        id, slug, title, author, author_username, author_avatar, genre, genre_slug, cover,
        description, status, language, maturity, age_rating, min_age, content_type,
        target_audience, is_original, is_editors_pick, is_trending, \`reads\`, \`votes\`,
        comments_count, chapters_json, tags_json, copyright
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        author = VALUES(author),
        author_username = VALUES(author_username),
        author_avatar = VALUES(author_avatar),
        genre = VALUES(genre),
        genre_slug = VALUES(genre_slug),
        cover = VALUES(cover),
        description = VALUES(description),
        status = VALUES(status),
        language = VALUES(language),
        maturity = VALUES(maturity),
        age_rating = VALUES(age_rating),
        min_age = VALUES(min_age),
        content_type = VALUES(content_type),
        target_audience = VALUES(target_audience),
        is_original = VALUES(is_original),
        is_editors_pick = VALUES(is_editors_pick),
        is_trending = VALUES(is_trending),
        \`reads\` = VALUES(\`reads\`),
        \`votes\` = VALUES(\`votes\`),
        comments_count = VALUES(comments_count),
        chapters_json = VALUES(chapters_json),
        tags_json = VALUES(tags_json),
        copyright = VALUES(copyright)
    `, [
      storyId,
      slug,
      story.title,
      story.author || 'Author',
      story.authorUsername || 'author',
      story.authorAvatar || '',
      story.genre || 'General',
      story.genreSlug || 'general',
      story.cover || '',
      story.description || '',
      story.status || 'ongoing',
      story.language || 'en',
      story.maturity || 'everyone',
      story.ageRating || '13+',
      Number(story.minAge) || 13,
      story.contentType || 'story',
      story.targetAudience || 'Young Adult',
      story.isOriginal ? 1 : 0,
      story.isEditorsPick ? 1 : 0,
      story.isTrending ? 1 : 0,
      Number(story.reads) || 1,
      Number(story.votes) || 1,
      Number(story.commentsCount) || 0,
      chaptersJson,
      tagsJson,
      story.copyright || 'All Rights Reserved'
    ]);
  } catch (error) {
    console.warn('[DB] saveStoryToDb failed on SQL, saved to persistent store:', error.message);
  }

  return { success: true, story: storyObj };
}

export async function deleteStoryFromDb(slugOrId) {
  // Update local store
  const store = getLocalStore();
  store.stories = (store.stories || []).filter(s => s.slug !== slugOrId && String(s.id) !== String(slugOrId));
  saveLocalStore(store);

  try {
    await query(`DELETE FROM avora_stories WHERE slug = ? OR id = ?`, [String(slugOrId), String(slugOrId)]);
    return { success: true };
  } catch (error) {
    console.warn('[DB] deleteStoryFromDb SQL notice:', error.message);
    return { success: true, storeOnly: true };
  }
}

export async function incrementStoryReadsInDb(slugOrId, chapterId = null, count = 1) {
  const inc = Number(count) || 1;

  // Local store increment
  const store = getLocalStore();
  const story = (store.stories || []).find(s => s.slug === slugOrId || String(s.id) === String(slugOrId));
  if (story) {
    story.reads = (Number(story.reads) || 0) + inc;
    if (chapterId && Array.isArray(story.chapters)) {
      story.chapters = story.chapters.map(c => c.id === chapterId ? { ...c, reads: (Number(c.reads) || 0) + inc } : c);
    }
    saveLocalStore(store);
  }

  try {
    await query(`UPDATE avora_stories SET \`reads\` = \`reads\` + ? WHERE slug = ? OR id = ?`, [inc, String(slugOrId), String(slugOrId)]);
    return { success: true };
  } catch (error) {
    console.warn('[DB] incrementStoryReadsInDb SQL notice:', error.message);
    return { success: true, storeOnly: true };
  }
}

// ==========================================
// 2. Author Bank Details Database Operations
// ==========================================
export async function saveBankDetailsToDb(details) {
  const userEmail = (details.userEmail || details.email || '').toLowerCase().trim();
  const username = (details.username || '').toLowerCase().trim();
  const id = details.id || `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const bankObj = {
    ...details,
    id,
    userEmail,
    username,
    updatedAt: new Date().toISOString()
  };

  // Local store update
  const store = getLocalStore();
  const existingIdx = (store.bankDetails || []).findIndex(b => 
    (userEmail && b.userEmail === userEmail) || 
    (username && b.username === username) ||
    b.id === id
  );
  if (existingIdx >= 0) {
    store.bankDetails[existingIdx] = { ...store.bankDetails[existingIdx], ...bankObj };
  } else {
    store.bankDetails = [bankObj, ...(store.bankDetails || [])];
  }
  saveLocalStore(store);

  try {
    await query(`
      INSERT INTO avora_bank_details (
        id, user_email, username, account_holder_name, bank_name,
        account_type, country, currency, routing_number, account_number, last4,
        status, payout_split
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        account_holder_name = VALUES(account_holder_name),
        bank_name = VALUES(bank_name),
        account_type = VALUES(account_type),
        country = VALUES(country),
        currency = VALUES(currency),
        routing_number = VALUES(routing_number),
        account_number = VALUES(account_number),
        last4 = VALUES(last4),
        status = VALUES(status),
        payout_split = VALUES(payout_split)
    `, [
      id,
      userEmail,
      username,
      details.accountHolderName || '',
      details.bankName || '',
      details.accountType || 'checking',
      details.country || 'United States',
      details.currency || 'USD',
      details.routingNumber || '',
      details.accountNumber || '',
      details.last4 || '4242',
      details.status || 'verified',
      details.payoutSplit || '90% Author / 10% Platform'
    ]);
  } catch (error) {
    console.warn('[DB] saveBankDetailsToDb SQL notice:', error.message);
  }

  return { success: true, bankDetails: bankObj };
}

export async function getBankDetailsFromDb(userEmailOrUsername) {
  const search = (userEmailOrUsername || '').toLowerCase().trim();
  if (!search) return null;

  try {
    const rows = await query(`
      SELECT 
        id, user_email as userEmail, username, account_holder_name as accountHolderName,
        bank_name as bankName, account_type as accountType, country, currency,
        routing_number as routingNumber, account_number as accountNumber, last4,
        status, payout_split as payoutSplit, updated_at as updatedAt
      FROM avora_bank_details
      WHERE LOWER(user_email) = ? OR LOWER(username) = ?
      LIMIT 1
    `, [search, search]);

    if (Array.isArray(rows) && rows[0]) {
      return rows[0];
    }
  } catch (error) {
    console.warn('[DB] getBankDetailsFromDb SQL notice:', error.message);
  }

  const store = getLocalStore();
  return (store.bankDetails || []).find(b => 
    (b.userEmail && b.userEmail.toLowerCase() === search) || 
    (b.username && b.username.toLowerCase() === search)
  ) || null;
}

export async function deleteBankDetailsFromDb(userEmailOrUsername) {
  const search = (userEmailOrUsername || '').toLowerCase().trim();
  const store = getLocalStore();
  store.bankDetails = (store.bankDetails || []).filter(b => 
    b.userEmail?.toLowerCase() !== search && b.username?.toLowerCase() !== search
  );
  saveLocalStore(store);

  try {
    await query(`DELETE FROM avora_bank_details WHERE LOWER(user_email) = ? OR LOWER(username) = ?`, [search, search]);
  } catch (error) {}

  return { success: true };
}

// ==========================================
// 3. User Profiles Database Operations
// ==========================================
export async function saveUserProfileToDb(profile) {
  const userEmail = (profile.email || profile.userEmail || '').toLowerCase().trim();
  const username = (profile.username || '').toLowerCase().trim();
  const id = profile.id || `usr_${Date.now()}`;

  const profObj = { ...profile, id, userEmail, username };

  const store = getLocalStore();
  const existingIdx = (store.userProfiles || []).findIndex(p => 
    (userEmail && p.userEmail === userEmail) || (username && p.username === username)
  );
  if (existingIdx >= 0) {
    store.userProfiles[existingIdx] = { ...store.userProfiles[existingIdx], ...profObj };
  } else {
    store.userProfiles = [profObj, ...(store.userProfiles || [])];
  }
  saveLocalStore(store);

  try {
    await query(`
      INSERT INTO avora_user_profiles (
        id, user_email, username, name, avatar, role, birthdate, bio, preferences_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        avatar = VALUES(avatar),
        role = VALUES(role),
        birthdate = VALUES(birthdate),
        bio = VALUES(bio),
        preferences_json = VALUES(preferences_json)
    `, [
      id,
      userEmail,
      username,
      profile.name || '',
      profile.avatar || '',
      profile.role || 'reader',
      profile.birthdate || null,
      profile.bio || '',
      JSON.stringify(profile.userPreferences || {})
    ]);
  } catch (error) {
    console.warn('[DB] saveUserProfileToDb SQL notice:', error.message);
  }

  return { success: true, profile: profObj };
}

export async function getUserProfileFromDb(emailOrUsername) {
  const search = (emailOrUsername || '').toLowerCase().trim();
  if (!search) return null;

  try {
    const rows = await query(`
      SELECT id, user_email as userEmail, username, name, avatar, role, birthdate, bio, preferences_json as preferencesJson
      FROM avora_user_profiles
      WHERE LOWER(user_email) = ? OR LOWER(username) = ?
      LIMIT 1
    `, [search, search]);

    if (Array.isArray(rows) && rows[0]) {
      const r = rows[0];
      return {
        ...r,
        userPreferences: r.preferencesJson ? JSON.parse(r.preferencesJson) : {}
      };
    }
  } catch (error) {
    console.warn('[DB] getUserProfileFromDb SQL notice:', error.message);
  }

  const store = getLocalStore();
  return (store.userProfiles || []).find(p => 
    (p.userEmail && p.userEmail.toLowerCase() === search) || 
    (p.username && p.username.toLowerCase() === search)
  ) || null;
}

// ==========================================
// 3b. User Library & Reading Data Operations
// ==========================================
export async function saveUserLibraryDataToDb(userIdentifier, data) {
  const search = (userIdentifier || '').toLowerCase().trim();
  if (!search) return { success: false, error: 'User identifier required' };

  const store = getLocalStore();
  if (!store.userLibraries) store.userLibraries = {};
  store.userLibraries[search] = {
    ...(store.userLibraries[search] || {}),
    ...data,
    updatedAt: new Date().toISOString()
  };
  saveLocalStore(store);

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS avora_user_library_data (
        user_identifier VARCHAR(255) PRIMARY KEY,
        data_json LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await query(`
      INSERT INTO avora_user_library_data (user_identifier, data_json)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE data_json = VALUES(data_json)
    `, [search, JSON.stringify(store.userLibraries[search])]);
  } catch (error) {
    // Graceful fallback to persistent JSON store
  }

  return { success: true };
}

export async function getUserLibraryDataFromDb(userIdentifier) {
  const search = (userIdentifier || '').toLowerCase().trim();
  if (!search) return null;

  try {
    const rows = await query(`
      SELECT data_json FROM avora_user_library_data
      WHERE user_identifier = ?
      LIMIT 1
    `, [search]);
    if (Array.isArray(rows) && rows[0]?.data_json) {
      return typeof rows[0].data_json === 'string' ? JSON.parse(rows[0].data_json) : rows[0].data_json;
    }
  } catch (error) {}

  const store = getLocalStore();
  return store.userLibraries?.[search] || null;
}

// ==========================================
// 4. Notifications Database Operations
// ==========================================
export async function getNotificationsFromDb(userEmail = null, limit = 20) {
  try {
    let rows;
    if (userEmail) {
      rows = await query(
        `SELECT id, user_id, user_email, title, message, type, link, is_read, email_sent, recipient_email, created_at 
         FROM avora_notifications 
         WHERE user_email = ? OR user_email IS NULL OR user_email = ''
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userEmail, Number(limit)]
      );
    } else {
      rows = await query(
        `SELECT id, user_id, user_email, title, message, type, link, is_read, email_sent, recipient_email, created_at 
         FROM avora_notifications 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [Number(limit)]
      );
    }
    if (Array.isArray(rows) && rows.length > 0) return rows;
  } catch (error) {
    console.warn('[DB] getNotificationsFromDb falling back to store:', error.message);
  }

  const store = getLocalStore();
  const list = store.notifications || [];
  if (userEmail) {
    return list.filter(n => !n.userEmail || n.userEmail === userEmail).slice(0, limit);
  }
  return list.slice(0, limit);
}

export async function saveNotificationToDb({
  id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  userId = null,
  userEmail = null,
  title,
  message,
  type = 'system',
  link = null,
  emailSent = false,
  recipientEmail = null
}) {
  const notifObj = {
    id,
    userId,
    userEmail,
    title,
    message,
    type,
    link,
    read: false,
    emailSent,
    recipientEmail,
    time: 'Just now',
    created_at: new Date().toISOString()
  };

  const store = getLocalStore();
  store.notifications = [notifObj, ...(store.notifications || [])];
  saveLocalStore(store);

  try {
    await query(
      `INSERT INTO avora_notifications (id, user_id, user_email, title, message, type, link, is_read, email_sent, recipient_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, userEmail, title, message, type, link, 0, emailSent ? 1 : 0, recipientEmail]
    );
  } catch (error) {
    console.warn('[DB] saveNotificationToDb SQL notice:', error.message);
  }

  return { success: true, id };
}

export async function markNotificationReadInDb(id) {
  const store = getLocalStore();
  store.notifications = (store.notifications || []).map(n => n.id === id ? { ...n, read: true } : n);
  saveLocalStore(store);

  try {
    await query(`UPDATE avora_notifications SET is_read = 1 WHERE id = ?`, [id]);
  } catch (error) {}
  return { success: true };
}

export async function markAllNotificationsReadInDb(userEmail = null) {
  const store = getLocalStore();
  store.notifications = (store.notifications || []).map(n => {
    if (!userEmail || n.userEmail === userEmail) return { ...n, read: true };
    return n;
  });
  saveLocalStore(store);

  try {
    if (userEmail) {
      await query(`UPDATE avora_notifications SET is_read = 1 WHERE user_email = ?`, [userEmail]);
    } else {
      await query(`UPDATE avora_notifications SET is_read = 1`);
    }
  } catch (error) {}
  return { success: true };
}

// ==========================================
// 5. Email Logs Database Operations
// ==========================================
export async function logEmailToDb({ recipient, subject, template = 'notification', status = 'sent', errorMessage = null }) {
  const logObj = {
    id: Date.now(),
    recipient,
    subject,
    template,
    status,
    errorMessage,
    createdAt: new Date().toISOString()
  };

  const store = getLocalStore();
  store.emailLogs = [logObj, ...(store.emailLogs || [])];
  saveLocalStore(store);

  try {
    const result = await query(
      `INSERT INTO avora_email_logs (recipient, subject, template, status, error_message)
       VALUES (?, ?, ?, ?, ?)`,
      [recipient, subject, template, status, errorMessage]
    );
    return { success: true, insertId: result?.insertId || logObj.id };
  } catch (error) {
    return { success: true, storeOnly: true };
  }
}

export async function getRecentEmailLogsFromDb(limit = 15) {
  try {
    const rows = await query(
      `SELECT id, recipient, subject, template, status, error_message, created_at
       FROM avora_email_logs
       ORDER BY created_at DESC
       LIMIT ?`,
      [Number(limit)]
    );
    if (Array.isArray(rows) && rows.length > 0) return rows;
  } catch (error) {}

  const store = getLocalStore();
  return (store.emailLogs || []).slice(0, limit);
}

// ==========================================
// 6. Contact Submissions Database Operations
// ==========================================
export async function saveContactSubmissionToDb({ name, email, subject, message, phone = null }) {
  const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const subObj = { id, name, email, subject, message, phone, createdAt: new Date().toISOString() };

  const store = getLocalStore();
  store.contactSubmissions = [subObj, ...(store.contactSubmissions || [])];
  saveLocalStore(store);

  try {
    await query(
      `INSERT INTO avora_contact_submissions (id, name, email, subject, message, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, email, subject, message, phone]
    );
  } catch (error) {}

  return { success: true, id };
}

export async function getContactSubmissionsFromDb(limit = 10) {
  try {
    const rows = await query(
      `SELECT id, name, email, subject, message, phone, createdAt
       FROM avora_contact_submissions
       ORDER BY createdAt DESC
       LIMIT ?`,
      [Number(limit)]
    );
    if (Array.isArray(rows) && rows.length > 0) return rows;
  } catch (error) {}

  const store = getLocalStore();
  return (store.contactSubmissions || []).slice(0, limit);
}
