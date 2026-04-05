// routes/nodeRoutes.js
// Maps HTTP endpoints to controller functions.
// Authentication middleware is applied selectively:
//   - /register is public (slave needs a token to access other endpoints)
//   - /heartbeat and GET endpoints require a valid JWT

const express = require('express');
const router = express.Router();

const { authenticateSlave } = require('../middleware/authMiddleware');
const {
  registerNode,
  receiveHeartbeat,
  getNodes,
  getNodeById,
  registerValidation,
  heartbeatValidation,
} = require('../controllers/nodeController');

// ── Public routes ──────────────────────────────────────────────────────────
// Register: no auth required (slave doesn't have a token yet)
router.post('/register', registerValidation, registerNode);

// ── Protected routes (slave must send JWT) ─────────────────────────────────
router.post('/heartbeat', authenticateSlave, heartbeatValidation, receiveHeartbeat);

// ── Dashboard / read-only routes ───────────────────────────────────────────
// In a real system you might add separate dashboard auth here.
// For this project, read endpoints are open to the frontend.
router.get('/', getNodes);
router.get('/:nodeId', getNodeById);

module.exports = router;
