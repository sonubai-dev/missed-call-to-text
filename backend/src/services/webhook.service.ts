import crypto from "crypto";
import { repository } from "../db/repository";
import { whatsappService } from "./whatsapp.service";
import pino from "pino";

const logger = pino({ name: "webhook-service" });

export interface MissedCallWebhookPayload {
  businessId?: string;
  phoneNumber: string;
  customerName?: string;
  callDirection?: "INCOMING" | "OUTGOING";
  callStatus?: "MISSED" | "ANSWERED" | "REJECTED" | "RINGING";
  timestamp: number;
  durationSeconds?: number;
  source?: string;
  suggestedMessage?: string;
  autoDispatch?: boolean;
}

export class WebhookService {
  /**
   * Processes missed call webhooks with end-to-end deduplication, idempotency,
   * audit recording, and retry safety.
   */
  async processMissedCallWebhook(
    payload: MissedCallWebhookPayload,
    idempotencyKey?: string
  ): Promise<{
    status: "PROCESSED" | "DUPLICATE";
    callId?: string;
    followupId?: string;
    messageId?: string;
    message?: string;
  }> {
    const rawString = JSON.stringify(payload);
    const payloadHash = crypto.createHash("sha256").update(rawString).digest("hex");
    const eventId = `evt_${crypto.randomUUID()}`;

    // 1. Check Idempotency Key & Payload Hash for duplicate delivery
    if (idempotencyKey) {
      const existing = await repository.findWebhookEventByIdempotencyKey(idempotencyKey);
      if (existing) {
        logger.info(
          { idempotencyKey, eventId: existing.id, status: existing.status },
          "Duplicate webhook detected by idempotency key. Skipping re-processing."
        );
        return {
          status: "DUPLICATE",
          message: "Event already processed previously with this idempotency key.",
        };
      }
    }

    const existingHash = await repository.findWebhookEventByHash(payloadHash);
    if (existingHash && existingHash.status === "PROCESSED") {
      logger.info(
        { payloadHash, eventId: existingHash.id },
        "Duplicate webhook detected by payload hash. Skipping re-processing."
      );
      return {
        status: "DUPLICATE",
        message: "Identical event payload already processed.",
      };
    }

    // 2. Audit Record Event (Status: PENDING)
    await repository.recordWebhookEvent({
      id: eventId,
      provider: "ANDROID_APP",
      event_type: "MISSED_CALL",
      payload_hash: payloadHash,
      idempotency_key: idempotencyKey,
      raw_payload: payload,
    });

    try {
      // 3. Resolve Business
      let businessId = payload.businessId;
      if (!businessId) {
        // Fallback to primary business in store
        const users = await repository.findUserByEmail("admin@example.com");
        if (users) {
          const biz = await repository.getBusinessByUserId(users.id);
          if (biz) businessId = biz.id;
        }
      }

      if (!businessId) {
        businessId = "default_business_id";
      }

      // 4. Create Call Event
      const call = await repository.createCall({
        business_id: businessId,
        phone_number: payload.phoneNumber,
        customer_name: payload.customerName,
        call_direction: payload.callDirection || "INCOMING",
        call_status: payload.callStatus || "MISSED",
        duration_seconds: payload.durationSeconds || 0,
        timestamp: payload.timestamp || Date.now(),
        source: payload.source || "ANDROID_TELECOM_SCREENING",
      });

      // 5. Create Follow-Up Suggestion
      const suggestedText =
        payload.suggestedMessage ||
        `Hi${payload.customerName ? ` ${payload.customerName}` : ""}, we noticed that you called. Sorry we missed your call. How can we help you?`;

      const followup = await repository.createFollowUp({
        call_id: call.id,
        business_id: businessId,
        phone_number: payload.phoneNumber,
        suggested_message: suggestedText,
        status: payload.autoDispatch ? "SENT" : "PENDING",
        delay_seconds: 0,
      });

      let messageId: string | undefined;

      // 6. WhatsApp Provider Dispatch (If automated)
      if (payload.autoDispatch) {
        const msg = await whatsappService.dispatchMessage({
          businessId,
          followupId: followup.id,
          phoneNumber: payload.phoneNumber,
          customerName: payload.customerName,
          content: suggestedText,
          mode: "MANUAL",
        });
        messageId = msg.id;
      }

      // 7. Mark Webhook as PROCESSED
      await repository.updateWebhookEventStatus(eventId, "PROCESSED");

      logger.info(
        { eventId, callId: call.id, followupId: followup.id },
        "Missed call webhook successfully processed"
      );

      return {
        status: "PROCESSED",
        callId: call.id,
        followupId: followup.id,
        messageId,
      };
    } catch (err: any) {
      logger.error({ eventId, err }, "Error processing missed-call webhook");
      await repository.updateWebhookEventStatus(eventId, "FAILED", err.message);
      throw err;
    }
  }
}

export const webhookService = new WebhookService();
