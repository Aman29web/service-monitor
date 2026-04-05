// services/apiService.js
// Handles all HTTP communication from the slave to the master server.

const axios = require('axios');

/** Singleton Axios instance configured for the master server */
let client = null;
let authToken = null; // stored after successful registration

/**
 * Initialize the Axios client.
 * Call once at startup.
 *
 * @param {string} masterUrl - Base URL of the master server
 */
const initClient = (masterUrl) => {
  client = axios.create({
    baseURL: masterUrl,
    timeout: 8000, // 8s timeout per request
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Store the JWT received after registration.
 * Subsequent requests will include it automatically.
 *
 * @param {string} token
 */
const setAuthToken = (token) => {
  authToken = token;
  if (client) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

/**
 * Register this slave with the master.
 * Returns the JWT token to use for heartbeats.
 *
 * @param {Object} registrationPayload
 * @returns {Promise<string>} JWT token
 */
const register = async (registrationPayload) => {
  const response = await client.post('/api/nodes/register', registrationPayload);
  return response.data.token;
};

/**
 * Send a heartbeat with current metrics.
 *
 * @param {Object} heartbeatPayload - { nodeId, cpuUsage, memoryUsage, totalMemory, openPorts }
 * @returns {Promise<void>}
 */
const sendHeartbeat = async (heartbeatPayload) => {
  await client.post('/api/nodes/heartbeat', heartbeatPayload);
};

module.exports = { initClient, setAuthToken, register, sendHeartbeat };
