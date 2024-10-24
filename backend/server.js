import { defaultMiddlewares, Server, routes, errorHandlers } from "./app.js";
import { connectDatabase } from "./services/database.js";
import config from "./config/index.js";
import * as homeController from "./controllers/index.js";
import { Logger } from "./services/logger.js";
import { gracefulShutdown } from "./utils/shutdown.js";


async function main(db, allEndpoints) {
  let server, runningServer;
  try {
    server = await Server.create({
      config,
      middlewares: defaultMiddlewares,
      routes,
      errorHandlers,
      allEndpoints,
    });

    runningServer = await server.start();

    process.on("SIGTERM", () =>
      gracefulShutdown("SIGTERM", db, server, runningServer)
    );
    process.on("SIGINT", () =>
      gracefulShutdown("SIGINT", db, server, runningServer)
    );
  } catch (error) {
    await Logger.writeServerError(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

const dbType = process.env.DB_TYPE || "mongo";

async function initialize() {
  let db;
  try {
    db = await connectDatabase(dbType);
    const allEndpoints = { homeController };
    await main(db, allEndpoints);
  } catch (error) {
    await Logger.writeServerError(`Initialization failed: ${error.message}`);
    process.exit(1);
  }
}

initialize();

process.on("unhandledRejection", async (reason, promise) => {
  // console.error("Unhandled Rejection at:", promise, "reason:", reason);
  await Logger.writeServerError(`Unhandled Rejection: ${reason}`);
  gracefulShutdown("Unhandled Rejection", db, server, runningServer);
});

process.on("uncaughtException", async (error) => {
  // console.error("Uncaught Exception:", error);
  await Logger.writeServerError(`Uncaught Exception: ${error.message}`);
  gracefulShutdown("Uncaught Exception", db, server, runningServer);
});
