import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateJwt } from "../middleware/auth";
import { razorpayService } from "../services/razorpay.service";
import { repository } from "../db/repository";
import { config } from "../config/env";

const verifySchema = z.object({
  subscriptionId: z.string().optional(),
});

export async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.addHook("preValidation", authenticateJwt);

  /**
   * GET /api/v1/subscription/status
   * Live server-side subscription entitlement verification directly against Razorpay
   */
  fastify.get("/status", async (request, reply) => {
    const userId = request.userId;
    const userEmail = request.userEmail;

    if (!userId || !userEmail) {
      return reply.status(401).send({ error: "Unauthorized", message: "User identity required" });
    }

    const querySubId = (request.query as any)?.subscription_id;
    let targetSubId = request.subscriptionId || querySubId;

    if (!targetSubId) {
      const user = await repository.findUserByEmail(userEmail);
      if (user?.subscription_id) {
        targetSubId = user.subscription_id;
      }
    }

    if (!targetSubId) {
      return reply.send({
        active: false,
        status: "none",
        message: "No active subscription found. Please subscribe to unlock all features.",
      });
    }

    try {
      const razorpaySub = await razorpayService.fetchSubscription(targetSubId);
      const entitlement = razorpayService.evaluateEntitlement(razorpaySub, userEmail);

      // If ownership mismatch, forbid
      if (entitlement.status === "ownership_mismatch") {
        return reply.status(403).send({
          active: false,
          status: "unauthorized",
          message: entitlement.message,
        });
      }

      return reply.send(entitlement);
    } catch (err: any) {
      request.log.error({ err, targetSubId }, "Failed to verify entitlement against Razorpay");
      return reply.status(502).send({
        active: false,
        status: "service_unavailable",
        message: "Temporary issue contacting payment authority. Please retry shortly.",
      });
    }
  });

  /**
   * POST /api/v1/subscription/create
   * Create a new recurring subscription on Razorpay with customer email metadata
   */
  fastify.post("/create", async (request, reply) => {
    const userId = request.userId;
    const userEmail = request.userEmail;

    if (!userId || !userEmail) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    try {
      const sub = await razorpayService.createSubscription(userEmail, userId);

      // Update in-memory user record if present
      await repository.updateUserSubscription(userId, "INACTIVE", sub.id);

      // Generate refreshed JWT token embedding the new subscriptionId
      const refreshedToken = fastify.jwt.sign({
        userId,
        email: userEmail,
        businessId: request.businessId,
        subscriptionId: sub.id,
      });

      return reply.status(201).send({
        subscriptionId: sub.id,
        shortUrl: sub.short_url,
        keyId: config.RAZORPAY_KEY_ID, // Only public Key ID is exposed to client!
        token: refreshedToken,
      });
    } catch (err: any) {
      request.log.error({ err }, "Failed to initialize Razorpay subscription");
      return reply.status(500).send({
        error: "Subscription Initialization Failed",
        message: err.message || "Failed to create subscription on Razorpay",
      });
    }
  });

  /**
   * POST /api/v1/subscription/verify
   * Immediate server-side check following customer checkout completion
   */
  fastify.post("/verify", async (request, reply) => {
    const userId = request.userId;
    const userEmail = request.userEmail;

    if (!userId || !userEmail) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const parsed = verifySchema.safeParse(request.body);
    const bodySubId = parsed.success ? parsed.data.subscriptionId : undefined;
    const targetSubId = bodySubId || request.subscriptionId;

    if (!targetSubId) {
      return reply.status(400).send({
        active: false,
        status: "missing_subscription_id",
        message: "No subscription identifier provided for verification.",
      });
    }

    try {
      const razorpaySub = await razorpayService.fetchSubscription(targetSubId);
      const entitlement = razorpayService.evaluateEntitlement(razorpaySub, userEmail);

      if (entitlement.active) {
        await repository.updateUserSubscription(userId, "ACTIVE", targetSubId);

        const refreshedToken = fastify.jwt.sign({
          userId,
          email: userEmail,
          businessId: request.businessId,
          subscriptionId: targetSubId,
        });

        return reply.send({
          ...entitlement,
          token: refreshedToken,
        });
      }

      return reply.send(entitlement);
    } catch (err: any) {
      request.log.error({ err, targetSubId }, "Subscription verification failed");
      return reply.status(502).send({
        active: false,
        status: "verification_error",
        message: "Could not complete live verification. Please try again.",
      });
    }
  });
}
