/**
 * ============================================
 * Request ID Middleware
 * ============================================
 * Generates unique ID for each request for tracing
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to add unique request ID to each request
 * Useful for correlating logs and debugging
 */
const requestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();

  // Add to response headers for client-side debugging
  res.setHeader('X-Request-ID', req.id);

  next();
};

module.exports = requestIdMiddleware;
