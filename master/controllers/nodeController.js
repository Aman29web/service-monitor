

const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { signSlaveToken } = require('../utils/jwtUtils');
const nodeService = require('../services/nodeService');
const { getAllNodes } = require('../services/nodeService');


const registerValidation = [
  body('nodeId').trim().notEmpty().withMessage('nodeId is required'),
  body('ipAddress').trim().notEmpty().withMessage('ipAddress is required'),
];

const heartbeatValidation = [
  body('nodeId').trim().notEmpty().withMessage('nodeId is required'),
  body('cpuUsage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('cpuUsage must be a number between 0 and 100'),
  body('memoryUsage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('memoryUsage must be a number between 0 and 100'),
];


const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return true; // caller should return early
  }
  return false;
};

const registerNode = asyncHandler(async (req, res) => {
  if (checkValidation(req, res)) return;

  const { node, isNew } = await nodeService.registerNode(req.body);

  const token = signSlaveToken(node.nodeId);

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

const receiveHeartbeat = asyncHandler(async (req, res) => {
  if (checkValidation(req, res)) return;

  const { nodeId, cpuUsage, memoryUsage, totalMemory, openPorts } = req.body;

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

  const io = req.app.get('io');
  if (io) {
    const nodes = await getAllNodes();
    io.emit('nodes:update', nodes);
    io.emit(`node:heartbeat:${nodeId}`, node);
  }

  console.log(
    `[Heartbeat] ${nodeId} | CPU: ${cpuUsage.toFixed(1)}% | MEM: ${memoryUsage.toFixed(1)}%`
  );

  return res.status(200).json({ success: true, message: 'Heartbeat received.', node });
});


const getNodes = asyncHandler(async (req, res) => {
  const nodes = await nodeService.getAllNodes();
  return res.status(200).json({ success: true, count: nodes.length, nodes });
});


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
