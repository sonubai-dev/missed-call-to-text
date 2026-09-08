"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repository = exports.Repository = void 0;
const pool_1 = require("./pool");
const crypto_1 = __importDefault(require("crypto"));
class Repository {
    // In-Memory Fallback State (when Postgres is not connected or in tests)
    users = [];
    businesses = [];
    calls = [];
    followups = [];
    messages = [];
    webhookEvents = [];
    // ================= USERS =================
    async createUser(email, passwordHash) {
        const pool = (0, pool_1.getDbPool)();
        const id = crypto_1.default.randomUUID();
        const now = new Date();
        if (pool) {
            const res = await pool.query(`INSERT INTO users (id, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id, email, passwordHash, now, now]);
            return res.rows[0];
        }
        const user = {
            id,
            email,
            password_hash: passwordHash,
            created_at: now,
            updated_at: now,
        };
        this.users.push(user);
        return user;
    }
    async findUserByEmail(email) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
            return res.rows[0] || null;
        }
        return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    async findUserById(id) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
            return res.rows[0] || null;
        }
        return this.users.find((u) => u.id === id) || null;
    }
    // ================= BUSINESSES =================
    async createBusiness(userId, data) {
        const pool = (0, pool_1.getDbPool)();
        const id = crypto_1.default.randomUUID();
        const now = new Date();
        const webhookSecret = `whsec_${crypto_1.default.randomBytes(16).toString("hex")}`;
        const biz = {
            id,
            user_id: userId,
            name: data?.name || "My Business",
            owner_name: data?.owner_name || "Business Owner",
            category: data?.category || "General Support",
            country_code: data?.country_code || "91",
            is_auto_reply_enabled: data?.is_auto_reply_enabled ?? false,
            auto_reply_delay_minutes: data?.auto_reply_delay_minutes ?? 1,
            whatsapp_mode: data?.whatsapp_mode || "MANUAL",
            whatsapp_phone_id: data?.whatsapp_phone_id,
            encrypted_whatsapp_token: data?.encrypted_whatsapp_token,
            webhook_secret: webhookSecret,
            created_at: now,
            updated_at: now,
        };
        if (pool) {
            const res = await pool.query(`INSERT INTO businesses (
          id, user_id, name, owner_name, category, country_code,
          is_auto_reply_enabled, auto_reply_delay_minutes, whatsapp_mode,
          whatsapp_phone_id, encrypted_whatsapp_token, webhook_secret, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`, [
                biz.id,
                biz.user_id,
                biz.name,
                biz.owner_name,
                biz.category,
                biz.country_code,
                biz.is_auto_reply_enabled,
                biz.auto_reply_delay_minutes,
                biz.whatsapp_mode,
                biz.whatsapp_phone_id,
                biz.encrypted_whatsapp_token,
                biz.webhook_secret,
                biz.created_at,
                biz.updated_at,
            ]);
            return res.rows[0];
        }
        this.businesses.push(biz);
        return biz;
    }
    async getBusinessByUserId(userId) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM businesses WHERE user_id = $1`, [userId]);
            return res.rows[0] || null;
        }
        return this.businesses.find((b) => b.user_id === userId) || null;
    }
    async updateBusiness(id, data) {
        const pool = (0, pool_1.getDbPool)();
        const now = new Date();
        if (pool) {
            const fields = [];
            const values = [];
            let idx = 1;
            for (const [key, val] of Object.entries(data)) {
                if (key !== "id" && key !== "user_id" && key !== "created_at") {
                    fields.push(`${key} = $${idx++}`);
                    values.push(val);
                }
            }
            fields.push(`updated_at = $${idx++}`);
            values.push(now);
            values.push(id);
            const res = await pool.query(`UPDATE businesses SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`, values);
            return res.rows[0] || null;
        }
        const biz = this.businesses.find((b) => b.id === id);
        if (!biz)
            return null;
        Object.assign(biz, data, { updated_at: now });
        return biz;
    }
    // ================= CALLS =================
    async createCall(data) {
        const pool = (0, pool_1.getDbPool)();
        const id = crypto_1.default.randomUUID();
        const now = new Date();
        const call = {
            id,
            ...data,
            created_at: now,
            updated_at: now,
        };
        if (pool) {
            const res = await pool.query(`INSERT INTO calls (id, business_id, phone_number, customer_name, call_direction, call_status, duration_seconds, timestamp, source, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [
                call.id,
                call.business_id,
                call.phone_number,
                call.customer_name,
                call.call_direction,
                call.call_status,
                call.duration_seconds,
                call.timestamp,
                call.source,
                call.created_at,
                call.updated_at,
            ]);
            return res.rows[0];
        }
        this.calls.unshift(call);
        return call;
    }
    async getCallsByBusinessId(businessId) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM calls WHERE business_id = $1 ORDER BY timestamp DESC`, [businessId]);
            return res.rows;
        }
        return this.calls
            .filter((c) => c.business_id === businessId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    async getCallById(id) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM calls WHERE id = $1`, [id]);
            return res.rows[0] || null;
        }
        return this.calls.find((c) => c.id === id) || null;
    }
    // ================= FOLLOW-UPS =================
    async createFollowUp(data) {
        const pool = (0, pool_1.getDbPool)();
        const id = crypto_1.default.randomUUID();
        const now = new Date();
        const followup = {
            id,
            ...data,
            created_at: now,
            updated_at: now,
        };
        if (pool) {
            const res = await pool.query(`INSERT INTO followups (id, call_id, business_id, phone_number, suggested_message, status, delay_seconds, scheduled_at, sent_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [
                followup.id,
                followup.call_id,
                followup.business_id,
                followup.phone_number,
                followup.suggested_message,
                followup.status,
                followup.delay_seconds,
                followup.scheduled_at,
                followup.sent_at,
                followup.created_at,
                followup.updated_at,
            ]);
            return res.rows[0];
        }
        this.followups.unshift(followup);
        return followup;
    }
    async getFollowUpsByBusinessId(businessId) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM followups WHERE business_id = $1 ORDER BY created_at DESC`, [businessId]);
            return res.rows;
        }
        return this.followups
            .filter((f) => f.business_id === businessId)
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }
    async updateFollowUpStatus(id, status, sentAt) {
        const pool = (0, pool_1.getDbPool)();
        const now = new Date();
        if (pool) {
            await pool.query(`UPDATE followups SET status = $1, sent_at = $2, updated_at = $3 WHERE id = $4`, [status, sentAt || (status === "SENT" ? now : null), now, id]);
            return;
        }
        const item = this.followups.find((f) => f.id === id);
        if (item) {
            item.status = status;
            if (sentAt)
                item.sent_at = sentAt;
            else if (status === "SENT")
                item.sent_at = now;
            item.updated_at = now;
        }
    }
    // ================= MESSAGES =================
    async createMessage(data) {
        const pool = (0, pool_1.getDbPool)();
        const id = crypto_1.default.randomUUID();
        const now = new Date();
        const msg = {
            id,
            ...data,
            created_at: now,
        };
        if (pool) {
            const res = await pool.query(`INSERT INTO messages (id, business_id, followup_id, phone_number, customer_name, content, mode, status, error_message, sent_at, delivered_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`, [
                msg.id,
                msg.business_id,
                msg.followup_id,
                msg.phone_number,
                msg.customer_name,
                msg.content,
                msg.mode,
                msg.status,
                msg.error_message,
                msg.sent_at,
                msg.delivered_at,
                msg.created_at,
            ]);
            return res.rows[0];
        }
        this.messages.unshift(msg);
        return msg;
    }
    async getMessagesByBusinessId(businessId) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM messages WHERE business_id = $1 ORDER BY created_at DESC`, [businessId]);
            return res.rows;
        }
        return this.messages
            .filter((m) => m.business_id === businessId)
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }
    async updateMessageStatus(id, status, errorMessage) {
        const pool = (0, pool_1.getDbPool)();
        const now = new Date();
        if (pool) {
            await pool.query(`UPDATE messages SET status = $1, error_message = $2,
         sent_at = CASE WHEN $1 = 'SENT' THEN $3 ELSE sent_at END,
         delivered_at = CASE WHEN $1 = 'DELIVERED' THEN $3 ELSE delivered_at END
         WHERE id = $4`, [status, errorMessage || null, now, id]);
            return;
        }
        const msg = this.messages.find((m) => m.id === id);
        if (msg) {
            msg.status = status;
            if (errorMessage)
                msg.error_message = errorMessage;
            if (status === "SENT")
                msg.sent_at = now;
            if (status === "DELIVERED")
                msg.delivered_at = now;
        }
    }
    // ================= WEBHOOK EVENTS =================
    async recordWebhookEvent(data) {
        const pool = (0, pool_1.getDbPool)();
        const now = new Date();
        const record = {
            id: data.id,
            provider: data.provider,
            event_type: data.event_type,
            payload_hash: data.payload_hash,
            idempotency_key: data.idempotency_key,
            received_at: now,
            status: "PENDING",
            raw_payload: data.raw_payload,
        };
        if (pool) {
            const res = await pool.query(`INSERT INTO webhook_events (id, provider, event_type, payload_hash, idempotency_key, received_at, status, raw_payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
                record.id,
                record.provider,
                record.event_type,
                record.payload_hash,
                record.idempotency_key,
                record.received_at,
                record.status,
                JSON.stringify(record.raw_payload),
            ]);
            return res.rows[0];
        }
        this.webhookEvents.unshift(record);
        return record;
    }
    async findWebhookEventByIdempotencyKey(key) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM webhook_events WHERE idempotency_key = $1`, [key]);
            return res.rows[0] || null;
        }
        return this.webhookEvents.find((e) => e.idempotency_key === key) || null;
    }
    async findWebhookEventByHash(hash) {
        const pool = (0, pool_1.getDbPool)();
        if (pool) {
            const res = await pool.query(`SELECT * FROM webhook_events WHERE payload_hash = $1`, [hash]);
            return res.rows[0] || null;
        }
        return this.webhookEvents.find((e) => e.payload_hash === hash) || null;
    }
    async updateWebhookEventStatus(id, status, errorMessage) {
        const pool = (0, pool_1.getDbPool)();
        const now = new Date();
        if (pool) {
            await pool.query(`UPDATE webhook_events SET status = $1, processed_at = $2, error_message = $3 WHERE id = $4`, [status, now, errorMessage || null, id]);
            return;
        }
        const event = this.webhookEvents.find((e) => e.id === id);
        if (event) {
            event.status = status;
            event.processed_at = now;
            event.error_message = errorMessage;
        }
    }
}
exports.Repository = Repository;
exports.repository = new Repository();
//# sourceMappingURL=repository.js.map