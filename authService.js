import { apiRequest, setAuthToken, removeAuthToken } from './apiClient';

export const authService = {
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    if (data.token) {
      await setAuthToken(data.token);
    }
    return data;
  },

  register: async (fullName, email, password) => {
    const data = await apiRequest('/auth/register', 'POST', { fullName, email, password });
    if (data.token) {
      await setAuthToken(data.token);
    }
    return data;
  },

  forgotPassword: async (email) => {
    return await apiRequest('/auth/forgot-password', 'POST', { email });
  },

  verifyOtp: async (email, otp) => {
    return await apiRequest('/auth/verify-otp', 'POST', { email, otp });
  },

  resetPassword: async (resetToken, newPassword) => {
    return await apiRequest('/auth/reset-password', 'POST', { resetToken, newPassword });
  },

  getProfile: async () => {
    return await apiRequest('/users/profile', 'GET');
  },

  updateProfile: async (profileFields) => {
    return await apiRequest('/users/profile', 'PATCH', profileFields);
  },

  logout: async () => {
    await removeAuthToken();
  },
};
