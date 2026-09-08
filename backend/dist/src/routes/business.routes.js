"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessRoutes = businessRoutes;
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const repository_1 = require("../db/repository");
const updateBusinessSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    owner_name: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    country_code: zod_1.z.string().optional(),
    is_auto_reply_enabled: zod_1.z.boolean().optional(),
    auto_reply_delay_minutes: zod_1.z.number().optional(),
    whatsapp_mode: zod_1.z.enum(["MANUAL", "WHATSAPP_WEB", "CLOUD_API"]).optional(),
    whatsapp_phone_id: zod_1.z.string().optional(),
    encrypted_whatsapp_token: zod_1.z.string().optional(),
});
async function businessRoutes(fastify) {
    fastify.addHook("preHandler", auth_1.authenticateJwt);
    fastify.get("/", async (request, reply) => {
        const business = await repository_1.repository.getBusinessByUserId(request.userId);
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
        const current = await repository_1.repository.getBusinessByUserId(request.userId);
        if (!current) {
            return reply.status(404).send({ error: "Not Found", message: "Business profile not found" });
        }
        const updated = await repository_1.repository.updateBusiness(current.id, parsed.data);
        return reply.send(updated);
    });
}
//# sourceMappingURL=business.routes.js.map