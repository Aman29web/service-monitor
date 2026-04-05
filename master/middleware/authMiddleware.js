// middleware/authMiddleware.js
// Verifies the JWT that slave agents attach to every request.
// The same secret is shared between master and slaves via environment variables.

const jwt = require('jsonwebtoken');

/**
 * Express middleware that validates a Bearer JWT in the Authorization header.
 * Attaches the decoded payload to `req.slave` on success.
 */
const authenticateSlave = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Header must be present and follow the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header missing or malformed.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.slave = decoded; // e.g. { nodeId, iat, exp }
    next();
  } catch (err) {
    // Distinguish between expired tokens and invalid signatures
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired. Please re-register the slave.'
        : 'Invalid token signature.';

    return res.status(403).json({ success: false, message });
  }
};

module.exports = { authenticateSlave };
