/**
 * ============================================
 * Authentication Routes
 * ============================================
 * Handles user registration and login
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { User, PasswordReset } = require('../models');
const { generateToken } = require('../utils/jwt');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { sendPasswordResetEmail } = require('../utils/email');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter, // Rate limiting: 10 registrations per hour per IP
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .isAlphanumeric()
      .withMessage('Username must be alphanumeric'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Full name must not exceed 100 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { username, email, password, fullName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [require('sequelize').Op.or]: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken'
        });
      }

      // Create new user (password will be hashed automatically by model hook)
      const user = await User.create({
        username,
        email,
        password,
        fullName: fullName || username
      });

      // Generate JWT token
      const token = generateToken(user.id);

      // Return user data (without password)
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter, // Rate limiting: 5 login attempts per 15 minutes per IP
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Return user data (without password)
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (sends email with reset token)
 * @access  Public
 */
router.post(
  '/forgot-password',
  loginLimiter, // Reuse login limiter to prevent abuse
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });

      // Always return success to prevent email enumeration
      // (don't reveal whether email exists in system)
      if (!user) {
        return res.json({
          success: true,
          message: 'If that email exists, a password reset link has been sent'
        });
      }

      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Create password reset record (expires in 1 hour)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await PasswordReset.create({
        userId: user.id,
        token: resetToken,
        expiresAt,
        requestIp: req.ip || req.connection.remoteAddress
      });

      // Send password reset email
      try {
        await sendPasswordResetEmail(email, resetToken, user.fullName || user.username);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't reveal email sending failure to user for security
      }

      res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing password reset request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token from email
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { token, newPassword } = req.body;

      // Find the password reset record
      const passwordReset = await PasswordReset.findOne({
        where: { token },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      // Validate token exists and is valid
      if (!passwordReset || !passwordReset.isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update user's password (will be auto-hashed by User model hook)
      const user = passwordReset.user;
      user.password = newPassword;
      await user.save();

      // Mark token as used
      passwordReset.used = true;
      passwordReset.usedAt = new Date();
      passwordReset.usedIp = req.ip || req.connection.remoteAddress;
      await passwordReset.save();

      res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting password',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;
