import { FastifyRequest, FastifyReply } from "fastify";
import { razorpayService } from "../services/razorpay.service";
import { repository } from "../db/repository";

/**
 * Gatekeeper middleware for sensitive paid operations
 * Never trusts client "paid=true" assertions; strictly enforces live server-side entitlement.
 */
export async function requireActiveSubscription(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const userEmail = request.userEmail;
  if (!userEmail) {
    return reply.status(401).send({ error: "Unauthorized", message: "User identity required" });
  }

  let subId = request.subscriptionId;
  if (!subId) {
    const user = await repository.findUserByEmail(userEmail);
    if (user?.subscription_id) {
      subId = user.subscription_id;
    }
  }

  if (!subId) {
    return reply.status(402).send({
      error: "Payment Required",
      status: "subscription_required",
      message: "An active subscription is required to perform this action.",
    });
  }

  try {
    const sub = await razorpayService.fetchSubscription(subId);
    const entitlement = razorpayService.evaluateEntitlement(sub, userEmail);

    if (!entitlement.active) {
      return reply.status(402).send({
        error: "Payment Required",
        status: entitlement.status,
        reason: entitlement.reason,
        message: entitlement.message || "Your subscription needs attention. Please renew to continue.",
      });
    }
  } catch (err) {
    request.log.error({ err, subId }, "Failed to verify entitlement during protected call");
    return reply.status(402).send({
      error: "Entitlement Verification Failed",
      message: "Could not verify active subscription with payment authority.",
    });
  }
}
