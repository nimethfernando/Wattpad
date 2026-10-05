import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';

// POST /api/stripe/connect: Creates a Stripe Connect Account & Onboarding Link for Authors
export async function POST(request) {
  try {
    const body = await request.json();
    const { authorEmail, authorUsername, authorName, existingAccountId } = body;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!isStripeConfigured() || !stripe) {
      const simulatedId = existingAccountId || `acct_sim_${Date.now()}`;
      return NextResponse.json({
        success: true,
        accountId: simulatedId,
        url: `${appUrl}/settings?payout_onboarding=complete&stripe_account_id=${simulatedId}&author=${encodeURIComponent(authorUsername || 'author')}&simulated=true`,
        sandbox: true,
        message: 'Stripe Connect unconfigured. Operating in sandbox onboarding mode.'
      });
    }

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
