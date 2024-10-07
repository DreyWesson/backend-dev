import { randomUUID } from 'crypto';

export const requestId = (req, res, next) => {
  req.requestId = randomUUID();
  next();
};
