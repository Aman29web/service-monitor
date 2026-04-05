// services/healthCheckService.js
// Periodically sweeps for stale nodes and emits Socket.IO alerts.

const { markStaleNodesDown, getAllNodes } = require('./nodeService');

// Check interval — run every 10 seconds
const CHECK_INTERVAL_MS = 10_000;

let intervalId = null;

/**
 * Start the background health-check sweep.
 * Pass the Socket.IO `io` instance so we can push real-time alerts to the frontend.
 *
 * @param {import('socket.io').Server} io
 */
const startHealthCheck = (io) => {
  if (intervalId) return; // already running

  console.log('[HealthCheck] Starting sweep interval every 10s...');

  intervalId = setInterval(async () => {
    try {
      // Mark stale nodes DOWN and get their IDs
      const downNodeIds = await markStaleNodesDown();

      if (downNodeIds.length > 0) {
        console.warn(`[HealthCheck] Nodes marked DOWN: ${downNodeIds.join(', ')}`);

        // Emit alert to all connected dashboard clients
        downNodeIds.forEach((nodeId) => {
          io.emit('node:alert', {
            nodeId,
            status: 'DOWN',
            message: `Node ${nodeId} has stopped sending heartbeats.`,
            timestamp: new Date().toISOString(),
          });
        });
      }

      // After updating statuses, broadcast the full fresh node list to the dashboard
      const nodes = await getAllNodes();
      io.emit('nodes:update', nodes);
    } catch (err) {
      console.error('[HealthCheck] Sweep error:', err.message);
    }
  }, CHECK_INTERVAL_MS);
};

/**
 * Stop the health-check sweep (useful for graceful shutdown in tests).
 */
const stopHealthCheck = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[HealthCheck] Sweep stopped.');
  }
};

module.exports = { startHealthCheck, stopHealthCheck };
