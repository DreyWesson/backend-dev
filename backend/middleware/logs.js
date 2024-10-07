import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { format } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Log {
  constructor(
    logDirectory = path.join(__dirname, "..", "logs"),
    dateFormat = "yyyy-MM-dd\tHH:mm:ss"
  ) {
    this.dateFormat = dateFormat;
    this.logDirectory = logDirectory;
  }

  createDirectory = async () => {
    try {
      await fs.access(this.logDirectory);
    } catch {
      await fs.mkdir(this.logDirectory, { recursive: true });
    }
  };

  writeLog = async (filename, requestId, logMessage) => {
    const dateTime = format(new Date(), this.dateFormat);
    const message = `${dateTime}\t${requestId}\t${logMessage}\n`;
    const filePath = path.join(this.logDirectory, `${filename}.log`);

    try {
      await this.createDirectory();
      await fs.appendFile(filePath, message, "utf8");
    } catch (error) {
      console.error("Error logging event: ", error);
    }
  };

  logRequest = (req, res, next) => {
    const { method, headers, url, requestId } = req;
    const { origin } = headers;
    const message = `${method}\t${origin || "Unknown Origin"}\t${url}`;

    this.writeLog("requests", requestId, message)
      .then(() => {
        // Optional: Log success if needed
      })
      .catch((error) => console.log(error));

    next();
  };

  logError = async (err, req, res, next) => {
    const { name, message } = err;
    const msg = `${name}: ${message}`;

    try {
      await this.writeLog("errors", req.requestId, msg);
    } catch (error) {
      console.error("Error logging error:", error);
    }

    res.status(500).json({
      status: "error",
      statusCode: 500,
      message: msg,
      errors: ["Internal Server Error"],
      timeStamp: new Date().toISOString(),
      requestId: req.requestId,
    });

  };
}

export const logs = new Log();
