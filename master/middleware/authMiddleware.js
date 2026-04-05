
const jwt = require('jsonwebtoken');


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
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired. Please re-register the slave.'
        : 'Invalid token signature.';

    return res.status(403).json({ success: false, message });
  }
};

module.exports = { authenticateSlave };
