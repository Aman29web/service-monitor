// services/nodeService.js
// All business logic related to slave nodes lives here.
// Controllers stay thin — they just call these functions.

const Node = require('../models/Node');

// How long (ms) without a heartbeat before we mark a node DOWN
const TIMEOUT_MS = parseInt(process.env.NODE_TIMEOUT_MS, 10) || 40000;

/**
 * Register a new slave node or update its metadata if it reconnects.
 * Using upsert so a slave that restarts doesn't cause a duplicate-key error.
 *
 * @param {Object} data - Registration payload from the slave
 * @returns {Object} { node, isNew }
 */
const registerNode = async (data) => {
  const { nodeId, ipAddress, hostname, platform, nodeVersion, agentPort } = data;

  const node = await Node.findOneAndUpdate(
    { nodeId }, // filter
    {
      $set: {
        ipAddress,
        hostname: hostname || 'unknown',
        platform: platform || 'unknown',
        nodeVersion: nodeVersion || 'unknown',
        agentPort: agentPort || null,
        status: 'UP',
        lastHeartbeat: new Date(),
      },
    },
    {
      upsert: true,       // create if not found
      new: true,          // return the updated document
      runValidators: true,
    }
  );

  // Mongoose doesn't expose `upserted` easily — detect by comparing timestamps
  const isNew =
    Math.abs(node.createdAt.getTime() - node.updatedAt.getTime()) < 1000;

  return { node, isNew };
};

/**
 * Process a heartbeat from a slave.
 * Updates metrics and resets the lastHeartbeat timestamp.
 *
 * @param {string} nodeId
 * @param {Object} metrics - { cpuUsage, memoryUsage, totalMemory, openPorts }
 * @returns {Object} Updated node document
 */
const processHeartbeat = async (nodeId, metrics) => {
  const { cpuUsage, memoryUsage, totalMemory, openPorts } = metrics;

  const node = await Node.findOneAndUpdate(
    { nodeId },
    {
      $set: {
        cpuUsage: cpuUsage ?? 0,
        memoryUsage: memoryUsage ?? 0,
        totalMemory: totalMemory ?? 0,
        openPorts: openPorts ?? [],
        status: 'UP',
        lastHeartbeat: new Date(),
      },
    },
    { new: true }
  );

  if (!node) {
    const err = new Error(`Node "${nodeId}" not found. Register first.`);
    err.statusCode = 404;
    throw err;
  }

  return node;
};

/**
 * Return all nodes, newest first.
 *
 * @returns {Array} Array of Node documents
 */
const getAllNodes = async () => {
  return Node.find({}).sort({ createdAt: -1 });
};

/**
 * Return a single node by nodeId.
 *
 * @param {string} nodeId
 * @returns {Object} Node document
 */
const getNodeById = async (nodeId) => {
  const node = await Node.findOne({ nodeId });
  if (!node) {
    const err = new Error(`Node "${nodeId}" not found.`);
    err.statusCode = 404;
    throw err;
  }
  return node;
};

/**
 * Health-check sweep — runs on a cron-like interval.
 * Any node whose lastHeartbeat is older than TIMEOUT_MS is marked DOWN.
 *
 * @returns {string[]} Array of nodeIds that were marked DOWN
 */
const markStaleNodesDown = async () => {
  const cutoff = new Date(Date.now() - TIMEOUT_MS);

  const result = await Node.updateMany(
    {
      status: 'UP',
      lastHeartbeat: { $lt: cutoff },
    },
    { $set: { status: 'DOWN' } }
  );

  if (result.modifiedCount > 0) {
    // Fetch the IDs of nodes that were just marked DOWN for alerting
    const downNodes = await Node.find(
      { status: 'DOWN', lastHeartbeat: { $lt: cutoff } },
      { nodeId: 1, _id: 0 }
    );
    return downNodes.map((n) => n.nodeId);
  }

  return [];
};

module.exports = {
  registerNode,
  processHeartbeat,
  getAllNodes,
  getNodeById,
  markStaleNodesDown,
};
