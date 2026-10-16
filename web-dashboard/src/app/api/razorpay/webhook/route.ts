import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { DeviceRepository } from '@/lib/device-db';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature if secret configured
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSig);

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature.' },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody || '{}');
    const eventType = event.event || '';
    const payload = event.payload || {};

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    // Handle subscription lifecycle events
    if (eventType === 'subscription.charged' || eventType === 'subscription.activated') {
      const sub = payload.subscription?.entity || {};
      const subId = sub.id || '';
      const currentEnd = sub.current_end ? sub.current_end * 1000 : Date.now() + 30 * 86400 * 1000;
      const paymentId = payload.payment?.entity?.id;

      if (subId) {
        await DeviceRepository.updateBySubscriptionId(subId, 'active', currentEnd);
      }
    } else if (eventType === 'subscription.halted' || eventType === 'subscription.cancelled') {
      const sub = payload.subscription?.entity || {};
      const subId = sub.id || '';
      if (subId) {
        await DeviceRepository.updateBySubscriptionId(subId, 'expired', Date.now());
      }
    } else if (eventType === 'payment.failed') {
      console.warn('[Razorpay Webhook] Payment failed for transaction:', payload.payment?.entity?.id);
    }

    return NextResponse.json({ status: 'ok', received: true, event: eventType });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Webhook internal error.' },
      { status: 500 }
    );
  }
}
