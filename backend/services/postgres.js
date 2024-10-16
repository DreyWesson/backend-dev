import { Sequelize } from "sequelize";
import { config } from "dotenv";

config()

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: "postgres",
  logging: false,
  retry: {
    max: 10,
    timeout: 3000,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
  },
});

export const connectPostgres = async () => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await sequelize.authenticate();
      console.log("PostgreSQL connected successfully");
      return;
    } catch (error) {
      console.error(`PostgreSQL connection error (attempt ${i + 1}/${MAX_RETRIES}):`, error);
      if (i < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        throw error;
      }
    }
  }
};

export const disconnectPostgres = async () => {
  try {
    await sequelize.close();
    console.log("PostgreSQL disconnected successfully");
  } catch (error) {
    console.error("PostgreSQL disconnection error:", error);
  }
};

export default sequelize;
