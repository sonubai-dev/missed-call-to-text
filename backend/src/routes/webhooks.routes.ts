import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  validateAndroidWebhookHmac,
  validateMetaWebhookHmac,
} from "../middleware/hmac-validator";
import { webhookService } from "../services/webhook.service";
import { config } from "../config/env";
import { repository } from "../db/repository";

const missedCallSchema = z.object({
  businessId: z.string().optional(),
  phoneNumber: z.string(),
  customerName: z.string().optional(),
  callDirection: z.enum(["INCOMING", "OUTGOING"]).optional(),
  callStatus: z.enum(["MISSED", "ANSWERED", "REJECTED", "RINGING"]).optional(),
  timestamp: z.number(),
  durationSeconds: z.number().optional(),
  source: z.string().optional(),
  suggestedMessage: z.string().optional(),
  autoDispatch: z.boolean().optional(),
});

export async function webhooksRoutes(fastify: FastifyInstance) {
  // 1. Android Missed-Call Ingest Webhook
  fastify.post(
    "/missed-call",
    {
      preHandler: [validateAndroidWebhookHmac],
    },
    async (request, reply) => {
      const parsed = missedCallSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation Error",
          details: parsed.error.format(),
        });
      }

      const idempotencyKey = (request.headers["x-idempotency-key"] as string) || undefined;

      const result = await webhookService.processMissedCallWebhook(
        parsed.data,
        idempotencyKey
      );

      if (result.status === "DUPLICATE") {
        return reply.status(200).send({
          success: true,
          status: "DUPLICATE_IGNORED",
          message: result.message,
        });
      }

      return reply.status(201).send({
        success: true,
        status: "PROCESSED",
        callId: result.callId,
        followupId: result.followupId,
        messageId: result.messageId,
      });
    }
  );

  // 2. Meta WhatsApp Webhook Challenge Verification (GET)
  fastify.get("/whatsapp", async (request, reply) => {
    const query = request.query as {
      "hub.mode"?: string;
      "hub.verify_token"?: string;
      "hub.challenge"?: string;
    };

    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    if (mode === "subscribe" && token === config.META_VERIFY_TOKEN) {
      request.log.info("Meta Webhook verified successfully");
      return reply.status(200).type("text/plain").send(challenge);
    }

    request.log.warn({ mode, token }, "Meta Webhook verification failed");
    return reply.status(403).send("Forbidden: Invalid verify token");
  });

  // 3. Meta WhatsApp Inbound Events & Delivery Receipts (POST)
  fastify.post(
    "/whatsapp",
    {
      preHandler: [validateMetaWebhookHmac],
    },
    async (request, reply) => {
      const body = request.body as any;

      request.log.info({ event: body }, "Meta WhatsApp webhook event received");

      // Extract delivery status updates safely if present
      if (body?.entry) {
        for (const entry of body.entry) {
          if (entry?.changes) {
            for (const change of entry.changes) {
              const statuses = change?.value?.statuses;
              if (Array.isArray(statuses)) {
                for (const st of statuses) {
                  const statusName = st.status?.toUpperCase(); // 'DELIVERED', 'READ', 'SENT', 'FAILED'
                  if (st.id) {
                    request.log.info(
                      { wamid: st.id, statusName },
                      "Updating message delivery status from Meta Webhook"
                    );
                  }
                }
              }
            }
          }
        }
      }

      // Always return HTTP 200 to acknowledge Meta delivery receipt
      return reply.status(200).send({ received: true });
    }
  );
}
