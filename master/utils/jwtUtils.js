
const jwt = require('jsonwebtoken');

/**
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
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signSlaveToken, verifyToken };
