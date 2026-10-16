import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { initializeDatabase, getDbPool } from './db';
import { apiRouter } from './routes/api';
import { adminRouter } from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline styles for admin SPA
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature', 'X-Admin-Secret'],
  })
);

// 3. Global Rate Limiter (200 requests per minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errorCode: 'RATE_LIMIT_EXCEEDED',
    error: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// 4. Raw Body Capture for Razorpay Webhooks
app.use(
  '/api/razorpay/webhook',
  express.raw({ type: 'application/json' }),
  (req: Request, _res: Response, next: NextFunction) => {
    (req as any).rawBody = req.body;
    next();
  }
);

// 5. Standard JSON Body Parser for all other endpoints
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Health Check Endpoint (Required by Railway)
app.get('/health', async (_req: Request, res: Response) => {
  const p = getDbPool();
  let dbStatus = 'disconnected';
  if (p) {
    try {
      await p.query('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'unreachable';
    }
  } else {
    dbStatus = 'in-memory-fallback';
  }

  res.status(200).json({
    status: 'ok',
    service: 'MissCall Assistant Railway Backend',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// 7. Mount Core API & Admin Routes
app.use('/api', apiRouter);
app.use('/api/admin', adminRouter);

// 8. Serve static files (APK downloads & assets)
const publicDir = path.resolve(__dirname, '../../public');
app.use('/public', express.static(publicDir));
app.use('/downloads', express.static(path.join(publicDir, 'downloads')));

// 9. Root Route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'MissCall Assistant API',
    version: '1.0.0',
    platform: 'Railway Node.js + TypeScript + PostgreSQL',
    endpoints: {
      health: '/health',
      register: 'POST /api/register',
      status: 'GET /api/status',
      createSubscription: 'POST /api/subscription/create',
      verifySubscription: 'POST /api/subscription/verify',
      webhook: 'POST /api/razorpay/webhook',
      admin: '/api/admin',
    },
  });
});

// 10. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    errorCode: 'INTERNAL_SERVER_ERROR',
    error: err.message || 'An unexpected error occurred.',
  });
});

// Start Server & Run Auto-Migrations
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`[MissCall Assistant Backend] Running on Railway port ${PORT}`);
      console.log(`[Health Endpoint] http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('[Server Start Failure]:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
