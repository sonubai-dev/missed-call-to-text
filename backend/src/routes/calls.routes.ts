import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateJwt } from "../middleware/auth";
import { repository } from "../db/repository";

const createCallSchema = z.object({
  phone_number: z.string(),
  customer_name: z.string().optional(),
  call_direction: z.enum(["INCOMING", "OUTGOING"]).default("INCOMING"),
  call_status: z.enum(["MISSED", "ANSWERED", "REJECTED", "RINGING"]).default("MISSED"),
  duration_seconds: z.number().default(0),
  timestamp: z.number().default(() => Date.now()),
  source: z.string().default("MANUAL_ENTRY"),
});

export async function callsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticateJwt);

  fastify.post("/", async (request, reply) => {
    const parsed = createCallSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
    }

    const business = await repository.getBusinessByUserId(request.userId!);
    const businessId = business?.id || "default_business_id";

    const call = await repository.createCall({
      business_id: businessId,
      ...parsed.data,
    });

    return reply.status(201).send(call);
  });

  fastify.get("/", async (request, reply) => {
    const business = await repository.getBusinessByUserId(request.userId!);
    const businessId = business?.id || "default_business_id";
    const calls = await repository.getCallsByBusinessId(businessId);
    return reply.send(calls);
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const call = await repository.getCallById(id);
    if (!call) {
      return reply.status(404).send({ error: "Not Found", message: "Call event not found" });
    }
    return reply.send(call);
  });
}
