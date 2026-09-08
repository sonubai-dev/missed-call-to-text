import { FastifyInstance } from "fastify";
import { z } from "zod";
import { whatsappService } from "../services/whatsapp.service";

const connectSchema = z.object({
  phoneNumber: z.string().optional(),
});

export async function whatsappRoutes(fastify: FastifyInstance) {
  fastify.get("/status", async (_request, reply) => {
    const status = whatsappService.getStatus();
    return reply.send(status);
  });

  fastify.post("/connect", async (request, reply) => {
    const parsed = connectSchema.safeParse(request.body);
    const phoneNumber = parsed.success ? parsed.data.phoneNumber || "" : "";
    const status = await whatsappService.connect(phoneNumber);
    return reply.send(status);
  });

  fastify.post("/disconnect", async (_request, reply) => {
    const status = await whatsappService.disconnect();
    return reply.send(status);
  });
}
