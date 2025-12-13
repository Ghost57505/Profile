const nodemailer = require('nodemailer');

let cachedTransporter = null;

const createTransporter = async () => {
  // Return cached transporter
  if (cachedTransporter) return cachedTransporter;

  // Use real account if credentials are available
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    cachedTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    return cachedTransporter;
  }

  // Fall back to mock transporter for testing
  cachedTransporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 [TEST EMAIL SENT]', {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      return { messageId: 'test-' + Date.now() };
    }
  };
  return cachedTransporter;
};

const sendMFACode = async (email, code) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'test@example.com',
      to: email,
      subject: 'Your MFA Verification Code - Social Security',
      html: `
        <h2>Multi-Factor Authentication Code</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #266aca; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email and your account will remain secure.</p>
        <hr>
        <small>Social Security Administration - ID.me Authentication</small>
      `
    };

    // Log the code to console for testing
    console.log(`\n🔐 MFA CODE FOR ${email}: ${code}\n`);

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email service error:', error.message);
    // Don't fail the entire flow if email fails during testing
    console.warn('⚠️  MFA code generation succeeded but email delivery failed. Code:', code);
    return true;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = await createTransporter();
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'test@example.com',
      to: email,
      subject: 'Password Reset - Social Security',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #266aca; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // Log the reset link to console for testing
    console.log(`\n🔗 PASSWORD RESET LINK FOR ${email}: ${resetUrl}\n`);

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email service error:', error.message);
    // Don't fail the entire flow if email fails during testing
    console.warn('⚠️  Password reset link generation succeeded but email delivery failed');
    return true;
  }
};

module.exports = {
  sendMFACode,
  sendPasswordResetEmail
};
