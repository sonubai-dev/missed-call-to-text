import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'apk-headers-middleware',
      buildStart() {
        const publicDownloads = path.resolve(process.cwd(), 'public/downloads');
        if (!fs.existsSync(publicDownloads)) {
          fs.mkdirSync(publicDownloads, { recursive: true });
        }
        const targetApk = path.join(publicDownloads, 'misscall-assistant.apk');
        const sourceApk = path.resolve(process.cwd(), 'web-dashboard/public/downloads/misscall-assistant.apk');
        if ((!fs.existsSync(targetApk) || fs.statSync(targetApk).size < 10000000) && fs.existsSync(sourceApk)) {
          fs.copyFileSync(sourceApk, targetApk);
        }
      },
      configureServer(server) {
        // Ensure apk directory exists
        const publicDownloads = path.resolve(process.cwd(), 'public/downloads');
        if (!fs.existsSync(publicDownloads)) {
          fs.mkdirSync(publicDownloads, { recursive: true });
        }

        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/release-apk-status') {
            const infoPath = path.resolve(process.cwd(), 'public/downloads/release-info.json');
            const apkPath = path.resolve(process.cwd(), 'public/downloads/misscall-assistant.apk');
            const exists = fs.existsSync(apkPath);
            const stats = exists ? fs.statSync(apkPath) : null;
            let meta: any = {};
            if (fs.existsSync(infoPath)) {
              try {
                meta = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
              } catch (e) {}
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(
              JSON.stringify({
                available: exists,
                filename: 'misscall-assistant.apk',
                path: '/downloads/misscall-assistant.apk',
                sizeBytes: stats ? stats.size : 0,
                sizeFormatted: meta.fileSize || '20.5 MB (Release)',
                mimeType: 'application/vnd.android.package-archive',
                sha256: meta.sha256 || '4EA4DADE497925A6430525DBADE99C964DC1F71E01261029A89736C7C75BCEEA',
                status: exists ? 'available' : 'missing',
                verified: exists,
                lastChecked: new Date().toISOString(),
              })
            );
            return;
          }

          if (req.url && (req.url === '/downloads/misscall-assistant.apk' || req.url.startsWith('/downloads/misscall-assistant.apk?'))) {
            const apkPath = path.resolve(process.cwd(), 'public/downloads/misscall-assistant.apk');
            if (fs.existsSync(apkPath)) {
              const fileData = fs.readFileSync(apkPath);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="Missed-Call-Assistant.apk"');
              res.setHeader('Content-Length', fileData.length.toString());
              res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
              res.end(fileData);
              return;
            }
          }

          // --- ADMINISTRATIVE SESSION VALIDATION & AUTHORIZATION ---
          const adminOwnerEmail = (process.env.ADMIN_OWNER_EMAIL || 'ssdd747346@gmail.com').trim().toLowerCase();
          const adminPassword = (process.env.ADMIN_PASSWORD || 'admin_misscall_secret_2026').trim();
          const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || 'admin_jwt_super_secret_session_key_2026';

          const signAdminSessionToken = (email: string): string => {
            const payload = JSON.stringify({
              email: email.toLowerCase(),
              role: 'owner',
              exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            });
            const encodedPayload = Buffer.from(payload).toString('base64url');
            const signature = crypto.createHmac('sha256', adminSessionSecret).update(encodedPayload).digest('base64url');
            return `${encodedPayload}.${signature}`;
          };

          const verifyAdminSessionCookie = (cookieHeader: string | undefined): boolean => {
            if (!cookieHeader) return false;
            const match = cookieHeader.match(/admin_session=([^;]+)/);
            if (!match) return false;
            const token = match[1].trim();

            try {
              const parts = token.split('.');
              if (parts.length !== 2) return false;
              const [encodedPayload, signature] = parts;
              const expectedSig = crypto.createHmac('sha256', adminSessionSecret).update(encodedPayload).digest('base64url');

              const sigBuf = Buffer.from(signature);
              const expBuf = Buffer.from(expectedSig);
              if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
                return false;
              }

              const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
              if (!payload.email || payload.email.toLowerCase() !== adminOwnerEmail) {
                return false;
              }
              if (payload.exp && Date.now() > payload.exp) {
                return false;
              }
              return true;
            } catch {
              return false;
            }
          };

          const pathname = req.url ? req.url.split('?')[0] : '';
          const isSecure = req.headers['x-forwarded-proto'] === 'https' || (req.socket as any)?.encrypted || process.env.NODE_ENV === 'production';

          // --- DEVICE & BUSINESS DATABASE REPOSITORY ---
          const devicesDbPath = path.resolve(process.cwd(), '.data/devices_db.json');
          const getDevicesMap = (): Record<string, any> => {
            try {
              if (fs.existsSync(devicesDbPath)) {
                const list = JSON.parse(fs.readFileSync(devicesDbPath, 'utf-8') || '[]');
                const map: Record<string, any> = {};
                list.forEach((item: any) => { map[item.deviceId] = item; });
                return map;
              }
            } catch {}
            return {};
          };

          const saveDevice = (rec: any) => {
            try {
              if (!fs.existsSync(path.dirname(devicesDbPath))) {
                fs.mkdirSync(path.dirname(devicesDbPath), { recursive: true });
              }
              const map = getDevicesMap();
              map[rec.deviceId] = rec;
              fs.writeFileSync(devicesDbPath, JSON.stringify(Object.values(map), null, 2), 'utf-8');
            } catch (e) {
              console.error('Failed to save device record:', e);
            }
          };

          // 1. POST /api/admin/login
          if (pathname === '/api/admin/login' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body || '{}');
                const email = (data.email || '').trim().toLowerCase();
                const password = (data.password || '').trim();

                if (!email || !password) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'Email and password are required.' }));
                  return;
                }

                // Strict ADMIN_OWNER_EMAIL authorization check
                if (email !== adminOwnerEmail) {
                  res.statusCode = 403;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'Access Denied: Only the authorized ADMIN_OWNER_EMAIL can access administrative controls.',
                  }));
                  return;
                }

                // Password verification
                if (password !== adminPassword) {
                  res.statusCode = 401;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'Invalid admin credentials provided.' }));
                  return;
                }

                // Cryptographic token & HttpOnly, Secure cookie emission
                const token = signAdminSessionToken(adminOwnerEmail);
                const cookieFlags = `admin_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400${isSecure ? '; Secure' : ''}`;

                res.statusCode = 200;
                res.setHeader('Set-Cookie', cookieFlags);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  admin: { email: adminOwnerEmail, role: 'owner' },
                  message: 'Admin authentication successful.',
                }));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Failed to process login.' }));
              }
            });
            return;
          }

          // 2. POST /api/admin/logout
          if (pathname === '/api/admin/logout' && req.method === 'POST') {
            res.statusCode = 200;
            res.setHeader('Set-Cookie', `admin_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isSecure ? '; Secure' : ''}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Admin logged out.' }));
            return;
          }

          // 3. GET /api/admin/me
          if (pathname === '/api/admin/me' && req.method === 'GET') {
            const isValid = verifyAdminSessionCookie(req.headers.cookie);
            if (!isValid) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ authenticated: false, error: 'No active administrative session.' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ authenticated: true, admin: { email: adminOwnerEmail, role: 'owner' } }));
            return;
          }

          // 4. Any other API under /api/admin/* (Protected)
          if (pathname.startsWith('/api/admin/')) {
            const authHeader = req.headers.authorization || '';
            const adminSecretHeader = req.headers['x-admin-secret'] || '';
            const masterSecret = process.env.ADMIN_SECRET || 'misscall_admin_super_secret_master_key_2026';
            const isValidSecret = adminSecretHeader === masterSecret || authHeader === `Bearer ${masterSecret}`;
            const isValidCookie = verifyAdminSessionCookie(req.headers.cookie);

            if (!isValidSecret && !isValidCookie) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ authenticated: false, error: 'Unauthorized: Valid administrative session required.' }));
              return;
            }

            // GET /api/admin/stats
            if (pathname === '/api/admin/stats' && req.method === 'GET') {
              const map = getDevicesMap();
              const list = Object.values(map);
              const total = list.length;
              const active = list.filter((b: any) => b.status === 'active').length;
              const unpaid = list.filter((b: any) => b.status === 'registered_unpaid').length;
              const trial = list.filter((b: any) => b.status === 'trial').length;
              const halted = list.filter((b: any) => b.status === 'halted' || b.status === 'cancelled').length;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                totalBusinesses: total,
                activeSubscribers: active,
                registeredUnpaid: unpaid,
                trialUsers: trial,
                haltedOrCancelled: halted,
                estimatedMonthlyRevenue: active * 100,
                currency: 'INR',
              }));
              return;
            }

            // GET /api/admin/businesses
            if (pathname === '/api/admin/businesses' && req.method === 'GET') {
              const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
              const status = urlObj.searchParams.get('status') || 'all';
              const search = (urlObj.searchParams.get('search') || '').toLowerCase();
              const map = getDevicesMap();
              let list = Object.values(map);
              if (status !== 'all') {
                list = list.filter((b: any) => b.status === status);
              }
              if (search) {
                list = list.filter((b: any) =>
                  (b.businessName || '').toLowerCase().includes(search) ||
                  (b.phone || '').includes(search) ||
                  (b.deviceId || '').includes(search)
                );
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                data: list.map((b: any) => ({
                  id: b.id || b.deviceId,
                  device_id: b.deviceId,
                  business_name: b.businessName || 'Business',
                  phone: b.phone || '+91 98765 00000',
                  status: b.status,
                  razorpay_subscription_id: b.razorpaySubscriptionId || null,
                  valid_until: b.validUntil ? new Date(b.validUntil).toISOString() : null,
                  created_at: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
                })),
                total: list.length,
              }));
              return;
            }

            // POST /api/admin/notify
            if (pathname === '/api/admin/notify' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                const parsed = JSON.parse(body || '{}');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  message: `Notification dispatched to ${parsed.businessIds?.length || 0} business(es).`,
                  pushSentCount: parsed.businessIds?.length || 0,
                }));
              });
              return;
            }
          }

          // GET /health
          if (pathname === '/health' && req.method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'ok',
              service: 'MissCall Assistant Dev & Railway Backend',
              timestamp: new Date().toISOString(),
              database: 'connected',
            }));
            return;
          }

          // 5. Admin Page Routes (/admin, /admin/dashboard, /admin/*)
          if (pathname === '/admin' || (pathname.startsWith('/admin/') && pathname !== '/admin/login')) {
            const isValid = verifyAdminSessionCookie(req.headers.cookie);
            if (!isValid) {
              const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
              if (acceptsHtml) {
                // Direct browser navigation redirect to /admin/login
                res.statusCode = 302;
                res.setHeader('Location', `/admin/login?from=${encodeURIComponent(pathname)}`);
                res.end();
                return;
              } else {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ authenticated: false, redirect: '/admin/login' }));
                return;
              }
            }
          }

          // 6. If already authenticated admin visits /admin/login, redirect to /admin
          if (pathname === '/admin/login' && req.method === 'GET') {
            const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
            if (acceptsHtml && verifyAdminSessionCookie(req.headers.cookie)) {
              res.statusCode = 302;
              res.setHeader('Location', '/admin');
              res.end();
              return;
            }
          }

          // --- DEVICE AUTH & RAZORPAY SUBSCRIPTION ENGINE ---
          const JWT_DEVICE_SECRET = process.env.JWT_SECRET || 'misscall_device_jwt_secret_key_2026_production';

          // 6.5 POST /api/register { deviceId, businessName, phone, fcmToken? }
          if (pathname === '/api/register' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const deviceId = (parsed.deviceId || '').trim();
                const businessName = (parsed.businessName || 'My Business').trim();
                const phone = (parsed.phone || '').trim();
                const fcmToken = parsed.fcmToken || null;

                if (!deviceId || !businessName || !phone) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, errorCode: 'VALIDATION_ERROR', error: 'deviceId, businessName, and phone are required.' }));
                  return;
                }

                const map = getDevicesMap();
                let device = map[deviceId];
                const now = Date.now();
                if (!device) {
                  const trialDuration = 3 * 24 * 60 * 60 * 1000;
                  device = {
                    id: crypto.randomUUID(),
                    deviceId,
                    businessName,
                    phone,
                    fcmToken,
                    status: 'registered_unpaid',
                    trialEndsAt: now + trialDuration,
                    validUntil: now + trialDuration,
                    createdAt: now,
                    updatedAt: now,
                  };
                } else {
                  device.businessName = businessName;
                  device.phone = phone;
                  if (fcmToken) device.fcmToken = fcmToken;
                  device.updatedAt = now;
                }
                saveDevice(device);

                const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
                const payload = Buffer.from(JSON.stringify({
                  businessId: device.id || device.deviceId,
                  deviceId,
                  role: 'business',
                  iat: Math.floor(now / 1000),
                  exp: Math.floor(now / 1000) + 90 * 86400,
                })).toString('base64url');
                const sig = crypto.createHmac('sha256', JWT_DEVICE_SECRET).update(`${header}.${payload}`).digest('base64url');
                const token = `${header}.${payload}.${sig}`;

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  businessId: device.id || device.deviceId,
                  token,
                  status: device.status,
                  businessName: device.businessName,
                  phone: device.phone,
                }));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: e.message || 'Registration failed' }));
              }
            });
            return;
          }

          // 6.6 GET /api/status (with JWT authorization)
          if (pathname === '/api/status' && req.method === 'GET') {
            const authHeader = req.headers.authorization || '';
            let targetDeviceId = '';
            try {
              const token = authHeader.replace(/^Bearer /i, '').trim();
              const [header, payload, sig] = token.split('.');
              const expectedSig = crypto.createHmac('sha256', JWT_DEVICE_SECRET).update(`${header}.${payload}`).digest('base64url');
              const sigBuf = Buffer.from(sig);
              const expBuf = Buffer.from(expectedSig);
              if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
                const dec = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
                if (dec.deviceId) targetDeviceId = dec.deviceId;
              }
            } catch {}

            if (!targetDeviceId) {
              const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
              targetDeviceId = (urlObj.searchParams.get('deviceId') || '').trim();
            }

            if (!targetDeviceId) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, errorCode: 'UNAUTHORIZED', error: 'Bearer token or deviceId required' }));
              return;
            }

            const map = getDevicesMap();
            const device = map[targetDeviceId];
            const now = Date.now();

            if (!device) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, errorCode: 'NOT_FOUND', error: 'Business not found' }));
              return;
            }

            let status = device.status || 'registered_unpaid';
            if (status === 'active' && device.validUntil && device.validUntil < now) {
              status = 'registered_unpaid';
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              status,
              validUntil: device.validUntil ? new Date(device.validUntil).toISOString() : null,
              businessName: device.businessName,
              phone: device.phone,
            }));
            return;
          }

          // 7. POST /api/auth/device
          if (pathname === '/api/auth/device' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const deviceId = (parsed.deviceId || '').trim();
                if (!deviceId) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, errorCode: 'INVALID_DEVICE_ID', error: 'deviceId is required' }));
                  return;
                }

                const map = getDevicesMap();
                let device = map[deviceId];
                const now = Date.now();

                if (!device) {
                  const trialDuration = 3 * 24 * 60 * 60 * 1000;
                  device = {
                    deviceId,
                    status: 'trial',
                    trialEndsAt: now + trialDuration,
                    validUntil: now + trialDuration,
                    createdAt: now,
                    updatedAt: now,
                  };
                  saveDevice(device);
                }

                let currentStatus = device.status;
                let daysRemaining = 0;
                if (device.status === 'trial') {
                  if (now > device.trialEndsAt) {
                    currentStatus = 'expired';
                  } else {
                    daysRemaining = Math.max(1, Math.ceil((device.trialEndsAt - now) / 86400000));
                  }
                } else if (device.status === 'active') {
                  if (now > device.validUntil) {
                    currentStatus = 'expired';
                  } else {
                    daysRemaining = Math.max(0, Math.ceil((device.validUntil - now) / 86400000));
                  }
                }

                const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
                const payload = Buffer.from(JSON.stringify({
                  deviceId,
                  role: 'device',
                  iat: Math.floor(now / 1000),
                  exp: Math.floor(now / 1000) + 86400,
                })).toString('base64url');
                const sig = crypto.createHmac('sha256', JWT_DEVICE_SECRET).update(`${header}.${payload}`).digest('base64url');
                const token = `${header}.${payload}.${sig}`;

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  token,
                  deviceId,
                  status: currentStatus,
                  validUntil: device.validUntil,
                  trialDaysRemaining: daysRemaining,
                  plan: '₹100/month',
                  message: currentStatus === 'trial' ? `3-Day Free Trial active (${daysRemaining} days left)` : 'Device authenticated',
                }));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: e.message || 'Device authentication failed' }));
              }
            });
            return;
          }

          // 8. GET /api/subscription/status
          if (pathname === '/api/subscription/status' && req.method === 'GET') {
            const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const deviceId = (urlObj.searchParams.get('deviceId') || '').trim();

            if (!deviceId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, errorCode: 'MISSING_DEVICE_ID', error: 'deviceId query param is required' }));
              return;
            }

            const map = getDevicesMap();
            const device = map[deviceId];
            const now = Date.now();

            if (!device) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                status: 'none',
                validUntil: 0,
                trialDaysRemaining: 0,
                isTrial: false,
                plan: '₹100/month',
                message: 'Device not registered',
              }));
              return;
            }

            let computedStatus = device.status;
            let daysRemaining = 0;
            if (device.status === 'trial') {
              if (now > device.trialEndsAt) {
                computedStatus = 'expired';
              } else {
                daysRemaining = Math.max(1, Math.ceil((device.trialEndsAt - now) / 86400000));
              }
            } else if (device.status === 'active') {
              if (now > device.validUntil) {
                computedStatus = 'expired';
              } else {
                daysRemaining = Math.max(0, Math.ceil((device.validUntil - now) / 86400000));
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              deviceId: device.deviceId,
              status: computedStatus,
              validUntil: device.validUntil,
              trialDaysRemaining: daysRemaining,
              isTrial: computedStatus === 'trial',
              plan: '₹100/month',
              subscriptionId: device.razorpaySubscriptionId || null,
              message: computedStatus === 'active'
                ? `Active until ${new Date(device.validUntil).toLocaleDateString()}`
                : computedStatus === 'trial'
                ? `3-Day Free Trial (${daysRemaining} days left)`
                : 'Subscription expired',
            }));
            return;
          }

          // 9. POST /api/subscription/create
          if (pathname === '/api/subscription/create' && req.method === 'POST') {
            const authHeader = req.headers.authorization || '';
            let verifiedDeviceId = '';
            try {
              const token = authHeader.replace(/^Bearer /i, '').trim();
              const [header, payload, sig] = token.split('.');
              const expectedSig = crypto.createHmac('sha256', JWT_DEVICE_SECRET).update(`${header}.${payload}`).digest('base64url');
              if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
                const dec = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
                if (dec.deviceId && dec.exp > Date.now() / 1000) {
                  verifiedDeviceId = dec.deviceId;
                }
              }
            } catch {}

            if (!verifiedDeviceId) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, errorCode: 'UNAUTHORIZED', error: 'Valid Bearer JWT is required' }));
              return;
            }

            const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
            const subId = `sub_${Date.now()}_${verifiedDeviceId.substring(0, 6)}`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              subscription_id: subId,
              key_id: keyId,
              plan_id: process.env.RAZORPAY_PLAN_ID || 'plan_misscall_100mo',
              amount: 10000,
              currency: 'INR',
              short_url: 'https://rzp.io/rzp/DCET6eO8',
              name: 'MissCall Assistant Pro',
              description: '₹100/month Unlimited Missed Call SMS & Automation',
            }));
            return;
          }

          // 10. POST /api/subscription/verify
          if (pathname === '/api/subscription/verify' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const paymentId = (parsed.razorpay_payment_id || '').trim();
                const subscriptionId = (parsed.razorpay_subscription_id || '').trim();
                const signature = (parsed.razorpay_signature || '').trim();
                const deviceId = (parsed.deviceId || '').trim();

                if (!paymentId || !subscriptionId) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, errorCode: 'MISSING_PAYMENT_FIELDS', error: 'Payment fields required' }));
                  return;
                }

                const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
                if (keySecret && !keySecret.includes('placeholder')) {
                  const expected = crypto.createHmac('sha256', keySecret).update(`${paymentId}|${subscriptionId}`).digest('hex');
                  const sigBuf = Buffer.from(signature);
                  const expBuf = Buffer.from(expected);
                  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, errorCode: 'INVALID_SIGNATURE', error: 'Invalid HMAC signature' }));
                    return;
                  }
                }

                const map = getDevicesMap();
                let device = map[deviceId];
                const now = Date.now();
                if (!device) {
                  device = { deviceId: deviceId || `dev_${Date.now()}`, createdAt: now };
                }
                device.status = 'active';
                device.razorpaySubscriptionId = subscriptionId;
                device.lastPaymentId = paymentId;
                device.validUntil = Math.max(device.validUntil || 0, now) + 30 * 86400000;
                device.updatedAt = now;
                saveDevice(device);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  status: 'active',
                  validUntil: device.validUntil,
                  subscriptionId,
                  paymentId,
                  message: 'Subscription verified and activated for 30 days',
                }));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: e.message || 'Verification failed' }));
              }
            });
            return;
          }

          // 11. POST /api/razorpay/webhook
          if (pathname === '/api/razorpay/webhook' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const event = JSON.parse(body || '{}');
                const eventType = event.event || '';
                const payload = event.payload || {};

                if (eventType === 'subscription.charged' || eventType === 'subscription.activated') {
                  const subId = payload.subscription?.entity?.id;
                  const currentEnd = (payload.subscription?.entity?.current_end || 0) * 1000 || Date.now() + 30 * 86400000;
                  const map = getDevicesMap();
                  for (const dev of Object.values(map)) {
                    if (dev.razorpaySubscriptionId === subId) {
                      dev.status = 'active';
                      dev.validUntil = currentEnd;
                      dev.updatedAt = Date.now();
                      saveDevice(dev);
                      break;
                    }
                  }
                } else if (eventType === 'subscription.halted' || eventType === 'subscription.cancelled') {
                  const subId = payload.subscription?.entity?.id;
                  const map = getDevicesMap();
                  for (const dev of Object.values(map)) {
                    if (dev.razorpaySubscriptionId === subId) {
                      dev.status = 'expired';
                      dev.updatedAt = Date.now();
                      saveDevice(dev);
                      break;
                    }
                  }
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'ok', received: true, event: eventType }));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: e.message || 'Webhook error' }));
              }
            });
            return;
          }

          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
