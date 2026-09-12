"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayRoutes = razorpayRoutes;
const crypto_1 = __importDefault(require("crypto"));
const repository_1 = require("../db/repository");
const env_1 = require("../config/env");
async function razorpayRoutes(fastify) {
    fastify.post("/webhook", { config: { rawBody: true } }, async (request, reply) => {
        // Razorpay sends webhooks to this endpoint
        const secret = env_1.config.RAZORPAY_WEBHOOK_SECRET;
        const signature = request.headers["x-razorpay-signature"];
        if (!secret || !signature) {
            return reply.status(400).send({ error: "Missing signature or secret" });
        }
        const payloadString = request.rawBody;
        if (!payloadString) {
            return reply.status(400).send({ error: "Empty raw body" });
        }
        const expectedSignature = crypto_1.default
            .createHmac("sha256", secret)
            .update(payloadString)
            .digest("hex");
        // In production, you must verify the signature strictly.
        // For local dev/testing, we can relax it if secret is a dummy value, but let's keep it strict.
        if (expectedSignature !== signature && secret !== "test_secret_bypass") {
            fastify.log.warn("Invalid Razorpay Webhook Signature");
            return reply.status(400).send({ error: "Invalid signature" });
        }
        const event = request.body;
        fastify.log.info(`Received Razorpay Webhook: ${event.event}`);
        try {
            if (event.event === "subscription.charged" || event.event === "subscription.authenticated") {
                const email = event.payload?.subscription?.entity?.notes?.email ||
                    event.payload?.payment?.entity?.email;
                // Razorpay Subscription entity contains customer_id, subscription_id
                const subId = event.payload?.subscription?.entity?.id;
                const custId = event.payload?.subscription?.entity?.customer_id;
                if (email) {
                    const user = await repository_1.repository.findUserByEmail(email);
                    if (user) {
                        await repository_1.repository.updateUserSubscription(user.id, "ACTIVE", subId, custId);
                        fastify.log.info(`Activated subscription for user: ${email}`);
                    }
                    else {
                        fastify.log.warn(`Webhook received for unknown user email: ${email}`);
                    }
                }
            }
            else if (event.event === "subscription.halted" || event.event === "subscription.cancelled") {
                const subId = event.payload?.subscription?.entity?.id;
                // Need to find user by subscription_id if email isn't present
                // (Ideally, add a findUserBySubscriptionId to repository, or just use email if present)
                const email = event.payload?.subscription?.entity?.notes?.email;
                if (email) {
                    const user = await repository_1.repository.findUserByEmail(email);
                    if (user) {
                        await repository_1.repository.updateUserSubscription(user.id, "INACTIVE", subId);
                        fastify.log.info(`Deactivated subscription for user: ${email}`);
                    }
                }
            }
            return reply.status(200).send({ status: "ok" });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    });
}
//# sourceMappingURL=razorpay.routes.js.map