import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host') || '';

  // Canonical redirect: If accessed via default Vercel domains, redirect permanently to official custom domain
  if (
    host.includes('wattpad-sigma.vercel.app') ||
    host.includes('avoralibrary.vercel.app')
  ) {
    const url = request.nextUrl.clone();
    url.host = 'www.avoralibrary.com';
    url.port = '';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, and images
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

