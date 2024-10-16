import { Sequelize } from "sequelize";
import { config } from "dotenv";

config()

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
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== "production")
      console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    throw error;
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
