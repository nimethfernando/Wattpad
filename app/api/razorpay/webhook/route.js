import { NextResponse } from 'next/server';
import { verifyWebhookSignature, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!isRazorpayConfigured()) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('[Razorpay Webhook Error]: Invalid HMAC signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const eventData = JSON.parse(rawBody);
    const event = eventData.event;
    const payload = eventData.payload;

    console.log(`[Razorpay Webhook Received]: Event ${event} | ID: ${eventData.id || 'N/A'}`);

    switch (event) {
      case 'payment.captured': {
        const payment = payload.payment?.entity;
        console.log(`[Razorpay Webhook Payment Captured]: ${payment.id} for amount ₹${payment.amount / 100}`);
        break;
      }
      case 'payment.failed': {
        const payment = payload.payment?.entity;
        console.warn(`[Razorpay Webhook Payment Failed]: ${payment.id} reason: ${payment.error_description}`);
        break;
      }
      case 'order.paid': {
        const order = payload.order?.entity;
        console.log(`[Razorpay Webhook Order Paid]: ${order.id}`);
        break;
      }
      case 'refund.created': {
        const refund = payload.refund?.entity;
        console.log(`[Razorpay Webhook Refund Created]: ${refund.id}`);
        break;
      }
      default:
        console.log(`[Razorpay Webhook Unhandled Event]: ${event}`);
    }

    return NextResponse.json({ received: true, event });
  } catch (error) {
    console.error('[Razorpay Webhook Handler Error]:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

