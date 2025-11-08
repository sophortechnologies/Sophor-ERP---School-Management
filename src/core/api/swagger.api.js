import { swaggerClient } from "../../lib/swagger-client";
import { SWAGGER_CONFIG } from "../../config/swagger.config";

/**
 * Core Swagger API Service
 * Handles all API calls through Swagger client
 */
class SwaggerApiService {
  constructor() {
    this.baseURL = SWAGGER_CONFIG.BASE_URL;
  }

  /**
   * GET request via Swagger
   */
  async get(endpoint, params = {}) {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        ...(Object.keys(params).length && {
          params: new URLSearchParams(params),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * POST request via Swagger
   */
  async post(endpoint, data = {}) {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * PUT request via Swagger
   */
  async put(endpoint, data = {}) {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * DELETE request via Swagger
   */
  async delete(endpoint) {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const swaggerApiService = new SwaggerApiService();
