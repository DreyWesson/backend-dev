// errorMiddleware.js
import logger from '../logger.js';

// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
  // Log error using Winston
  logger.error(err.message, err);

  // Send a generic error response
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong, please try again later.',
  });
};

export default errorMiddleware;
