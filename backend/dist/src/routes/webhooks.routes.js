"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRoutes = webhooksRoutes;
const zod_1 = require("zod");
const hmac_validator_1 = require("../middleware/hmac-validator");
const webhook_service_1 = require("../services/webhook.service");
const env_1 = require("../config/env");
const missedCallSchema = zod_1.z.object({
    businessId: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string(),
    customerName: zod_1.z.string().optional(),
    callDirection: zod_1.z.enum(["INCOMING", "OUTGOING"]).optional(),
    callStatus: zod_1.z.enum(["MISSED", "ANSWERED", "REJECTED", "RINGING"]).optional(),
    timestamp: zod_1.z.number(),
    durationSeconds: zod_1.z.number().optional(),
    source: zod_1.z.string().optional(),
    suggestedMessage: zod_1.z.string().optional(),
    autoDispatch: zod_1.z.boolean().optional(),
});
async function webhooksRoutes(fastify) {
    // 1. Android Missed-Call Ingest Webhook
    fastify.post("/missed-call", {
        preHandler: [hmac_validator_1.validateAndroidWebhookHmac],
    }, async (request, reply) => {
        const parsed = missedCallSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation Error",
                details: parsed.error.format(),
            });
        }
        const idempotencyKey = request.headers["x-idempotency-key"] || undefined;
        const result = await webhook_service_1.webhookService.processMissedCallWebhook(parsed.data, idempotencyKey);
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
    });
    // 2. Meta WhatsApp Webhook Challenge Verification (GET)
    fastify.get("/whatsapp", async (request, reply) => {
        const query = request.query;
        const mode = query["hub.mode"];
        const token = query["hub.verify_token"];
        const challenge = query["hub.challenge"];
        if (mode === "subscribe" && token === env_1.config.META_VERIFY_TOKEN) {
            request.log.info("Meta Webhook verified successfully");
            return reply.status(200).type("text/plain").send(challenge);
        }
        request.log.warn({ mode, token }, "Meta Webhook verification failed");
        return reply.status(403).send("Forbidden: Invalid verify token");
    });
    // 3. Meta WhatsApp Inbound Events & Delivery Receipts (POST)
    fastify.post("/whatsapp", {
        preHandler: [hmac_validator_1.validateMetaWebhookHmac],
    }, async (request, reply) => {
        const body = request.body;
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
                                    request.log.info({ wamid: st.id, statusName }, "Updating message delivery status from Meta Webhook");
                                }
                            }
                        }
                    }
                }
            }
        }
        // Always return HTTP 200 to acknowledge Meta delivery receipt
        return reply.status(200).send({ received: true });
    });
}
//# sourceMappingURL=webhooks.routes.js.map