"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRoutes = messagesRoutes;
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const repository_1 = require("../db/repository");
const whatsapp_service_1 = require("../services/whatsapp.service");
const sendMessageSchema = zod_1.z.object({
    followup_id: zod_1.z.string().optional(),
    phone_number: zod_1.z.string(),
    customer_name: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1),
    mode: zod_1.z.enum(["MANUAL", "WHATSAPP_WEB", "CLOUD_API"]).default("MANUAL"),
});
async function messagesRoutes(fastify) {
    fastify.addHook("preHandler", auth_1.authenticateJwt);
    fastify.post("/", async (request, reply) => {
        const parsed = sendMessageSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
        }
        const business = await repository_1.repository.getBusinessByUserId(request.userId);
        const businessId = business?.id || "default_business_id";
        const msg = await whatsapp_service_1.whatsappService.dispatchMessage({
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
        const business = await repository_1.repository.getBusinessByUserId(request.userId);
        const businessId = business?.id || "default_business_id";
        const messages = await repository_1.repository.getMessagesByBusinessId(businessId);
        return reply.send(messages);
    });
}
//# sourceMappingURL=messages.routes.js.map