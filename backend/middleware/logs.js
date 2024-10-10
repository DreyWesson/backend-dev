import path from "path";
import { fileURLToPath } from "url";
import {
  createLogDirectory,
  createWinstonLogger,
  createCustomLogger,
} from "../utils/logger.utils.js";
import { decryptMetadata } from "../utils/encryption.js";

import dotenv from "dotenv";

dotenv.config();

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

    this.logger =
      typeof handleWriting === "function"
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
    const { method, headers, url, metadata } = req;
    const { origin } = headers;
    const requestId = decryptMetadata(metadata).requestId;
    const message = `${method} ${origin || "Unknown Origin"} ${url}`;

    this.writeLog("info", requestId, message).catch((error) =>
      console.error("Error logging request:", error)
    );

    next();
  };

  logError = async (err, req, res, next) => {
    const { name, message } = err;
    const errorMessage = `${name}: ${message}`;
    const logMessage = `${req.method} ${req.originalUrl} - ${errorMessage}`;
    const requestId = decryptMetadata(req.metadata).requestId;

    try {
      await this.writeLog("error", requestId, logMessage);
    } catch (logError) {
      console.error("Error logging error:", logError);
    }

    res.status(500).json({
      requestId,
      status: "error",
      statusCode: 500,
      message: errorMessage,
      errors: ["Internal Server Error"],
      timeStamp: new Date().toISOString(),
    });
  };
}

const setArgs = (type = "custom") => [
  path.join(__dirname, "..", "logs"),
  type !== "winston" ? "yyyy-MM-dd HH:mm:ss" : "YYYY-MM-DD hh:mm:ss",
  type !== "winston" ? createCustomLogger : createWinstonLogger
];

export const logs = new Log(...setArgs("winston"));
