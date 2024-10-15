import { decryptMetadata } from "../utils/encryption.js";
import { loggerInstance } from "../services/logger.js";


class Log {
  constructor() {
    if (Log.instance) {
      return Log.instance;
    }
    Log.instance = this;
  }

  logRequest = async (req, res, next) => {
    const { method, headers, url, metadata } = req;
    const { origin } = headers;
    const requestId = decryptMetadata(metadata).requestId;
    const message = `${method} ${origin || "Unknown Origin"} ${url}`;

    try {
      await loggerInstance.writeLog("info", requestId, message);
    } catch (error) {
      console.error("Error logging request:", error);
    }
    next();
  };

  logError = async (err, req, res, next) => {
    const { name, message } = err;
    const errorMessage = `${name}: ${message}`;
    const logMessage = `${req.method} ${req.originalUrl} - ${errorMessage}`;
    const requestId = decryptMetadata(req.metadata).requestId;

    try {
      await loggerInstance.writeLog("error", requestId, logMessage);
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

export const logs = new Log();