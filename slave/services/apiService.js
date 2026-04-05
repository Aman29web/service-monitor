
const axios = require('axios');

let client = null;
let authToken = null; // stored after successful registration

/**
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
 * @param {string} token
 */
const setAuthToken = (token) => {
  authToken = token;
  if (client) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

/**
 * @param {Object} registrationPayload
 * @returns {Promise<string>} JWT token
 */
const register = async (registrationPayload) => {
  const response = await client.post('/api/nodes/register', registrationPayload);
  return response.data.token;
};

/**
 * @param {Object} heartbeatPayload - { nodeId, cpuUsage, memoryUsage, totalMemory, openPorts }
 * @returns {Promise<void>}
 */
const sendHeartbeat = async (heartbeatPayload) => {
  await client.post('/api/nodes/heartbeat', heartbeatPayload);
};

module.exports = { initClient, setAuthToken, register, sendHeartbeat };
