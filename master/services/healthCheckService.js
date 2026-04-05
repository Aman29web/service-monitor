
const { markStaleNodesDown, getAllNodes } = require('./nodeService');

const CHECK_INTERVAL_MS = 10_000;

let intervalId = null;

/**
 * @param {import('socket.io').Server} io
 */
const startHealthCheck = (io) => {
  if (intervalId) return; // already running

  console.log('[HealthCheck] Starting sweep interval every 10s...');

  intervalId = setInterval(async () => {
    try {
      const downNodeIds = await markStaleNodesDown();

      if (downNodeIds.length > 0) {
        console.warn(`[HealthCheck] Nodes marked DOWN: ${downNodeIds.join(', ')}`);

        downNodeIds.forEach((nodeId) => {
          io.emit('node:alert', {
            nodeId,
            status: 'DOWN',
            message: `Node ${nodeId} has stopped sending heartbeats.`,
            timestamp: new Date().toISOString(),
          });
        });
      }

      const nodes = await getAllNodes();
      io.emit('nodes:update', nodes);
    } catch (err) {
      console.error('[HealthCheck] Sweep error:', err.message);
    }
  }, CHECK_INTERVAL_MS);
};


const stopHealthCheck = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[HealthCheck] Sweep stopped.');
  }
};

module.exports = { startHealthCheck, stopHealthCheck };
