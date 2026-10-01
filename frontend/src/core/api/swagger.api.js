import { apiClient } from "../../lib/swagger-client";

class ApiService {
  async get(endpoint, params = {}) {
    try {
      return await apiClient.get(endpoint, params);
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      return await apiClient.post(endpoint, data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      return await apiClient.put(endpoint, data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      return await apiClient.delete(endpoint);
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const swaggerApiService = new ApiService();
