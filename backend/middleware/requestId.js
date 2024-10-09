import { randomUUID } from 'crypto';
import { encrypt } from '../utils/encryption.js';

export const requestId = (req, res, next) => {
  const requestId = randomUUID();

  const metadata = {
    requestId,
    ip: req.ip || req.connection.remoteAddress,
    hostname: req.hostname,
    userAgent: req.headers['user-agent'],
    url: req.originalUrl || req.url,
    method: req.method
  };

  const encryptedMetadata = encrypt(JSON.stringify(metadata), process.env.ENCRYPTION_SECRET_KEY);

  req.metadata = encryptedMetadata;
  // res.setHeader('X-Metadata', encryptedMetadata);
  res.setHeader('X-Request-Id', requestId);

  next();
};
