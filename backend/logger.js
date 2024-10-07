// logger.js
import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'; // Use fs for synchronous operations

// Get the __dirname value using ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory and file paths
const logsDir = path.join(__dirname, 'logs');
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

// Ensure the logs directory exists synchronously
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Logs directory created successfully.');
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

// Custom format for log messages
const logFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the Winston logger instance
const logger = createLogger({
  level: 'info', // Default logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp to logs
    format.errors({ stack: true }), // Format errors with stack trace
    logFormat
  ),
  transports: [
    // Log only errors to error.log
    new transports.File({ filename: errorLogPath, level: 'error' }),

    // Log all messages to combined.log
    new transports.File({ filename: combinedLogPath }),

    // Output to console as well
    new transports.Console({
      format: format.combine(
        format.colorize(), // Colorize logs in the console
        logFormat
      ),
    }),
  ],
});

export default logger;
