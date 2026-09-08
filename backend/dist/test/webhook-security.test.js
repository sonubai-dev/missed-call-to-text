"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const crypto_1 = __importDefault(require("crypto"));
const app_1 = require("../src/app");
const env_1 = require("../src/config/env");
(0, node_test_1.describe)("Webhook Security & Endpoints", () => {
    const app = (0, app_1.buildApp)();
    (0, node_test_1.test)("GET /health returns 200 OK", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/health",
        });
        node_assert_1.default.strictEqual(response.statusCode, 200);
        const body = JSON.parse(response.payload);
        node_assert_1.default.strictEqual(body.status, "OK");
    });
    (0, node_test_1.test)("GET /api/v1/webhooks/whatsapp verifies Meta challenge", async () => {
        const challenge = "test_challenge_123456";
        const response = await app.inject({
            method: "GET",
            url: `/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${env_1.config.META_VERIFY_TOKEN}&hub.challenge=${challenge}`,
        });
        node_assert_1.default.strictEqual(response.statusCode, 200);
        node_assert_1.default.strictEqual(response.payload, challenge);
    });
    (0, node_test_1.test)("GET /api/v1/webhooks/whatsapp rejects invalid token", async () => {
        const response = await app.inject({
            method: "GET",
            url: `/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test`,
        });
        node_assert_1.default.strictEqual(response.statusCode, 403);
    });
    (0, node_test_1.test)("POST /api/v1/webhooks/missed-call rejects missing signature", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/webhooks/missed-call",
            payload: {
                phoneNumber: "+919876543210",
                timestamp: Date.now(),
            },
        });
        node_assert_1.default.strictEqual(response.statusCode, 401);
    });
    (0, node_test_1.test)("POST /api/v1/webhooks/missed-call accepts valid HMAC signature and processes call", async () => {
        const now = Date.now();
        const payload = {
            phoneNumber: "+919876543210",
            customerName: "Rahul Verma",
            callStatus: "MISSED",
            timestamp: now,
            source: "ANDROID_TELECOM_SCREENING",
        };
        const rawBody = JSON.stringify(payload);
        const dataToSign = `${now}.${rawBody}`;
        const signature = crypto_1.default
            .createHmac("sha256", env_1.config.WEBHOOK_SECRET)
            .update(dataToSign)
            .digest("hex");
        const idempotencyKey = `idemp_${Date.now()}`;
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/webhooks/missed-call",
            headers: {
                "x-signature-sha256": `sha256=${signature}`,
                "x-timestamp": now.toString(),
                "x-idempotency-key": idempotencyKey,
            },
            payload,
        });
        node_assert_1.default.strictEqual(response.statusCode, 201);
        const resBody = JSON.parse(response.payload);
        node_assert_1.default.strictEqual(resBody.success, true);
        node_assert_1.default.strictEqual(resBody.status, "PROCESSED");
        node_assert_1.default.ok(resBody.callId);
        node_assert_1.default.ok(resBody.followupId);
        // Test Idempotency & Replay Protection on duplicate delivery
        const duplicateResponse = await app.inject({
            method: "POST",
            url: "/api/v1/webhooks/missed-call",
            headers: {
                "x-signature-sha256": `sha256=${signature}`,
                "x-timestamp": now.toString(),
                "x-idempotency-key": idempotencyKey,
            },
            payload,
        });
        node_assert_1.default.strictEqual(duplicateResponse.statusCode, 200);
        const dupBody = JSON.parse(duplicateResponse.payload);
        node_assert_1.default.strictEqual(dupBody.status, "DUPLICATE_IGNORED");
    });
    (0, node_test_1.test)("POST /api/v1/message/generate generates multilingual messages", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/message/generate",
            payload: {
                businessName: "ABC Dental Clinic",
                customerName: "Rahul",
                customerPhone: "+919876543210",
                missedCallTime: "7:30 PM",
                tone: "PROFESSIONAL",
                language: "ENGLISH",
            },
        });
        node_assert_1.default.strictEqual(response.statusCode, 200);
        const body = JSON.parse(response.payload);
        node_assert_1.default.ok(body.content.includes("ABC Dental Clinic"));
        node_assert_1.default.ok(body.content.includes("7:30 PM"));
    });
});
//# sourceMappingURL=webhook-security.test.js.map