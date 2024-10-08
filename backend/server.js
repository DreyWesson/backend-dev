import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { requestId } from "./middleware/requestId.js";
import { logs } from "./middleware/logs.js";
import { decryptMetadata } from "./middleware/decryptMetadata.js";

dotenv.config();
const app = express();
app.use(cors());

app.use(requestId);
app.use(logs.logRequest);

// app.use(decryptMetadata);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/error", (req, res) => {
  throw new Error("This is a test error!"); // Simulate an error for testing
});

app.use(logs.logError);

// Start the server and listen on the specified port
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
