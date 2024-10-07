// server.js
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import dotenv from 'dotenv';
import express from 'express';
import logger from './logger.js'; // Import logger synchronously
import errorMiddleware from './middleware/error.js';
import { fileURLToPath } from 'url';

dotenv.config(); // Load environment variables

// Initialize the Express app
const app = express();

// Get the __dirname and __filename using ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log directory and access log file paths
const logsDir = path.join(__dirname, 'logs');
const accessLogFile = path.join(logsDir, 'access.log');

// Ensure the logs directory exists (optional, since logger.js handles it)
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Logs directory created successfully.');
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

// Create a write stream for the access log
const accessLogStream = fs.createWriteStream(accessLogFile, { flags: 'a' });

// Configure Morgan for request logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Log to the console as well

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define some routes for testing
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/error', (req, res) => {
  throw new Error('This is a test error!'); // Simulate an error for testing
});

// Use the custom error handling middleware
app.use(errorMiddleware);

// Start the server and listen on the specified port
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
