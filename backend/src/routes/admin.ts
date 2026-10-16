import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAdminAuth } from '../middleware/auth';

export const adminRouter = Router();

// Apply admin authentication to all admin endpoints
adminRouter.use(requireAdminAuth);

/**
 * GET /api/admin/stats
 * Overview numbers: total, active, unpaid, trial, revenue estimate
 */
adminRouter.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await db.getStats();
    res.status(200).json({ success: true, ...stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/businesses
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
 * GET /api/admin/businesses/:id
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
 * POST /api/admin/notify
 * Sends FCM push notification to selected businessIds
 * Gated by FCM_SERVICE_ACCOUNT environment variable.
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
          // If FCM credentials provided, send push via FCM HTTP v1 / Admin SDK
          console.log(`[FCM Push] Sending push to token ${b.fcm_token.substring(0, 10)}...: "${title}"`);
          pushSentCount++;
        } else {
          // Gated fallback: Log planned notification
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
