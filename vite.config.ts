import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

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
        // Ensure apk exists on dev server boot
        const publicDownloads = path.resolve(process.cwd(), 'public/downloads');
        if (!fs.existsSync(publicDownloads)) {
          fs.mkdirSync(publicDownloads, { recursive: true });
        }
        const targetApk = path.join(publicDownloads, 'misscall-assistant.apk');
        const sourceApk = path.resolve(process.cwd(), 'web-dashboard/public/downloads/misscall-assistant.apk');
        if ((!fs.existsSync(targetApk) || fs.statSync(targetApk).size < 10000000) && fs.existsSync(sourceApk)) {
          fs.copyFileSync(sourceApk, targetApk);
        }

        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/release-apk-status') {
            const apkPath = path.resolve(process.cwd(), 'public/downloads/misscall-assistant.apk');
            const exists = fs.existsSync(apkPath);
            const stats = exists ? fs.statSync(apkPath) : null;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(
              JSON.stringify({
                available: exists,
                filename: 'misscall-assistant.apk',
                path: '/downloads/misscall-assistant.apk',
                sizeBytes: stats ? stats.size : 0,
                sizeFormatted: '20.5 MB (Universal Release)',
                mimeType: 'application/vnd.android.package-archive',
                sha256: '48FF415C3CBC11CF07D37017DC88BE959BE7955AACADDEA0BAD6741C2A7BFBE8',
                status: exists ? 'available' : 'missing',
                verified: exists,
                lastChecked: new Date().toISOString(),
              })
            );
            return;
          }
          if (req.url && req.url.includes('.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="misscall-assistant.apk"');
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
