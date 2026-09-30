import mysql from 'mysql2/promise';

let pool;

export function getDbPool() {
  if (!pool) {
    const host = process.env.DB_HOST || '162.241.148.163';
    const port = Number(process.env.DB_PORT || 3306);
    const user = process.env.DB_USER || 'ditya0a7_yourcpaneluser_admin';
    const password = process.env.DB_PASSWORD || 'supersecretadminpassword123';
    const database = process.env.DB_NAME || 'ditya0a7_yourcpaneluser_gbncircle';

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
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
    console.error('Database connection test failed:', error);
    return { success: false, error: error.message };
  }
}

// Notification DB Queries
export async function getNotificationsFromDb(userEmail = 'elena@avoralibrary.com', limit = 20) {
  try {
    const rows = await query(
      `SELECT id, user_id, user_email, title, message, type, link, is_read, email_sent, recipient_email, created_at 
       FROM avora_notifications 
       WHERE user_email = ? OR user_email IS NULL OR user_email = ''
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userEmail, Number(limit)]
    );
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      link: r.link,
      read: Boolean(r.is_read),
      emailSent: Boolean(r.email_sent),
      recipientEmail: r.recipient_email,
      time: r.created_at ? new Date(r.created_at).toLocaleString() : 'Just now',
      rawDate: r.created_at
    }));
  } catch (error) {
    console.error('Failed to get notifications from DB:', error);
    return [];
  }
}

export async function saveNotificationToDb({
  id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  userId = null,
  userEmail = 'elena@avoralibrary.com',
  title,
  message,
  type = 'system',
  link = null,
  emailSent = false,
  recipientEmail = null
}) {
  try {
    await query(
      `INSERT INTO avora_notifications (id, user_id, user_email, title, message, type, link, is_read, email_sent, recipient_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, userId, userEmail, title, message, type, link, emailSent ? 1 : 0, recipientEmail || userEmail]
    );
    return { id, success: true };
  } catch (error) {
    console.error('Failed to save notification to DB:', error);
    return { success: false, error: error.message };
  }
}

export async function markNotificationReadInDb(notificationId) {
  try {
    await query(
      `UPDATE avora_notifications SET is_read = 1 WHERE id = ?`,
      [notificationId]
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read in DB:', error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsReadInDb(userEmail = 'elena@avoralibrary.com') {
  try {
    await query(
      `UPDATE avora_notifications SET is_read = 1 WHERE user_email = ? OR user_email IS NULL`,
      [userEmail]
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all notifications as read in DB:', error);
    return { success: false, error: error.message };
  }
}

// Email Logs DB Queries
export async function logEmailToDb({ recipient, subject, template = 'notification', status = 'sent', errorMessage = null }) {
  try {
    const result = await query(
      `INSERT INTO avora_email_logs (recipient, subject, template, status, error_message)
       VALUES (?, ?, ?, ?, ?)`,
      [recipient, subject, template, status, errorMessage]
    );
    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error('Failed to log email to DB:', error);
    return { success: false, error: error.message };
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
    return rows;
  } catch (error) {
    console.error('Failed to get email logs from DB:', error);
    return [];
  }
}

// Contact Submissions DB Queries
export async function saveContactSubmissionToDb({ name, email, subject, message, phone = null }) {
  try {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await query(
      `INSERT INTO avora_contact_submissions (id, name, email, subject, message, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, email, subject, message, phone]
    );
    return { success: true, id };
  } catch (error) {
    console.error('Failed to save contact submission to DB:', error);
    return { success: false, error: error.message };
  }
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
    return rows;
  } catch (error) {
    console.error('Failed to get contact submissions from DB:', error);
    return [];
  }
}
