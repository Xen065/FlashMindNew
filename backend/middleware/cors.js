/**
 * ============================================
 * CORS Configuration
 * ============================================
 * Configures Cross-Origin Resource Sharing with origin validation
 */

const logger = require('../utils/logger');

/**
 * Parse allowed origins from environment variable
 * Supports comma-separated list of origins
 */
const getAllowedOrigins = () => {
  // Get allowed origins from environment
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    // Split by comma and trim whitespace
    return envOrigins.split(',').map(origin => origin.trim());
  }

  // Default allowed origins for development
  const defaultOrigins = [
    'http://localhost:3000',           // React development server
    'http://localhost:3001',           // Alternative React port
    'http://127.0.0.1:3000',           // Localhost IP variant
    process.env.FRONTEND_URL           // Configured frontend URL
  ].filter(Boolean);  // Remove undefined values

  return defaultOrigins;
};

/**
 * CORS options with origin validation
 */
const corsOptions = {
  /**
   * Dynamic origin validation
   * @param {string} origin - Request origin
   * @param {function} callback - Callback(error, allow)
   */
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      logger.debug('CORS: Allowing request with no origin (mobile/API client)');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      logger.debug('CORS: Allowing origin', { origin });
      callback(null, true);
    } else {
      // Log blocked CORS request for security monitoring
      logger.warn('CORS: Blocked request from unauthorized origin', {
        origin,
        allowedOrigins
      });

      callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    }
  },

  /**
   * Allow credentials (cookies, authorization headers)
   * Required for cookie-based authentication
   */
  credentials: true,

  /**
   * Allow specific HTTP methods
   */
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  /**
   * Allow specific headers
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],

  /**
   * Expose specific headers to the client
   */
  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time'
  ],

  /**
   * How long the results of a preflight request can be cached (in seconds)
   * 24 hours
   */
  maxAge: 86400,

  /**
   * Success status for OPTIONS requests
   * Some legacy browsers (IE11, some SmartTVs) choke on 204
   */
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
