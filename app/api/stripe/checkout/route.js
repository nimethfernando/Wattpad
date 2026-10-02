import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function POST(request) {
  try {
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe is not configured yet. Please add STRIPE_SECRET_KEY to your .env.local file.',
          sandboxMode: true
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      mode = 'donate', // 'donate' | 'subscribe'
      plan = 'monthly', // 'monthly' | 'annual'
      amount = 5, // For tips
      donorName = 'Reader',
      donorEmail,
      author = 'Author',
      authorUsername,
      storyTitle,
      donorMessage = '',
      authorStripeAccountId = null, // Stripe Connect account for direct bank payout
      successUrl,
      cancelUrl,
    } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finalSuccessUrl = successUrl || `${appUrl}/settings?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${appUrl}/settings?payment=cancelled`;

    // 1. VIP MEMBERSHIP SUBSCRIPTION FLOW
    if (mode === 'subscribe') {
      const isAnnual = plan === 'annual' || String(plan).toLowerCase().includes('annual');
      const unitAmountCents = isAnnual ? 4999 : 599; // $49.99/yr or $5.99/mo
      const interval = isAnnual ? 'year' : 'month';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: donorEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: isAnnual ? 'Avora VIP Annual Membership' : 'Avora VIP Monthly Membership',
                description: 'Ad-free serialized fiction, Golden Crown Crest badge, and offline PWA reading.',
                images: [`${appUrl}/tab-icon.png`],
              },
              unit_amount: unitAmountCents,
              recurring: {
                interval,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          flow: 'subscription',
          plan: isAnnual ? 'annual' : 'monthly',
          subscriberName: donorName,
        },
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    }

    // 2. AUTHOR TIP / DONATION FLOW (With Direct Bank Payout via Stripe Connect)
    const tipAmountCents = Math.round(Number(amount || 5) * 100);

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: donorEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Reader Tip to ${author}`,
              description: storyTitle ? `For "${storyTitle}"` : `Support for author ${author}`,
              images: [`${appUrl}/tab-icon.png`],
            },
            unit_amount: tipAmountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        flow: 'donation',
        author,
        authorUsername: authorUsername || '',
        donorName,
        storyTitle: storyTitle || '',
        donorMessage: donorMessage || '',
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    };

    // If author has connected their bank account through Stripe Connect Express:
    // Route 90% directly to the author's bank account, retain 10% platform fee
    if (authorStripeAccountId) {
      const platformFeePercent = 0.10; // 10% platform fee
      const applicationFeeCents = Math.round(tipAmountCents * platformFeePercent);

      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeCents,
        transfer_data: {
          destination: authorStripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe Checkout API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
