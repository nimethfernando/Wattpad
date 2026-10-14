import { NextResponse } from 'next/server';
import { razorpay, isRazorpayConfigured, getRazorpayKeyId } from '@/lib/razorpay';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mode = 'donate', // 'donate' | 'subscribe' | 'coins'
      plan = 'monthly', // 'monthly' | 'annual'
      amount, // In INR (e.g. 85, 255, 339, 2549)
      amountInUsd, // In USD (e.g. 1, 3, 3.99, 29.99)
      currency = 'INR',
      donorName = 'Reader',
      donorEmail,
      donorPhone,
      author = 'Author',
      authorUsername = 'author',
      storyTitle = 'Serialized Story',
      donorMessage = '',
      coinsAmount = 0
    } = body;

    // Check if Razorpay is configured on server
    if (!isRazorpayConfigured() || !razorpay) {
      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay gateway is not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.',
          isConfigured: false
        },
        { status: 503 }
      );
    }

    // Determine final amount in INR
    let finalInr = 0;
    if (mode === 'subscribe') {
      const isAnnual = String(plan).toLowerCase().includes('annual');
      finalInr = Number(amount) || (isAnnual ? 2549 : 339); // $29.99/yr ≈ ₹2,549 or $3.99/mo ≈ ₹339
    } else if (mode === 'coins') {
      finalInr = Number(amount) || 99; // Default ₹99
    } else {
      // Tip Author (mode === 'donate')
      finalInr = Math.max(10, Number(amount) || 85); // Minimum ₹10 tip (default $1 ≈ ₹85)
    }

    // Razorpay amounts are strictly in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(finalInr * 100);

    // Create unique receipt identifier (max 40 chars for Razorpay)
    const receiptId = `rcpt_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const calculatedUsd = amountInUsd ? Number(amountInUsd).toFixed(2) : (finalInr / 85).toFixed(2);

    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receiptId,
      notes: {
        platform: 'Avora Library',
        mode,
        plan: mode === 'subscribe' ? plan : '',
        amountInUsd: calculatedUsd,
        amountInInr: String(finalInr),
        paymentInstrument: 'card_only',
        author: mode === 'subscribe' ? 'Avora Platform' : author,
        authorUsername: mode === 'subscribe' ? 'avoralibrary' : authorUsername,
        storyTitle: mode === 'subscribe' ? 'Avora VIP Membership' : storyTitle,
        donorName,
        donorEmail: donorEmail || '',
        donorPhone: donorPhone || '',
        donorMessage: donorMessage ? donorMessage.slice(0, 250) : '',
        coinsAmount: String(coinsAmount || 0)
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      receipt: order.receipt,
      notes: order.notes
    });
  } catch (error) {
    console.error('[Razorpay Create Order Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize Razorpay payment order.'
      },
      { status: 500 }
    );
  }
}

