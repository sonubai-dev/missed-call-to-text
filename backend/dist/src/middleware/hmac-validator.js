"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndroidWebhookHmac = validateAndroidWebhookHmac;
exports.validateMetaWebhookHmac = validateMetaWebhookHmac;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 minutes
/**
 * Validates HMAC-SHA256 signatures and timestamp freshness for Android app webhooks.
 * Headers expected:
 * - X-Signature / X-Signature-SHA256: sha256=HEX_SIGNATURE
 * - X-Timestamp: Unix timestamp in milliseconds or ISO string
 */
async function validateAndroidWebhookHmac(request, reply) {
    const signatureHeader = (request.headers["x-signature-sha256"] ||
        request.headers["x-signature"]);
    const timestampHeader = request.headers["x-timestamp"];
    if (!signatureHeader) {
        return reply.status(401).send({
            error: "Unauthorized",
            message: "Missing X-Signature-SHA256 header",
        });
    }
    // 1. Timestamp validation (Replay Protection)
    if (!timestampHeader) {
        return reply.status(400).send({
            error: "Bad Request",
            message: "Missing X-Timestamp header for replay validation",
        });
    }
    const timestamp = parseInt(timestampHeader, 10);
    const now = Date.now();
    if (isNaN(timestamp) || Math.abs(now - timestamp) > MAX_TIMESTAMP_DRIFT_MS) {
        return reply.status(400).send({
            error: "Bad Request",
            message: "Webhook timestamp expired or out of allowed window (5 min)",
        });
    }
    // 2. HMAC Signature calculation
    const rawBody = JSON.stringify(request.body);
    const dataToSign = `${timestamp}.${rawBody}`;
    const secret = env_1.config.WEBHOOK_SECRET;
    const expectedSignature = crypto_1.default
        .createHmac("sha256", secret)
        .update(dataToSign)
        .digest("hex");
    const cleanSignature = signatureHeader.replace(/^sha256=/, "");
    const isValid = cleanSignature.length === expectedSignature.length &&
        crypto_1.default.timingSafeEqual(Buffer.from(cleanSignature, "hex"), Buffer.from(expectedSignature, "hex"));
    if (!isValid) {
        request.log.warn({ signatureHeader, expectedSignature }, "Invalid HMAC signature on incoming missed-call webhook");
        return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid webhook HMAC signature",
        });
    }
}
/**
 * Validates Meta WhatsApp Webhook X-Hub-Signature-256 header.
 */
async function validateMetaWebhookHmac(request, reply) {
    const hubSignature = request.headers["x-hub-signature-256"];
    if (!hubSignature) {
        return reply.status(401).send({
            error: "Unauthorized",
            message: "Missing X-Hub-Signature-256 header",
        });
    }
    const rawBody = JSON.stringify(request.body);
    const expectedSignature = `sha256=${crypto_1.default
        .createHmac("sha256", env_1.config.META_APP_SECRET)
        .update(rawBody)
        .digest("hex")}`;
    const isValid = hubSignature.length === expectedSignature.length &&
        crypto_1.default.timingSafeEqual(Buffer.from(hubSignature), Buffer.from(expectedSignature));
    if (!isValid) {
        request.log.warn({ hubSignature }, "Invalid Meta Webhook signature");
        return reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid Meta Webhook signature",
        });
    }
}
//# sourceMappingURL=hmac-validator.js.map