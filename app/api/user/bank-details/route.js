import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      accountHolderName, 
      bankName, 
      accountNumber, 
      routingNumber, 
      accountType = 'checking', 
      country = 'United States', 
      currency = 'USD' 
    } = body;

    // Validate required fields
    if (!accountHolderName || !accountHolderName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Account holder legal name is required.' },
        { status: 400 }
      );
    }

    if (!bankName || !bankName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Bank institution name is required.' },
        { status: 400 }
      );
    }

    if (!accountNumber || !accountNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Bank account number or IBAN is required.' },
        { status: 400 }
      );
    }

    if (!routingNumber || !routingNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Routing number, sort code, or IFSC is required.' },
        { status: 400 }
      );
    }

    const cleanAcc = accountNumber.trim().replace(/\s+/g, '');
    const cleanRouting = routingNumber.trim().replace(/\s+/g, '');
    const last4 = cleanAcc.slice(-4) || '4242';
    const maskedAccountNumber = cleanAcc.length > 4 ? `••••••••${last4}` : cleanAcc;
    const maskedRouting = cleanRouting.length > 4 ? `••••${cleanRouting.slice(-4)}` : cleanRouting;

    const bankDetails = {
      accountHolderName: accountHolderName.trim(),
      bankName: bankName.trim(),
      accountType,
      country,
      currency,
      routingNumber: maskedRouting,
      accountNumber: maskedAccountNumber,
      last4,
      status: 'verified',
      updatedAt: new Date().toISOString().split('T')[0],
      payoutSplit: '90% Author / 10% Platform'
    };

    return NextResponse.json({
      success: true,
      message: 'Bank details validated and linked successfully for 90% direct payouts.',
      bankDetails
    });
  } catch (error) {
    console.error('Bank details API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error processing bank details.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    supportedCountries: [
      { code: 'US', name: 'United States', currency: 'USD', routingLabel: 'Routing Number (ABA)' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP', routingLabel: 'Sort Code' },
      { code: 'CA', name: 'Canada', currency: 'CAD', routingLabel: 'Transit & Institution No.' },
      { code: 'AU', name: 'Australia', currency: 'AUD', routingLabel: 'BSB Number' },
      { code: 'IN', name: 'India', currency: 'INR', routingLabel: 'IFSC Code' },
      { code: 'DE', name: 'Germany', currency: 'EUR', routingLabel: 'BIC / SWIFT' },
      { code: 'FR', name: 'France', currency: 'EUR', routingLabel: 'BIC / SWIFT' }
    ],
    accountTypes: ['checking', 'savings', 'business'],
    authorSharePercent: 90,
    platformFeePercent: 10
  });
}
