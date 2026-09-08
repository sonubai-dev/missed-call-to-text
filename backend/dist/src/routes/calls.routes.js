"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callsRoutes = callsRoutes;
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const repository_1 = require("../db/repository");
const createCallSchema = zod_1.z.object({
    phone_number: zod_1.z.string(),
    customer_name: zod_1.z.string().optional(),
    call_direction: zod_1.z.enum(["INCOMING", "OUTGOING"]).default("INCOMING"),
    call_status: zod_1.z.enum(["MISSED", "ANSWERED", "REJECTED", "RINGING"]).default("MISSED"),
    duration_seconds: zod_1.z.number().default(0),
    timestamp: zod_1.z.number().default(() => Date.now()),
    source: zod_1.z.string().default("MANUAL_ENTRY"),
});
async function callsRoutes(fastify) {
    fastify.addHook("preHandler", auth_1.authenticateJwt);
    fastify.post("/", async (request, reply) => {
        const parsed = createCallSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
        }
        const business = await repository_1.repository.getBusinessByUserId(request.userId);
        const businessId = business?.id || "default_business_id";
        const call = await repository_1.repository.createCall({
            business_id: businessId,
            ...parsed.data,
        });
        return reply.status(201).send(call);
    });
    fastify.get("/", async (request, reply) => {
        const business = await repository_1.repository.getBusinessByUserId(request.userId);
        const businessId = business?.id || "default_business_id";
        const calls = await repository_1.repository.getCallsByBusinessId(businessId);
        return reply.send(calls);
    });
    fastify.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const call = await repository_1.repository.getCallById(id);
        if (!call) {
            return reply.status(404).send({ error: "Not Found", message: "Call event not found" });
        }
        return reply.send(call);
    });
}
//# sourceMappingURL=calls.routes.js.map