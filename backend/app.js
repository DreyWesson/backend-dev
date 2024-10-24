import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { requestId } from "./middleware/requestId.js";
import { logs } from "./middleware/logger.js";
import allAPIRoutes from "./routes/index.js";
import { Logger } from "./services/logger.js";

dotenv.config();

export class Server {
  constructor({
    app = express(),
    config,
    middlewares = [],
    routes,
    errorHandlers,
    allEndpoints,
  }) {
    this.app = app;
    this.config = config;
    this.middlewares = middlewares;
    this.routes = routes;
    this.errorHandlers = errorHandlers;
    this.allEndpoints = allEndpoints;
  }

  static async create({ config, middlewares = [], routes, errorHandlers, allEndpoints }) {
    try { 
        const app = express();
        const server = new Server({
          app,
          config,
          middlewares,
          routes,
          errorHandlers,
          allEndpoints,
        });
    
        await server.init();
        return server;
    } catch (error) {
        throw new Error("Error creating server");
    }
  }

  async init() {
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  setupMiddlewares() {
    this.middlewares.forEach((middleware) => this.app.use(middleware));
  }

  setupRoutes() {
    this.routes(this.app, this.allEndpoints);
  }

  setupErrorHandlers() {
    this.errorHandlers(this.app);
  }

  async start() {
    return new Promise((resolve) => {
      const server = this.app.listen(this.config.PORT, () => {
        if (process.env.NODE_ENV === "development")
          console.log(`Server running on http://localhost:${this.config.PORT}`);
        resolve(server);
      });
    });
  }

  async stop(server) {
    return new Promise((resolve, reject) => {
      server.close(async (err) => {
        if (err) {
          await Logger.writeServerError(
            `Error stopping server: ${err.message}`
          );
          reject(err);
          return;
        }

        // await this.allEndpoints.disconnect();
        resolve();
      });
    });
  }
}

export const defaultMiddlewares = [
  cors(),
  requestId,
  logs.logRequest,
  express.json(),
  express.urlencoded({ extended: true }),
];

export function routes(app, allEndpoints) {
  app.use("/api/v1", allAPIRoutes(allEndpoints));
  app.get("/error", (req, res, next) => {
    next(new Error("Deliberate error: testing error middleware"));
  });
  app.use("*", (req, res) => res.status(404).json({ message: "Not found" }));
}

export function errorHandlers(app) {
  app.use(logs.logError);

  app.use((err, req, res, next) => {
    Logger.writeServerError(`Error: ${err.stack}`);
    res.status(500).send("Something broke!");
  });
}