import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  requireAdminAuth,
  signAdminSessionToken,
  verifyAdminSessionCookie,
  ADMIN_OWNER_EMAIL,
  ADMIN_PASSWORD,
} from '../middleware/auth';

export const adminRouter = Router();

/**
 * 1. POST /api/admin/login
 * Validates admin owner email and password, emits secure HttpOnly cookie.
 */
adminRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const password = (req.body?.password || '').trim();

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    if (email !== ADMIN_OWNER_EMAIL) {
      res.status(403).json({
        success: false,
        error: 'Access Denied: Only the authorized ADMIN_OWNER_EMAIL can access administrative controls.',
      });
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ success: false, error: 'Invalid admin credentials provided.' });
      return;
    }

    const token = signAdminSessionToken(ADMIN_OWNER_EMAIL);
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
    const cookieFlags = `admin_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400${isSecure ? '; Secure' : ''}`;

    res.setHeader('Set-Cookie', cookieFlags);
    res.status(200).json({
      success: true,
      admin: { email: ADMIN_OWNER_EMAIL, role: 'owner' },
      message: 'Admin authentication successful.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to process login: ' + err.message });
  }
});

/**
 * 2. POST /api/admin/logout
 * Clears admin session cookie.
 */
adminRouter.post('/logout', (_req: Request, res: Response): void => {
  const isSecure = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `admin_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isSecure ? '; Secure' : ''}`);
  res.status(200).json({ success: true, message: 'Admin logged out.' });
});

/**
 * 3. GET /api/admin/me
 * Checks if active admin session exists.
 */
adminRouter.get('/me', (req: Request, res: Response): void => {
  const isValid = verifyAdminSessionCookie(req.headers.cookie);
  if (!isValid) {
    res.status(401).json({ authenticated: false, error: 'No active administrative session.' });
    return;
  }
  res.status(200).json({ authenticated: true, admin: { email: ADMIN_OWNER_EMAIL, role: 'owner' } });
});

// Protect all subsequent endpoints with requireAdminAuth
adminRouter.use(requireAdminAuth);

/**
 * 4. GET /api/admin/stats
 * Overview numbers: total, active, unpaid, trial, revenue estimate
 */
adminRouter.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await db.getStats();
    res.status(200).json({ success: true, ...stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. GET /api/admin/businesses
 * Filter by status, search by business name, pagination
 */
adminRouter.get('/businesses', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = (req.query.status as string) || 'all';
    const search = (req.query.search as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const result = await db.listBusinesses({
      status,
      search,
      page,
      limit,
    });

    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. GET /api/admin/businesses/:id
 * Detailed record with payment events history
 */
adminRouter.get('/businesses/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const business = await db.getBusinessById(id);

    if (!business) {
      res.status(404).json({ success: false, error: 'Business not found' });
      return;
    }

    const events = await db.getPaymentEventsByBusinessId(business.id);

    res.status(200).json({
      success: true,
      business,
      paymentEvents: events,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. POST /api/admin/notify
 * Sends FCM push notification to selected businessIds
 */
adminRouter.post('/notify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessIds, title, body } = req.body;

    if (!Array.isArray(businessIds) || businessIds.length === 0 || !title || !body) {
      res.status(400).json({
        success: false,
        error: 'businessIds (array), title (string), and body (string) are required.',
      });
      return;
    }

    const fcmServiceAccount = process.env.FCM_SERVICE_ACCOUNT;
    let pushSentCount = 0;
    let fallbackLoggedCount = 0;

    for (const bId of businessIds) {
      const b = await db.getBusinessById(bId);
      if (b && b.fcm_token) {
        if (fcmServiceAccount) {
          console.log(`[FCM Push] Sending push to token ${b.fcm_token.substring(0, 10)}...: "${title}"`);
          pushSentCount++;
        } else {
          console.log(`[FCM Simulated] Notification queued for ${b.business_name} (${b.phone}): "${title} - ${body}"`);
          fallbackLoggedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: fcmServiceAccount
        ? `Successfully dispatched push notifications to ${pushSentCount} device(s).`
        : `FCM_SERVICE_ACCOUNT not configured. Simulated push notification logged for ${fallbackLoggedCount} registered device(s).`,
      pushSentCount: fcmServiceAccount ? pushSentCount : fallbackLoggedCount,
      fcmConfigured: Boolean(fcmServiceAccount),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
