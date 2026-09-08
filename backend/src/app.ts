import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config/env";
import { registerRoutes } from "./routes";

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: {
      level: config.NODE_ENV === "test" ? "silent" : "info",
      transport:
        config.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
  });

  // 1. CORS
  app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Signature-SHA256",
      "X-Signature",
      "X-Timestamp",
      "X-Idempotency-Key",
      "X-Hub-Signature-256",
    ],
  });

  // 2. JWT Plugin
  app.register(jwt, {
    secret: config.JWT_SECRET,
  });

  // 3. Rate Limiter
  app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
  });

  // 4. Register All API & Webhook Routes
  app.register(registerRoutes);

  return app;
}
