import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { repository } from "../db/repository";
import { authenticateJwt } from "../middleware/auth";
import { razorpayService } from "../services/razorpay.service";

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

    const token = fastify.jwt.sign({
      userId: user.id,
      email: user.email,
      businessId: business.id,
    });

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
    let user = await repository.findUserByEmail(email);
    
    // In databaseless mode, if user is not in ephemeral memory, create an authenticated profile
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await repository.createUser(email, passwordHash);
    } else {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return reply.status(401).send({ error: "Unauthorized", message: "Invalid email or password" });
      }
    }

    let business = await repository.getBusinessByUserId(user.id);
    if (!business) {
      business = await repository.createBusiness(user.id);
    }

    const token = fastify.jwt.sign({
      userId: user.id,
      email: user.email,
      businessId: business.id,
      subscriptionId: user.subscription_id,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        subscription_status: user.subscription_status,
        subscription_id: user.subscription_id,
      },
      business,
      token,
    });
  });

  const deviceAuthSchema = z.object({
    deviceId: z.string().min(6),
    phoneNumber: z.string().optional(),
    businessName: z.string().optional(),
  });

  fastify.post("/device-auth", async (request, reply) => {
    const parsed = deviceAuthSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation Error", details: parsed.error.format() });
    }

    const { deviceId, phoneNumber, businessName } = parsed.data;
    const deviceEmail = `device_${deviceId.toLowerCase().replace(/[^a-z0-9]/g, "")}@misscall.app`;

    let user = await repository.findUserByEmail(deviceEmail);
    let business;
    if (!user) {
      const dummyHash = await bcrypt.hash(deviceId, 6);
      user = await repository.createUser(deviceEmail, dummyHash);
      business = await repository.createBusiness(user.id, {
        name: businessName || "My Store",
        owner_name: phoneNumber || "Store Owner",
      });
    } else {
      business = await repository.getBusinessByUserId(user.id);
    }

    const token = fastify.jwt.sign({
      userId: user.id,
      email: user.email,
      businessId: business?.id || "biz_default",
      subscriptionId: user.subscription_id,
    });

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        subscription_status: user.subscription_status,
        subscription_id: user.subscription_id,
      },
      business,
      token,
    });
  });

  fastify.get("/me", { preValidation: [authenticateJwt] }, async (request, reply) => {
    const userId = request.userId;
    const userEmail = request.userEmail;

    if (!userId || !userEmail) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    let user = await repository.findUserById(userId);
    if (!user) {
      user = await repository.findUserByEmail(userEmail);
    }

    let activeStatus = "INACTIVE";
    let subId = request.subscriptionId || user?.subscription_id;

    if (subId) {
      try {
        const sub = await razorpayService.fetchSubscription(subId);
        const entitlement = razorpayService.evaluateEntitlement(sub, userEmail);
        if (entitlement.active) {
          activeStatus = "ACTIVE";
        }
      } catch (err) {
        request.log.warn({ err, subId }, "Could not refresh live entitlement during /me call");
      }
    }

    const business = user ? await repository.getBusinessByUserId(user.id) : null;

    return reply.send({
      user: {
        id: user?.id || userId,
        email: user?.email || userEmail,
        subscription_status: activeStatus,
        subscription_id: subId,
      },
      business,
    });
  });
}
