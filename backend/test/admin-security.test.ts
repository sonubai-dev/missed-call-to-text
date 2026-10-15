import { test, describe } from "node:test";
import assert from "node:assert";
import { buildApp } from "../src/app";
import { config } from "../src/config/env";

describe("Admin Authentication & Authorization Security Suite", () => {
  const app = buildApp();
  const ownerEmail = config.ADMIN_OWNER_EMAIL;
  const adminPassword = config.ADMIN_PASSWORD;

  test("Unauthorized email is rejected with 403 Forbidden", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/admin/login",
      payload: {
        email: "hacker@example.com",
        password: adminPassword,
      },
    });

    assert.strictEqual(res.statusCode, 403);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.success, false);
    assert.match(body.error, /Access Denied/i);
  });

  test("Invalid password for authorized email is rejected with 401 Unauthorized", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/admin/login",
      payload: {
        email: ownerEmail,
        password: "wrong_password_xyz",
      },
    });

    assert.strictEqual(res.statusCode, 401);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.success, false);
    assert.match(body.error, /Invalid admin credentials/i);
  });

  test("Valid ADMIN_OWNER_EMAIL and password sets HttpOnly cookie and succeeds", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/admin/login",
      payload: {
        email: ownerEmail,
        password: adminPassword,
      },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.admin.email, ownerEmail);

    const setCookie = res.headers["set-cookie"] as string;
    assert.ok(setCookie, "Set-Cookie header must be present");
    assert.match(setCookie, /admin_session=/);
    assert.match(setCookie, /HttpOnly/i, "Cookie must have HttpOnly flag");
    assert.match(setCookie, /SameSite=Lax/i, "Cookie must have SameSite flag");
  });

  test("GET /api/v1/admin/me returns 401 without cookie", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/admin/me",
    });

    assert.strictEqual(res.statusCode, 401);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.authenticated, false);
  });

  test("GET /api/v1/admin/me returns admin profile with valid cookie", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/login",
      payload: {
        email: ownerEmail,
        password: adminPassword,
      },
    });

    const setCookie = loginRes.headers["set-cookie"] as string;
    const cookieVal = setCookie.split(";")[0];

    const meRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/me",
      headers: {
        cookie: cookieVal,
      },
    });

    assert.strictEqual(meRes.statusCode, 200);
    const meBody = JSON.parse(meRes.payload);
    assert.strictEqual(meBody.authenticated, true);
    assert.strictEqual(meBody.admin.email, ownerEmail);
    assert.strictEqual(meBody.admin.role, "owner");
  });

  test("POST /api/v1/admin/logout clears session cookie", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/admin/logout",
    });

    assert.strictEqual(res.statusCode, 200);
    const setCookie = res.headers["set-cookie"] as string;
    assert.match(setCookie, /Max-Age=0/i, "Logout must clear cookie with Max-Age=0");
  });
});
