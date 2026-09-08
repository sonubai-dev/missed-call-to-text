"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followupsRoutes = followupsRoutes;
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const repository_1 = require("../db/repository");
const createFollowupSchema = zod_1.z.object({
    call_id: zod_1.z.string(),
    phone_number: zod_1.z.string(),
    suggested_message: zod_1.z.string(),
    delay_seconds: zod_1.z.number().default(0),
    status: zod_1.z.enum(["PENDING", "DRAFT", "SENT", "FAILED", "IGNORED"]).default("PENDING"),
});
async function followupsRoutes(fastify) {
    fastify.addHook("preHandler", auth_1.authenticateJwt);
    fastify.post("/", async (request, reply) => {
        const parsed = createFollowupSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
        }
        const business = await repository_1.repository.getBusinessByUserId(request.userId);
        const businessId = business?.id || "default_business_id";
        const followup = await repository_1.repository.createFollowUp({
            business_id: businessId,
            ...parsed.data,
        });
        return reply.status(201).send(followup);
    });
    fastify.get("/", async (request, reply) => {
        const business = await repository_1.repository.getBusinessByUserId(request.userId);
        const businessId = business?.id || "default_business_id";
        const followups = await repository_1.repository.getFollowUpsByBusinessId(businessId);
        return reply.send(followups);
    });
}
//# sourceMappingURL=followups.routes.js.map