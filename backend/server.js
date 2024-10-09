import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { requestId } from "./middleware/requestId.js";
import { logs } from "./middleware/logs.js";

dotenv.config();
const app = express();
app.use(cors());

app.use(requestId);
app.use(logs.logRequest);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/error", (req, res) => {
  throw new Error("This is a test error!");
});

app.use(logs.logError);

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
