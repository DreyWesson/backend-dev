import path from "path";
import { format } from "date-fns";
import { promises as fs } from "fs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const writeLog = async (filename, requestId, logMessage) => {
  const dateFormat = "yyyy-MM-dd\tHH:mm:ss";
  const dateTime = format(new Date(), dateFormat);
  const combine = `${dateTime}\t${requestId}\t${logMessage}\n`;

  try {
    const dir = path.join(__dirname, "..", "logs");

    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    const logFilePath = path.join(dir, `${filename}.log`);
    await fs.appendFile(logFilePath, combine);
  } catch (error) {
    console.log("Error logging event: ", error);
  }
};

export const logEvents = (req, res, next) => {
  const { method, url, requestId, headers } = req;
  const { origin } = headers;
  const message = `${method}\t${origin || "Unknown Origin"}\t${url}`;

  writeLog("requests", requestId, message).catch((error) => console.log(error));

  next();
};

export const logErrors = (err, req, res, next) => {
  const { name, message } = err;
  const msg = `${name}: ${message}`;

  writeLog("errors", req.requestId, message);

  res.status(500).json({
    status: "error",
    statusCode: 500,
    message: msg,
    errors: ["Internal Server Error"],
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });

  next();
};
