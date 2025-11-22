/**
 * ============================================
 * PasswordReset Model
 * ============================================
 * Stores password reset tokens for secure password recovery
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordReset = sequelize.define('PasswordReset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // User who requested the reset
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },

  // Secure random token (sent via email)
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Cryptographically secure random token'
  },

  // Token expiration (default 1 hour)
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
    comment: 'Token expires after this date/time'
  },

  // Has the token been used?
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if token has been used to reset password'
  },

  // When was it used?
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'used_at'
  },

  // IP address that requested reset (for audit trail)
  requestIp: {
    type: DataTypes.STRING(45), // IPv6 can be up to 45 chars
    allowNull: true,
    field: 'request_ip',
    comment: 'IP address that requested the reset'
  },

  // IP address that used the reset (for audit trail)
  resetIp: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'reset_ip',
    comment: 'IP address that used the reset token'
  }

}, {
  tableName: 'password_resets',
  timestamps: true,
  indexes: [
    {
      fields: ['token']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['expires_at']
    }
  ]
});

/**
 * Check if token is valid
 * @returns {boolean}
 */
PasswordReset.prototype.isValid = function() {
  const now = new Date();
  return !this.used && this.expiresAt > now;
};

/**
 * Mark token as used
 * @param {string} resetIp - IP address that used the token
 */
PasswordReset.prototype.markAsUsed = async function(resetIp) {
  this.used = true;
  this.usedAt = new Date();
  this.resetIp = resetIp;
  await this.save();
};

module.exports = PasswordReset;
