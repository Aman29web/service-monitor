// models/Node.js
// Mongoose schema for a registered slave node

const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema(
  {
    // Unique identifier sent by the slave agent on registration
    nodeId: {
      type: String,
      required: [true, 'nodeId is required'],
      unique: true,
      trim: true,
    },

    // IP address of the slave machine
    ipAddress: {
      type: String,
      required: [true, 'ipAddress is required'],
      trim: true,
    },

    // Human-readable hostname (optional, nice for the dashboard)
    hostname: {
      type: String,
      trim: true,
      default: 'unknown',
    },

    // CPU usage as a percentage (0–100)
    cpuUsage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Memory usage as a percentage (0–100)
    memoryUsage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Total memory in bytes (for reference)
    totalMemory: {
      type: Number,
      default: 0,
    },

    // List of open TCP ports detected by the slave
    openPorts: {
      type: [Number],
      default: [],
    },

    // Node platform/OS info
    platform: {
      type: String,
      default: 'unknown',
    },

    // Node.js version on the slave
    nodeVersion: {
      type: String,
      default: 'unknown',
    },

    // Health status — updated by the health-check service
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'UNKNOWN'],
      default: 'UNKNOWN',
    },

    // Unix timestamp (ms) of the last received heartbeat
    lastHeartbeat: {
      type: Date,
      default: null,
    },

    // Port the slave agent is running on (useful when simulating multiple locally)
    agentPort: {
      type: Number,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
    // Expose virtuals when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// nodeId already has a unique index from the schema definition
// Index status for fast dashboard queries
NodeSchema.index({ status: 1 });
// Index lastHeartbeat for the health-check TTL query
NodeSchema.index({ lastHeartbeat: 1 });

// ─── Virtual: secondsSinceHeartbeat ──────────────────────────────────────────
NodeSchema.virtual('secondsSinceHeartbeat').get(function () {
  if (!this.lastHeartbeat) return null;
  return Math.floor((Date.now() - new Date(this.lastHeartbeat).getTime()) / 1000);
});

module.exports = mongoose.model('Node', NodeSchema);
