/**
 * ============================================
 * RefreshToken Model
 * ============================================
 * Stores refresh tokens for JWT token rotation
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' // Delete tokens when user is deleted
  },

  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
    comment: 'JWT refresh token (long-lived)'
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
    comment: 'Token expiration date (30 days from creation)'
  },

  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether token has been revoked/used'
  },

  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'revoked_at',
    comment: 'When the token was revoked'
  },

  replacedBy: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'replaced_by',
    comment: 'Token that replaced this one (for audit trail)'
  },

  // IP and User Agent for security tracking
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 can be up to 45 characters
    allowNull: true,
    field: 'ip_address',
    comment: 'IP address where token was created'
  },

  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'user_agent',
    comment: 'User agent of the client that created the token'
  }

}, {
  tableName: 'refresh_tokens',
  timestamps: true, // Adds createdAt and updatedAt
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['token']
    },
    {
      fields: ['expires_at']
    }
  ]
});

/**
 * Instance method to check if token is active
 * @returns {boolean} - True if token is not revoked and not expired
 */
RefreshToken.prototype.isActive = function() {
  return !this.revoked && this.expiresAt > new Date();
};

/**
 * Instance method to revoke token
 * @param {string} replacedByToken - Optional token that replaced this one
 */
RefreshToken.prototype.revoke = async function(replacedByToken = null) {
  this.revoked = true;
  this.revokedAt = new Date();
  if (replacedByToken) {
    this.replacedBy = replacedByToken;
  }
  await this.save();
};

/**
 * Static method to revoke all user tokens (logout from all devices)
 * @param {number} userId - User ID
 */
RefreshToken.revokeAllUserTokens = async function(userId) {
  await RefreshToken.update(
    {
      revoked: true,
      revokedAt: new Date()
    },
    {
      where: {
        userId,
        revoked: false
      }
    }
  );
};

/**
 * Static method to cleanup expired tokens (run periodically)
 */
RefreshToken.cleanupExpiredTokens = async function() {
  const deletedCount = await RefreshToken.destroy({
    where: {
      expiresAt: {
        [require('sequelize').Op.lt]: new Date()
      }
    }
  });
  return deletedCount;
};

module.exports = RefreshToken;
