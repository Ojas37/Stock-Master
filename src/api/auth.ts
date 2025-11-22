// Authentication API placeholders

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

// TODO: connect to POST /auth/login
export const login = async (credentials: LoginCredentials) => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          id: '1',
          name: 'John Doe',
          email: credentials.email,
          role: 'manager',
        },
        token: 'mock-jwt-token',
      });
    }, 1000);
  });
};

// TODO: connect to POST /auth/signup
export const signup = async (data: SignupData) => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Account created successfully',
      });
    }, 1000);
  });
};

// TODO: connect to POST /auth/request-reset-otp
export const requestResetOTP = async (email: string) => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'OTP sent to your email',
      });
    }, 1000);
  });
};

// TODO: connect to POST /auth/reset-password
export const resetPassword = async (data: ResetPasswordData) => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Password reset successfully',
      });
    }, 1000);
  });
};

export const logout = () => {
  // Clear local storage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
