import nodemailer from 'nodemailer';
import { logEmailToDb } from './db.js';

let transporter;

export function getEmailTransporter() {
  if (!transporter) {
    const user = process.env.EMAIL_USER || '';
    const pass = process.env.EMAIL_PASS || '';

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });
  }
  return transporter;
}

export function isEmailConfigured() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  return Boolean(user && pass && user.includes('@') && pass.trim().length > 0 && !pass.includes('your_app_password'));
}

export async function verifySmtp() {
  if (!isEmailConfigured()) {
    return { success: false, configured: false, message: 'SMTP credentials not configured. Running in sandbox mode.' };
  }

  try {
    const t = getEmailTransporter();
    // Timeout verification after 5 seconds to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SMTP verify timeout')), 5000)
    );
    await Promise.race([t.verify(), timeoutPromise]);
    return { success: true, user: process.env.EMAIL_USER || '', configured: true };
  } catch (error) {
    console.warn('SMTP verify notice:', error.message);
    return { success: false, error: error.message, configured: false };
  }
}

// Base HTML Email Template with Avora Library Styling
function getBaseHtml({ headerTitle = 'Avora Library Alert', contentHtml, actionUrl, actionText }) {
  const currentYear = new Date().getFullYear();
  const brandUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avoralibrary.com';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #7c3aed 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .logo-sub {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 4px;
      font-weight: 500;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.6;
    }
    .headline {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .body-text {
      font-size: 15px;
      color: #475569;
      margin-bottom: 24px;
    }
    .cta-container {
      text-align: center;
      margin: 28px 0;
    }
    .cta-btn {
      display: inline-block;
      background: #f97316;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 28px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #f97316;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="logo-text">Avora Library</h1>
      <div class="logo-sub">Serialized Storytelling &amp; Community Reading</div>
    </div>
    
    <div class="content">
      ${contentHtml}

      ${actionUrl && actionText ? `
        <div class="cta-container">
          <a href="${actionUrl}" class="cta-btn">${actionText} &rarr;</a>
        </div>
      ` : ''}
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">You received this notification from your Avora Library account or reader preferences.</p>
      <p style="margin: 0;">&copy; ${currentYear} Avora Library Platform &bull; <a href="${brandUrl}">Visit Website</a> &bull; <a href="${brandUrl}/settings">Preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generic Notification Email
export async function sendNotificationEmail({
  to,
  subject,
  title,
  message,
  actionUrl = null,
  actionText = null
}) {
  const isConfigured = isEmailConfigured();

  // If email credentials are not set up, dispatch safely in sandbox simulation mode
  if (!isConfigured) {
    console.log(`[Email Dev Sandbox] Dispatching simulated email to: ${to} | Subject: [Avora Library] ${subject}`);
    await logEmailToDb({
      recipient: to,
      subject,
      template: 'general_notification',
      status: 'simulated_sandbox'
    });
    return { 
      success: true, 
      simulated: true, 
      messageId: `sim_${Date.now()}`,
      note: 'Dispatched via Avora Dev Sandbox (SMTP unconfigured)'
    };
  }

  const t = getEmailTransporter();
  const fromUser = process.env.EMAIL_USER || 'gnbmailsender@gmail.com';

  const contentHtml = `
    <h2 class="headline">${title}</h2>
    <p class="body-text">${message.replace(/\n/g, '<br>')}</p>
  `;

  const html = getBaseHtml({
    headerTitle: title,
    contentHtml,
    actionUrl,
    actionText
  });

  try {
    const sendPromise = t.sendMail({
      from: `"Avora Library" <${fromUser}>`,
      to,
      subject: `[Avora Library] ${subject}`,
      html,
      text: `${title}\n\n${message}\n\n${actionUrl ? `${actionText}: ${actionUrl}` : ''}`
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP send timeout (6s)')), 6000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);

    await logEmailToDb({
      recipient: to,
      subject,
      template: 'general_notification',
      status: 'sent'
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Service Notice] SMTP dispatch warning for ${to} (${error.message}). Gracefully falling back to logged notification.`);
    await logEmailToDb({
      recipient: to,
      subject,
      template: 'general_notification',
      status: 'sandbox_fallback',
      errorMessage: error.message
    });
    // Return gracefully so user flows (registration, password reset) never crash
    return { success: true, fallback: true, error: error.message };
  }
}

// Chapter Alert Notification Email
export async function sendChapterAlertEmail({
  to,
  authorName,
  storyTitle,
  chapterTitle,
  chapterUrl
}) {
  const subject = `New Chapter Alert: ${storyTitle} by ${authorName}`;
  const title = `New Chapter Published in ${storyTitle}`;
  const message = `Exciting news! Author ${authorName} just published a brand new serial chapter: "${chapterTitle}". Jump back in now to continue reading and leave your marginalia reactions!`;

  return sendNotificationEmail({
    to,
    subject,
    title,
    message,
    actionUrl: chapterUrl,
    actionText: 'Read Chapter Now'
  });
}

// Welcome Email on Registration
export async function sendWelcomeEmail({ to, name = 'Story Lover' }) {
  const subject = `Welcome to Avora Library, ${name}! 📚✨`;
  const title = `Welcome to Avora Library!`;
  const message = `Hello ${name},\n\nWelcome to Avora Library — your new home for serialized storytelling and community reading! Explore thousands of trending novels, join active fandom spaces, react directly to story paragraphs, and start serializing your own stories.\n\nHappy reading!`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return sendNotificationEmail({
    to,
    subject,
    title,
    message,
    actionUrl: `${appUrl}/browse`,
    actionText: 'Explore Trending Stories'
  });
}

// Contact Form Dispatch Notification
export async function sendContactFormNotification({ name, email, subject, message, topic = 'General' }) {
  const adminRecipient = process.env.EMAIL_USER || 'gnbmailsender@gmail.com';

  // 1. Notify Admin Team
  const adminResult = await sendNotificationEmail({
    to: adminRecipient,
    subject: `New Help Desk Inquiry: [${topic}] from ${name}`,
    title: `Inquiry Submitted by ${name}`,
    message: `A new message was submitted via the Avora Library contact desk:\n\nSender: ${name} (${email})\nTopic: ${topic}\nSubject: ${subject}\n\nMessage:\n${message}`,
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`,
    actionText: 'Open Admin Console'
  });

  // 2. Send acknowledgment to the sender
  await sendNotificationEmail({
    to: email,
    subject: `We received your inquiry regarding "${subject}"`,
    title: `Thank You for Contacting Avora Library`,
    message: `Hi ${name},\n\nWe have received your message regarding "${subject}". Our team typically reviews incoming tickets and responds within 24 hours.\n\nSummary of your message:\n"${message}"`,
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
    actionText: 'Back to Avora Library'
  });

  return adminResult;
}

// Password Recovery Email
export async function sendPasswordResetEmail({ to, resetToken = 'sample_token_2026' }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/login?token=${resetToken}&email=${encodeURIComponent(to)}`;

  return sendNotificationEmail({
    to,
    subject: `Reset your Avora Library password`,
    title: `Password Reset Request`,
    message: `We received a request to reset the password for your Avora Library account. Click the button below to choose a new password. If you didn't request this, you can safely ignore this email.`,
    actionUrl: resetUrl,
    actionText: 'Reset Password'
  });
}
