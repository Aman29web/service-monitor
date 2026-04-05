// utils/asyncHandler.js
// Wraps an async route handler and forwards any thrown errors to Express's
// next() so they are caught by the global error middleware.

/**
 * @param {Function} fn - async Express route handler
 * @returns {Function} Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
