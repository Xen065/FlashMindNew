/**
 * ============================================
 * Email Service Utility
 * ============================================
 * Handles sending emails for password reset, verification, etc.
 *
 * Currently uses Nodemailer for development.
 * For production, consider:
 * - SendGrid (recommended, free tier: 100 emails/day)
 * - AWS SES (scalable, cheap: $0.10 per 1,000 emails)
 * - Mailgun, Postmark, etc.
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter based on environment
 */
const createTransporter = () => {
  // Development: Use Ethereal email (fake SMTP for testing)
  // Production: Use real SMTP service
  if (process.env.NODE_ENV === 'production') {
    // Production SMTP configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development: Use Ethereal (or console logging)
    // Note: In real dev, you'd create Ethereal account first
    // For now, we'll use a generic config
    return nodemailer.createTransporter({
      host: 'localhost',
      port: 1025, // Mailhog or similar local mail server
      ignoreTLS: true,
      // If Mailhog not available, log to console
      streamTransport: !process.env.SMTP_HOST,
      newline: 'unix',
      buffer: true
    });
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name for personalization
 * @returns {Promise<Object>} - Email send result
 */
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"FlashMind Support" <${process.env.EMAIL_FROM || 'noreply@flashmind.com'}>`,
    to: email,
    subject: 'Password Reset Request - FlashMind',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #6366F1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>

            <p>We received a request to reset your FlashMind account password. Click the button below to create a new password:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              ${resetUrl}
            </p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link expires in <strong>1 hour</strong></li>
                <li>Can only be used <strong>once</strong></li>
                <li>If you didn't request this, you can safely ignore this email</li>
              </ul>
            </div>

            <p>For security reasons, never share this link with anyone.</p>

            <p>Thanks,<br>The FlashMind Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email from FlashMind. Please do not reply.</p>
            <p>If you didn't request a password reset, your account is still secure.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request

      Hi ${userName || 'there'},

      We received a request to reset your FlashMind account password.

      Reset your password by visiting this link:
      ${resetUrl}

      This link expires in 1 hour and can only be used once.

      If you didn't request this password reset, you can safely ignore this email.

      Thanks,
      The FlashMind Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    // In development, log to console
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Password Reset Email Sent');
      console.log('   To:', email);
      console.log('   Reset URL:', resetUrl);
      console.log('   Token:', resetToken);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) // Only works with Ethereal
    };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send email verification email
 * @param {string} email - User's email address
 * @param {string} verificationToken - Email verification token
 * @param {string} userName - User's name
 * @returns {Promise<Object>} - Email send result
 */
const sendEmailVerification = async (email, verificationToken, userName) => {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"FlashMind" <${process.env.EMAIL_FROM || 'noreply@flashmind.com'}>`,
    to: email,
    subject: 'Verify Your Email - FlashMind',
    html: `
      <h2>Welcome to FlashMind!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
      <p><a href="${verifyUrl}" style="padding: 12px 30px; background: #6366F1; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>Or copy this link: ${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
    `,
    text: `Welcome to FlashMind! Verify your email: ${verifyUrl}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Verification Email Sent to:', email);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerification
};
