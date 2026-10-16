import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

export interface AuthenticatedRequest extends Request {
  businessId?: string;
  deviceId?: string;
  business?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'misscall_jwt_default_secret_production_key_32bytes';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'misscall_admin_super_secret_master_key_2026';

export function signBusinessJwt(payload: { businessId: string; deviceId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '90d' });
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

  let providedSecret = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedSecret = authHeader.substring(7).trim();
  } else if (typeof adminSecretHeader === 'string') {
    providedSecret = adminSecretHeader.trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    if (match) {
      providedSecret = match[1].trim();
    }
  }

  if (!providedSecret || providedSecret !== ADMIN_SECRET) {
    res.status(401).json({
      success: false,
      errorCode: 'ADMIN_UNAUTHORIZED',
      error: 'Unauthorized: Valid ADMIN_SECRET credential is required.',
    });
    return;
  }

  next();
}
