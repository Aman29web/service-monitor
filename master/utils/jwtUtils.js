// utils/jwtUtils.js
// Helper functions for signing and verifying JWTs.

const jwt = require('jsonwebtoken');

/**
 * Sign a token for a slave agent to use in subsequent requests.
 *
 * @param {string} nodeId - The slave's unique identifier
 * @returns {string} Signed JWT
 */
const signSlaveToken = (nodeId) => {
  return jwt.sign(
    { nodeId, role: 'slave' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_SLAVE_EXPIRY || '365d' }
  );
};

/**
 * Verify and decode a JWT (used in tests or utility scripts).
 *
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signSlaveToken, verifyToken };
