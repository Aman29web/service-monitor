

const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: [true, 'nodeId is required'],
      unique: true,
      trim: true,
    },

    ipAddress: {
      type: String,
      required: [true, 'ipAddress is required'],
      trim: true,
    },

    hostname: {
      type: String,
      trim: true,
      default: 'unknown',
    },

    cpuUsage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    memoryUsage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    totalMemory: {
      type: Number,
      default: 0,
    },

    openPorts: {
      type: [Number],
      default: [],
    },

    platform: {
      type: String,
      default: 'unknown',
    },

    nodeVersion: {
      type: String,
      default: 'unknown',
    },

    status: {
      type: String,
      enum: ['UP', 'DOWN', 'UNKNOWN'],
      default: 'UNKNOWN',
    },

    lastHeartbeat: {
      type: Date,
      default: null,
    },

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


NodeSchema.index({ status: 1 });
NodeSchema.index({ lastHeartbeat: 1 });

NodeSchema.virtual('secondsSinceHeartbeat').get(function () {
  if (!this.lastHeartbeat) return null;
  return Math.floor((Date.now() - new Date(this.lastHeartbeat).getTime()) / 1000);
});

module.exports = mongoose.model('Node', NodeSchema);
