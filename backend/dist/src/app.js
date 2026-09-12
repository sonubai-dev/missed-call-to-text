"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const fastify_raw_body_1 = __importDefault(require("fastify-raw-body"));
const env_1 = require("./config/env");
const routes_1 = require("./routes");
function buildApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: env_1.config.NODE_ENV === "test" ? "silent" : "info",
            transport: env_1.config.NODE_ENV === "development"
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
    app.register(cors_1.default, {
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
    app.register(jwt_1.default, {
        secret: env_1.config.JWT_SECRET,
    });
    // 3. Rate Limiter
    app.register(rate_limit_1.default, {
        max: env_1.config.RATE_LIMIT_MAX,
        timeWindow: env_1.config.RATE_LIMIT_WINDOW_MS,
    });
    // 4. Raw Body for Webhooks
    app.register(fastify_raw_body_1.default, {
        field: 'rawBody',
        global: false,
        encoding: 'utf8',
        runFirst: true
    });
    // 5. Register All API & Webhook Routes
    app.register(routes_1.registerRoutes);
    return app;
}
//# sourceMappingURL=app.js.map