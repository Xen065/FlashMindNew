/**
 * ============================================
 * JWT Utility Functions
 * ============================================
 * Helper functions for JWT token generation
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {number} userId - User ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate access token and refresh token pair
 * @param {number} userId - User ID
 * @returns {Object} - Object containing accessToken and refreshToken
 */
const generateTokenPair = (userId) => {
  // Short-lived access token (15 minutes)
  const accessToken = jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Long-lived refresh token (30 days)
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  generateTokenPair,
  verifyToken
};
