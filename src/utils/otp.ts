// OTP Generation and Management Utility

interface OTPStore {
  [email: string]: {
    otp: string;
    expiresAt: number;
    attempts: number;
  };
}

// In-memory OTP storage (in production, use Redis or database)
const otpStorage: OTPStore = {};

export class OTPService {
  private static readonly OTP_LENGTH = 6;
  private static readonly OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private static readonly MAX_ATTEMPTS = 3;

  /**
   * Generate a random 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP for an email
   */
  static storeOTP(email: string, otp: string): void {
    otpStorage[email] = {
      otp,
      expiresAt: Date.now() + this.OTP_EXPIRY,
      attempts: 0,
    };
    console.log(`OTP generated for ${email}: ${otp} (Valid for 10 minutes)`);
  }

  /**
   * Verify OTP for an email
   */
  static verifyOTP(email: string, inputOTP: string): {
    success: boolean;
    message: string;
  } {
    const stored = otpStorage[email];

    if (!stored) {
      return {
        success: false,
        message: 'No OTP found. Please request a new one.',
      };
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      delete otpStorage[email];
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check attempts
    if (stored.attempts >= this.MAX_ATTEMPTS) {
      delete otpStorage[email];
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      };
    }

    // Verify OTP
    if (stored.otp === inputOTP) {
      delete otpStorage[email]; // Remove after successful verification
      return {
        success: true,
        message: 'OTP verified successfully',
      };
    }

    // Increment attempts
    stored.attempts++;
    return {
      success: false,
      message: `Invalid OTP. ${this.MAX_ATTEMPTS - stored.attempts} attempts remaining.`,
    };
  }

  /**
   * Clear OTP for an email
   */
  static clearOTP(email: string): void {
    delete otpStorage[email];
  }

  /**
   * Check if OTP exists and is valid
   */
  static hasValidOTP(email: string): boolean {
    const stored = otpStorage[email];
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) {
      delete otpStorage[email];
      return false;
    }
    return true;
  }

  /**
   * Get remaining time for OTP
   */
  static getRemainingTime(email: string): number {
    const stored = otpStorage[email];
    if (!stored) return 0;
    const remaining = stored.expiresAt - Date.now();
    return remaining > 0 ? Math.floor(remaining / 1000) : 0;
  }
}

/**
 * Send OTP via email (simulation)
 * In production, integrate with services like:
 * - SendGrid
 * - AWS SES
 * - Twilio SendGrid
 * - Nodemailer with SMTP
 */
export const sendOTPEmail = async (email: string, otp: string, type: 'signup' | 'reset' = 'signup'): Promise<boolean> => {
  try {
    // Call API route to send email (server-side)
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, type }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ OTP email sent to ${email}`);
      return true;
    } else {
      console.warn(`⚠️ ${result.message}`);
      // Fallback to console
      console.log(`
╔════════════════════════════════════════╗
║        OTP EMAIL NOTIFICATION          ║
╠════════════════════════════════════════╣
║ To: ${email.padEnd(33)} ║
║ Subject: Your StockMaster OTP          ║
║                                        ║
║ Your OTP code is: ${otp}               ║
║                                        ║
║ This code will expire in 10 minutes.  ║
║ Do not share this code with anyone.   ║
╚════════════════════════════════════════╝
      `);
      return true; // Return true even with console fallback
    }
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    
    // Fallback to console
    console.log(`
╔════════════════════════════════════════╗
║        OTP EMAIL NOTIFICATION          ║
╠════════════════════════════════════════╣
║ To: ${email.padEnd(33)} ║
║ Subject: Your StockMaster OTP          ║
║                                        ║
║ Your OTP code is: ${otp}               ║
║                                        ║
║ This code will expire in 10 minutes.  ║
║ Do not share this code with anyone.   ║
╚════════════════════════════════════════╝
    `);
    
    return true; // Return true even with console fallback
  }
};

/**
 * Send OTP via SMS (simulation)
 * In production, integrate with services like:
 * - Twilio
 * - AWS SNS
 * - MSG91
 */
export const sendOTPSMS = async (phone: string, otp: string): Promise<boolean> => {
  try {
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`SMS sent to ${phone}: Your StockMaster OTP is ${otp}. Valid for 10 minutes.`);

    // TODO: In production, use real SMS service:
    /*
    const client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `Your StockMaster OTP is ${otp}. Valid for 10 minutes. Do not share.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    */

    return true;
  } catch (error) {
    console.error('Failed to send OTP SMS:', error);
    return false;
  }
};
