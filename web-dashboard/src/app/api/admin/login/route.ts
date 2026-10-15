import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'admin_jwt_super_secret_session_key_2026';

function signToken(email: string): string {
  const payload = JSON.stringify({
    email,
    role: 'admin',
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const adminOwnerEmail = (process.env.ADMIN_OWNER_EMAIL || 'ssdd747346@gmail.com').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin_misscall_secret_2026').trim();

    // 1. Strict Owner Email Authorization
    if (email.trim().toLowerCase() !== adminOwnerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: This account is not authorized as an administrative owner.',
        },
        { status: 403 }
      );
    }

    // 2. Password Verification
    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials provided.' },
        { status: 401 }
      );
    }

    // 3. Create Session Token
    const sessionToken = signToken(adminOwnerEmail);

    const response = NextResponse.json({
      success: true,
      admin: {
        email: adminOwnerEmail,
        role: 'owner',
        authenticatedAt: new Date().toISOString(),
      },
      message: 'Admin authentication successful.',
    });

    // 4. Set HttpOnly, Secure Session Cookie
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 1 day
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error processing admin login.' },
      { status: 500 }
    );
  }
}
