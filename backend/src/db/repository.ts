import {
  Business,
  CallRecord,
  FollowUpRecord,
  MessageRecord,
  User,
  WebhookEventRecord,
} from "../types";
import crypto from "crypto";

/**
 * Pure In-Memory Databaseless Repository
 * All persistent database connections (PostgreSQL/pg) have been completely removed.
 * Authoritative subscription state is managed and verified live via Razorpay REST API.
 */
export class Repository {
  private users: User[] = [];
  private businesses: Business[] = [];
  private calls: CallRecord[] = [];
  private followups: FollowUpRecord[] = [];
  private messages: MessageRecord[] = [];
  private webhookEvents: WebhookEventRecord[] = [];

  // ================= USERS =================
  async createUser(email: string, passwordHash: string): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();

    const user: User = {
      id,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      subscription_status: 'INACTIVE',
      created_at: now,
      updated_at: now,
    };
    this.users.push(user);
    return user;
  }

  async updateUserSubscription(
    id: string,
    status: User['subscription_status'],
    subscriptionId?: string,
    customerId?: string
  ): Promise<void> {
    const now = new Date();
    const user = this.users.find(u => u.id === id || (subscriptionId && u.subscription_id === subscriptionId));
    if (user) {
      user.subscription_status = status;
      if (subscriptionId) user.subscription_id = subscriptionId;
      if (customerId) user.razorpay_customer_id = customerId;
      user.updated_at = now;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  // ================= BUSINESSES =================
  async createBusiness(userId: string, data?: Partial<Business>): Promise<Business> {
    const id = crypto.randomUUID();
    const now = new Date();
    const webhookSecret = `whsec_${crypto.randomBytes(16).toString("hex")}`;

    const biz: Business = {
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

    this.businesses.push(biz);
    return biz;
  }

  async getBusinessByUserId(userId: string): Promise<Business | null> {
    return this.businesses.find((b) => b.user_id === userId) || null;
  }

  async updateBusiness(id: string, data: Partial<Business>): Promise<Business | null> {
    const now = new Date();
    const biz = this.businesses.find((b) => b.id === id);
    if (!biz) return null;
    Object.assign(biz, data, { updated_at: now });
    return biz;
  }

  // ================= CALLS =================
  async createCall(data: Omit<CallRecord, "id" | "created_at" | "updated_at">): Promise<CallRecord> {
    const id = crypto.randomUUID();
    const now = new Date();

    const call: CallRecord = {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };

    this.calls.unshift(call);
    return call;
  }

  async getCallsByBusinessId(businessId: string): Promise<CallRecord[]> {
    return this.calls
      .filter((c) => c.business_id === businessId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async getCallById(id: string): Promise<CallRecord | null> {
    return this.calls.find((c) => c.id === id) || null;
  }

  // ================= FOLLOW-UPS =================
  async createFollowUp(
    data: Omit<FollowUpRecord, "id" | "created_at" | "updated_at">
  ): Promise<FollowUpRecord> {
    const id = crypto.randomUUID();
    const now = new Date();

    const followup: FollowUpRecord = {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };

    this.followups.unshift(followup);
    return followup;
  }

  async getFollowUpsByBusinessId(businessId: string): Promise<FollowUpRecord[]> {
    return this.followups
      .filter((f) => f.business_id === businessId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async updateFollowUpStatus(
    id: string,
    status: FollowUpRecord["status"],
    sentAt?: Date
  ): Promise<void> {
    const now = new Date();
    const item = this.followups.find((f) => f.id === id);
    if (item) {
      item.status = status;
      if (sentAt) item.sent_at = sentAt;
      else if (status === "SENT") item.sent_at = now;
      item.updated_at = now;
    }
  }

  // ================= MESSAGES =================
  async createMessage(data: Omit<MessageRecord, "id" | "created_at">): Promise<MessageRecord> {
    const id = crypto.randomUUID();
    const now = new Date();

    const msg: MessageRecord = {
      id,
      ...data,
      created_at: now,
    };

    this.messages.unshift(msg);
    return msg;
  }

  async getMessagesByBusinessId(businessId: string): Promise<MessageRecord[]> {
    return this.messages
      .filter((m) => m.business_id === businessId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async updateMessageStatus(
    id: string,
    status: MessageRecord["status"],
    errorMessage?: string
  ): Promise<void> {
    const now = new Date();
    const msg = this.messages.find((m) => m.id === id);
    if (msg) {
      msg.status = status;
      if (errorMessage) msg.error_message = errorMessage;
      if (status === "SENT") msg.sent_at = now;
      if (status === "DELIVERED") msg.delivered_at = now;
    }
  }

  // ================= WEBHOOK EVENTS =================
  async recordWebhookEvent(data: {
    id: string;
    provider: WebhookEventRecord["provider"];
    event_type: string;
    payload_hash: string;
    idempotency_key?: string;
    raw_payload: any;
  }): Promise<WebhookEventRecord> {
    const now = new Date();

    const record: WebhookEventRecord = {
      id: data.id,
      provider: data.provider,
      event_type: data.event_type,
      payload_hash: data.payload_hash,
      idempotency_key: data.idempotency_key,
      received_at: now,
      status: "PENDING",
      raw_payload: data.raw_payload,
    };

    this.webhookEvents.unshift(record);
    return record;
  }

  async findWebhookEventByIdempotencyKey(key: string): Promise<WebhookEventRecord | null> {
    return this.webhookEvents.find((e) => e.idempotency_key === key) || null;
  }

  async findWebhookEventByHash(hash: string): Promise<WebhookEventRecord | null> {
    return this.webhookEvents.find((e) => e.payload_hash === hash) || null;
  }

  async updateWebhookEventStatus(
    id: string,
    status: WebhookEventRecord["status"],
    errorMessage?: string
  ): Promise<void> {
    const now = new Date();
    const event = this.webhookEvents.find((e) => e.id === id);
    if (event) {
      event.status = status;
      event.processed_at = now;
      event.error_message = errorMessage;
    }
  }
}

export const repository = new Repository();
