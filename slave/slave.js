// slave/slave.js
// Entry point for the slave agent.
// Registers with the master server on startup, then sends heartbeats every 20s.
// Retries automatically if the master is unreachable.

require('dotenv').config();

const os = require('os');
const logger = require('./utils/logger');
const { collectMetrics } = require('./services/metricsService');
const { initClient, setAuthToken, register, sendHeartbeat } = require('./services/apiService');

// ─── Config ───────────────────────────────────────────────────────────────────
const MASTER_URL          = process.env.MASTER_URL          || 'http://localhost:4000';
const HEARTBEAT_INTERVAL  = parseInt(process.env.HEARTBEAT_INTERVAL_MS) || 20_000;
const RETRY_INTERVAL      = parseInt(process.env.RETRY_INTERVAL_MS)     || 10_000;
const PORTS_TO_SCAN       = (process.env.PORTS_TO_SCAN || '22,80,443,3000,3306,5432,6379,8080,27017')
  .split(',').map(Number).filter(Boolean);

// ─── Parse --port flag ────────────────────────────────────────────────────────
// Allows running multiple slaves locally:
//   node slave.js --port 5001
//   node slave.js --port 5002
const portFlagIndex = process.argv.indexOf('--port');
const agentPort = portFlagIndex !== -1
  ? parseInt(process.argv[portFlagIndex + 1], 10)
  : null;

// Unique node ID: hostname + port so each local slave appears separately
const NODE_ID = `${os.hostname()}-${agentPort || 'default'}`;

// ─── Initialize Axios client ──────────────────────────────────────────────────
initClient(MASTER_URL);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the first non-internal IPv4 address of this machine */
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) return alias.address;
    }
  }
  return '127.0.0.1';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Registration with retry ──────────────────────────────────────────────────

/**
 * Attempts to register this slave with the master.
 * Retries on failure until successful — the master might not be up yet.
 */
const registerWithRetry = async () => {
  while (true) {
    try {
      logger.info(`Registering with master at ${MASTER_URL}  [nodeId: ${NODE_ID}]`);

      const token = await register({
        nodeId:      NODE_ID,
        ipAddress:   getLocalIP(),
        hostname:    os.hostname(),
        platform:    os.platform(),
        nodeVersion: process.version,
        agentPort,
      });

      // Store the JWT — all subsequent requests will include it
      setAuthToken(token);
      logger.info('Registration successful. JWT token stored.');
      return; // exit retry loop
    } catch (err) {
      logger.warn(
        `Registration failed: ${err.message}. ` +
        `Retrying in ${RETRY_INTERVAL / 1000}s...`
      );
      await sleep(RETRY_INTERVAL);
    }
  }
};

// ─── Heartbeat loop ───────────────────────────────────────────────────────────

/**
 * Collects system metrics and sends them to the master.
 * Schedules itself recursively so the interval stays accurate
 * even if metric collection takes some time.
 */
const startHeartbeatLoop = () => {
  const tick = async () => {
    try {
      const metrics = await collectMetrics(PORTS_TO_SCAN);

      await sendHeartbeat({
        nodeId:      NODE_ID,
        cpuUsage:    metrics.cpuUsage,
        memoryUsage: metrics.memoryUsage,
        totalMemory: metrics.totalMemory,
        openPorts:   metrics.openPorts,
      });

      logger.info(
        `Heartbeat sent | ` +
        `CPU: ${metrics.cpuUsage}% | ` +
        `MEM: ${metrics.memoryUsage}% | ` +
        `Ports: [${metrics.openPorts.join(', ') || 'none'}]`
      );
    } catch (err) {
      logger.error(`Heartbeat failed: ${err.message}`);

      // If master rejected us (token expired / node not found), re-register
      const status = err.response?.status;
      if (status === 403 || status === 404) {
        logger.warn('Auth or node error — re-registering with master...');
        await registerWithRetry();
      }
      // For network errors (ECONNREFUSED etc.) we just retry on next tick
    }

    // Schedule next tick
    setTimeout(tick, HEARTBEAT_INTERVAL);
  };

  // Start immediately
  tick();
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────
(async () => {
  logger.info('='.repeat(50));
  logger.info(`Slave agent starting`);
  logger.info(`Node ID  : ${NODE_ID}`);
  logger.info(`Master   : ${MASTER_URL}`);
  logger.info(`Heartbeat: every ${HEARTBEAT_INTERVAL / 1000}s`);
  logger.info(`Scanning ports: ${PORTS_TO_SCAN.join(', ')}`);
  logger.info('='.repeat(50));

  await registerWithRetry();
  startHeartbeatLoop();
})();

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Slave agent shutting down.');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Slave agent shutting down.');
  process.exit(0);
});
