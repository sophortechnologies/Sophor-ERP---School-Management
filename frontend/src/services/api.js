//src/services/api.js
const getBackendUrl = () => {
  return (
    localStorage.getItem("customBackendUrl") || "http://192.168.137.146:5000"
  );
};

class ApiService {
  constructor() {
    this.baseURL = getBackendUrl();
  }

  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${this.baseURL}${endpoint}`;

      console.log(" API Request:", {
        method: options.method || "GET",
        url,
        endpoint,
      });

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const config = {
        ...options,
        headers,
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      console.log("📨 API Response:", {
        status: response.status,
        url: response.url,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(" API Error:", error.message);

      if (error.name === "AbortError") {
        throw new Error("Request timeout - backend not responding");
      }

      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get("/api/health");
      return {
        success: true,
        message: "Backend is connected",
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: `Backend connection failed: ${error.message}`,
        url: this.baseURL,
      };
    }
  }

  // Test multiple backend URLs
  async testBackendUrls() {
    const testUrls = [
      "http://10.13.188.49:5000",
      "http://localhost:5000",
      "http://192.168.137.146:5000",
    ];

    console.log(" Testing backend URLs...");

    const results = [];

    for (const url of testUrls) {
      const originalURL = this.baseURL;
      this.baseURL = url;

      try {
        console.log(`Testing: ${url}`);
        const startTime = Date.now();

        // Test with a simple fetch first
        const response = await fetch(`${url}/api/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          results.push({
            url,
            success: true,
            status: response.status,
            responseTime: `${responseTime}ms`,
            data,
          });
          console.log(` ${url} - OK (${responseTime}ms)`);
        } else {
          results.push({
            url,
            success: false,
            status: response.status,
            responseTime: `${responseTime}ms`,
            error: `HTTP ${response.status}`,
          });
          console.log(` ${url} - HTTP ${response.status}`);
        }
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error.message,
          responseTime: "N/A",
        });
        console.log(` ${url} - ${error.message}`);
      }

      this.baseURL = originalURL;
    }

    // Log summary
    const workingUrls = results.filter((r) => r.success);
    console.log(" Backend Test Summary:", {
      totalTested: testUrls.length,
      working: workingUrls.length,
      failing: testUrls.length - workingUrls.length,
      results,
    });

    return results;
  }

  // Test backend connectivity
  async testConnectivity() {
    const tests = [
      { name: "Network Reachability", test: () => this.pingTest() },
      { name: "Backend Health Endpoint", test: () => this.healthCheck() },
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({ name: test.name, success: true, result });
      } catch (error) {
        results.push({ name: test.name, success: false, error: error.message });
      }
    }

    return results;
  }

  async pingTest() {
    const startTime = Date.now();
    try {
      // Simple HEAD request to check if server is reachable
      await fetch(this.baseURL, {
        method: "HEAD",
        mode: "no-cors",
      });
      return { responseTime: Date.now() - startTime };
    } catch (error) {
      throw new Error(`Cannot reach server at ${this.baseURL}`);
    }
  }
}

// Create and export the instance
export const apiService = new ApiService();

// Also export the class for testing
export default ApiService;
