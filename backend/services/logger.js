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
    this.logger = createCustomLogger(logDirectoryPath, dateFormat);

    Logger.instance = this;
  }

  async writeLog(level, requestId, logMessage) {
    if (this.logger && typeof this.logger.log === "function") {
      this.logger.log({ level, message: logMessage, requestId });
    } else {
      console.warn("Logger implementation does not support 'log' method.");
    }
  }
}

export const loggerInstance = new Logger();
