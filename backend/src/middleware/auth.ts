import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    businessId?: string;
  }
}

export async function authenticateJwt(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const payload = await request.jwtVerify<{ userId: string; businessId: string }>();
    request.userId = payload.userId;
    request.businessId = payload.businessId;
  } catch (err) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid or expired JWT authorization token",
    });
  }
}
