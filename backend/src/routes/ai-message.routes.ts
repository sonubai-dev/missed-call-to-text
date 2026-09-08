import { FastifyInstance } from "fastify";
import { z } from "zod";
import { aiMessageService } from "../services/ai-message.service";

const generateSchema = z.object({
  businessName: z.string().default("My Business"),
  businessCategory: z.string().optional(),
  customerPhone: z.string(),
  customerName: z.string().optional(),
  missedCallTime: z.string().optional(),
  tone: z.enum(["PROFESSIONAL", "FRIENDLY", "SHORT", "PREMIUM"]).default("FRIENDLY"),
  language: z.enum(["ENGLISH", "HINDI", "HINGLISH"]).default("ENGLISH"),
});

export async function aiMessageRoutes(fastify: FastifyInstance) {
  fastify.post("/generate", async (request, reply) => {
    const parsed = generateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
    }

    const generated = aiMessageService.generate(parsed.data);
    return reply.send(generated);
  });
}
