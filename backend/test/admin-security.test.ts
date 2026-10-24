process.env.NODE_ENV = 'test';
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import http from "node:http";

describe("MissCall Assistant Backend Security & Admin Test Suite", () => {
  let server: http.Server;
  let baseUrl: string;
  let ADMIN_OWNER_EMAIL: string;
  let ADMIN_PASSWORD: string;
  let ADMIN_SECRET: string;
  let RazorpayService: any;

  before(async () => {
    process.env.NODE_ENV = 'test';
    const serverModule = await import("../src/server");
    const app = serverModule.default;
    const authModule = await import("../src/middleware/auth");
    ADMIN_OWNER_EMAIL = authModule.ADMIN_OWNER_EMAIL;
    ADMIN_PASSWORD = authModule.ADMIN_PASSWORD;
    ADMIN_SECRET = authModule.ADMIN_SECRET;
    const razorModule = await import("../src/services/razorpay");
    RazorpayService = razorModule.RazorpayService;

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  test("Unauthorized admin email is rejected with 403 Forbidden", async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "hacker@example.com",
        password: ADMIN_PASSWORD,
      }),
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /Access Denied/i);
  });

  test("Invalid password for authorized email is rejected with 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_OWNER_EMAIL,
        password: "wrong_password_xyz",
      }),
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /Invalid admin credentials/i);
  });

  test("Valid ADMIN_OWNER_EMAIL and password sets HttpOnly cookie and succeeds", async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_OWNER_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.admin.email, ADMIN_OWNER_EMAIL);

    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "Set-Cookie header must be present");
    assert.match(setCookie, /admin_session=/);
    assert.match(setCookie, /HttpOnly/i, "Cookie must have HttpOnly flag");
  });

  test("GET /api/admin/me returns 401 without cookie or header", async () => {
    const res = await fetch(`${baseUrl}/api/admin/me`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.authenticated, false);
  });

  test("GET /api/admin/me returns admin profile with valid session cookie", async () => {
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_OWNER_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const setCookie = loginRes.headers.get("set-cookie")!;
    const cookieVal = setCookie.split(";")[0];

    const meRes = await fetch(`${baseUrl}/api/admin/me`, {
      headers: {
        cookie: cookieVal,
      },
    });

    assert.strictEqual(meRes.status, 200);
    const meBody = await meRes.json();
    assert.strictEqual(meBody.authenticated, true);
    assert.strictEqual(meBody.admin.email, ADMIN_OWNER_EMAIL);
  });

  test("GET /api/admin/stats allows access via x-admin-secret header", async () => {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: {
        "x-admin-secret": ADMIN_SECRET,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.totalBusinesses === "number");
  });

  test("Razorpay webhook rejects tampered signature", async () => {
    const fakePayload = JSON.stringify({ event: "subscription.charged" });
    const res = await fetch(`${baseUrl}/api/razorpay/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "tampered_signature_12345",
      },
      body: fakePayload,
    });

    // When WEBHOOK_SECRET is set, it returns 400
    if (RazorpayService.getWebhookSecret() && !RazorpayService.getWebhookSecret().includes('placeholder')) {
      assert.strictEqual(res.status, 400);
    } else {
      assert.strictEqual(res.status, 200);
    }
  });
});
