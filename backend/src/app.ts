import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { getDatabaseState } from './config/db.js';
import { apiRouter } from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

export const app = express();

const configuredOrigins = env.clientOrigin
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server and non-browser requests.
      if (!origin) {
        callback(null, true);
        return;
      }

      const isConfigured = configuredOrigins.includes(origin);
      const isLocalhostDev =
        env.nodeEnv === 'development' && /^http:\/\/localhost:\d+$/.test(origin);

      if (isConfigured || isLocalhostDev) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  const database = getDatabaseState();
  const serviceStatus = database.connected ? 'ok' : 'degraded';

  res.status(200).json({
    success: true,
    message: 'Auction backend running',
    status: serviceStatus,
    env: env.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database,
  });
});

app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
