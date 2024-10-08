import path from "path";
import { fileURLToPath } from "url";
import {
  createLogDirectory,
  createWinstonLogger,
  createCustomLogger,
} from "../utils/logger.utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Log {
  constructor(
    logDirectoryPath = path.join(__dirname, "..", "logs"),
    dateFormat = "YYYY-MM-DD HH:mm:ss",
    handleWriting = createCustomLogger
  ) {
    this.dateFormat = dateFormat;
    this.logDirectoryPath = logDirectoryPath;

    createLogDirectory(this.logDirectoryPath);

    this.logger = typeof handleWriting === "function"
      ? handleWriting(this.logDirectoryPath, this.dateFormat)
      : handleWriting;
  }

  async writeLog(level, requestId, logMessage) {
    if (this.logger && typeof this.logger.log === "function") {
      this.logger.log({ level, message: logMessage, requestId });
    } else {
      console.warn("Logger implementation does not support 'log' method.");
    }
  }

  logRequest = (req, res, next) => {
    const { method, headers, url, requestId } = req;
    const { origin } = headers;
    const message = `${method}\t${origin || "Unknown Origin"}\t${url}`;

    this.writeLog("info", requestId, message).catch((error) =>
      console.error("Error logging request:", error)
    );

    next();
  };

  logError = async (err, req, res, next) => {
    const { name, message } = err;
    const errorMessage = `${name}: ${message}`;
    const logMessage = `${req.method} ${req.originalUrl} - ${errorMessage}`;

    try {
      await this.writeLog("error", req.requestId, logMessage);
    } catch (logError) {
      console.error("Error logging error:", logError);
    }

    res.status(500).json({
      status: "error",
      statusCode: 500,
      message: errorMessage,
      errors: ["Internal Server Error"],
      timeStamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  };
}

// Export a single instance of the Log class
export const logs = new Log(
  path.join(__dirname, "..", "logs"),
  "YYYY-MM-DD HH:mm:ss",
  createWinstonLogger
);
