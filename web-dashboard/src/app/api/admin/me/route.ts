import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'admin_jwt_super_secret_session_key_2026';

function verifyToken(token: string): { email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(encodedPayload).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return NextResponse.json({ authenticated: false, error: 'No active admin session.' }, { status: 401 });
  }

  const session = verifyToken(token);
  const adminOwnerEmail = (process.env.ADMIN_OWNER_EMAIL || 'ssdd747346@gmail.com').trim().toLowerCase();

  if (!session || session.email.toLowerCase() !== adminOwnerEmail) {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid or expired administrative session.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      email: session.email,
      role: session.role,
    },
  });
}
