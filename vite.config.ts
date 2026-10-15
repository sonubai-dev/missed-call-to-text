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
            const isValid = verifyAdminSessionCookie(req.headers.cookie);
            if (!isValid) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ authenticated: false, error: 'Unauthorized: Valid administrative session required.' }));
              return;
            }
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
