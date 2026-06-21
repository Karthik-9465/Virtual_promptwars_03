import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import { errorHandler } from './middleware/error';
import { validateEnv } from './config/env';
import { verifyDbConnection } from './config/db';

// Load and validate environment variables
dotenv.config();
const parsedEnv = validateEnv();

const app = express();
const PORT = parsedEnv.PORT;

// Security Middlewares & CORS
app.use(cors({
  origin: '*', // For development flexibility; restrict in production configuration
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Standard XSS/Security Header Emulation (OWASP Best Practice)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// API Routes
app.use('/api', router);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await verifyDbConnection();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message || error,
      timestamp: new Date(),
    });
  }
});

// Global Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      console.log('[Server] Connecting to database...');
      await verifyDbConnection();
      console.log('⚡ Database connection verified successfully.');

      app.listen(PORT, () => {
        console.log(`[Server] Carbon footprint assistant backend running on http://localhost:${PORT}`);
      });
    } catch (error: any) {
      console.error('❌ Failed to start server due to database connection failure:', error.message || error);
      process.exit(1);
    }
  };
  startServer();
}

export default app;
