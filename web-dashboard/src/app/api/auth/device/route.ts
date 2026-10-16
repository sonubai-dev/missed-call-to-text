import { NextResponse } from 'next/server';
import { DeviceRepository } from '@/lib/device-db';
import { signDeviceToken } from '@/lib/jwt-auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const deviceId = (body.deviceId || '').trim();

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'INVALID_DEVICE_ID',
          error: 'Parameter deviceId is required (UUID or unique hardware identifier).',
        },
        { status: 400 }
      );
    }

    // Ensure valid string length
    if (deviceId.length < 8 || deviceId.length > 128) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'MALFORMED_DEVICE_ID',
          error: 'deviceId must be between 8 and 128 characters.',
        },
        { status: 400 }
      );
    }

    // Register or retrieve device with 3-day trial tracking
    const record = await DeviceRepository.registerOrGetDevice(deviceId);
    const { status, daysRemaining } = DeviceRepository.computeStatus(record);

    // Issue short-lived device JWT
    const token = signDeviceToken(record.deviceId);

    return NextResponse.json({
      success: true,
      token,
      deviceId: record.deviceId,
      status,
      validUntil: record.validUntil,
      trialDaysRemaining: daysRemaining,
      plan: '₹100/month',
      message:
        status === 'trial'
          ? `3-Day Free Trial active (${daysRemaining} days remaining)`
          : status === 'active'
          ? 'Pro Subscription active'
          : 'Subscription expired. Please subscribe for ₹100/mo.',
    });
  } catch (err: any) {
    console.error('Device auth failed:', err);
    return NextResponse.json(
      {
        success: false,
        errorCode: 'SERVER_ERROR',
        error: err.message || 'Failed to authenticate device.',
      },
      { status: 500 }
    );
  }
}
