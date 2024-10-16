import path from "path";
import { fileURLToPath } from "url";
import { createCustomLogger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Logger {
  // Singleton PATTERN
  static #instance;

  constructor() {
    if (Logger.#instance) {
      throw new Error("Note: This is a singleton class. Use Logger.getInstance() or the staic methods instead of new.");
    }

    const logDirectoryPath = path.join(__dirname, "..", "logs");
    const dateFormat = "yyyy-MM-dd HH:mm:ss";
    this.loggers = {
      info: createCustomLogger(
        logDirectoryPath,
        dateFormat,
        "application-info"
      ),
      error: createCustomLogger(
        logDirectoryPath,
        dateFormat,
        "application-error"
      ),
      serverError: createCustomLogger(
        logDirectoryPath,
        dateFormat,
        "server-error"
      ),
    };

    Logger.#instance = this;
  }

  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = Object.freeze(new Logger());
    }
    return Logger.#instance;
  }

  static async writeLog(level, requestId, logMessage) {
    const logger = Logger.getInstance();
    const loggerInstance = logger.loggers[level] || logger.loggers.info;

    if (loggerInstance && typeof loggerInstance.log === "function") {
      await loggerInstance.log({ level, message: logMessage, requestId });
    } else {
      throw new Error(
        `Logger implementation does not support '${level}' level.`
      );
    }
  }

  static async writeServerError(errorMessage) {
    const logger = Logger.getInstance();
    await logger.loggers.serverError.log({
      level: "error",
      message: errorMessage,
    });
  }
}
