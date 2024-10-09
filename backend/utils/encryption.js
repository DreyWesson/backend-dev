import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = "aes-256-gcm";
const ivLength = 12;

export function encrypt(text, secret) {
  const key = getEncryptionKey(secret);
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");
  const ivHex = iv.toString("hex");

  return `${ivHex}:${encrypted}:${authTag}`;
}

function getEncryptionKey(secret) {
  if (!secret) {
    throw new Error("Encryption secret key is not set or is empty.");
  }

  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }

  return Buffer.from(secret, "utf8");
}

export function decrypt(encryptedData, secret = process.env.ENCRYPTION_SECRET_KEY) {
  const key = getEncryptionKey(secret);
  const [ivHex, encryptedText, authTagHex] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export const decryptMetadata = (data, secret) => {
  return (JSON.parse(decrypt(data, secret)));
};
