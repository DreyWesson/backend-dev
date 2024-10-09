import path from "path";
import { promises as fs } from "fs";
import { createLogger, format as winstonFormat, transports } from "winston";
import WinstonCloudWatch from "winston-cloudwatch";
import DailyRotateFile from "winston-daily-rotate-file";
import chalk from "chalk";
import { format } from "date-fns";

export async function createLogDirectory(logDirectory) {
  try {
    await fs.access(logDirectory);
  } catch {
    await fs.mkdir(logDirectory, { recursive: true });
  }
}

export function createWinstonLogger(logDirectory, dateFormat) {
  const dailyRotateTransport = new DailyRotateFile({
    filename: path.join(logDirectory, "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "info",
  });

  return createLogger({
    format: winstonFormat.combine(
      winstonFormat.timestamp({
        format: dateFormat, // Use the provided date format
      }),
      winstonFormat.printf(({ timestamp, level, message, requestId }) => {
        return `${timestamp} [${level}]: ${
          requestId ? `(${requestId}) ` : ""
        }${message}`;
      })
    ),
    transports: [
      dailyRotateTransport,
      new transports.File({
        filename: path.join(logDirectory, "errors.log"),
        level: "error",
        format: winstonFormat.combine(
          winstonFormat.timestamp({ format: dateFormat }),
          winstonFormat.uncolorize(),
          winstonFormat.printf(({ timestamp, level, message, requestId }) => {
            return `${timestamp} [${level}]: ${
              requestId ? `(${requestId}) ` : ""
            }${message}`;
          })
        ),
      }),
      new WinstonCloudWatch({
        logGroupName: "MyApplicationLogs",
        logStreamName: "MyApplicationStream",
        awsRegion: process.env.AWS_REGION || "us-east-1",
        jsonMessage: true,
      }),
      new transports.Console({
        format: winstonFormat.combine(
          winstonFormat.colorize(),
          winstonFormat.timestamp({ format: dateFormat }),
          winstonFormat.printf(({ timestamp, level, message, requestId }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${
              requestId ? `(${requestId}) ` : ""
            }${message}`;
          })
        ),
      }),
    ],
  });
}

function getColor(level) {
  switch (level) {
    case "info":
      return chalk.blue(level.toUpperCase());
    case "warn":
      return chalk.yellow(level.toUpperCase());
    case "error":
      return chalk.red(level.toUpperCase());
    case "debug":
      return chalk.green(level.toUpperCase());
    default:
      return level.toUpperCase();
  }
}

export function createCustomLogger(logDirectory, dateFormat) {
  createLogDirectory(logDirectory);

  const logFilePath = path.join(
    logDirectory,
    `application-${format(new Date(), "yyyy-MM-dd")}.log`
  );

  return {
    log({ level, message, requestId }) {
      const timestamp = format(new Date(), dateFormat);
      const coloredLevel = getColor(level);
      const reqId = requestId ? ` [RequestId: ${requestId}]` : "";
      const logMessage = `${timestamp} [${coloredLevel}]${reqId}: ${message}`;

      console.log(logMessage);

      try {
        fs.appendFile(logFilePath, logMessage, "utf8");
      } catch (error) {
        console.error(`Failed to write log to file: ${error.message}`);
      }
    },
  };
}