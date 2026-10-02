import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';

// POST /api/stripe/connect: Creates a Stripe Connect Account & Onboarding Link for Authors
export async function POST(request) {
  try {
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to enable bank payouts.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { authorEmail, authorUsername, authorName, existingAccountId } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let accountId = existingAccountId;

    // 1. Create a new Express Connect Account if author doesn't have one yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Can be configured dynamically per country (e.g. US, GB, CA, AU, EU)
        email: authorEmail || undefined,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          username: authorUsername || '',
          name: authorName || '',
        },
      });

      accountId = account.id;
    }

    // 2. Create the Onboarding Account Link
    // Authors enter their bank routing / IBAN and identity details directly on Stripe's secure portal
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/settings?payout_onboarding=refresh`,
      return_url: `${appUrl}/settings?payout_onboarding=complete&stripe_account_id=${accountId}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      accountId,
      url: accountLink.url,
    });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
