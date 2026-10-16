import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyDeviceToken } from '@/lib/jwt-auth';
import { DeviceRepository } from '@/lib/device-db';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const auth = verifyDeviceToken(authHeader);

    const body = await req.json().catch(() => ({}));
    const paymentId = (body.razorpay_payment_id || '').trim();
    const subscriptionId = (body.razorpay_subscription_id || '').trim();
    const signature = (body.razorpay_signature || '').trim();
    const deviceIdParam = (body.deviceId || '').trim();

    const deviceId = auth.deviceId || deviceIdParam;

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'UNAUTHORIZED',
          error: 'Missing device authorization or deviceId parameter.',
        },
        { status: 401 }
      );
    }

    if (!paymentId || !subscriptionId) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'MISSING_PAYMENT_FIELDS',
          error: 'razorpay_payment_id and razorpay_subscription_id are required.',
        },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Verify HMAC-SHA256 signature when key secret is present
    if (keySecret && !keySecret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${paymentId}|${subscriptionId}`)
        .digest('hex');

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(generatedSignature);

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json(
          {
            success: false,
            errorCode: 'INVALID_SIGNATURE',
            error: 'Payment verification failed: invalid cryptographic signature.',
          },
          { status: 400 }
        );
      }
    } else {
      // In sandbox/test mode without live keys, verify that signature exists or paymentId is valid
      if (!paymentId.startsWith('pay_')) {
        return NextResponse.json(
          {
            success: false,
            errorCode: 'INVALID_PAYMENT_ID',
            error: 'Invalid Razorpay payment identifier format.',
          },
          { status: 400 }
        );
      }
    }

    // Activate subscription for 30 days
    const updated = await DeviceRepository.activateSubscription(deviceId, subscriptionId, paymentId);

    return NextResponse.json({
      success: true,
      status: 'active',
      validUntil: updated.validUntil,
      subscriptionId,
      paymentId,
      message: 'Payment verified successfully! Pro subscription activated for 30 days.',
    });
  } catch (err: any) {
    console.error('Subscription verification failed:', err);
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VERIFICATION_ERROR',
        error: err.message || 'Payment verification processing failed.',
      },
      { status: 500 }
    );
  }
}
