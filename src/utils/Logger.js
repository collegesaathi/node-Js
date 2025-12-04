const winston = require('winston');

// Helper: Safely convert objects to JSON strings
const safeStringify = (msg) => {
  if (typeof msg === "object") {
    try {
      return JSON.stringify(msg, null, 2);
    } catch (err) {
      return "⚠️ [Unable to stringify message]";
    }
  }
  return msg;
};

// Filter logs per level
const levelFilter = (level) => {
  return winston.format((info) => {
    return info.level === level ? info : false;
  })();
};

// Master format for files
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${safeStringify(message)}`;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${safeStringify(message)}`;
  })
);

const Loggers = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    // ---------- LOGS PER LEVEL ----------
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(levelFilter('error'), fileFormat),
    }),
    new winston.transports.File({
      filename: 'logs/warn.log',
      level: 'warn',
      format: winston.format.combine(levelFilter('warn'), fileFormat),
    }),
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: winston.format.combine(levelFilter('info'), fileFormat),
    }),
    new winston.transports.File({
      filename: 'logs/http.log',
      level: 'http',
      format: winston.format.combine(levelFilter('http'), fileFormat),
    }),
    new winston.transports.File({
      filename: 'logs/verbose.log',
      level: 'verbose',
      format: winston.format.combine(levelFilter('verbose'), fileFormat),
    }),
    new winston.transports.File({
      filename: 'logs/debug.log',
      level: 'debug',
      format: winston.format.combine(levelFilter('debug'), fileFormat),
    }),
    new winston.transports.File({
      filename: 'logs/silly.log',
      level: 'silly',
      format: winston.format.combine(levelFilter('silly'), fileFormat),
    }),

    // ---------- CONSOLE LOGS ----------
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
});

module.exports = Loggers;
