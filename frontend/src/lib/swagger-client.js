//src/lib/swagger-client.js
import { SWAGGER_CONFIG } from "../config/swagger.config";

class ApiClient {
  constructor() {
    this.baseURL = SWAGGER_CONFIG.BASE_URL;
    this.timeout = SWAGGER_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${this.baseURL}${endpoint}`;

      const defaultHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      };

      console.log("API Request:", {
        method: config.method || "GET",
        url,
        baseURL: this.baseURL,
        headers: config.headers,
      });

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      console.log("API Response:", {
        status: response.status,
        url: response.url,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleHttpError(response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Client Error:", error);

      // Handle network-specific errors
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      } else if (error.message?.includes("Failed to fetch")) {
        throw new Error(
          `Network error: Cannot connect to ${this.baseURL}. Please check your connection.`
        );
      }

      throw error;
    }
  }

  handleHttpError(status, errorData) {
    const message = errorData.message || `HTTP Error ${status}`;

    switch (status) {
      case 401:
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
        return new Error("Session expired. Please login again.");
      case 403:
        return new Error("You don't have permission to perform this action.");
      case 404:
        return new Error("Resource not found.");
      case 500:
        return new Error("Server error. Please try again later.");
      case 502:
      case 503:
      case 504:
        return new Error(
          "Service temporarily unavailable. Please try again later."
        );
      default:
        return new Error(message);
    }
  }

  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length
      ? `?${new URLSearchParams(params)}`
      : "";

    return this.request(`${endpoint}${queryString}`, {
      method: "GET",
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  // Health check to verify server connection
  async healthCheck() {
    try {
      const response = await this.get("/api/health");
      return { healthy: true, response };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

export const apiClient = new ApiClient();
