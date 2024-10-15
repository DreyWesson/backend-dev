import mongoose from "mongoose";

import { config } from "dotenv";

config()

export const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnectMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
};
