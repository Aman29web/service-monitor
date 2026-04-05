// config/db.js
// Handles MongoDB connection with retry logic and event logging

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas with retry on failure.
 * Mongoose handles connection pooling automatically.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[DB] MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // These are the recommended options for Mongoose 7+
      serverSelectionTimeoutMS: 5000, // Fail fast on bad connection
    });

    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    // Exit process so the container/service restarts automatically
    process.exit(1);
  }
};

// Log disconnection events for observability
mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected. Mongoose will auto-reconnect.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] MongoDB reconnected.');
});

module.exports = connectDB;
