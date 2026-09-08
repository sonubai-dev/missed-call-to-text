import { test, describe } from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import { buildApp } from "../src/app";
import { config } from "../src/config/env";

describe("Webhook Security & Endpoints", () => {
  const app = buildApp();

  test("GET /health returns 200 OK", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });
    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.payload);
    assert.strictEqual(body.status, "OK");
  });

  test("GET /api/v1/webhooks/whatsapp verifies Meta challenge", async () => {
    const challenge = "test_challenge_123456";
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${config.META_VERIFY_TOKEN}&hub.challenge=${challenge}`,
    });
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.payload, challenge);
  });

  test("GET /api/v1/webhooks/whatsapp rejects invalid token", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test`,
    });
    assert.strictEqual(response.statusCode, 403);
  });

  test("POST /api/v1/webhooks/missed-call rejects missing signature", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/webhooks/missed-call",
      payload: {
        phoneNumber: "+919876543210",
        timestamp: Date.now(),
      },
    });
    assert.strictEqual(response.statusCode, 401);
  });

  test("POST /api/v1/webhooks/missed-call accepts valid HMAC signature and processes call", async () => {
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
    const signature = crypto
      .createHmac("sha256", config.WEBHOOK_SECRET)
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

    assert.strictEqual(response.statusCode, 201);
    const resBody = JSON.parse(response.payload);
    assert.strictEqual(resBody.success, true);
    assert.strictEqual(resBody.status, "PROCESSED");
    assert.ok(resBody.callId);
    assert.ok(resBody.followupId);

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

    assert.strictEqual(duplicateResponse.statusCode, 200);
    const dupBody = JSON.parse(duplicateResponse.payload);
    assert.strictEqual(dupBody.status, "DUPLICATE_IGNORED");
  });

  test("POST /api/v1/message/generate generates multilingual messages", async () => {
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

    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.payload);
    assert.ok(body.content.includes("ABC Dental Clinic"));
    assert.ok(body.content.includes("7:30 PM"));
  });
});
