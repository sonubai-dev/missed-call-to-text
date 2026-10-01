import { test, describe } from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import { buildApp } from "../src/app";
import { config } from "../src/config/env";

describe("Subscription & Entitlement Security Test Suite", () => {
  const app = buildApp();
  let userToken: string = "";
  let userEmail: string = "dentist@example.com";
  let activeSubId: string = "sub_active_test_123";

  test("User Registration issues cryptographically signed JWT", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: userEmail,
        password: "secure_password_123",
        businessName: "Dentist Care",
      },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.ok(body.token);
    assert.strictEqual(body.user.email, userEmail);
    userToken = body.token;
  });

  test("Subscription status requires valid Authorization header", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/subscription/status",
    });
    assert.strictEqual(res.statusCode, 401);
  });

  test("Subscription status rejects forged/tampered JWT tokens", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6ImF0dGFja2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature_signature";
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/subscription/status",
      headers: {
        Authorization: `Bearer ${fakeToken}`,
      },
    });
    assert.strictEqual(res.statusCode, 401);
  });

  test("New user with no subscription reports status 'none'", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/subscription/status",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.active, false);
    assert.strictEqual(body.status, "none");
  });

  test("POST /api/v1/subscription/create generates checkout and never leaks secrets", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/subscription/create",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.ok(body.subscriptionId);
    assert.ok(body.shortUrl);
    assert.ok(body.token);
    // Public Key ID is present
    assert.strictEqual(body.keyId, config.RAZORPAY_KEY_ID);
    // Private secrets are NEVER exposed in the JSON payload!
    assert.strictEqual(body.secret, undefined);
    assert.strictEqual(body.key_secret, undefined);
    assert.strictEqual(body.webhook_secret, undefined);
  });

  test("Razorpay Webhook rejects requests without signature", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/razorpay/webhook",
      payload: {
        event: "subscription.charged",
      },
    });
    assert.strictEqual(res.statusCode, 400);
  });

  test("Razorpay Webhook rejects invalid / forged signatures", async () => {
    const payload = {
      event: "subscription.charged",
      payload: {
        subscription: {
          entity: {
            id: activeSubId,
            notes: { email: userEmail },
          },
        },
      },
    };

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/razorpay/webhook",
      headers: {
        "x-razorpay-signature": "0000000000000000000000000000000000000000000000000000000000000000",
      },
      payload,
    });
    assert.strictEqual(res.statusCode, 400);
  });

  test("Razorpay Webhook accepts valid signature and activates subscription", async () => {
    const payload = {
      event: "subscription.charged",
      payload: {
        subscription: {
          entity: {
            id: activeSubId,
            customer_id: "cust_12345",
            notes: { email: userEmail },
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/razorpay/webhook",
      headers: {
        "x-razorpay-signature": validSignature,
      },
      payload,
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.status, "ok");
    assert.strictEqual(body.received, true);
  });

  test("Active subscription query grants entitlement", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/subscription/status?subscription_id=${activeSubId}`,
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.active, true);
    assert.strictEqual(body.status, "active");
  });

  test("Subscription halted/failed payment revokes entitlement", async () => {
    // sub_inactive triggers simulated halted status in mock service
    const inactiveSubId = "sub_inactive_failed_mandate";
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/subscription/status?subscription_id=${inactiveSubId}`,
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.active, false);
    assert.strictEqual(body.status, "halted");
    assert.ok(body.message.includes("needs attention") || body.message.includes("renew"));
  });

  test("Security: User cannot query or hijack another user's subscription ID", async () => {
    const victimSub = "sub_victim_999";
    // Register another user
    const otherUserRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "attacker@example.com",
        password: "attacker_password",
      },
    });
    const attackerToken = JSON.parse(otherUserRes.payload).token;

    // Attacker tries to pass another email's subscription ID
    // (mock returns notes.email = "user@example.com", attacker is "attacker@example.com")
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/subscription/status?subscription_id=${victimSub}`,
      headers: {
        Authorization: `Bearer ${attackerToken}`,
      },
    });

    assert.strictEqual(res.statusCode, 403);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.active, false);
    assert.strictEqual(body.status, "unauthorized");
  });
});
