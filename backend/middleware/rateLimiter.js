/**
 * ============================================
 * Rate Limiter Middleware
 * ============================================
 * Protects endpoints from abuse by limiting request rates.
 * Uses in-memory store (simple deployment, resets on server restart).
 *
 * For production with multiple servers, consider Redis-backed storage:
 * https://github.com/express-rate-limit/rate-limit-redis
 */

const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for login endpoint
 * Prevents brute-force password attacks
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === 'test'
  // Skip rate limiting for successful logins (optional - uncomment if desired)
  // skipSuccessfulRequests: true
});

/**
 * Moderate limiter for registration endpoint
 * Prevents spam account creation
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 registrations per hour
  message: {
    success: false,
    message: 'Too many accounts created from this IP. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * Lenient limiter for other auth endpoints
 * Prevents general API abuse
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Protects all API endpoints from abuse
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many API requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for static files and health checks
  skip: (req) => {
    return req.path === '/api/health' || req.path.startsWith('/uploads/');
  }
});

module.exports = {
  loginLimiter,
  registerLimiter,
  authLimiter,
  apiLimiter
};
