import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { saveNotificationToDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
    }

    const resetToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Dispatch recovery email
    const emailResult = await sendPasswordResetEmail({
      to: email,
      resetToken
    });

    // Save notification to DB
    await saveNotificationToDb({
      userEmail: email,
      title: 'Password Reset Dispatched',
      message: `A password reset link was dispatched to ${email}.`,
      type: 'security',
      emailSent: emailResult.success,
      recipientEmail: email
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been dispatched.'
    });
  } catch (error) {
    console.error('API /api/auth/forgot-password error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
