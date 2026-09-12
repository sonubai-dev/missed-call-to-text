import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { repository } from "../db/repository";
import { authenticateJwt } from "../middleware/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().optional(),
  ownerName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
    }

    const { email, password, businessName, ownerName } = parsed.data;

    const existing = await repository.findUserByEmail(email);
    if (existing) {
      return reply.status(409).send({ error: "Conflict", message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await repository.createUser(email, passwordHash);
    const business = await repository.createBusiness(user.id, {
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
    const user = await repository.findUserByEmail(email);
    if (!user) {
      return reply.status(401).send({ error: "Unauthorized", message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return reply.status(401).send({ error: "Unauthorized", message: "Invalid email or password" });
    }

    let business = await repository.getBusinessByUserId(user.id);
    if (!business) {
      business = await repository.createBusiness(user.id);
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

  fastify.get("/me", { preValidation: [authenticateJwt] }, async (request, reply) => {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const user = await repository.findUserById(userId);
    if (!user) {
      return reply.status(404).send({ error: "Not Found", message: "User not found" });
    }

    const business = await repository.getBusinessByUserId(userId);

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
