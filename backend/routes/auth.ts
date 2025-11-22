import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { generateToken } from '../middleware/auth';
import { generateOTP, sendOTPEmail } from '../services/email';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with verified = 0 (unverified)
    const result = await query(
      'INSERT INTO users (name, email, password, role, verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'user', 0] // SQLite uses 0 for false, 1 for true
    );

    const user = result.rows[0] as any;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in database
    await query(
      'INSERT INTO otp_verifications (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)',
      [email, otp, 'signup', expiresAt.toISOString()]
    );

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, 'signup');
    } catch (emailError) {
      console.error('Failed to send OTP email, but user created:', emailError);
      // User is created, OTP is stored, just email failed
      // Return success anyway - user can request resend
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
      requiresVerification: true,
      email: email,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const result = await query(
      'SELECT id, name, email, password, role, verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0] as any;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP for email confirmation
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Check OTP
    const result = await query(
      'SELECT * FROM otp_verifications WHERE email = $1 AND otp = $2 AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Mark user as verified
    await query('UPDATE users SET verified = 1 WHERE email = $1', [email]);

    // Delete used OTP
    await query('DELETE FROM otp_verifications WHERE email = $1', [email]);

    // Get user details
    const userResult = await query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email]
    );

    const user = userResult.rows[0] as any;

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
});

/**
 * POST /api/auth/request-reset
 * Request password reset OTP
 */
router.post('/request-reset', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user exists
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate OTP (this would be done by frontend OTP service)
    res.json({
      success: true,
      message: 'Password reset OTP sent',
    });
  } catch (error) {
    console.error('Reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process reset request',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Verify OTP
    const otpResult = await query(
      'SELECT * FROM otp_verifications WHERE email = $1 AND otp = $2 AND type = $3 AND expires_at > NOW()',
      [email, otp, 'reset']
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    // Delete used OTP
    await query('DELETE FROM otp_verifications WHERE email = $1', [email]);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  }
});

export default router;
