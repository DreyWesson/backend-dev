import dotenv from "dotenv";
import { decrypt } from "../utils/encryption.js";

dotenv.config();

export const decryptMetadata = (req, res, next) => {
  const decryptedMetadata = JSON.parse(
    decrypt(req.metadata, process.env.ENCRYPTION_SECRET_KEY)
  );
  console.log("Decrypted Metadata:", decryptedMetadata);
  next();
};
