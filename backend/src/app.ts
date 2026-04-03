import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { getDatabaseState } from './config/db.js';
import { apiRouter } from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
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
    database,
  });
});

app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
