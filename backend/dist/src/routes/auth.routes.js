"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const repository_1 = require("../db/repository");
const auth_1 = require("../middleware/auth");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    businessName: zod_1.z.string().optional(),
    ownerName: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
async function authRoutes(fastify) {
    fastify.post("/register", async (request, reply) => {
        const parsed = registerSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
        }
        const { email, password, businessName, ownerName } = parsed.data;
        const existing = await repository_1.repository.findUserByEmail(email);
        if (existing) {
            return reply.status(409).send({ error: "Conflict", message: "Email already registered" });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await repository_1.repository.createUser(email, passwordHash);
        const business = await repository_1.repository.createBusiness(user.id, {
            name: businessName || "My Business",
            owner_name: ownerName || "Owner",
        });
        const token = fastify.jwt.sign({ userId: user.id, businessId: business.id });
        return reply.status(201).send({
            user: { id: user.id, email: user.email },
            business,
            token,
        });
    });
    fastify.post("/login", async (request, reply) => {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
        }
        const { email, password } = parsed.data;
        const user = await repository_1.repository.findUserByEmail(email);
        if (!user) {
            return reply.status(401).send({ error: "Unauthorized", message: "Invalid email or password" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return reply.status(401).send({ error: "Unauthorized", message: "Invalid email or password" });
        }
        let business = await repository_1.repository.getBusinessByUserId(user.id);
        if (!business) {
            business = await repository_1.repository.createBusiness(user.id);
        }
        const token = fastify.jwt.sign({ userId: user.id, businessId: business.id });
        return reply.send({
            user: {
                id: user.id,
                email: user.email,
                subscription_status: user.subscription_status
            },
            business,
            token,
        });
    });
    fastify.get("/me", { preValidation: [auth_1.authenticateJwt] }, async (request, reply) => {
        const userId = request.userId;
        if (!userId) {
            return reply.status(401).send({ error: "Unauthorized" });
        }
        const user = await repository_1.repository.findUserById(userId);
        if (!user) {
            return reply.status(404).send({ error: "Not Found", message: "User not found" });
        }
        const business = await repository_1.repository.getBusinessByUserId(userId);
        return reply.send({
            user: {
                id: user.id,
                email: user.email,
                subscription_status: user.subscription_status,
                subscription_id: user.subscription_id
            },
            business
        });
    });
}
//# sourceMappingURL=auth.routes.js.map