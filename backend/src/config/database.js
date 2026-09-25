import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(uri = env.MONGODB_URI) {
  mongoose.set('strictQuery', true);
  try {
    return await mongoose.connect(uri, {
      autoIndex: env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 10_000
    });
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export function getDatabaseStatus() {
  return connectionStates[mongoose.connection.readyState] ?? 'unknown';
}
