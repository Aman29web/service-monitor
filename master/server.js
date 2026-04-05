// server.js
// Entry point for the Health Monitor Master Server.
// Bootstraps Express, Socket.IO, MongoDB, and background services.

require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const nodeRoutes = require('./routes/nodeRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startHealthCheck } = require('./services/healthCheckService');

// ─── App & HTTP Server ────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Attach io to app so controllers can access it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// ─── Security & Logging Middleware ────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiter — 200 req / 1 min per IP (generous for slave heartbeats)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Slow down.' },
});
app.use(limiter);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/nodes', nodeRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const bootstrap = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n🚀 Master server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Nodes API: http://localhost:${PORT}/api/nodes\n`);
  });

  // Start background health-check sweep
  startHealthCheck(io);
};

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});
