import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'misscall_device_jwt_secret_key_2026_production';

export interface DeviceTokenPayload {
  deviceId: string;
  role: 'device';
  exp: number; // Unix timestamp seconds
  iat: number;
}

export function signDeviceToken(deviceId: string, expirySeconds = 86400): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload: DeviceTokenPayload = {
    deviceId: deviceId.trim(),
    role: 'device',
    iat: now,
    exp: now + expirySeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${encodedPayload}`)
    .digest('base64url');

  return `${header}.${encodedPayload}.${signature}`;
}

export function verifyDeviceToken(authHeader: string | null | undefined): { valid: boolean; deviceId?: string; error?: string } {
  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' };
  }

  const parts = authHeader.trim().split(' ');
  const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];

  if (!token) {
    return { valid: false, error: 'Malformed Authorization token' };
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    return { valid: false, error: 'Invalid JWT structure' };
  }

  const [header, payload, signature] = segments;

  try {
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Invalid token cryptographic signature' };
    }

    const decoded: DeviceTokenPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp < now) {
      return { valid: false, error: 'Device token has expired' };
    }

    if (!decoded.deviceId) {
      return { valid: false, error: 'Token missing deviceId claim' };
    }

    return { valid: true, deviceId: decoded.deviceId };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification failed' };
  }
}
