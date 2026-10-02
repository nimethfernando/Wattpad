import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not defined in environment variables.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle supported Stripe events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};

        if (metadata.flow === 'subscription') {
          console.log(`[Stripe Webhook] VIP Subscription activated for: ${session.customer_email || metadata.subscriberName}`);
          // Fulfill VIP subscription in database / user records here
        } else if (metadata.flow === 'donation') {
          console.log(`[Stripe Webhook] Author Tip completed: $${(session.amount_total / 100).toFixed(2)} to ${metadata.author}`);
          // Fulfill tipping record in database here
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`[Stripe Webhook] VIP Subscription cancelled: ${subscription.id}`);
        // Mark user subscription inactive in database
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`[Stripe Webhook] PaymentIntent succeeded: ${paymentIntent.id} ($${(paymentIntent.amount / 100).toFixed(2)})`);
        break;
      }

      default:
        // Other events can be safely acknowledged
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handling error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
