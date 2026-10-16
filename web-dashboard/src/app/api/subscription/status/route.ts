import { NextResponse } from 'next/server';
import { DeviceRepository } from '@/lib/device-db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = (searchParams.get('deviceId') || '').trim();

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'MISSING_DEVICE_ID',
          error: 'Query parameter deviceId is required.',
        },
        { status: 400 }
      );
    }

    const device = await DeviceRepository.getDevice(deviceId);

    if (!device) {
      return NextResponse.json({
        success: true,
        status: 'none',
        validUntil: 0,
        trialDaysRemaining: 0,
        isTrial: false,
        plan: '₹100/month',
        message: 'Device not registered. Call /api/auth/device to start 3-day free trial.',
      });
    }

    const { status, daysRemaining } = DeviceRepository.computeStatus(device);

    return NextResponse.json({
      success: true,
      deviceId: device.deviceId,
      status,
      validUntil: device.validUntil,
      trialDaysRemaining: daysRemaining,
      isTrial: status === 'trial',
      plan: '₹100/month',
      subscriptionId: device.razorpaySubscriptionId || null,
      message:
        status === 'active'
          ? `Subscription active until ${new Date(device.validUntil).toLocaleDateString()}`
          : status === 'trial'
          ? `3-Day Free Trial active (${daysRemaining} days remaining)`
          : 'Subscription expired. Please renew for ₹100/mo.',
    });
  } catch (err: any) {
    console.error('Status check failed:', err);
    return NextResponse.json(
      {
        success: false,
        errorCode: 'SERVER_ERROR',
        error: err.message || 'Failed to check subscription status.',
      },
      { status: 500 }
    );
  }
}
