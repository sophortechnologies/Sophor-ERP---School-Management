// Mock service for demonstration - replace with actual API calls
class AuthService {
  async login(credentials) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation - replace with actual API call
    if (
      credentials.username === "admin" &&
      credentials.password === "password"
    ) {
      const user = {
        id: 1,
        username: credentials.username,
        role: "admin",
        name: "Administrator",
      };

      localStorage.setItem("accessToken", "mock-jwt-token");
      localStorage.setItem("refreshToken", "mock-refresh-token");

      return {
        user,
        accessToken: "mock-jwt-token",
        refreshToken: "mock-refresh-token",
      };
    } else {
      throw new Error("Invalid username or password");
    }
  }

  async logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return Promise.resolve();
  }

  async getCurrentUser() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No token found");
    }

    // Mock user data - replace with actual API call
    return {
      id: 1,
      username: "admin",
      role: "admin",
      name: "Administrator",
    };
  }

  async refreshToken() {
    // Mock implementation
    const newToken = "new-mock-jwt-token";
    localStorage.setItem("accessToken", newToken);
    return { accessToken: newToken };
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
