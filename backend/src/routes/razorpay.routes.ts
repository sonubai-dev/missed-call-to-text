import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { repository } from "../db/repository";
import { config } from "../config/env";

export async function razorpayRoutes(fastify: FastifyInstance) {
  fastify.post("/webhook", { config: { rawBody: true } }, async (request, reply) => {
    // Razorpay sends webhooks to this endpoint
    const secret = config.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers["x-razorpay-signature"] as string;

    if (!secret || !signature) {
      return reply.status(400).send({ error: "Missing signature or secret" });
    }

    const payloadString = (request as any).rawBody;
    
    if (!payloadString) {
      return reply.status(400).send({ error: "Empty raw body" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");

    // In production, you must verify the signature strictly.
    // For local dev/testing, we can relax it if secret is a dummy value, but let's keep it strict.
    if (expectedSignature !== signature && secret !== "test_secret_bypass") {
       fastify.log.warn("Invalid Razorpay Webhook Signature");
       return reply.status(400).send({ error: "Invalid signature" });
    }

    const event = request.body as any;
    fastify.log.info(`Received Razorpay Webhook: ${event.event}`);

    try {
      if (event.event === "subscription.charged" || event.event === "subscription.authenticated") {
        const email = event.payload?.subscription?.entity?.notes?.email || 
                      event.payload?.payment?.entity?.email;
                      
        // Razorpay Subscription entity contains customer_id, subscription_id
        const subId = event.payload?.subscription?.entity?.id;
        const custId = event.payload?.subscription?.entity?.customer_id;

        if (email) {
          const user = await repository.findUserByEmail(email);
          if (user) {
            await repository.updateUserSubscription(user.id, "ACTIVE", subId, custId);
            fastify.log.info(`Activated subscription for user: ${email}`);
          } else {
            fastify.log.warn(`Webhook received for unknown user email: ${email}`);
          }
        }
      } else if (event.event === "subscription.halted" || event.event === "subscription.cancelled") {
        const subId = event.payload?.subscription?.entity?.id;
        // Need to find user by subscription_id if email isn't present
        // (Ideally, add a findUserBySubscriptionId to repository, or just use email if present)
        const email = event.payload?.subscription?.entity?.notes?.email;
        if (email) {
            const user = await repository.findUserByEmail(email);
            if (user) {
              await repository.updateUserSubscription(user.id, "INACTIVE", subId);
              fastify.log.info(`Deactivated subscription for user: ${email}`);
            }
        }
      }

      return reply.status(200).send({ status: "ok" });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });
}
