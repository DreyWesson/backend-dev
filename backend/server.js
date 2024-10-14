import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { requestId } from "./middleware/requestId.js";
import { logs } from "./middleware/logger.js";

dotenv.config();

class Server {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.errorHandler();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(requestId);
    this.app.use(logs.logRequest);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  routes() {
    this.app.get("/", (req, res) => {
      res.send("Hello, world!");
    });

    this.app.get("/error", (req, res) => {
      throw new Error("This is a test error!");
    });
  }

  errorHandler() {
    console.log("*******DEBUG******")
    this.app.use(logs.logError);
  }

  start() {
    const PORT = process.env.PORT || 80;
    this.app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

const server = new Server();
server.start();

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

// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { requestId } from "./middleware/requestId.js";
// import { logs } from "./middleware/logger.js";
