/**
 * ============================================
 * Error Codes and Custom Error Class
 * ============================================
 * Centralized error handling with structured error codes
 */

/**
 * Structured error codes with HTTP status codes
 */
const ERROR_CODES = {
  // Authentication errors (AUTH_xxx)
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: 'Invalid email or password',
    statusCode: 401
  },
  AUTH_ACCOUNT_DISABLED: {
    code: 'AUTH_002',
    message: 'Your account has been deactivated. Please contact support.',
    statusCode: 401
  },
  AUTH_EMAIL_NOT_VERIFIED: {
    code: 'AUTH_003',
    message: 'Please verify your email address before accessing this feature',
    statusCode: 403
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_004',
    message: 'Your session has expired. Please log in again.',
    statusCode: 401
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_005',
    message: 'Invalid authentication token',
    statusCode: 401
  },
  AUTH_UNAUTHORIZED: {
    code: 'AUTH_006',
    message: 'You are not authorized to access this resource',
    statusCode: 403
  },

  // Validation errors (VAL_xxx)
  VALIDATION_ERROR: {
    code: 'VAL_001',
    message: 'Validation failed. Please check your input.',
    statusCode: 400
  },
  VALIDATION_EMAIL_INVALID: {
    code: 'VAL_002',
    message: 'Please provide a valid email address',
    statusCode: 400
  },
  VALIDATION_PASSWORD_WEAK: {
    code: 'VAL_003',
    message: 'Password must be at least 6 characters long',
    statusCode: 400
  },
  VALIDATION_REQUIRED_FIELD: {
    code: 'VAL_004',
    message: 'Required field is missing',
    statusCode: 400
  },

  // Resource errors (RES_xxx)
  RESOURCE_NOT_FOUND: {
    code: 'RES_001',
    message: 'The requested resource was not found',
    statusCode: 404
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 'RES_002',
    message: 'This resource already exists',
    statusCode: 409
  },
  RESOURCE_CONFLICT: {
    code: 'RES_003',
    message: 'Resource conflict occurred',
    statusCode: 409
  },

  // Database errors (DB_xxx)
  DATABASE_ERROR: {
    code: 'DB_001',
    message: 'A database error occurred. Please try again.',
    statusCode: 500
  },
  DATABASE_CONNECTION_ERROR: {
    code: 'DB_002',
    message: 'Unable to connect to database',
    statusCode: 503
  },
  DATABASE_CONSTRAINT_VIOLATION: {
    code: 'DB_003',
    message: 'Database constraint violation',
    statusCode: 400
  },

  // Rate limiting errors (RATE_xxx)
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_001',
    message: 'Too many requests. Please try again later.',
    statusCode: 429
  },

  // File/Upload errors (FILE_xxx)
  FILE_TOO_LARGE: {
    code: 'FILE_001',
    message: 'File size exceeds maximum allowed size',
    statusCode: 413
  },
  FILE_INVALID_TYPE: {
    code: 'FILE_002',
    message: 'Invalid file type',
    statusCode: 400
  },

  // Business logic errors (BIZ_xxx)
  BIZ_INSUFFICIENT_PERMISSIONS: {
    code: 'BIZ_001',
    message: 'You do not have permission to perform this action',
    statusCode: 403
  },
  BIZ_OPERATION_NOT_ALLOWED: {
    code: 'BIZ_002',
    message: 'This operation is not allowed',
    statusCode: 403
  },
  BIZ_ALREADY_ENROLLED: {
    code: 'BIZ_003',
    message: 'You are already enrolled in this course',
    statusCode: 400
  },
  BIZ_COURSE_NOT_PUBLISHED: {
    code: 'BIZ_004',
    message: 'This course is not published yet',
    statusCode: 403
  },

  // Generic errors (SYS_xxx)
  INTERNAL_SERVER_ERROR: {
    code: 'SYS_001',
    message: 'An unexpected error occurred. Please try again.',
    statusCode: 500
  },
  SERVICE_UNAVAILABLE: {
    code: 'SYS_002',
    message: 'Service temporarily unavailable. Please try again later.',
    statusCode: 503
  },
  NOT_IMPLEMENTED: {
    code: 'SYS_003',
    message: 'This feature is not yet implemented',
    statusCode: 501
  }
};

/**
 * Custom Application Error Class
 * Extends the standard Error class with error codes and status codes
 */
class AppError extends Error {
  /**
   * Create an application error
   * @param {Object} errorCode - Error code object from ERROR_CODES
   * @param {Object} details - Additional error details (optional)
   * @param {Error} originalError - Original error if wrapping another error (optional)
   */
  constructor(errorCode, details = null, originalError = null) {
    super(errorCode.message);

    this.name = 'AppError';
    this.code = errorCode.code;
    this.statusCode = errorCode.statusCode || 500;
    this.details = details;
    this.originalError = originalError;
    this.isOperational = true; // Distinguish operational errors from programmer errors

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    const error = {
      code: this.code,
      message: this.message
    };

    // Only include details in development or if explicitly set
    if (this.details && (process.env.NODE_ENV === 'development' || this.details.includeInResponse)) {
      error.details = this.details;
    }

    return error;
  }
}

/**
 * Helper function to create common errors
 */
const createError = {
  /**
   * Create a not found error
   * @param {string} resourceName - Name of the resource
   */
  notFound: (resourceName = 'Resource') => {
    return new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, {
      resource: resourceName
    });
  },

  /**
   * Create an unauthorized error
   * @param {string} reason - Reason for unauthorized access
   */
  unauthorized: (reason = null) => {
    return new AppError(ERROR_CODES.AUTH_UNAUTHORIZED, {
      reason
    });
  },

  /**
   * Create a validation error
   * @param {Array} errors - Array of validation errors
   */
  validation: (errors) => {
    return new AppError(ERROR_CODES.VALIDATION_ERROR, {
      errors
    });
  },

  /**
   * Create a database error
   * @param {Error} originalError - Original database error
   */
  database: (originalError) => {
    return new AppError(ERROR_CODES.DATABASE_ERROR, null, originalError);
  },

  /**
   * Create a rate limit error
   */
  rateLimit: () => {
    return new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
};

module.exports = {
  ERROR_CODES,
  AppError,
  createError
};
