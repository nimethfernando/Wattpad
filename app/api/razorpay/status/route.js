import { NextResponse } from 'next/server';
import { isRazorpayConfigured, getRazorpayKeyId } from '@/lib/razorpay';

export async function GET() {
  const configured = isRazorpayConfigured();
  const rawKey = getRazorpayKeyId();

  return NextResponse.json({
    success: true,
    isConfigured: configured,
    mode: rawKey.startsWith('rzp_live_') ? 'live' : (rawKey.startsWith('rzp_test_') ? 'test' : (configured ? 'live' : 'unconfigured')),
    keyIdMasked: rawKey ? `${rawKey.slice(0, 8)}••••••••${rawKey.slice(-4)}` : null,
    supportedMethods: ['UPI (GPay / PhonePe / Paytm / QR)', 'Cards (RuPay / Visa / MasterCard)', 'Net Banking (50+ Banks)', 'Wallets'],
    currency: 'INR',
    payoutSplit: '90% Author / 10% Platform'
  });
}

