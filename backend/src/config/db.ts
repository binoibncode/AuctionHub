import mongoose from 'mongoose';
import { env } from './env.js';

type DatabaseState = {
  connected: boolean;
  status: 'connected' | 'disconnected';
  lastError?: string;
};

const databaseState: DatabaseState = {
  connected: false,
  status: 'disconnected',
};

mongoose.connection.on('connected', () => {
  databaseState.connected = true;
  databaseState.status = 'connected';
  databaseState.lastError = undefined;
});

mongoose.connection.on('disconnected', () => {
  databaseState.connected = false;
  databaseState.status = 'disconnected';
});

mongoose.connection.on('error', (error) => {
  databaseState.connected = false;
  databaseState.status = 'disconnected';
  databaseState.lastError = error.message;
});

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MongoDB connection error';
    databaseState.connected = false;
    databaseState.status = 'disconnected';
    databaseState.lastError = message;
    throw error;
  }
}

export function getDatabaseState(): DatabaseState {
  return { ...databaseState };
}
