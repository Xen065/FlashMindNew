/**
 * ============================================
 * Test Setup Configuration
 * ============================================
 * Initializes test database and global test configuration
 */

// IMPORTANT: Set test environment BEFORE requiring any modules
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:'; // Use in-memory SQLite for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-min-32-chars-long';

// Now require database after environment is set
const sequelize = require('../config/database');

// Initialize database before all tests
beforeAll(async () => {
  try {
    // Authenticate connection
    await sequelize.authenticate();

    // Sync database (create tables)
    await sequelize.sync({ force: true });

    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Test database initialization failed:', error);
    throw error;
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables after each test for test isolation
  const models = Object.keys(sequelize.models);
  for (const modelName of models) {
    await sequelize.models[modelName].destroy({ where: {}, force: true, truncate: true });
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Error closing test database:', error);
  }
});

// Global test helpers
global.testHelpers = {
  /**
   * Create a test user
   */
  createTestUser: async (overrides = {}) => {
    const { User } = require('../models');
    return await User.create({
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!',
      fullName: 'Test User',
      ...overrides
    });
  },

  /**
   * Create a test course
   */
  createTestCourse: async (instructorId, overrides = {}) => {
    const { Course } = require('../models');
    return await Course.create({
      title: `Test Course ${Date.now()}`,
      description: 'Test course description',
      instructorId,
      isPublic: true,
      ...overrides
    });
  },

  /**
   * Create a test card
   */
  createTestCard: async (userId, courseId, overrides = {}) => {
    const { Card } = require('../models');
    return await Card.create({
      userId,
      courseId,
      question: 'Test question',
      answer: 'Test answer',
      cardType: 'basic',
      ...overrides
    });
  },

  /**
   * Generate JWT token for testing
   */
  generateTestToken: (userId) => {
    const { generateToken } = require('../utils/jwt');
    return generateToken(userId);
  }
};
