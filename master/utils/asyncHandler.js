
/**
 * @param {Function} fn - async Express route handler
 * @returns {Function} Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
