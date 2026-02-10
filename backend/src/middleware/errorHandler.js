const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: 'Conflict',
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid Data',
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Unexpected errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error'
  });
};

module.exports = errorHandler;
