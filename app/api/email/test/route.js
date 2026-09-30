import { NextResponse } from 'next/server';
import { testDbConnection, getRecentEmailLogsFromDb, getContactSubmissionsFromDb } from '@/lib/db';
import { verifySmtp, sendNotificationEmail } from '@/lib/email';

export async function GET() {
  try {
    const [dbStatus, smtpStatus, recentLogs, recentContacts] = await Promise.all([
      testDbConnection(),
      verifySmtp(),
      getRecentEmailLogsFromDb(10),
      getContactSubmissionsFromDb(5)
    ]);

    return NextResponse.json({
      success: true,
      database: {
        host: process.env.DB_HOST || '162.241.148.163',
        database: process.env.DB_NAME || 'ditya0a7_yourcpaneluser_gbncircle',
        user: process.env.DB_USER || 'ditya0a7_yourcpaneluser_admin',
        ...dbStatus
      },
      email: {
        user: process.env.EMAIL_USER || 'gnbmailsender@gmail.com',
        service: 'gmail',
        ...smtpStatus
      },
      recentLogs,
      recentContacts
    });
  } catch (error) {
    console.error('API /api/email/test GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      to = process.env.EMAIL_USER || 'gnbmailsender@gmail.com', 
      subject = 'Test Notification from Avora Library',
      title = 'MariaDB & Email System Operational',
      message = 'This is an automated test verifying that Avora Library is connected to the MariaDB database and Gmail SMTP notification dispatcher.',
      actionUrl = null,
      actionText = null
    } = body;

    const emailResult = await sendNotificationEmail({
      to,
      subject,
      title,
      message,
      actionUrl: actionUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      actionText: actionText || 'Visit Avora Library'
    });

    return NextResponse.json({
      success: emailResult.success,
      recipient: to,
      messageId: emailResult.messageId,
      error: emailResult.error
    });
  } catch (error) {
    console.error('API /api/email/test POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
