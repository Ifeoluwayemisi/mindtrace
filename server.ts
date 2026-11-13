import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, checkDatabaseConnection } from './src/db/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

// 1. Core Parsers & Security Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// 2. Session Store using connect-pg-simple or MemoryStore fallback
const sessionSecret =
  process.env.SESSION_SECRET || 'd8e52a91b4f3c7e012894a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d';

let sessionStore: any;
if (pool) {
  const PgSession = connectPgSimple(session);
  sessionStore = new PgSession({
    pool: pool as any,
    tableName: 'user_sessions',
    createTableIfMissing: false,
  });
} else {
  sessionStore = new session.MemoryStore();
}

app.use(
  session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 Days
    },
  })
);

// 3. API Routers
import { authRouter } from './src/routes/auth';
import { syncRouter } from './src/routes/sync';
import { teacherRouter } from './src/routes/teacher';
import { teacherAssignmentRouter } from './src/routes/teacherAssignments';
import { aiRouter } from './src/routes/ai';
import { adminRouter } from './src/routes/admin';
import { studentRouter } from './src/routes/student';
import { studentAssignmentRouter } from './src/routes/studentAssignments';
import { analyticsRouter } from './src/routes/analytics';
import { isDemoMode, getDemoModeStatus } from './src/config/demoMode';

app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/teacher', teacherAssignmentRouter);
app.use('/api/teacher/assignments', teacherAssignmentRouter);
app.use('/api/teacher/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/student', studentRouter);
app.use('/api/student/assignments', studentAssignmentRouter);

// 4. Configuration & Health Check Endpoints
app.get('/api/config', (_req: Request, res: Response) => {
  res.status(200).json(getDemoModeStatus());
});

app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  
  res.status(200).json({
    status: 'healthy',
    app: 'MindTrace Diagnostic Platform API',
    version: '1.2.0',
    environment: process.env.NODE_ENV || 'development',
    demoMode: isDemoMode(),
    serverTimestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.ok,
      provider: 'Neon PostgreSQL',
      ...(dbStatus.error ? { errorNote: 'Database URL not configured or pool connecting offline' } : {}),
    },
  });
});

// 5. Vite Dev Server / Production Static File Serving Integration
async function configureServer() {
  if (!isProduction) {
    // Development mode: Attach Vite dev server middleware to Express
    const { createServer: createViteServer } = await import('vite');
    const react = (await import('@vitejs/plugin-react')).default;
    const tailwindcss = (await import('@tailwindcss/vite')).default;

    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      configFile: false,
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static client assets from dist/client
    const clientDist = path.join(__dirname, 'client');
    app.use(express.static(clientDist));
    
    // SPA Fallback for client-side hash/history routing
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: isProduction ? 'An unexpected server error occurred.' : err?.message,
    });
  });

  if (!isProduction) {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 MindTrace Server listening on http://0.0.0.0:${PORT}`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      if (isDemoMode()) {
        console.log(`✨ [DEMO MODE ACTIVE] Teacher accreditation barriers bypassed`);
      } else if (process.env.NODE_ENV === 'production') {
        console.log(`🔒 [PRODUCTION SAFEGUARD] Demo mode strictly enforced off`);
      } else {
        console.log(`🛡️  Accreditation: Standard verification required`);
      }
      console.log(`=======================================================`);
    });
  }
}

configureServer();

export default app;
