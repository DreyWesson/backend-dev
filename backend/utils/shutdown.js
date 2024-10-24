import { Logger } from "../services/logger.js";

let isShuttingDown = false;

export async function gracefulShutdown(signal, db, server, runningServer) {
  if (isShuttingDown) {
    console.log('Shutdown already in progress');
    return;
  }
  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 30000);

  try {
    if (server && server.stop) {
      console.log('Stopping server...');
      await server.stop(runningServer);
      console.log('Server stopped');
    }

    if (db && db.disconnect) {
      console.log('Disconnecting database...');
      await db.disconnect();
      console.log('Database disconnected');
    }

    console.log('Graceful shutdown completed');
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    await Logger.writeServerError(`Error during graceful shutdown: ${error.message}`);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}
