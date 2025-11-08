import { swaggerApiService } from "../../../core/api/swagger.api";
import { SWAGGER_ENDPOINTS } from "../../../config/swagger.config";

/**
 * Authentication API Module
 * Handles all authentication-related API calls via Swagger
 */
class AuthApi {
  /**
   * Login user
   * @param {Object} credentials - { username, password }
   * @returns {Promise<Object>} - { user, accessToken, refreshToken }
   */
  async login(credentials) {
    try {
      const response = await swaggerApiService.post(
        SWAGGER_ENDPOINTS.LOGIN,
        credentials
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await swaggerApiService.post(SWAGGER_ENDPOINTS.LOGOUT);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current logged-in user
   */
  async getCurrentUser() {
    try {
      const response = await swaggerApiService.get(
        SWAGGER_ENDPOINTS.GET_CURRENT_USER
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await swaggerApiService.post(
        SWAGGER_ENDPOINTS.REFRESH_TOKEN,
        { refreshToken }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const response = await swaggerApiService.post("/auth/forgot-password", {
        email,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await swaggerApiService.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const authApi = new AuthApi();
