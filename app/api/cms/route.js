import { NextResponse } from 'next/server';
import { getCmsConfigFromDb, saveCmsConfigToDb } from '@/lib/db';
import { initialCmsConfig } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbConfig = await getCmsConfigFromDb();

    // Response with strict no-cache headers so browsers and CDNs immediately receive updated logos & pages
    const response = NextResponse.json({
      success: true,
      cmsConfig: dbConfig || null
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching CMS config from database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve CMS configuration.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const incomingConfig = body.cmsConfig || body;

    if (!incomingConfig || typeof incomingConfig !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid CMS configuration payload.' },
        { status: 400 }
      );
    }

    const saved = await saveCmsConfigToDb(incomingConfig);

    const response = NextResponse.json({
      success: true,
      message: 'CMS configuration successfully persisted to server database.',
      cmsConfig: saved.cmsConfig
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    console.error('Error persisting CMS config to database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save CMS configuration.' },
      { status: 500 }
    );
  }
}

