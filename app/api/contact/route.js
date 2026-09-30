import { NextResponse } from 'next/server';
import { saveContactSubmissionToDb } from '@/lib/db';
import { sendContactFormNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, topic = 'support', phone = null } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }

    // 1. Save to MariaDB
    const dbResult = await saveContactSubmissionToDb({
      name,
      email,
      subject: `[${topic}] ${subject || 'Inquiry'}`,
      message,
      phone
    });

    // 2. Dispatch Email via Gmail SMTP
    try {
      await sendContactFormNotification({
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        topic
      });
    } catch (mailErr) {
      console.error('Error dispatching contact email:', mailErr);
    }

    return NextResponse.json({
      success: true,
      submissionId: dbResult.id,
      message: 'Inquiry saved to database and email notification dispatched.'
    });
  } catch (error) {
    console.error('API /api/contact POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
