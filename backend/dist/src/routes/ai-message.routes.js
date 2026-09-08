"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiMessageRoutes = aiMessageRoutes;
const zod_1 = require("zod");
const ai_message_service_1 = require("../services/ai-message.service");
const generateSchema = zod_1.z.object({
    businessName: zod_1.z.string().default("My Business"),
    businessCategory: zod_1.z.string().optional(),
    customerPhone: zod_1.z.string(),
    customerName: zod_1.z.string().optional(),
    missedCallTime: zod_1.z.string().optional(),
    tone: zod_1.z.enum(["PROFESSIONAL", "FRIENDLY", "SHORT", "PREMIUM"]).default("FRIENDLY"),
    language: zod_1.z.enum(["ENGLISH", "HINDI", "HINGLISH"]).default("ENGLISH"),
});
async function aiMessageRoutes(fastify) {
    fastify.post("/generate", async (request, reply) => {
        const parsed = generateSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
        }
        const generated = ai_message_service_1.aiMessageService.generate(parsed.data);
        return reply.send(generated);
    });
}
//# sourceMappingURL=ai-message.routes.js.map