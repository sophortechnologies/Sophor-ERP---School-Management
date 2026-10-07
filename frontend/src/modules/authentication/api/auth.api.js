// src/modules/authentication/api/auth.api.js
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../config/swagger.config";

class AuthApi {
  /**
   * Universal login - backend accepts { email, password } or { username, password }
   */
  async login(credentials) {
    try {
      // Allow user to enter either email or username in the identifier input
      const payload = {
        password: credentials.password,
      };

      if (credentials.username?.includes("@")) {
        payload.email = credentials.username.trim();
      } else {
        payload.username = credentials.username?.trim();
      }

      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      return this.normalizeAuthResponse(response.data);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.GET_CURRENT_USER);
      return this.normalizeAuthResponse(response.data);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Normalize API responses to match frontend Redux authSlice expectations
   */
  normalizeAuthResponse(apiData) {
    if (!apiData) return null;

    const rawUser = apiData.user || (apiData.id ? apiData : null);
    const token = apiData.access_token || apiData.accessToken || apiData.token;

    if (rawUser) {
      const roleStr =
        typeof rawUser.role === "object" ? rawUser.role?.name : rawUser.role;
      const normalizedRole = String(roleStr || "student").toLowerCase();

      return {
        user: {
          id: rawUser.id,
          username: rawUser.username,
          role: normalizedRole,
          email: rawUser.email,
          name:
            [rawUser.firstName, rawUser.lastName].filter(Boolean).join(" ") ||
            rawUser.username,
          firstName: rawUser.firstName,
          lastName: rawUser.lastName,
          permissions: rawUser.permissions || [],
          isActive: rawUser.isActive ?? true,
        },
        accessToken: token || localStorage.getItem("accessToken"),
        refreshToken:
          apiData.refresh_token ||
          apiData.refreshToken ||
          localStorage.getItem("refreshToken"),
      };
    }

    return apiData;
  }

  /**
   * Logout user from backend session
   */
  async logout() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Refresh access token via /auth/refresh-token
   */
  async refreshToken() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Change password: { oldPassword, newPassword }
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Forgot password: { email }
   */
  async forgotPassword(email) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Reset password with token: { token, newPassword }
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  formatError(error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        message: data.message || data.error || `Server error: ${status}`,
        status,
        data,
      };
    }
    return {
      message: error.message || "Network error. Please try again.",
      status: 0,
    };
  }
}

export const authApi = new AuthApi();
