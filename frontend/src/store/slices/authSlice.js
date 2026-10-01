// src/store/slices/authSlice.js - COMPLETE FILE
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../modules/authentication/api/auth.api";
import { DASHBOARD_ROUTES } from "../../constants/roles";

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("🔄 REDUX THUNK: Universal login started", credentials);

      const response = await authApi.login(credentials);
      console.log("✅ REDUX THUNK: Login response", response);

      // Store tokens
      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
      }
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      // Store user object with role
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Log role detection
        console.log(`🎯 User role detected: ${response.user.role}`);
        console.log(`📍 Will redirect to: ${DASHBOARD_ROUTES[response.user.role] || '/dashboard'}`);
      }

      return response;
    } catch (error) {
      console.error("❌ REDUX THUNK: Login failed", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please check your credentials.";

      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 REDUX THUNK: Getting current user");
      const response = await authApi.getCurrentUser();
      console.log("✅ REDUX THUNK: Got current user", response);

      // Update stored user
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error("❌ REDUX THUNK: getCurrentUser failed", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to get user profile";

      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("dashboardRoute");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    userRole: null,
    dashboardRoute: '/dashboard',
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      console.log("📝 REDUX: setUser called", action.payload);
      state.user = action.payload;
      state.isAuthenticated = true;
      state.userRole = action.payload.role;
      state.dashboardRoute = DASHBOARD_ROUTES[action.payload.role] || '/dashboard';
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        console.log("🔄 REDUX: loginUser.pending");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ REDUX: loginUser.fulfilled", action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userRole = action.payload.user?.role;
        state.dashboardRoute = DASHBOARD_ROUTES[action.payload.user?.role] || '/dashboard';
        state.error = null;

        console.log("🎯 REDUX: State updated", {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          role: state.userRole,
          dashboardRoute: state.dashboardRoute,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("❌ REDUX: loginUser.rejected", action.payload);
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.userRole = null;
        state.dashboardRoute = '/dashboard';
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        console.log("🔄 REDUX: getCurrentUser.pending");
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log("✅ REDUX: getCurrentUser.fulfilled", action.payload);
        const user = action.payload.user || action.payload;
        state.user = user;
        state.isAuthenticated = true;
        state.userRole = user.role;
        state.dashboardRoute = DASHBOARD_ROUTES[user.role] || '/dashboard';
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        console.log("❌ REDUX: getCurrentUser.rejected", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("✅ REDUX: logoutUser.fulfilled");
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.userRole = null;
        state.dashboardRoute = '/dashboard';
      });
  },
});

export const { clearError, setUser, updateUserProfile } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.userRole;
export const selectDashboardRoute = (state) => state.auth.dashboardRoute;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;