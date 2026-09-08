"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappRoutes = whatsappRoutes;
const zod_1 = require("zod");
const whatsapp_service_1 = require("../services/whatsapp.service");
const connectSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string().optional(),
});
async function whatsappRoutes(fastify) {
    fastify.get("/status", async (_request, reply) => {
        const status = whatsapp_service_1.whatsappService.getStatus();
        return reply.send(status);
    });
    fastify.post("/connect", async (request, reply) => {
        const parsed = connectSchema.safeParse(request.body);
        const phoneNumber = parsed.success ? parsed.data.phoneNumber || "" : "";
        const status = await whatsapp_service_1.whatsappService.connect(phoneNumber);
        return reply.send(status);
    });
    fastify.post("/disconnect", async (_request, reply) => {
        const status = await whatsapp_service_1.whatsappService.disconnect();
        return reply.send(status);
    });
}
//# sourceMappingURL=whatsapp.routes.js.map