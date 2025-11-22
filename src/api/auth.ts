// Authentication API - Connected to Backend
import { API_BASE_URL, handleResponse } from './config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface VerifyOTPData {
  email: string;
  otp: string;
}

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * User Registration - Creates account and sends OTP email
 * POST /api/auth/signup
 */
export const signup = async (data: SignupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{
      success: boolean;
      message: string;
      requiresVerification?: boolean;
      email?: string;
      token?: string;
      user?: any;
    }>(response);

    // Store token and user if registration successful without OTP
    if (result.success && result.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: error.message || 'Signup failed. Please try again.',
    };
  }
};

/**
 * Verify OTP after registration
 * POST /api/auth/verify-otp
 */
export const verifySignupOTP = async (data: VerifyOTPData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{
      success: boolean;
      message: string;
      token?: string;
      user?: any;
    }>(response);

    // Store token and user after successful verification
    if (result.success && result.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      message: error.message || 'Verification failed. Please try again.',
    };
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await handleResponse<{
      success: boolean;
      message?: string;
      token?: string;
      user?: any;
    }>(response);

    // Store token and user data in localStorage
    if (result.success && result.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed. Please try again.',
    };
  }
};

/**
 * Request password reset OTP
 * POST /api/auth/request-reset
 */
export const requestResetOTP = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/request-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await handleResponse<{
      success: boolean;
      message: string;
    }>(response);

    return result;
  } catch (error: any) {
    console.error('Request OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP. Please try again.',
    };
  }
};

/**
 * Reset password with OTP verification
 * POST /api/auth/reset-password
 */
export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{
      success: boolean;
      message: string;
    }>(response);

    return result;
  } catch (error: any) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: error.message || 'Password reset failed. Please try again.',
    };
  }
};

/**
 * Resend OTP (reuses signup flow - backend will send new OTP)
 * POST /api/auth/request-reset
 */
export const resendOTP = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/request-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await handleResponse<{
      success: boolean;
      message: string;
    }>(response);

    return result;
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to resend OTP. Please try again.',
    };
  }
};

/**
 * Logout
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};
