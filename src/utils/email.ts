import nodemailer from 'nodemailer';

/**
 * Email configuration and sender utility
 * 
 * To use Gmail:
 * 1. Enable 2-Step Verification in your Google Account
 * 2. Generate an App Password: https://myaccount.google.com/apppasswords
 * 3. Create .env.local file with:
 *    NEXT_PUBLIC_EMAIL_USER=your-email@gmail.com
 *    NEXT_PUBLIC_EMAIL_PASSWORD=your-app-password
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Create email transporter
 */
const createTransporter = () => {
  // Check if credentials are configured
  const emailUser = process.env.NEXT_PUBLIC_EMAIL_USER;
  const emailPassword = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email credentials not configured. Using console fallback.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const transporter = createTransporter();

  // If no transporter (credentials not set), use console fallback
  if (!transporter) {
    console.log('\n' + '═'.repeat(60));
    console.log('📧 EMAIL NOTIFICATION (Console Fallback)');
    console.log('═'.repeat(60));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('\nContent:');
    console.log(options.html.replace(/<[^>]*>/g, '')); // Strip HTML tags for console
    console.log('═'.repeat(60) + '\n');
    return true;
  }

  // Send actual email
  try {
    const info = await transporter.sendMail({
      from: `"StockMaster" <${process.env.NEXT_PUBLIC_EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✅ Email sent successfully to ${options.to}`);
    console.log(`Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    // Fallback to console if email fails
    console.log('\n' + '═'.repeat(60));
    console.log('📧 EMAIL NOTIFICATION (Fallback - Email sending failed)');
    console.log('═'.repeat(60));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('\nContent:');
    console.log(options.html.replace(/<[^>]*>/g, ''));
    console.log('═'.repeat(60) + '\n');
    
    return false;
  }
};

/**
 * OTP Email Template
 */
export const createOTPEmailHTML = (otp: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StockMaster OTP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #000000; font-size: 32px; font-weight: bold;">StockMaster</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Verification Code</h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                    You requested a verification code for your StockMaster account. Use the code below to complete your verification:
                  </p>
                  
                  <!-- OTP Box -->
                  <div style="background-color: #f8f8f8; border: 2px dashed #dddddd; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                    <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </div>
                  
                  <p style="margin: 20px 0; color: #999999; font-size: 14px; line-height: 1.5;">
                    <strong>⏰ This code will expire in 10 minutes.</strong>
                  </p>
                  
                  <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                    If you didn't request this code, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #eeeeee;">
                  <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
                    This is an automated message from StockMaster. Please do not reply to this email.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
                    © 2025 StockMaster. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
