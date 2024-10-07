import dotenv from 'dotenv';
import express from 'express';
import cors from "cors";
import { logEvents, logErrors } from './middleware/logger.js';
import { requestId } from './middleware/requestId.js';
import { logs } from './middleware/logs.js';

dotenv.config();
const app = express();
app.use(cors());

app.use(requestId);

// app.use(logEvents)
app.use(logs.logRequest);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/error', (req, res) => {
  throw new Error('This is a test error!'); // Simulate an error for testing
});

app.use(logs.logError);

// Start the server and listen on the specified port
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
