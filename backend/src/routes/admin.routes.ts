import { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../config/env";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: "Validation Error", details: parsed.error.format() });
    }

    const { email, password } = parsed.data;
    const adminOwnerEmail = config.ADMIN_OWNER_EMAIL.trim().toLowerCase();

    if (email.trim().toLowerCase() !== adminOwnerEmail) {
      return reply.status(403).send({
        success: false,
        error: "Access Denied: Only the authorized ADMIN_OWNER_EMAIL can access administrative controls.",
      });
    }

    if (password !== config.ADMIN_PASSWORD) {
      return reply.status(401).send({
        success: false,
        error: "Invalid admin credentials provided.",
      });
    }

    const token = fastify.jwt.sign({
      email: adminOwnerEmail,
      role: "owner",
    });

    // Set HttpOnly, Secure session cookie
    const isProd = config.NODE_ENV === "production";
    reply.header(
      "Set-Cookie",
      `admin_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400${isProd ? "; Secure" : ""}`
    );

    return reply.status(200).send({
      success: true,
      admin: {
        email: adminOwnerEmail,
        role: "owner",
      },
      message: "Admin authentication successful.",
    });
  });

  fastify.get("/me", async (request, reply) => {
    const cookieHeader = request.headers.cookie || "";
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    if (!match) {
      return reply.status(401).send({ authenticated: false, error: "No active admin session." });
    }

    try {
      const decoded: any = fastify.jwt.verify(match[1]);
      if (decoded.email?.toLowerCase() === config.ADMIN_OWNER_EMAIL.toLowerCase()) {
        return reply.send({
          authenticated: true,
          admin: {
            email: decoded.email,
            role: "owner",
          },
        });
      }
    } catch (e) {}

    return reply.status(401).send({ authenticated: false, error: "Session invalid or expired." });
  });

  fastify.post("/logout", async (request, reply) => {
    reply.header(
      "Set-Cookie",
      "admin_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0"
    );
    return reply.send({ success: true, message: "Admin logged out." });
  });
}
