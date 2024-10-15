import path from "path";
import { fileURLToPath } from "url";
import { createCustomLogger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    const logDirectoryPath = path.join(__dirname, "..", "logs");
    const dateFormat = "yyyy-MM-dd HH:mm:ss";
    this.loggers = {
      info: createCustomLogger(logDirectoryPath, dateFormat, 'application-info'),
      error: createCustomLogger(logDirectoryPath, dateFormat, 'application-error'),
      serverError: createCustomLogger(logDirectoryPath, dateFormat, 'server-error')
    };

    Logger.instance = this;
  }

  async writeLog(level, requestId, logMessage) {
    const logger = this.loggers[level] || this.loggers.info;
    if (logger && typeof logger.log === "function") {
      await logger.log({ level, message: logMessage, requestId });
    } else {
      console.warn(`Logger implementation does not support '${level}' level.`);
    }
  }

  async writeServerError(errorMessage) {
    await this.loggers.serverError.log({ level: 'error', message: errorMessage });
  }
}

export const loggerInstance = new Logger();
