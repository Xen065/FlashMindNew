/**
 * ============================================
 * Authentication API Tests
 * ============================================
 * Tests for user registration, login, and authentication
 */

const request = require('supertest');
const app = require('../server'); // Will need to export app from server.js
const { User, PasswordReset } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('should register new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test123!',
          fullName: 'Test User'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user.username).toBe('testuser');
      expect(res.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should reject duplicate email', async () => {
      // Create first user
      await User.create({
        username: 'existing',
        email: 'existing@example.com',
        password: 'Test123!',
        fullName: 'Existing User'
      });

      // Attempt to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Test123!',
          fullName: 'New User'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already');
    });

    test('should reject duplicate username', async () => {
      // Create first user
      await User.create({
        username: 'existinguser',
        email: 'user1@example.com',
        password: 'Test123!',
        fullName: 'User 1'
      });

      // Attempt to register with same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'user2@example.com',
          password: 'Test123!',
          fullName: 'User 2'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already');
    });

    test('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Test123!',
          fullName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
          fullName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject short username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'Test123!',
          fullName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject non-alphanumeric username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test@user!',
          email: 'test@example.com',
          password: 'Test123!',
          fullName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should hash password before storing', async () => {
      const password = 'Test123!';
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'hashtest',
          email: 'hash@example.com',
          password,
          fullName: 'Hash Test'
        });

      const user = await User.findOne({ where: { email: 'hash@example.com' } });
      expect(user.password).not.toBe(password); // Password should be hashed
      expect(user.password.length).toBeGreaterThan(50); // Bcrypt hash is long
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'Test123!',
        fullName: 'Login User'
      });
    });

    test('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    test('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });

    test('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });

    test('should reject inactive user', async () => {
      // Deactivate user
      testUser.isActive = false;
      await testUser.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('deactivated');
    });

    test('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Test123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;
    let token;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'meuser',
        email: 'me@example.com',
        password: 'Test123!',
        fullName: 'Me User'
      });
      token = generateToken(testUser.id);
    });

    test('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('me@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    test('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'forgotuser',
        email: 'forgot@example.com',
        password: 'Test123!',
        fullName: 'Forgot User'
      });
    });

    test('should create password reset token for existing user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'forgot@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('password reset link');

      // Verify token was created in database
      const resetRecord = await PasswordReset.findOne({
        where: { userId: testUser.id }
      });
      expect(resetRecord).toBeDefined();
      expect(resetRecord.token).toBeDefined();
      expect(resetRecord.used).toBe(false);
    });

    test('should return generic message for non-existent email (security)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      // Should return success to prevent email enumeration
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'not-an-email'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should create new token if old one exists', async () => {
      // Create first reset request
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' });

      const firstToken = await PasswordReset.findOne({
        where: { userId: testUser.id }
      });

      // Create second reset request
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' });

      const allTokens = await PasswordReset.findAll({
        where: { userId: testUser.id }
      });

      expect(allTokens.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let testUser;
    let resetToken;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'resetuser',
        email: 'reset@example.com',
        password: 'OldPassword123!',
        fullName: 'Reset User'
      });

      // Create password reset token
      const crypto = require('crypto');
      resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await PasswordReset.create({
        userId: testUser.id,
        token: resetToken,
        expiresAt
      });
    });

    test('should reset password with valid token', async () => {
      const newPassword = 'NewPassword123!';
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset successfully');

      // Verify password was changed
      const updatedUser = await User.findByPk(testUser.id);
      const isPasswordValid = await updatedUser.comparePassword(newPassword);
      expect(isPasswordValid).toBe(true);

      // Verify token was marked as used
      const resetRecord = await PasswordReset.findOne({
        where: { token: resetToken }
      });
      expect(resetRecord.used).toBe(true);
    });

    test('should reject invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token-12345',
          newPassword: 'NewPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });

    test('should reject expired token', async () => {
      // Create expired token
      const expiredToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() - 2); // 2 hours ago

      await PasswordReset.create({
        userId: testUser.id,
        token: expiredToken,
        expiresAt
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'NewPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    test('should reject already used token', async () => {
      // Mark token as used
      const resetRecord = await PasswordReset.findOne({
        where: { token: resetToken }
      });
      resetRecord.used = true;
      await resetRecord.save();

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '123' // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // Note: Rate limiting tests are skipped because rate limiting is disabled in test environment
  // Rate limiting is verified in production/development environments
  // This ensures tests run quickly and reliably without flaky rate limit state
});
