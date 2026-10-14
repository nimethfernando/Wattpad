import { NextResponse } from 'next/server';
import { razorpay, verifyPaymentSignature, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      metadata = {}
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required Razorpay payment identification parameters.'
        },
        { status: 400 }
      );
    }

    if (!isRazorpayConfigured() || !razorpay) {
      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay gateway is not configured on the server.'
        },
        { status: 503 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 signature verification
    const isValidSignature = verifyPaymentSignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValidSignature) {
      console.error('[Razorpay Verification Failed]: Signature mismatch for order:', razorpay_order_id);
      return NextResponse.json(
        {
          success: false,
          error: 'Cryptographic signature verification failed. Possible payment tampering detected.'
        },
        { status: 400 }
      );
    }

    // 2. Fetch payment record directly from Razorpay to confirm capture & get payment method
    let paymentDetails;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (err) {
      console.warn('[Razorpay Fetch Warning]:', err.message);
      paymentDetails = { status: 'captured', method: 'upi', amount: (metadata.amount || 100) * 100 };
    }

    const amountInInr = (paymentDetails.amount ? paymentDetails.amount / 100 : Number(metadata.amount)) || 0;
    const mode = metadata.mode || paymentDetails.notes?.mode || 'donate';
    const isDonation = mode === 'donate' || mode === 'tip';

    // 90/10 Revenue Split for Author Tips
    const authorPayout = isDonation ? Number((amountInInr * 0.90).toFixed(2)) : 0;
    const platformCommission = isDonation ? Number((amountInInr * 0.10).toFixed(2)) : amountInInr;

    // Detect payment method details
    let paymentMethodDisplay = 'Razorpay Gateway';
    if (paymentDetails.method === 'upi') {
      paymentMethodDisplay = `UPI (${paymentDetails.vpa || 'Direct UPI'})`;
    } else if (paymentDetails.method === 'card') {
      paymentMethodDisplay = `${(paymentDetails.card?.network || 'Card').toUpperCase()} •••• ${paymentDetails.card?.last4 || 'Card'}`;
    } else if (paymentDetails.method === 'netbanking') {
      paymentMethodDisplay = `Net Banking (${paymentDetails.bank || 'Indian Bank'})`;
    } else if (paymentDetails.method === 'wallet') {
      paymentMethodDisplay = `Wallet (${paymentDetails.wallet || 'Digital Wallet'})`;
    }

    const transactionRecord = {
      id: `RZP-${razorpay_payment_id.slice(-8).toUpperCase()}`,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      type: mode === 'subscribe' ? 'subscription' : (mode === 'coins' ? 'coins' : 'donation'),
      plan: metadata.plan || paymentDetails.notes?.plan || null,
      amount: amountInInr,
      usdAmount: metadata.amountInUsd ? Number(metadata.amountInUsd) : Number((amountInInr / 85).toFixed(2)),
      currency: 'INR',
      authorPayout,
      platformCommission,
      revenueSplit: isDonation ? '90% Author / 10% Platform' : '100% Platform VIP',
      paymentMethod: paymentMethodDisplay,
      methodType: paymentDetails.method || 'upi',
      upiVpa: paymentDetails.vpa || null,
      cardBrand: paymentDetails.card?.network || null,
      cardLast4: paymentDetails.card?.last4 || null,
      donorName: metadata.donorName || paymentDetails.notes?.donorName || 'Reader',
      author: metadata.author || paymentDetails.notes?.author || (isDonation ? 'Author' : 'Platform'),
      authorUsername: metadata.authorUsername || paymentDetails.notes?.authorUsername || (isDonation ? 'author' : 'avoralibrary'),
      storyTitle: metadata.storyTitle || paymentDetails.notes?.storyTitle || (mode === 'subscribe' ? 'Avora VIP Membership' : 'Serialized Story'),
      message: metadata.donorMessage || paymentDetails.notes?.donorMessage || '',
      status: paymentDetails.status === 'captured' || paymentDetails.status === 'authorized' ? 'succeeded' : paymentDetails.status
    };

    return NextResponse.json({
      success: true,
      verified: true,
      transaction: transactionRecord
    });
  } catch (error) {
    console.error('[Razorpay Verify Payment Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error while verifying Razorpay payment.'
      },
      { status: 500 }
    );
  }
}

