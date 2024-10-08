import path from "path";
import { promises as fs } from "fs";
import { createLogger, format as winstonFormat, transports } from "winston";
import WinstonCloudWatch from "winston-cloudwatch";
import DailyRotateFile from "winston-daily-rotate-file";



export async function ensureLogDirectory(logDirectory) {
  try {
    await fs.access(logDirectory);
  } catch {
    await fs.mkdir(logDirectory, { recursive: true });
    console.log(`Log directory created at: ${logDirectory}`);
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
        return `${timestamp} [${level}]: ${requestId ? `(${requestId}) ` : ""}${message}`;
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
            return `${timestamp} [${level}]: ${requestId ? `(${requestId}) ` : ""}${message}`;
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
            return `${timestamp} [${level}]: ${requestId ? `(${requestId}) ` : ""}${message}`;
          })
        ),
      }),
    ],
  });
}