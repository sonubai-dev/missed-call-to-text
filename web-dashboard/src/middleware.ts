import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'admin_jwt_super_secret_session_key_2026';

/**
 * Web Crypto HMAC-SHA256 signature verification for Edge runtime compatibility.
 */
async function verifyEdgeToken(token: string, ownerEmail: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ADMIN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode base64url signature to Uint8Array
    const binarySig = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      key,
      binarySig,
      encoder.encode(encodedPayload)
    );

    if (!isValidSig) return false;

    const decodedString = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedString);

    if (payload.exp && Date.now() > payload.exp) {
      return false;
    }
    if (payload.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminOwnerEmail = (process.env.ADMIN_OWNER_EMAIL || 'ssdd747346@gmail.com').trim().toLowerCase();
  const sessionCookie = request.cookies.get('admin_session')?.value;

  // 1. If visiting /admin/login while already authenticated, redirect to /admin/dashboard
  if (pathname === '/admin/login') {
    if (sessionCookie && (await verifyEdgeToken(sessionCookie, adminOwnerEmail))) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect all administrative page routes (/admin, /admin/dashboard, /admin/*)
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie || !(await verifyEdgeToken(sessionCookie, adminOwnerEmail))) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect all administrative API routes (/api/admin/* except /api/admin/login)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    if (!sessionCookie || !(await verifyEdgeToken(sessionCookie, adminOwnerEmail))) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized: Active administrative session required.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
