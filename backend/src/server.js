import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

let server;

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  if (!server) {
    await disconnectDatabase();
    return;
  }

  server.close(async () => {
    await disconnectDatabase();
    process.exitCode = 0;
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

try {
  await connectDatabase();
  server = createApp().listen(env.PORT, () => {
    console.log(`PVPIT CRM API listening on port ${env.PORT}`);
  });
} catch (error) {
  console.error(error.message);
  await disconnectDatabase();
  process.exitCode = 1;
}
