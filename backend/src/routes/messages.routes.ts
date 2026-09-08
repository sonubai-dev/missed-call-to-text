import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticateJwt } from "../middleware/auth";
import { repository } from "../db/repository";
import { whatsappService } from "../services/whatsapp.service";

const sendMessageSchema = z.object({
  followup_id: z.string().optional(),
  phone_number: z.string(),
  customer_name: z.string().optional(),
  content: z.string().min(1),
  mode: z.enum(["MANUAL", "WHATSAPP_WEB", "CLOUD_API"]).default("MANUAL"),
});

export async function messagesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticateJwt);

  fastify.post("/", async (request, reply) => {
    const parsed = sendMessageSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
    }

    const business = await repository.getBusinessByUserId(request.userId!);
    const businessId = business?.id || "default_business_id";

    const msg = await whatsappService.dispatchMessage({
      businessId,
      followupId: parsed.data.followup_id,
      phoneNumber: parsed.data.phone_number,
      customerName: parsed.data.customer_name,
      content: parsed.data.content,
      mode: parsed.data.mode,
    });

    return reply.status(201).send(msg);
  });

  fastify.get("/", async (request, reply) => {
    const business = await repository.getBusinessByUserId(request.userId!);
    const businessId = business?.id || "default_business_id";
    const messages = await repository.getMessagesByBusinessId(businessId);
    return reply.send(messages);
  });
}
