import SwaggerClient from "swagger-client";
import { SWAGGER_CONFIG } from "../config/swagger.config";

/**
 * Swagger Client Wrapper
 * Provides a configured Swagger client instance
 */
class SwaggerClientWrapper {
  constructor() {
    this.client = null;
    this.baseURL = SWAGGER_CONFIG.BASE_URL;
  }

  /**
   * Initialize Swagger client
   */
  async initialize() {
    try {
      if (!this.client) {
        this.client = await SwaggerClient({
          url: SWAGGER_CONFIG.SPEC_URL,
          requestInterceptor: (req) => {
            // Add authorization token
            const token = localStorage.getItem("accessToken");
            if (token) {
              req.headers.Authorization = `Bearer ${token}`;
            }
            return req;
          },
          responseInterceptor: (res) => {
            // Handle response
            return res;
          },
        });
      }
      return this.client;
    } catch (error) {
      console.error("Failed to initialize Swagger client:", error);
      throw error;
    }
  }

  /**
   * Get Swagger client instance
   */
  async getClient() {
    if (!this.client) {
      await this.initialize();
    }
    return this.client;
  }

  /**
   * Execute API operation
   * @param {string} operationId - Swagger operation ID
   * @param {object} parameters - Request parameters
   */
  async execute(operationId, parameters = {}) {
    try {
      const client = await this.getClient();
      const response = await client.execute({
        operationId,
        parameters,
      });
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      const message = error.response.body?.message || "An error occurred";
      throw new Error(message);
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
}

export const swaggerClient = new SwaggerClientWrapper();
