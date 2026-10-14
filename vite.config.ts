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
