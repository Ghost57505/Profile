const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({});
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({});
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({});
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({});
  }

  // Default error
  res.status(err.status || 500).json({});
};

module.exports = errorHandler;
