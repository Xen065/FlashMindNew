/**
 * ============================================
 * FlashMind Backend Server
 * ============================================
 * This is the main entry point for the backend API server.
 * It sets up Express, connects to PostgreSQL, and handles all API requests.
 */

// Load environment variables from .env file
require('dotenv').config();

// ============================================
// Environment Variable Validation
// ============================================
// Validate critical environment variables before starting server
const validateEnvVariables = () => {
  const requiredEnvVars = {
    // Critical security variables
    JWT_SECRET: {
      description: 'JWT secret for token signing',
      critical: true,
      validation: (val) => val && val.length >= 32,
      errorMessage: 'JWT_SECRET must be at least 32 characters long'
    },
    // Database configuration
    DB_DIALECT: {
      description: 'Database dialect (postgres, sqlite, etc.)',
      critical: false,
      default: 'postgres'
    },
    // Application URLs
    FRONTEND_URL: {
      description: 'Frontend application URL',
      critical: false,
      default: 'http://localhost:3000'
    }
  };

  const errors = [];
  const warnings = [];

  // Validate each required variable
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    if (!value) {
      if (config.critical) {
        errors.push(`❌ MISSING CRITICAL: ${key} - ${config.description}`);
      } else if (config.default) {
        warnings.push(`⚠️  USING DEFAULT: ${key}=${config.default} (${config.description})`);
        process.env[key] = config.default;
      } else {
        warnings.push(`⚠️  MISSING: ${key} - ${config.description}`);
      }
    } else if (config.validation && !config.validation(value)) {
      errors.push(`❌ INVALID: ${key} - ${config.errorMessage || 'Invalid value'}`);
    }
  }

  // Additional production-specific validations
  if (process.env.NODE_ENV === 'production') {
    // Check JWT secret is not a weak default
    const weakSecrets = ['secret', 'your_jwt_secret', 'change_this', 'test', '123456'];
    if (process.env.JWT_SECRET && weakSecrets.some(weak =>
      process.env.JWT_SECRET.toLowerCase().includes(weak))) {
      errors.push('❌ SECURITY: JWT_SECRET appears to be a weak/default value in production!');
    }

    // Ensure database is not SQLite in production
    if (process.env.DB_DIALECT === 'sqlite') {
      warnings.push('⚠️  WARNING: Using SQLite in production is not recommended. Use PostgreSQL instead.');
    }

    // Check if SMTP is configured for production
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      warnings.push('⚠️  WARNING: SMTP not configured. Password reset emails will not work!');
    }

    // Check if HTTPS is being used (via FRONTEND_URL)
    if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('https://')) {
      warnings.push('⚠️  WARNING: FRONTEND_URL should use HTTPS in production');
    }
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Environment Warnings:');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }

  // Print errors and exit if any critical issues
  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Errors:');
    errors.forEach(error => console.error(`   ${error}`));
    console.error('\n💡 Solution:');
    console.error('   1. Copy backend/.env.example to backend/.env');
    console.error('   2. Update .env with your actual values');
    console.error('   3. Generate a secure JWT_SECRET:');
    console.error('      node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    console.error('\n📖 See DEPLOYMENT_GUIDE.md for detailed setup instructions\n');
    process.exit(1);
  }
};

// Run validation before starting server
validateEnvVariables();

// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// Import logging utilities
const logger = require('./utils/logger');
const requestIdMiddleware = require('./middleware/requestId');
const responseTimeMiddleware = require('./middleware/responseTime');

// Import database connection
const db = require('./config/database');

// Import error handling utilities
const { AppError, ERROR_CODES } = require('./utils/errorCodes');

// Import routes
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const cardRoutes = require('./routes/cards');
const studyRoutes = require('./routes/study');
const studyTasksRoutes = require('./routes/studyTasks');
const examRemindersRoutes = require('./routes/examReminders');
const calendarRoutes = require('./routes/calendar');
const statsRoutes = require('./routes/stats');
const achievementRoutes = require('./routes/achievements');
const adminRoutes = require('./routes/admin');
// New study tool features
const studyGoalsRoutes = require('./routes/studyGoals');
const analyticsRoutes = require('./routes/analytics');
const pomodoroRoutes = require('./routes/pomodoro');
const smartPlannerRoutes = require('./routes/smartPlanner');
const studyNotesRoutes = require('./routes/studyNotes');
const mathTrickRoutes = require('./routes/mathTrick');

// Initialize Express app
const app = express();

// ============================================
// Middleware Configuration
// ============================================

// Request ID middleware (must be first for all requests to have IDs)
app.use(requestIdMiddleware);

// Response time tracking and logging
app.use(responseTimeMiddleware);

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the React frontend to communicate with this backend
// Import CORS configuration with origin validation
const corsOptions = require('./middleware/cors');
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// HTTP request logger (shows requests in console)
// NOTE: Morgan is kept for development console output, but structured logging
// is now handled by Winston in responseTimeMiddleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// ============================================
// API Routes
// ============================================

// Health check endpoint (test if server is running)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FlashMind API Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Public routes (no authentication required)
app.use('/api/public', publicRoutes);

// Authentication routes (login, register)
app.use('/api/auth', authRoutes);

// User profile routes
app.use('/api/users', userRoutes);

// Course management routes
app.use('/api/courses', courseRoutes);

// Flashcard routes
app.use('/api/cards', cardRoutes);

// Study session routes (spaced repetition)
app.use('/api/study', studyRoutes);

// Study tasks (todo list) routes
app.use('/api/study/tasks', studyTasksRoutes);

// Exam reminders routes
app.use('/api/study/exams', examRemindersRoutes);

// Calendar integration routes
app.use('/api/calendar', calendarRoutes);

// Statistics and progress routes
app.use('/api/stats', statsRoutes);

// Achievement and gamification routes
app.use('/api/achievements', achievementRoutes);

// Admin routes (RBAC protected)
app.use('/api/admin', adminRoutes);

// Study tool features routes
app.use('/api/study/goals', studyGoalsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/planner', smartPlannerRoutes);
app.use('/api/study/notes', studyNotesRoutes);
app.use('/api/math-trick', mathTrickRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Handle AppError instances
  if (err instanceof AppError) {
    // Use structured logger
    logger.error('Application Error', {
      requestId: req.id,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      method: req.method,
      url: req.url,
      userId: req.user?.id,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      stack: err.stack,
      originalError: err.originalError?.message,
      originalStack: err.originalError?.stack
    });

    // Send structured error response
    return res.status(err.statusCode).json({
      success: false,
      error: err.toJSON(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        originalError: err.originalError?.message
      })
    });
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError' || (err.errors && Array.isArray(err.errors))) {
    logger.warn('Validation Error', {
      requestId: req.id,
      type: 'ValidationError',
      errors: err.errors,
      method: req.method,
      url: req.url,
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VAL_001',
        message: 'Validation failed',
        details: err.errors
      }
    });
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    logger.error('Database Error', {
      requestId: req.id,
      type: err.name,
      errors: err.errors?.map(e => e.message),
      method: req.method,
      url: req.url,
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'DB_003',
        message: 'Database constraint violation',
        ...(process.env.NODE_ENV === 'development' && {
          details: err.errors?.map(e => e.message)
        })
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.warn('JWT Error', {
      requestId: req.id,
      type: 'JsonWebTokenError',
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection?.remoteAddress
    });

    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_005',
        message: 'Invalid authentication token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('JWT Expired', {
      requestId: req.id,
      type: 'TokenExpiredError',
      method: req.method,
      url: req.url,
      userId: req.user?.id
    });

    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_004',
        message: 'Your session has expired. Please log in again.'
      }
    });
  }

  // Handle unknown errors
  logger.error('Unknown Error', {
    requestId: req.id,
    type: 'UnknownError',
    name: err.name,
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent')
  });

  // Don't leak error details in production
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: 'SYS_001',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again.'
        : err.message || 'Internal server error'
    },
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      name: err.name
    })
  });
});

// ============================================
// Database Connection & Server Start
// ============================================

const PORT = process.env.PORT || 5000;

// Only start server if this file is run directly (not imported for tests)
if (require.main === module) {
  // Connect to database and start server
  db.authenticate()
    .then(() => {
      logger.info('Database connected successfully');

      // Sync database models (create tables if they don't exist)
      // Using alter mode to update existing schema (adds/removes columns as needed)
      // WARNING: This can be slow on large databases. Consider using migrations for production.
      return db.sync({ alter: true });
    })
    .then(() => {
      logger.info('Database synchronized');

      // Start listening for requests
      app.listen(PORT, () => {
        logger.info('FlashMind API Server started', {
          environment: process.env.NODE_ENV,
          port: PORT,
          url: `http://localhost:${PORT}`,
          healthCheck: `http://localhost:${PORT}/api/health`
        });

        // Keep console output for visibility
        console.log('');
        console.log('🚀 ============================================');
        console.log(`🚀 FlashMind API Server is running!`);
        console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
        console.log(`🚀 Port: ${PORT}`);
        console.log(`🚀 URL: http://localhost:${PORT}`);
        console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
        console.log('🚀 ============================================');
        console.log('');
      });
    })
    .catch(err => {
      logger.error('Unable to start server', {
        error: err.message,
        stack: err.stack
      });
      console.error('❌ Unable to start server:', err);
      process.exit(1);
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  console.log('SIGTERM received, closing server...');
  db.close();
  process.exit(0);
});

// Export app for testing
module.exports = app;
