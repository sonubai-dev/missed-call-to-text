import { Pool } from 'pg';
import crypto from 'crypto';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (pool) return pool;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn('[Database] DATABASE_URL is not set. Operating in local in-memory fallback mode.');
    return null;
  }

  pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('[Database Pool Error]:', err);
  });

  return pool;
}

// In-memory fallback store when PostgreSQL DATABASE_URL is not attached yet
interface MemoryBusiness {
  id: string;
  device_id: string;
  business_name: string;
  phone: string;
  fcm_token: string | null;
  status: 'registered_unpaid' | 'trial' | 'active' | 'halted' | 'cancelled';
  razorpay_subscription_id: string | null;
  valid_until: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface MemoryPaymentEvent {
  id: string;
  business_id: string | null;
  event_type: string;
  payload: any;
  created_at: Date;
}

const memoryBusinesses = new Map<string, MemoryBusiness>();
const memoryPaymentEvents: MemoryPaymentEvent[] = [];

/**
 * Initializes the PostgreSQL schema and runs idempotent migrations.
 */
export async function initializeDatabase(): Promise<void> {
  const p = getDbPool();
  if (!p) {
    console.log('[Database] Initialized memory fallback database tables.');
    return;
  }

  const client = await p.connect();
  try {
    console.log('[Database] Connected to PostgreSQL. Verifying tables and schema...');
    
    // 1. Enable pgcrypto for UUID generation if needed
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 2. Table: businesses
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id VARCHAR(255) UNIQUE NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        fcm_token TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'registered_unpaid',
        razorpay_subscription_id VARCHAR(255),
        valid_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes on businesses
    await client.query(`CREATE INDEX IF NOT EXISTS idx_businesses_device_id ON businesses(device_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_businesses_sub_id ON businesses(razorpay_subscription_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);`);

    // 3. Table: payment_events
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Index on payment_events
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_events_business_id ON payment_events(business_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_events_type ON payment_events(event_type);`);

    console.log('[Database] Schema migrations applied successfully: businesses, payment_events');
  } catch (err) {
    console.error('[Database Migration Failed]:', err);
    throw err;
  } finally {
    client.release();
  }
}

export const db = {
  /**
   * Upserts a business by device_id.
   * If new, sets status = 'registered_unpaid'. If exists, updates info and preserves status.
   */
  async upsertBusiness(data: {
    deviceId: string;
    businessName: string;
    phone: string;
    fcmToken?: string | null;
  }) {
    const p = getDbPool();
    if (p) {
      const query = `
        INSERT INTO businesses (device_id, business_name, phone, fcm_token, status, updated_at)
        VALUES ($1, $2, $3, $4, 'registered_unpaid', NOW())
        ON CONFLICT (device_id) DO UPDATE
        SET business_name = EXCLUDED.business_name,
            phone = EXCLUDED.phone,
            fcm_token = COALESCE(EXCLUDED.fcm_token, businesses.fcm_token),
            updated_at = NOW()
        RETURNING *;
      `;
      const res = await p.query(query, [
        data.deviceId,
        data.businessName,
        data.phone,
        data.fcmToken || null,
      ]);
      return res.rows[0];
    } else {
      let b = memoryBusinesses.get(data.deviceId);
      const now = new Date();
      if (!b) {
        b = {
          id: crypto.randomUUID(),
          device_id: data.deviceId,
          business_name: data.businessName,
          phone: data.phone,
          fcm_token: data.fcmToken || null,
          status: 'registered_unpaid',
          razorpay_subscription_id: null,
          valid_until: null,
          created_at: now,
          updated_at: now,
        };
        memoryBusinesses.set(data.deviceId, b);
      } else {
        b.business_name = data.businessName;
        b.phone = data.phone;
        if (data.fcmToken) b.fcm_token = data.fcmToken;
        b.updated_at = now;
      }
      return b;
    }
  },

  async getBusinessById(id: string) {
    const p = getDbPool();
    if (p) {
      const res = await p.query('SELECT * FROM businesses WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      for (const b of memoryBusinesses.values()) {
        if (b.id === id) return b;
      }
      return null;
    }
  },

  async getBusinessByDeviceId(deviceId: string) {
    const p = getDbPool();
    if (p) {
      const res = await p.query('SELECT * FROM businesses WHERE device_id = $1', [deviceId]);
      return res.rows[0] || null;
    } else {
      return memoryBusinesses.get(deviceId) || null;
    }
  },

  async getBusinessBySubscriptionId(subId: string) {
    const p = getDbPool();
    if (p) {
      const res = await p.query('SELECT * FROM businesses WHERE razorpay_subscription_id = $1', [subId]);
      return res.rows[0] || null;
    } else {
      for (const b of memoryBusinesses.values()) {
        if (b.razorpay_subscription_id === subId) return b;
      }
      return null;
    }
  },

  async updateBusiness(
    id: string,
    updates: {
      status?: 'registered_unpaid' | 'trial' | 'active' | 'halted' | 'cancelled';
      razorpay_subscription_id?: string | null;
      valid_until?: Date | null;
      business_name?: string;
      phone?: string;
      fcm_token?: string | null;
    }
  ) {
    const p = getDbPool();
    if (p) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) {
          fields.push(`${key} = $${idx}`);
          values.push(val);
          idx++;
        }
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE businesses
        SET ${fields.join(', ')}
        WHERE id = $${idx}
        RETURNING *;
      `;
      const res = await p.query(query, values);
      return res.rows[0];
    } else {
      const b = await this.getBusinessById(id);
      if (b) {
        Object.assign(b, updates, { updated_at: new Date() });
      }
      return b;
    }
  },

  async logPaymentEvent(businessId: string | null, eventType: string, payload: any) {
    const p = getDbPool();
    if (p) {
      const query = `
        INSERT INTO payment_events (business_id, event_type, payload, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
      `;
      const res = await p.query(query, [businessId, eventType, JSON.stringify(payload)]);
      return res.rows[0];
    } else {
      const ev: MemoryPaymentEvent = {
        id: crypto.randomUUID(),
        business_id: businessId,
        event_type: eventType,
        payload,
        created_at: new Date(),
      };
      memoryPaymentEvents.unshift(ev);
      return ev;
    }
  },

  async getPaymentEventsByBusinessId(businessId: string) {
    const p = getDbPool();
    if (p) {
      const query = `
        SELECT * FROM payment_events
        WHERE business_id = $1
        ORDER BY created_at DESC
        LIMIT 50;
      `;
      const res = await p.query(query, [businessId]);
      return res.rows;
    } else {
      return memoryPaymentEvents.filter((e) => e.business_id === businessId);
    }
  },

  async listBusinesses(filter: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const offset = (page - 1) * limit;

    const p = getDbPool();
    if (p) {
      const conditions: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (filter.status && filter.status !== 'all') {
        conditions.push(`status = $${idx}`);
        values.push(filter.status);
        idx++;
      }

      if (filter.search && filter.search.trim()) {
        conditions.push(`(business_name ILIKE $${idx} OR phone ILIKE $${idx} OR device_id ILIKE $${idx})`);
        values.push(`%${filter.search.trim()}%`);
        idx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countRes = await p.query(`SELECT COUNT(*) FROM businesses ${whereClause}`, values);
      const total = parseInt(countRes.rows[0].count, 10);

      values.push(limit, offset);
      const dataQuery = `
        SELECT * FROM businesses
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `;
      const res = await p.query(dataQuery, values);

      return {
        data: res.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      let list = Array.from(memoryBusinesses.values());
      if (filter.status && filter.status !== 'all') {
        list = list.filter((b) => b.status === filter.status);
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase();
        list = list.filter(
          (b) =>
            b.business_name.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.device_id.includes(q)
        );
      }
      const total = list.length;
      list.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      const paginated = list.slice(offset, offset + limit);
      return {
        data: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  },

  async getStats() {
    const p = getDbPool();
    if (p) {
      const totalRes = await p.query(`SELECT COUNT(*) FROM businesses`);
      const activeRes = await p.query(`SELECT COUNT(*) FROM businesses WHERE status = 'active'`);
      const unpaidRes = await p.query(`SELECT COUNT(*) FROM businesses WHERE status = 'registered_unpaid'`);
      const trialRes = await p.query(`SELECT COUNT(*) FROM businesses WHERE status = 'trial'`);
      const haltedRes = await p.query(`SELECT COUNT(*) FROM businesses WHERE status = 'halted' OR status = 'cancelled'`);

      const total = parseInt(totalRes.rows[0].count, 10);
      const active = parseInt(activeRes.rows[0].count, 10);
      const unpaid = parseInt(unpaidRes.rows[0].count, 10);
      const trial = parseInt(trialRes.rows[0].count, 10);
      const halted = parseInt(haltedRes.rows[0].count, 10);

      // Revenue estimate: Active * ₹100/mo
      const estimatedMonthlyRevenue = active * 100;

      return {
        totalBusinesses: total,
        activeSubscribers: active,
        registeredUnpaid: unpaid,
        trialUsers: trial,
        haltedOrCancelled: halted,
        estimatedMonthlyRevenue,
        currency: 'INR',
      };
    } else {
      let total = 0,
        active = 0,
        unpaid = 0,
        trial = 0,
        halted = 0;
      for (const b of memoryBusinesses.values()) {
        total++;
        if (b.status === 'active') active++;
        else if (b.status === 'registered_unpaid') unpaid++;
        else if (b.status === 'trial') trial++;
        else if (b.status === 'halted' || b.status === 'cancelled') halted++;
      }
      return {
        totalBusinesses: total,
        activeSubscribers: active,
        registeredUnpaid: unpaid,
        trialUsers: trial,
        haltedOrCancelled: halted,
        estimatedMonthlyRevenue: active * 100,
        currency: 'INR',
      };
    }
  },
};
