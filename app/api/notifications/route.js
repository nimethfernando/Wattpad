import { NextResponse } from 'next/server';
import { 
  getNotificationsFromDb, 
  saveNotificationToDb, 
  markNotificationReadInDb, 
  markAllNotificationsReadInDb 
} from '@/lib/db';
import { sendNotificationEmail, sendChapterAlertEmail } from '@/lib/email';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || null;
    const limit = searchParams.get('limit') || 25;

    const notifications = await getNotificationsFromDb(email, limit);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('API /api/notifications GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, 
      message, 
      type = 'system', 
      link = null, 
      userEmail = null,
      sendEmail = false,
      recipientEmail = null,
      authorName = null,
      storyTitle = null,
      chapterTitle = null
    } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
    }

    const targetEmail = recipientEmail || userEmail;
    let emailSent = false;

    // Send email via nodemailer if requested
    if (sendEmail && targetEmail) {
      try {
        if (type === 'chapter_alert' && authorName && storyTitle && chapterTitle) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const emailRes = await sendChapterAlertEmail({
            to: targetEmail,
            authorName,
            storyTitle,
            chapterTitle,
            chapterUrl: link ? `${appUrl}${link}` : `${appUrl}/story`
          });
          emailSent = emailRes.success;
        } else {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const emailRes = await sendNotificationEmail({
            to: targetEmail,
            subject: title,
            title,
            message,
            actionUrl: link ? `${appUrl}${link}` : null,
            actionText: 'View on Avora'
          });
          emailSent = emailRes.success;
        }
      } catch (mailErr) {
        console.error('Could not send notification email:', mailErr);
      }
    }

    // Save notification to MariaDB
    const dbResult = await saveNotificationToDb({
      title,
      message,
      type,
      link,
      userEmail,
      emailSent,
      recipientEmail: targetEmail
    });

    return NextResponse.json({ 
      success: true, 
      notificationId: dbResult.id,
      emailSent 
    });
  } catch (error) {
    console.error('API /api/notifications POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, markAll = false, userEmail = null } = body;

    if (markAll) {
      await markAllNotificationsReadInDb(userEmail);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      await markNotificationReadInDb(id);
      return NextResponse.json({ success: true, message: `Notification ${id} marked as read` });
    }

    return NextResponse.json({ success: false, error: 'id or markAll flag required' }, { status: 400 });
  } catch (error) {
    console.error('API /api/notifications PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
