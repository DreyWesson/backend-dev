import path from "path";
import { fileURLToPath } from "url";
import { createCustomLogger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class Logger {
  // Singleton PATTERN
  static #instance;

  constructor() {
    if (Logger.#instance) {
      throw new Error("Use Logger.getInstance() instead of new.");
    }

    const logDirectoryPath = path.join(__dirname, "..", "logs");
    const dateFormat = "yyyy-MM-dd HH:mm:ss";
    this.loggers = {
      info: createCustomLogger(logDirectoryPath, dateFormat, 'application-info'),
      error: createCustomLogger(logDirectoryPath, dateFormat, 'application-error'),
      serverError: createCustomLogger(logDirectoryPath, dateFormat, 'server-error'),
    };

    Logger.#instance = this;
  }

  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = Object.freeze(new Logger());
    }
    return Logger.#instance;
  }

  async writeLog(level, requestId, logMessage) {
    const logger = this.loggers[level] || this.loggers.info;
    if (logger && typeof logger.log === "function") {
      await logger.log({ level, message: logMessage, requestId });
    } else {
      // console.warn(`Logger implementation does not support '${level}' level.`);
      throw new Error(`Logger implementation does not support '${level}' level.`)
    }
  }

  async writeServerError(errorMessage) {
    await this.loggers.serverError.log({ level: 'error', message: errorMessage });
  }
}

export const loggerInstance = Logger.getInstance();
