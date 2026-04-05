// services/metricsService.js
// Collects real system metrics using Node.js built-ins.

const os = require('os');
const net = require('net');

/**
 * Get current CPU usage percentage.
 * We take two samples 200ms apart and compute the delta.
 *
 * @returns {Promise<number>} CPU usage as a percentage (0–100)
 */
const getCpuUsage = () => {
  return new Promise((resolve) => {
    const sample1 = os.cpus();

    setTimeout(() => {
      const sample2 = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;

      sample1.forEach((cpu, i) => {
        const cpu2 = sample2[i];

        // Sum all tick types for both samples
        const tickDelta = Object.keys(cpu2.times).reduce((sum, type) => {
          return sum + (cpu2.times[type] - cpu.times[type]);
        }, 0);

        const idleDelta = cpu2.times.idle - cpu.times.idle;

        totalIdle += idleDelta;
        totalTick += tickDelta;
      });

      const usage = 100 - (100 * totalIdle) / totalTick;
      resolve(Math.min(100, Math.max(0, parseFloat(usage.toFixed(2)))));
    }, 200);
  });
};

/**
 * Get current memory usage percentage and total memory.
 *
 * @returns {{ memoryUsage: number, totalMemory: number, freeMemory: number }}
 */
const getMemoryUsage = () => {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const percentage = parseFloat(((used / total) * 100).toFixed(2));

  return {
    memoryUsage: percentage,
    totalMemory: total,
    freeMemory: free,
  };
};

/**
 * Check whether a specific TCP port is open on localhost.
 * Uses a raw net.Socket with a 300ms timeout.
 *
 * @param {number} port
 * @returns {Promise<boolean>}
 */
const isPortOpen = (port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 300; // ms

    socket.setTimeout(timeout);

    socket
      .on('connect', () => {
        socket.destroy();
        resolve(true);
      })
      .on('timeout', () => {
        socket.destroy();
        resolve(false);
      })
      .on('error', () => {
        resolve(false);
      })
      .connect(port, '127.0.0.1');
  });
};

/**
 * Scan a list of ports and return the ones that are open.
 *
 * @param {number[]} ports - Ports to scan
 * @returns {Promise<number[]>} Open ports
 */
const getOpenPorts = async (ports) => {
  // Run all checks in parallel for speed
  const results = await Promise.all(
    ports.map(async (port) => {
      const open = await isPortOpen(port);
      return open ? port : null;
    })
  );
  return results.filter(Boolean);
};

/**
 * Collect all metrics in one call.
 *
 * @param {number[]} portsToScan
 * @returns {Promise<Object>}
 */
const collectMetrics = async (portsToScan = []) => {
  const [cpuUsage, memInfo, openPorts] = await Promise.all([
    getCpuUsage(),
    Promise.resolve(getMemoryUsage()),
    getOpenPorts(portsToScan),
  ]);

  return {
    cpuUsage,
    memoryUsage: memInfo.memoryUsage,
    totalMemory: memInfo.totalMemory,
    freeMemory: memInfo.freeMemory,
    openPorts,
  };
};

module.exports = { collectMetrics, getCpuUsage, getMemoryUsage, getOpenPorts };
