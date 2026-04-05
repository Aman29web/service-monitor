// utils/logger.js
// Lightweight console logger with timestamps and levels.

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', DEBUG: 'DEBUG' };

const log = (level, message, data) => {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level}]`;

  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

module.exports = {
  info:  (msg, data) => log(levels.INFO,  msg, data),
  warn:  (msg, data) => log(levels.WARN,  msg, data),
  error: (msg, data) => log(levels.ERROR, msg, data),
  debug: (msg, data) => log(levels.DEBUG, msg, data),
};
