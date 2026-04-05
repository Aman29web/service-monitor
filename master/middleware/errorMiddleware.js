// middleware/errorMiddleware.js
// Centralized error handler — must be the LAST middleware registered in server.js

/**
 * 404 handler — catches requests to undefined routes.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.message}`);
    if (err.stack) console.error(err.stack);
  } else {
    console.error(`[Error] ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
