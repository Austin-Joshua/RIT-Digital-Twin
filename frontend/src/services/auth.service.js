import apiClient from "./api.service";
import { API_CONFIG } from "../config/api.config";

export const authService = {
  login: async (identifier, password, rememberMe = false) => {
    const payload = {
      username: identifier,
      password,
      rememberMe,
    };
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, payload);
    const data = response.data || {};
    const accessToken = data.accessToken || data.token;
    const refreshToken = data.refreshToken;
    const user = data.user || {
      userId: data.userId,
      username: data.username,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    };

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { accessToken, refreshToken, user };
  },

  register: async (userData) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (_err) {
      // ignore logout network errors; local cleanup is authoritative
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem("accessToken") || localStorage.getItem("token"));
  },

  verifyToken: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.VERIFY_TOKEN);
      return response.data?.valid !== false;
    } catch (_err) {
      return false;
    }
  },
};

export default authService;
