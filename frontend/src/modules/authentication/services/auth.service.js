// src/modules/authentication/services/auth.service.js
import { authApi } from "../api/auth.api";

class AuthService {
  async login(credentials) {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    try {
      const response = await authApi.getCurrentUser();
      return response;
    } catch (error) {
      this.clearTokens();
      throw new Error("Failed to get current user");
    }
  }

  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }
}

export const authService = new AuthService();
