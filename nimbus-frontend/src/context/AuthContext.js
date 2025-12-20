import React, { createContext, useState, useContext } from 'react';
import { API_ENDPOINTS } from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('accessToken');
    return !!token && token !== 'undefined' && token !== 'null';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).role : null;
  });

  // Signup with OTP (Step 1: Send OTP email)
  const signup = async (name, email, password, confirmPassword, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Don't auto-login - wait for OTP verification
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Verify OTP (Step 2: Verify OTP and auto-login)
  const verifyOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      // Auto-login: Save tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Resend OTP
  const resendOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.RESEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Login with API
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch (err) {
      console.error('Token refresh error:', err.message);
      logout(); // Auto logout on token refresh failure
      return false;
    }
  };

  // Logout with API
  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      // Clear tokens and user data regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
    }
  };

  // Get current user from API
  const getCurrentUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const response = await fetch(API_ENDPOINTS.AUTH.GET_ME, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        // Try to refresh token if 401
        if (response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            return getCurrentUser(); // Retry with new token
          }
        }
        return null;
      }

      const data = await response.json();
      setUser(data.user);
      setRole(data.user.role);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error('Get current user error:', err.message);
      return null;
    }
  };

  // Update User Profile (Local + API if needed)
  const updateUserProfile = async (userData) => {
    setLoading(true);
    try {
      // 1. Update local state immediately for UI responsiveness
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setRole(updatedUser.role);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // 2. TODO: Call API endpoint when available
      // await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, ...);

      setLoading(false);
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Forgot Password - Step 1: Send OTP
  const sendForgotPasswordOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Forgot Password - Step 2: Verify OTP
  const verifyForgotPasswordOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Forgot Password - Step 3: Reset Password
  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.RESET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Forgot Password - Resend OTP
  const resendForgotPasswordOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.RESEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated,
      loading,
      error,
      login,
      signup,
      verifyOtp,
      resendOtp,
      logout,
      refreshAccessToken,
      getCurrentUser,
      updateUserProfile,
      sendForgotPasswordOtp,
      verifyForgotPasswordOtp,
      resetPassword,
      resendForgotPasswordOtp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
