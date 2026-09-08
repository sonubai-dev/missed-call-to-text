import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateJwt } from "../middleware/auth";
import { repository } from "../db/repository";

const createFollowupSchema = z.object({
  call_id: z.string(),
  phone_number: z.string(),
  suggested_message: z.string(),
  delay_seconds: z.number().default(0),
  status: z.enum(["PENDING", "DRAFT", "SENT", "FAILED", "IGNORED"]).default("PENDING"),
});

export async function followupsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticateJwt);

  fastify.post("/", async (request, reply) => {
    const parsed = createFollowupSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
    }

    const business = await repository.getBusinessByUserId(request.userId!);
    const businessId = business?.id || "default_business_id";

    const followup = await repository.createFollowUp({
      business_id: businessId,
      ...parsed.data,
    });

    return reply.status(201).send(followup);
  });

  fastify.get("/", async (request, reply) => {
    const business = await repository.getBusinessByUserId(request.userId!);
    const businessId = business?.id || "default_business_id";
    const followups = await repository.getFollowUpsByBusinessId(businessId);
    return reply.send(followups);
  });
}
