import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateJwt } from "../middleware/auth";
import { repository } from "../db/repository";

const updateBusinessSchema = z.object({
  name: z.string().optional(),
  owner_name: z.string().optional(),
  category: z.string().optional(),
  country_code: z.string().optional(),
  is_auto_reply_enabled: z.boolean().optional(),
  auto_reply_delay_minutes: z.number().optional(),
  whatsapp_mode: z.enum(["MANUAL", "WHATSAPP_WEB", "CLOUD_API"]).optional(),
  whatsapp_phone_id: z.string().optional(),
  encrypted_whatsapp_token: z.string().optional(),
});

export async function businessRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticateJwt);

  fastify.get("/", async (request, reply) => {
    const business = await repository.getBusinessByUserId(request.userId!);
    if (!business) {
      return reply.status(404).send({ error: "Not Found", message: "Business profile not found" });
    }
    return reply.send(business);
  });

  fastify.put("/", async (request, reply) => {
    const parsed = updateBusinessSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
    }

    const current = await repository.getBusinessByUserId(request.userId!);
    if (!current) {
      return reply.status(404).send({ error: "Not Found", message: "Business profile not found" });
    }

    const updated = await repository.updateBusiness(current.id, parsed.data);
    return reply.send(updated);
  });
}
