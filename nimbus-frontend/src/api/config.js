import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  EMAIL: {
    GENERATE: `${API_BASE_URL}/api/email/generate`,
    SEND: `${API_BASE_URL}/api/email/send`,
    SAVE: `${API_BASE_URL}/api/email/save`,
    HISTORY: `${API_BASE_URL}/api/email/history`,
    ACTIVITY: `${API_BASE_URL}/api/email/activity`,
  },
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
    GET_ME: `${API_BASE_URL}/api/auth/me`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
    RESEND_OTP: `${API_BASE_URL}/api/auth/resend-otp`,
    FORGOT_PASSWORD: {
      SEND_OTP: `${API_BASE_URL}/api/auth/forgot-password/send-otp`,
      VERIFY_OTP: `${API_BASE_URL}/api/auth/forgot-password/verify-otp`,
      RESET: `${API_BASE_URL}/api/auth/forgot-password/reset`,
      RESEND_OTP: `${API_BASE_URL}/api/auth/forgot-password/resend-otp`,
    },
  },
  LOGO: {
    GENERATE: `${API_BASE_URL}/api/logo/generate`,
    SAVE: `${API_BASE_URL}/api/logo/save`,
    HISTORY: `${API_BASE_URL}/api/logo/history`,
    ACTIVITY: `${API_BASE_URL}/api/logo/activity`,
  },
  POSTER: {
    GENERATE: `${API_BASE_URL}/api/poster/generate`,
    SAVE: `${API_BASE_URL}/api/poster/save`,
    HISTORY: `${API_BASE_URL}/api/poster/history`,
    ACTIVITY: `${API_BASE_URL}/api/poster/activity`,
  },
  REPORT: {
    GENERATE: `${API_BASE_URL}/api/report/generate`,
    SAVE: `${API_BASE_URL}/api/report/save`,
    HISTORY: `${API_BASE_URL}/api/report/history`,
    ACTIVITY: `${API_BASE_URL}/api/report/activity`,
  },
};

// AXIOS INSTANCE (DEFAULT EXPORT)
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default axiosInstance;


export const fetchWithAuth = async (url, options = {}) => {
  const accessToken = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('refreshToken', refreshData.refreshToken);
          return fetchWithAuth(url, options);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
};
