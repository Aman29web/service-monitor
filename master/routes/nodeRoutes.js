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

router.post('/register', registerValidation, registerNode);

router.post('/heartbeat', authenticateSlave, heartbeatValidation, receiveHeartbeat);
router.get('/', getNodes);
router.get('/:nodeId', getNodeById);

module.exports = router;
