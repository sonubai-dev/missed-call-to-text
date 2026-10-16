import fs from 'fs';
import path from 'path';

export interface DeviceRecord {
  deviceId: string;
  status: 'trial' | 'active' | 'expired' | 'none';
  validUntil: number; // Unix timestamp ms
  trialEndsAt: number; // Unix timestamp ms
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  lastPaymentId?: string;
  createdAt: number;
  updatedAt: number;
}

const DB_FILE = path.resolve(process.cwd(), '.data/devices_db.json');

// In-memory cache for fast lookups
const memoryStore = new Map<string, DeviceRecord>();

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadFromFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const records: DeviceRecord[] = JSON.parse(data || '[]');
      records.forEach((r) => memoryStore.set(r.deviceId, r));
    }
  } catch (err) {
    console.error('[DeviceDB] Failed to load local device records:', err);
  }
}

function saveToFile() {
  try {
    ensureDirSync(path.dirname(DB_FILE));
    const records = Array.from(memoryStore.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DeviceDB] Failed to save local device records:', err);
  }
}

// Initial load on startup
loadFromFile();

export class DeviceRepository {
  /**
   * Retrieves a device record or registers a new device with a 3-day free trial.
   */
  static async registerOrGetDevice(deviceId: string): Promise<DeviceRecord> {
    const cleanId = (deviceId || '').trim();
    if (!cleanId) {
      throw new Error('Device ID must not be empty');
    }

    const now = Date.now();
    let record = memoryStore.get(cleanId);

    if (!record) {
      // Create new device with 3-day free trial
      const trialDuration = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
      record = {
        deviceId: cleanId,
        status: 'trial',
        trialEndsAt: now + trialDuration,
        validUntil: now + trialDuration,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.set(cleanId, record);
      saveToFile();
      return record;
    }

    // Refresh dynamic status based on time
    const updated = this.computeStatus(record);
    if (updated.status !== record.status) {
      record = { ...record, status: updated.status, updatedAt: now };
      memoryStore.set(cleanId, record);
      saveToFile();
    }

    return record;
  }

  /**
   * Gets current device status.
   */
  static async getDevice(deviceId: string): Promise<DeviceRecord | null> {
    const cleanId = (deviceId || '').trim();
    if (!cleanId) return null;

    let record = memoryStore.get(cleanId);
    if (!record) return null;

    const computed = this.computeStatus(record);
    if (computed.status !== record.status) {
      record = { ...record, status: computed.status, updatedAt: Date.now() };
      memoryStore.set(cleanId, record);
      saveToFile();
    }

    return record;
  }

  /**
   * Updates device subscription entitlement after payment.
   */
  static async activateSubscription(
    deviceId: string,
    subscriptionId: string,
    paymentId?: string,
    validDurationMs = 30 * 24 * 60 * 60 * 1000 // 30 days
  ): Promise<DeviceRecord> {
    const device = await this.registerOrGetDevice(deviceId);
    const now = Date.now();

    device.status = 'active';
    device.razorpaySubscriptionId = subscriptionId;
    if (paymentId) device.lastPaymentId = paymentId;
    device.validUntil = Math.max(device.validUntil, now) + validDurationMs;
    device.updatedAt = now;

    memoryStore.set(device.deviceId, device);
    saveToFile();
    return device;
  }

  /**
   * Updates device status by subscription ID (for webhooks).
   */
  static async updateBySubscriptionId(
    subId: string,
    status: 'active' | 'expired',
    validUntil?: number
  ): Promise<DeviceRecord | null> {
    for (const record of memoryStore.values()) {
      if (record.razorpaySubscriptionId === subId) {
        record.status = status;
        if (validUntil) record.validUntil = validUntil;
        record.updatedAt = Date.now();
        memoryStore.set(record.deviceId, record);
        saveToFile();
        return record;
      }
    }
    return null;
  }

  /**
   * Helper to evaluate current status based on timestamps.
   */
  static computeStatus(record: DeviceRecord): { status: 'trial' | 'active' | 'expired' | 'none'; daysRemaining: number } {
    const now = Date.now();

    if (record.status === 'active') {
      if (record.validUntil > now) {
        const days = Math.ceil((record.validUntil - now) / (24 * 60 * 60 * 1000));
        return { status: 'active', daysRemaining: Math.max(0, days) };
      }
      return { status: 'expired', daysRemaining: 0 };
    }

    if (record.status === 'trial') {
      if (record.trialEndsAt > now) {
        const days = Math.ceil((record.trialEndsAt - now) / (24 * 60 * 60 * 1000));
        return { status: 'trial', daysRemaining: Math.max(1, days) };
      }
      return { status: 'expired', daysRemaining: 0 };
    }

    return { status: record.status, daysRemaining: 0 };
  }
}
