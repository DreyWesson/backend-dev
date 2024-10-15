// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { requestId } from "./middleware/requestId.js";
// import { logs } from "./middleware/logger.js";
// import config from "./config/index.js";
// import * as homeController from "./controllers/index.js";
// import allAPIRoutes from "./routes/index.js";

// dotenv.config();

// const db = { homeController };

// class Server {
//   constructor({
//     app = express(),
//     config,
//     middlewares = () => {},
//     routes = () => {},
//     errorHandlers = () => {},
//     db = null,
//   }) {
//     this.app = app;
//     this.config = config;
//     this.middlewares = middlewares;
//     this.routes = routes;
//     this.errorHandlers = errorHandlers;
//     this.db = db;
//   }

//   static async create({ app, config, middlewares, routes, errorHandlers, db }) {
//     const server = new Server({
//       app: app || express(),
//       config,
//       middlewares,
//       routes,
//       errorHandlers,
//       db,
//     });

//     await server.init();
//     return server;
//   }

//   async init() {
//     // Handle DB connection here if needed
//     if (this.db && this.db.connect) {
//       await this.db.connect();
//     }

//     this.middlewares(this.app);
//     this.routes(this.app);
//     this.errorHandlers(this.app);
//   }

//   async start() {
//     return new Promise((resolve) => {
//       const server = this.app.listen(this.config.PORT, () => {
//         console.log(`Server running on http://localhost:${this.config.PORT}`);
//         resolve(server);
//       });
//     });
//   }

//   async stop(server) {
//     return new Promise((resolve, reject) => {
//       server.close(async (err) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         // Gracefully disconnect DB
//         if (this.db && this.db.disconnect) {
//           await this.db.disconnect();
//         }
//         resolve();
//       });
//     });
//   }
// }

// const defaultMiddlewares = [
//   cors(),
//   requestId,
//   logs.logRequest,
//   express.json(),
//   express.urlencoded({ extended: true })
// ];

// function middlewares(app) {
//   app.use(cors());
//   app.use(requestId);
//   app.use(logs.logRequest);
//   app.use(express.json());
//   app.use(express.urlencoded({ extended: true }));
// }

// function routes(app) {
//   app.use("/api/v1", allAPIRoutes(db));
//   app.get("/error", (req, res, next) => {
//     next(new Error("Deliberate error: testing error middleware"));
//   });
//   app.use("*", (req, res) => res.status(404).json({ message: "Not found" }));
// }

// function errorHandlers(app) {
//   app.use(logs.logError);

//   app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined,
//     });
//   });
// }

// async function main(db) {
//   try {
//     const server = await Server.create({
//       config,
//       middlewares,
//       routes,
//       errorHandlers,
//       db,
//     });

//     const runningServer = await server.start();

//     process.on("SIGTERM", async () => {
//       // console.log("SIGTERM signal received: closing HTTP server");
//       await server.stop(runningServer);
//       process.exit(0);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// }

// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection at:", promise, "reason:", reason);
// });

// process.on("uncaughtException", (error) => {
//   console.error("Uncaught Exception:", error);
// });

// main(db);





import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { requestId } from "./middleware/requestId.js";
import { logs } from "./middleware/logger.js";
import config from "./config/index.js";
import * as homeController from "./controllers/index.js";
import allAPIRoutes from "./routes/index.js";
import { loggerInstance } from "./services/logger.js";

dotenv.config();

const db = { homeController };

class Server {
  constructor({
    app = express(),
    config,
    middlewares = [],
    routes,
    errorHandlers,
    db,
  }) {
    this.app = app;
    this.config = config;
    this.middlewares = middlewares;
    this.routes = routes;
    this.errorHandlers = errorHandlers;
    this.db = db;
  }

  static async create({ config, middlewares = [], routes, errorHandlers, db }) {
    const app = express();
    const server = new Server({
      app,
      config,
      middlewares,
      routes,
      errorHandlers,
      db,
    });

    await server.init();
    return server;
  }

  async init() {
    // await this.db.connect();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  setupMiddlewares() {
    this.middlewares.forEach(middleware => this.app.use(middleware));
  }

  setupRoutes() {
    this.routes(this.app, this.db);
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
          await loggerInstance.writeServerError(`Error stopping server: ${err.message}`)
          reject(err);
          return;
        }

        // await this.db.disconnect();
        resolve();
      });
    });
  }
}

const defaultMiddlewares = [
  cors(),
  requestId,
  logs.logRequest,
  express.json(),
  express.urlencoded({ extended: true })
];

function routes(app, db) {
  app.use("/api/v1", allAPIRoutes(db));
  app.get("/error", (req, res, next) => {
    next(new Error("Deliberate error: testing error middleware"));
  });
  app.use("*", (req, res) => res.status(404).json({ message: "Not found" }));
}

function errorHandlers(app) {
  app.use(logs.logError);

  app.use((err, req, res, next) => {
    loggerInstance.writeServerError(`Error: ${err.stack}`)
    res.status(500).send("Something broke!");
  });
}

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
    await loggerInstance.writeServerError(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

process.on("unhandledRejection", async (reason, promise) => {
  await loggerInstance.writeServerError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", async (error) => {
  await loggerInstance.writeServerError(`Uncaught Exception: ${error.message}`);
});

main(db);


















// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { requestId } from "./middleware/requestId.js";
// import { logs } from "./middleware/logger.js";
// import config from "./config/index.js";
// import * as homeController from "./controllers/index.js";
// import allAPIRoutes from "./routes/index.js";

// dotenv.config();

// const db = { homeController };

// class Server {
//   constructor({
//     app = express(),
//     config,
//     middlewares,
//     routes,
//     errorHandlers,
//     db,
//   }) {
//     this.app = app;
//     this.config = config;
//     this.middlewares = middlewares;
//     this.routes = routes;
//     this.errorHandlers = errorHandlers;
//     this.db = db;
//   }

//   static async create({ app, config, middlewares, routes, errorHandlers, db }) {
//     const server = new Server({
//       app: app || express(),
//       config,
//       middlewares,
//       routes,
//       errorHandlers,
//       db,
//     });

//     await server.init();
//     return server;
//   }

//   async init() {
//     this.middlewares(this.app);
//     this.routes(this.app);
//     this.errorHandlers(this.app);
//   }

//   async start() {
//     return new Promise((resolve) => {
//       const server = this.app.listen(this.config.PORT, () => {
//         console.log(`Server running on http://localhost:${this.config.PORT}`);
//         resolve(server);
//       });
//     });
//   }

//   async stop(server) {
//     return new Promise((resolve, reject) => {
//       server.close(async (err) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         await this.db.disconnect();
//         resolve();
//       });
//     });
//   }
// }

// function middlewares(app) {
//   app.use(cors());
//   app.use(requestId);
//   app.use(logs.logRequest);
//   app.use(express.json());
//   app.use(express.urlencoded({ extended: true }));
// }

// function routes(app) {
//   app.use("/api/v1", allAPIRoutes(db));
//   app.get("/error", (req, res, next) => {
//     next(new Error("Deliberate error: testing error middleware"));
//   });
//   app.use("*", (req, res) => res.status(404).json({ message: "Not found" }));
// }

// function errorHandlers(app) {
//   app.use(logs.logError);

//   app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send("Something broke!");
//   });
// }

// async function main(db) {
//   try {
//     const server = await Server.create({
//       config,
//       middlewares,
//       routes,
//       errorHandlers,
//       db,
//     });

//     const runningServer = await server.start();

//     process.on("SIGTERM", async () => {
//       console.log("SIGTERM signal received: closing HTTP server");
//       await server.stop(runningServer);
//       process.exit(0);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// }

// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection at:", promise, "reason:", reason);
// });

// process.on("uncaughtException", (error) => {
//   console.error("Uncaught Exception:", error);
// });

// main(db);






// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { requestId } from "./middleware/requestId.js";
// import { logs } from "./middleware/logger.js";

// dotenv.config();

// const server = new Server();
// server.start();

// dotenv.config();
// const app = express();
// app.use(cors());

// app.use(requestId);
// app.use(logs.logRequest);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   res.send("Hello, world!");
// });

// app.get("/error", (req, res) => {
//   throw new Error("This is a test error!");
// });

// app.use(logs.logError);

// const PORT = process.env.PORT || 80;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
