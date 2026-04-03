import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { registerSocketHandlers } from './utils/socket.js';

const DB_RETRY_MS = 5000;

async function connectDatabaseWithRetry(): Promise<void> {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('MongoDB unavailable. API is running in degraded mode.', error);
    setTimeout(() => {
      void connectDatabaseWithRetry();
    }, DB_RETRY_MS);
  }
}

async function bootstrap() {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  httpServer.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });

  void connectDatabaseWithRetry();
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
