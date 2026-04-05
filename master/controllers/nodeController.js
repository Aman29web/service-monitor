// controllers/nodeController.js
// Handles HTTP request/response. Business logic lives in nodeService.js.

const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { signSlaveToken } = require('../utils/jwtUtils');
const nodeService = require('../services/nodeService');
const { getAllNodes } = require('../services/nodeService');

// ─── Validation rules ─────────────────────────────────────────────────────────

/** Validation rules for POST /api/nodes/register */
const registerValidation = [
  body('nodeId').trim().notEmpty().withMessage('nodeId is required'),
  body('ipAddress').trim().notEmpty().withMessage('ipAddress is required'),
];

/** Validation rules for POST /api/nodes/heartbeat */
const heartbeatValidation = [
  body('nodeId').trim().notEmpty().withMessage('nodeId is required'),
  body('cpuUsage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('cpuUsage must be a number between 0 and 100'),
  body('memoryUsage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('memoryUsage must be a number between 0 and 100'),
];

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Send a 422 response if express-validator found errors */
const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return true; // caller should return early
  }
  return false;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/nodes/register
 * Called by the slave on startup. Returns a JWT for subsequent requests.
 */
const registerNode = asyncHandler(async (req, res) => {
  if (checkValidation(req, res)) return;

  const { node, isNew } = await nodeService.registerNode(req.body);

  // Issue a signed token the slave can use for heartbeat requests
  const token = signSlaveToken(node.nodeId);

  // Emit real-time update to dashboard via Socket.IO (io attached to req.app)
  const io = req.app.get('io');
  if (io) {
    const nodes = await getAllNodes();
    io.emit('nodes:update', nodes);
    if (isNew) {
      io.emit('node:registered', { nodeId: node.nodeId, ipAddress: node.ipAddress });
    }
  }

  return res.status(isNew ? 201 : 200).json({
    success: true,
    message: isNew ? 'Node registered successfully.' : 'Node re-registered.',
    token,
    node,
  });
});

/**
 * POST /api/nodes/heartbeat
 * Called by the slave every 20 seconds with fresh metrics.
 */
const receiveHeartbeat = asyncHandler(async (req, res) => {
  if (checkValidation(req, res)) return;

  const { nodeId, cpuUsage, memoryUsage, totalMemory, openPorts } = req.body;

  // Ensure the authenticated slave can only send its own heartbeat
  if (req.slave.nodeId !== nodeId) {
    return res.status(403).json({
      success: false,
      message: 'Token nodeId does not match request nodeId.',
    });
  }

  const node = await nodeService.processHeartbeat(nodeId, {
    cpuUsage,
    memoryUsage,
    totalMemory,
    openPorts,
  });

  // Push updated node list to all dashboard clients in real-time
  const io = req.app.get('io');
  if (io) {
    const nodes = await getAllNodes();
    io.emit('nodes:update', nodes);
    // Also emit the individual node update for the detail page
    io.emit(`node:heartbeat:${nodeId}`, node);
  }

  console.log(
    `[Heartbeat] ${nodeId} | CPU: ${cpuUsage.toFixed(1)}% | MEM: ${memoryUsage.toFixed(1)}%`
  );

  return res.status(200).json({ success: true, message: 'Heartbeat received.', node });
});

/**
 * GET /api/nodes
 * Returns all nodes for the dashboard.
 */
const getNodes = asyncHandler(async (req, res) => {
  const nodes = await nodeService.getAllNodes();
  return res.status(200).json({ success: true, count: nodes.length, nodes });
});

/**
 * GET /api/nodes/:nodeId
 * Returns a single node's details.
 */
const getNodeById = asyncHandler(async (req, res) => {
  const node = await nodeService.getNodeById(req.params.nodeId);
  return res.status(200).json({ success: true, node });
});

module.exports = {
  registerNode,
  receiveHeartbeat,
  getNodes,
  getNodeById,
  registerValidation,
  heartbeatValidation,
};
