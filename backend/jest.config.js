/**
 * ============================================
 * Jest Configuration for Backend Testing
 * ============================================
 * Configures Jest test runner for backend API testing
 */

module.exports = {
  // Use Node.js environment for testing
  testEnvironment: 'node',

  // Coverage directory
  coverageDirectory: 'coverage',

  // Collect coverage from these files
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js'
  ],

  // Setup files to run after environment is set up
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60
    }
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],

  // Verbose output
  verbose: true,

  // Force exit after tests complete
  forceExit: true,

  // Clear mocks between tests
  clearMocks: true,

  // Detect open handles
  detectOpenHandles: true,

  // Test timeout (10 seconds)
  testTimeout: 10000
};
