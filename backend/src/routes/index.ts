import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { businessRoutes } from "./business.routes";
import { callsRoutes } from "./calls.routes";
import { followupsRoutes } from "./followups.routes";
import { messagesRoutes } from "./messages.routes";
import { whatsappRoutes } from "./whatsapp.routes";
import { webhooksRoutes } from "./webhooks.routes";
import { aiMessageRoutes } from "./ai-message.routes";

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: "/api/v1/auth" });
  fastify.register(businessRoutes, { prefix: "/api/v1/business" });
  fastify.register(callsRoutes, { prefix: "/api/v1/calls" });
  fastify.register(followupsRoutes, { prefix: "/api/v1/followups" });
  fastify.register(messagesRoutes, { prefix: "/api/v1/messages" });
  fastify.register(whatsappRoutes, { prefix: "/api/v1/whatsapp" });
  fastify.register(webhooksRoutes, { prefix: "/api/v1/webhooks" });
  fastify.register(aiMessageRoutes, { prefix: "/api/v1/message" });

  fastify.get("/health", async () => {
    return { status: "OK", timestamp: Date.now() };
  });
}
