/**
 * ============================================
 * Response Time Middleware
 * ============================================
 * Tracks and logs request processing time
 */

const logger = require('../utils/logger');

/**
 * Middleware to track response time for each request
 */
const responseTimeMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override res.end to capture when response is actually sent
  res.end = function(...args) {
    const duration = Date.now() - startTime;

    // Set response time header before sending response
    res.setHeader('X-Response-Time', `${duration}ms`);

    // Call the original end function
    originalEnd.apply(this, args);

    // Log request after response is sent (but headers are already set)
    setImmediate(() => {
      // Store duration for logger
      res.responseTime = duration;
      logger.logRequest(req, res);

      // Warn on slow requests (> 1 second)
      if (duration > 1000) {
        logger.warn('Slow Request Detected', {
          requestId: req.id,
          method: req.method,
          url: req.originalUrl || req.url,
          duration: `${duration}ms`,
          userId: req.user?.id
        });
      }
    });
  };

  next();
};

module.exports = responseTimeMiddleware;
