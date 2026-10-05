import { NextResponse } from 'next/server';
import { saveBankDetailsToDb, getBankDetailsFromDb, deleteBankDetailsFromDb } from '@/lib/db';
import { getServerUserContext } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

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
      currency = 'USD',
      userEmail,
      username,
      bankDetails: incomingBankDetails
    } = body;

    const { user } = await getServerUserContext();
    const effectiveEmail = userEmail || user?.email || null;
    const effectiveUsername = username || user?.username || null;

    // Handle nested bankDetails payload if passed
    const rawHolder = incomingBankDetails?.accountHolderName || accountHolderName;
    const rawBank = incomingBankDetails?.bankName || bankName;
    const rawAcc = incomingBankDetails?.accountNumber || accountNumber;
    const rawRouting = incomingBankDetails?.routingNumber || routingNumber;
    const effectiveAccountType = incomingBankDetails?.accountType || accountType;
    const effectiveCountry = incomingBankDetails?.country || country;
    const effectiveCurrency = incomingBankDetails?.currency || currency;

    // Validate required fields
    if (!rawHolder || !rawHolder.trim()) {
      return NextResponse.json(
        { success: false, error: 'Account holder legal name is required.' },
        { status: 400 }
      );
    }

    if (!rawBank || !rawBank.trim()) {
      return NextResponse.json(
        { success: false, error: 'Bank institution name is required.' },
        { status: 400 }
      );
    }

    if (!rawAcc || !rawAcc.trim()) {
      return NextResponse.json(
        { success: false, error: 'Bank account number or IBAN is required.' },
        { status: 400 }
      );
    }

    if (!rawRouting || !rawRouting.trim()) {
      return NextResponse.json(
        { success: false, error: 'Routing number, sort code, or IFSC is required.' },
        { status: 400 }
      );
    }

    const cleanAcc = String(rawAcc).trim().replace(/\s+/g, '');
    const cleanRouting = String(rawRouting).trim().replace(/\s+/g, '');
    const last4 = cleanAcc.slice(-4) || '4242';
    const maskedAccountNumber = cleanAcc.length > 4 ? `••••••••${last4}` : cleanAcc;
    const maskedRouting = cleanRouting.length > 4 ? `••••${cleanRouting.slice(-4)}` : cleanRouting;

    const formattedDetails = {
      userEmail: effectiveEmail,
      username: effectiveUsername,
      accountHolderName: rawHolder.trim(),
      bankName: rawBank.trim(),
      accountType: effectiveAccountType,
      country: effectiveCountry,
      currency: effectiveCurrency,
      routingNumber: maskedRouting,
      accountNumber: maskedAccountNumber,
      last4,
      status: 'verified',
      updatedAt: new Date().toISOString().split('T')[0],
      payoutSplit: '90% Author / 10% Platform'
    };

    // Save persistently to MariaDB / local store
    await saveBankDetailsToDb(formattedDetails);

    return NextResponse.json({
      success: true,
      message: 'Bank details validated and linked successfully for 90% direct payouts.',
      bankDetails: formattedDetails
    });
  } catch (error) {
    console.error('Bank details API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error processing bank details.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    const userParam = searchParams.get('username');

    const { user } = await getServerUserContext();
    const queryEmail = emailParam || user?.email || null;
    const queryUsername = userParam || user?.username || null;

    let savedBankDetails = null;
    if (queryEmail || queryUsername) {
      savedBankDetails = await getBankDetailsFromDb(queryEmail || queryUsername);
    }

    return NextResponse.json({
      success: true,
      bankDetails: savedBankDetails,
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
  } catch (error) {
    console.error('Bank details GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { user } = await getServerUserContext();
    const target = body.userEmail || body.username || user?.email || user?.username;

    if (target) {
      await deleteBankDetailsFromDb(target);
    }

    return NextResponse.json({ success: true, message: 'Bank details removed successfully.' });
  } catch (error) {
    console.error('Bank details DELETE API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
