import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, getDbPool } from '../db';
import { requireBusinessAuth, signBusinessJwt, AuthenticatedRequest } from '../middleware/auth';
import { RazorpayService } from '../services/razorpay';

export const apiRouter = Router();

// Validation Schemas
const RegisterSchema = z.object({
  deviceId: z.string().min(6).max(128),
  businessName: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  fcmToken: z.string().optional().nullable(),
});

const VerifySubscriptionSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * 1. POST /api/register
 * Upserts a business by device_id.
 * Initial status: registered_unpaid (or existing preserved).
 * Returns: { businessId, token (JWT), status }
 */
apiRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        error: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
      return;
    }

    const { deviceId, businessName, phone, fcmToken } = parseResult.data;

    const business = await db.upsertBusiness({
      deviceId,
      businessName,
      phone,
      fcmToken,
    });

    const token = signBusinessJwt({
      businessId: business.id,
      deviceId: business.device_id,
    });

    res.status(200).json({
      success: true,
      businessId: business.id,
      token,
      status: business.status,
      businessName: business.business_name,
      phone: business.phone,
    });
  } catch (err: any) {
    console.error('[API Register Error]:', err);
    res.status(500).json({
      success: false,
      errorCode: 'REGISTRATION_FAILED',
      error: err.message || 'Internal registration failure',
    });
  }
});

/**
 * 2. GET /api/status
 * Requires JWT.
 * Returns: { status, validUntil }
 */
apiRouter.get('/status', requireBusinessAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const business = await db.getBusinessById(req.businessId!);
    if (!business) {
      res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        error: 'Business record not found',
      });
      return;
    }

    const now = new Date();
    let currentStatus = business.status;

    // Check if subscription period has expired
    if (business.status === 'active' && business.valid_until && new Date(business.valid_until) < now) {
      currentStatus = 'registered_unpaid';
      await db.updateBusiness(business.id, { status: 'registered_unpaid' });
    }

    res.status(200).json({
      success: true,
      businessId: business.id,
      deviceId: business.device_id,
      businessName: business.business_name,
      phone: business.phone,
      status: currentStatus,
      validUntil: business.valid_until,
      razorpaySubscriptionId: business.razorpay_subscription_id,
    });
  } catch (err: any) {
    console.error('[API Status Error]:', err);
    res.status(500).json({
      success: false,
      errorCode: 'STATUS_CHECK_FAILED',
      error: err.message || 'Failed to retrieve business status',
    });
  }
});

/**
 * 3. POST /api/subscription/create
 * Requires JWT.
 * Creates Razorpay subscription, attaches it to the business, and returns { subscriptionId, keyId }.
 */
apiRouter.post('/subscription/create', requireBusinessAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const business = req.business;
    const subData = await RazorpayService.createSubscription(business.id, business.device_id);

    // Save razorpay_subscription_id in businesses table
    await db.updateBusiness(business.id, {
      razorpay_subscription_id: subData.subscriptionId,
    });

    res.status(200).json({
      success: true,
      subscriptionId: subData.subscriptionId,
      keyId: subData.keyId,
      planId: subData.planId,
      amount: subData.amount,
      currency: subData.currency,
    });
  } catch (err: any) {
    console.error('[API Subscription Create Error]:', err);
    res.status(500).json({
      success: false,
      errorCode: 'SUBSCRIPTION_CREATE_ERROR',
      error: err.message || 'Could not initialize payment subscription',
    });
  }
});

/**
 * 4. POST /api/subscription/verify
 * Verifies HMAC SHA256 of payment_id|subscription_id.
 * Marks business status = active, sets valid_until = +30 days.
 */
apiRouter.post('/subscription/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = VerifySubscriptionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = parseResult.data;

    // Verify cryptographic signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    );

    if (!isValid) {
      res.status(400).json({
        success: false,
        errorCode: 'INVALID_SIGNATURE',
        error: 'Razorpay payment signature verification failed.',
      });
      return;
    }

    // Locate business by subscription id
    let business = await db.getBusinessBySubscriptionId(razorpay_subscription_id);

    // If not linked yet, check deviceId in body if supplied
    if (!business && req.body.deviceId) {
      business = await db.getBusinessByDeviceId(req.body.deviceId);
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    if (business) {
      await db.updateBusiness(business.id, {
        status: 'active',
        razorpay_subscription_id,
        valid_until: validUntil,
      });

      // Log event
      await db.logPaymentEvent(business.id, 'client_verified', {
        paymentId: razorpay_payment_id,
        subscriptionId: razorpay_subscription_id,
        verifiedAt: now.toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      status: 'active',
      validUntil: validUntil.toISOString(),
      message: 'Subscription payment successfully verified! Pro active.',
    });
  } catch (err: any) {
    console.error('[API Subscription Verify Error]:', err);
    res.status(500).json({
      success: false,
      errorCode: 'VERIFICATION_ERROR',
      error: err.message || 'Failed to verify payment',
    });
  }
});

/**
 * 5. POST /api/razorpay/webhook
 * Handled via raw JSON body.
 * Verifies X-Razorpay-Signature with RAZORPAY_WEBHOOK_SECRET.
 * Idempotent and returns 200 quickly.
 */
apiRouter.post('/razorpay/webhook', async (req: Request, res: Response): Promise<void> => {
  // Always acknowledge immediately with 200
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (signature && !RazorpayService.verifyWebhookSignature(rawBody, signature)) {
      console.warn('[Razorpay Webhook Warning] Invalid webhook signature detected.');
      res.status(400).json({ success: false, error: 'Invalid signature' });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = body?.event || 'unknown';
    const payload = body?.payload || {};

    console.log(`[Razorpay Webhook Received]: ${eventType}`);

    const subEntity = payload.subscription?.entity;
    const paymentEntity = payload.payment?.entity;
    const subscriptionId = subEntity?.id || paymentEntity?.subscription_id;

    let businessId: string | null = null;

    if (subscriptionId) {
      const business = await db.getBusinessBySubscriptionId(subscriptionId);
      if (business) {
        businessId = business.id;
        const now = new Date();

        if (eventType === 'subscription.charged' || eventType === 'subscription.activated') {
          const currentEndSec = subEntity?.current_end;
          const validUntil = currentEndSec
            ? new Date(currentEndSec * 1000)
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          await db.updateBusiness(business.id, {
            status: 'active',
            valid_until: validUntil,
          });
        } else if (eventType === 'subscription.halted') {
          await db.updateBusiness(business.id, { status: 'halted' });
        } else if (eventType === 'subscription.cancelled') {
          await db.updateBusiness(business.id, { status: 'cancelled' });
        }
      }
    }

    // Record every webhook event idempotently
    await db.logPaymentEvent(businessId, eventType, body);

    res.status(200).json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook Processing Error]:', err);
    // Still return 200 to prevent Razorpay delivery retries on unrecoverable body parsing
    res.status(200).json({ status: 'received_with_error', error: err.message });
  }
});
