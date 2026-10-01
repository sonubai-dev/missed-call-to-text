import { FastifyInstance } from "fastify";
import { razorpayService } from "../services/razorpay.service";
import { repository } from "../db/repository";

export async function razorpayRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/razorpay/webhook
   * Official Razorpay Webhook Event Processor
   */
  fastify.post("/webhook", { config: { rawBody: true } }, async (request, reply) => {
    const signature = request.headers["x-razorpay-signature"] as string;

    if (!signature) {
      fastify.log.warn("Missing x-razorpay-signature header");
      return reply.status(400).send({ error: "Missing x-razorpay-signature header" });
    }

    const rawBody = (request as any).rawBody;
    if (!rawBody) {
      return reply.status(400).send({ error: "Empty webhook payload" });
    }

    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      fastify.log.warn({ signature }, "Unauthorized Razorpay Webhook Signature rejected");
      return reply.status(400).send({ error: "Invalid signature" });
    }

    const event = request.body as any;
    const eventType = event.event;
    fastify.log.info({ eventType, eventId: event.payload?.subscription?.entity?.id }, `Processing verified Razorpay webhook: ${eventType}`);

    try {
      const subEntity = event.payload?.subscription?.entity;
      const paymentEntity = event.payload?.payment?.entity;

      const subId = subEntity?.id || paymentEntity?.subscription_id;
      const custId = subEntity?.customer_id || paymentEntity?.customer_id;
      const email = subEntity?.notes?.email || paymentEntity?.email || paymentEntity?.notes?.email;

      switch (eventType) {
        // --- SUBSCRIPTION ACTIVE & CHARGED EVENTS ---
        case "subscription.charged":
        case "subscription.authenticated":
        case "subscription.activated":
        case "subscription.resumed": {
          if (email) {
            const user = await repository.findUserByEmail(email);
            if (user) {
              await repository.updateUserSubscription(user.id, "ACTIVE", subId, custId);
              fastify.log.info({ email, subId }, "Subscription entitlement marked ACTIVE via webhook");
            }
          }
          break;
        }

        // --- SUBSCRIPTION HALTED / PAYMENT FAILED EVENTS ---
        case "subscription.halted":
        case "payment.failed": {
          if (email) {
            const user = await repository.findUserByEmail(email);
            if (user) {
              await repository.updateUserSubscription(user.id, "INACTIVE", subId);
              fastify.log.warn({ email, subId }, "Subscription halted due to payment failure");
            }
          }
          break;
        }

        // --- SUBSCRIPTION CANCELLED / PAUSED EVENTS ---
        case "subscription.cancelled":
        case "subscription.paused": {
          if (email) {
            const user = await repository.findUserByEmail(email);
            if (user) {
              await repository.updateUserSubscription(user.id, "INACTIVE", subId);
              fastify.log.info({ email, subId }, `Subscription marked ${eventType}`);
            }
          }
          break;
        }

        default:
          fastify.log.debug({ eventType }, "Unhandled Razorpay event acknowledged");
          break;
      }

      return reply.status(200).send({ status: "ok", received: true, event: eventType });
    } catch (err: any) {
      fastify.log.error({ err }, "Error processing Razorpay webhook event");
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });
}
