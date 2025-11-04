import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('Email server is ready to take messages');
  }
});

export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"TradersSquare" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify Your Email Address - TradersSquare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">TradersSquare</h1>
          <p style="color: #6B7280; margin: 5px 0 0 0;">Ecommerce Platform</p>
        </div>
        
        <h2 style="color: #1F2937; margin-bottom: 20px;">Verify Your Email Address</h2>
        
        <p style="color: #4B5563; line-height: 1.6; margin-bottom: 25px;">
          Thank you for signing up with TradersSquare! To complete your registration and start shopping,
          please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold; 
                    display: inline-block; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #4B5563; line-height: 1.6; margin-bottom: 15px;">
          Or copy and paste this link in your browser:
        </p>
        
        <p style="background-color: #F3F4F6; padding: 12px; border-radius: 4px; 
                  word-break: break-all; font-family: monospace; color: #4F46E5; 
                  margin: 15px 0;">
          ${verificationUrl}
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #6B7280; font-size: 14px; margin: 0;">
            This verification link will expire in 24 hours.<br>
            If you didn't create an account with TradersSquare, please ignore this email.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            © 2024 TradersSquare. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Verify your email address for TradersSquare\n\nPlease click the following link to verify your email address:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with TradersSquare, please ignore this email.`
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${email}`);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"TradersSquare" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset Your Password - TradersSquare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">TradersSquare</h1>
          <p style="color: #6B7280; margin: 5px 0 0 0;">Ecommerce Platform</p>
        </div>
        
        <h2 style="color: #1F2937; margin-bottom: 20px;">Reset Your Password</h2>
        
        <p style="color: #4B5563; line-height: 1.6; margin-bottom: 25px;">
          You recently requested to reset your password for your TradersSquare account.
          Click the button below to set a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold; 
                    display: inline-block; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #4B5563; line-height: 1.6; margin-bottom: 15px;">
          Or copy and paste this link in your browser:
        </p>
        
        <p style="background-color: #F3F4F6; padding: 12px; border-radius: 4px; 
                  word-break: break-all; font-family: monospace; color: #4F46E5; 
                  margin: 15px 0;">
          ${resetUrl}
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #6B7280; font-size: 14px; margin: 0;">
            This password reset link will expire in 1 hour.<br>
            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            © 2025 TradersSquare. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Reset your password for TradersSquare\n\nPlease click the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email and your password will remain unchanged.`
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}