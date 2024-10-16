import { defaultMiddlewares, Server, routes, errorHandlers } from "./app.js";
import { connectDatabase } from "./services/database.js";
import config from "./config/index.js";
import * as homeController from "./controllers/index.js";
import { Logger } from "./services/logger.js";

async function main(db) {
  try {
    const server = await Server.create({
      config,
      middlewares: defaultMiddlewares,
      routes,
      errorHandlers,
      db,
    });

    const runningServer = await server.start();

    process.on("SIGTERM", async () => {
      await server.stop(runningServer);
      process.exit(0);
    });
  } catch (error) {
    await Logger.writeServerError(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

const dbType = process.env.DB_TYPE || "mongo";

async function initialize() {
  await connectDatabase(dbType);
  const allEndpoints = { homeController };
  await main(allEndpoints);
}

initialize();

process.on("unhandledRejection", async (reason, promise) => {
  await Logger.writeServerError(
    `Unhandled Rejection at: ${promise}, reason: ${reason}`
  );
});

process.on("uncaughtException", async (error) => {
  await Logger.writeServerError(`Uncaught Exception: ${error.message}`);
});
