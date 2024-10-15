import { connectMongoDB, disconnectMongoDB } from "./mongo.js";
import { connectPostgres, disconnectPostgres } from "./postgres.js";

export const connectDatabase = async (dbType) => {
  if (dbType === "mongo") {
    await connectMongoDB();
    return { connect: connectMongoDB, disconnect: disconnectMongoDB };
  } else if (dbType === "postgres") {
    await connectPostgres();
    return { connect: connectPostgres, disconnect: disconnectPostgres };
  } else {
    throw new Error("Unsupported database type");
  }
};
