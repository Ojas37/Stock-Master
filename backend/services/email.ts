import nodemailer from 'nodemailer';

// Create transporter lazily to ensure env vars are loaded
const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.NEXT_PUBLIC_EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
  
  console.log('📧 Email config:', {
    user: emailUser ? `${emailUser.substring(0, 5)}...` : 'NOT SET',
    pass: emailPassword ? '***SET***' : 'NOT SET'
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email: string, otp: string, type: 'signup' | 'reset'): Promise<void> => {
  const subject = type === 'signup' 
    ? 'StockMaster - Verify Your Email' 
    : 'StockMaster - Password Reset OTP';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>StockMaster IMS</h1>
          <p>${type === 'signup' ? 'Email Verification' : 'Password Reset'}</p>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>${type === 'signup' 
            ? 'Thank you for registering with StockMaster. Please use the following OTP to verify your email address:' 
            : 'We received a request to reset your password. Use the following OTP to proceed:'
          }</p>
          
          <div class="otp-box">
            <p style="margin: 0; color: #666;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This OTP is valid for <strong>10 minutes</strong></li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p style="margin-top: 20px;">
            ${type === 'signup' 
              ? 'Enter this code on the verification page to complete your registration.' 
              : 'Enter this code on the password reset page to create a new password.'
            }
          </p>
        </div>
        <div class="footer">
          <p>© 2025 StockMaster IMS. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"StockMaster IMS" <${process.env.EMAIL_USER || process.env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
