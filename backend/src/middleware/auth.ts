import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';

export interface AuthenticatedRequest extends Request {
  businessId?: string;
  deviceId?: string;
  business?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'misscall_jwt_default_secret_production_key_32bytes';
export const ADMIN_SECRET = process.env.ADMIN_SECRET || 'misscall_admin_super_secret_master_key_2026';
export const ADMIN_OWNER_EMAIL = (process.env.ADMIN_OWNER_EMAIL || 'ssdd747346@gmail.com').trim().toLowerCase();
export const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'admin_misscall_secret_2026').trim();
export const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || ADMIN_SECRET;

// Defensive check: Alert if default administrative secrets are detected in production
if (process.env.NODE_ENV === 'production') {
  if (
    ADMIN_SECRET === 'misscall_admin_super_secret_master_key_2026' ||
    ADMIN_PASSWORD === 'admin_misscall_secret_2026' ||
    JWT_SECRET === 'misscall_jwt_default_secret_production_key_32bytes'
  ) {
    console.error(
      '[SECURITY ALERT] Default production secrets detected! Please set JWT_SECRET, ADMIN_SECRET, and ADMIN_PASSWORD in your environment variables.'
    );
  }
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
export function safeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signBusinessJwt(payload: { businessId: string; deviceId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '90d' });
}

export function signAdminSessionToken(email: string): string {
  const payload = JSON.stringify({
    email: email.toLowerCase(),
    role: 'owner',
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  if (!match) return false;
  const token = match[1].trim();

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(encodedPayload).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (!payload.email || payload.email.toLowerCase() !== ADMIN_OWNER_EMAIL) {
      return false;
    }
    if (payload.exp && Date.now() > payload.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function requireBusinessAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      errorCode: 'UNAUTHORIZED',
      error: 'Missing or invalid Authorization header. Bearer token required.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      businessId: string;
      deviceId: string;
    };

    if (!decoded.businessId) {
      res.status(401).json({
        success: false,
        errorCode: 'INVALID_TOKEN',
        error: 'Token payload missing businessId claim.',
      });
      return;
    }

    const business = await db.getBusinessById(decoded.businessId);
    if (!business) {
      res.status(401).json({
        success: false,
        errorCode: 'BUSINESS_NOT_FOUND',
        error: 'The registered business associated with this token was not found.',
      });
      return;
    }

    req.businessId = decoded.businessId;
    req.deviceId = decoded.deviceId;
    req.business = business;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      errorCode: 'TOKEN_EXPIRED_OR_INVALID',
      error: 'JWT verification failed: ' + (err.message || 'Invalid signature'),
    });
  }
}

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const adminSecretHeader = req.headers['x-admin-secret'];
  const cookieHeader = req.headers.cookie;

  // 1. Check Bearer / Header secret with constant-time equality check
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const provided = authHeader.substring(7).trim();
    if (safeEqualStrings(provided, ADMIN_SECRET)) {
      return next();
    }
  }

  if (typeof adminSecretHeader === 'string' && safeEqualStrings(adminSecretHeader.trim(), ADMIN_SECRET)) {
    return next();
  }

  // 2. Check signed HttpOnly cookie
  if (verifyAdminSessionCookie(cookieHeader)) {
    return next();
  }

  res.status(401).json({
    success: false,
    errorCode: 'ADMIN_UNAUTHORIZED',
    error: 'Unauthorized: Valid administrative session or ADMIN_SECRET required.',
  });
}
