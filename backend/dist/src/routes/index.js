"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_routes_1 = require("./auth.routes");
const business_routes_1 = require("./business.routes");
const calls_routes_1 = require("./calls.routes");
const followups_routes_1 = require("./followups.routes");
const messages_routes_1 = require("./messages.routes");
const whatsapp_routes_1 = require("./whatsapp.routes");
const webhooks_routes_1 = require("./webhooks.routes");
const ai_message_routes_1 = require("./ai-message.routes");
const razorpay_routes_1 = require("./razorpay.routes");
async function registerRoutes(fastify) {
    fastify.register(auth_routes_1.authRoutes, { prefix: "/api/v1/auth" });
    fastify.register(business_routes_1.businessRoutes, { prefix: "/api/v1/business" });
    fastify.register(calls_routes_1.callsRoutes, { prefix: "/api/v1/calls" });
    fastify.register(followups_routes_1.followupsRoutes, { prefix: "/api/v1/followups" });
    fastify.register(messages_routes_1.messagesRoutes, { prefix: "/api/v1/messages" });
    fastify.register(whatsapp_routes_1.whatsappRoutes, { prefix: "/api/v1/whatsapp" });
    fastify.register(webhooks_routes_1.webhooksRoutes, { prefix: "/api/v1/webhooks" });
    fastify.register(ai_message_routes_1.aiMessageRoutes, { prefix: "/api/v1/message" });
    fastify.register(razorpay_routes_1.razorpayRoutes, { prefix: "/api/v1/razorpay" });
    fastify.get("/health", async () => {
        return { status: "OK", timestamp: Date.now() };
    });
}
//# sourceMappingURL=index.js.map