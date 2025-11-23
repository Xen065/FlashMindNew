/**
 * ============================================
 * Winston Logger Configuration
 * ============================================
 * Structured logging with request IDs and context
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom log format for better readability
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Console format with colors for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    const metaKeys = Object.keys(meta).filter(key =>
      key !== 'timestamp' && key !== 'level' && key !== 'message'
    );

    if (metaKeys.length > 0) {
      const metaStr = JSON.stringify(
        Object.fromEntries(metaKeys.map(key => [key, meta[key]])),
        null,
        2
      );
      msg += `\n${metaStr}`;
    }

    return msg;
  })
);

/**
 * Main logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'flashmind-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error logs - separate file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Access logs - info and above
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 3,
      tailable: true
    })
  ],

  // Don't exit on error
  exitOnError: false
});

/**
 * Add console transport for non-production environments
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

/**
 * Create child logger with request context
 * @param {Object} context - Request context (requestId, userId, etc.)
 * @returns {Object} - Child logger instance
 */
logger.withContext = (context) => {
  return logger.child(context);
};

/**
 * Helper methods for common log patterns
 */
logger.logRequest = (req, res) => {
  const logData = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl || req.url,
    userId: req.user?.id,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    statusCode: res.statusCode,
    responseTime: res.get('X-Response-Time')
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

logger.logError = (error, req = null) => {
  const logData = {
    error: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode
  };

  if (req) {
    logData.requestId = req.id;
    logData.method = req.method;
    logData.url = req.originalUrl || req.url;
    logData.userId = req.user?.id;
    logData.ip = req.ip || req.connection?.remoteAddress;
  }

  logger.error('Application Error', logData);
};

logger.logAuth = (event, userId, metadata = {}) => {
  logger.info('Auth Event', {
    event,
    userId,
    ...metadata
  });
};

logger.logDatabase = (operation, model, metadata = {}) => {
  logger.debug('Database Operation', {
    operation,
    model,
    ...metadata
  });
};

module.exports = logger;
