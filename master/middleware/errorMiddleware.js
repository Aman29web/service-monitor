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

/**
 * Global error handler.
 * Express recognises this as an error handler because it has 4 parameters.
 */
const errorHandler = (err, req, res, _next) => {
  // Default to 500 if no status code was set on the error
  const statusCode = err.statusCode || res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;

  // Log the stack in development for easier debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.message}`);
    if (err.stack) console.error(err.stack);
  } else {
    console.error(`[Error] ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only expose the stack in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
