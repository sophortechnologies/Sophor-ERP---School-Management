// src/core/auth/AuthProvider.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser, setUser } from "../../store/slices/authSlice";
import { setInitializing } from "../../lib/api";
import Loader from "../../shared/components/UI/Loader/Loader";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      console.log("🔄 AuthProvider: Initializing", { 
        hasToken: !!token, 
        hasStoredUser: !!storedUser 
      });

      if (!token) {
        console.log("✅ No token found, initialization complete");
        setIsInitialized(true);
        return;
      }

      // Tell the API interceptor we're initializing
      // This prevents auto-logout on 401 errors during initialization
      setInitializing(true);

      try {
        console.log("🔄 Fetching current user from API...");
        const result = await dispatch(getCurrentUser()).unwrap();
        console.log("✅ Got user from API:", result);
      } catch (err) {
        console.error("❌ Failed to get current user:", err);

        // If we have a stored user, use it as fallback
        if (storedUser) {
          console.log("📦 Using stored user as fallback");
          try {
            const parsedUser = JSON.parse(storedUser);
            dispatch(setUser(parsedUser));
            console.log("✅ Restored user from localStorage:", parsedUser);
          } catch (parseError) {
            console.error("Failed to parse stored user:", parseError);
            // Clear corrupted data
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
          }
        } else {
          // No stored user and API failed, clear everything
          console.log("🧹 No stored user, clearing tokens");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        // We're done initializing - re-enable auto-logout on 401
        setInitializing(false);
        setIsInitialized(true);
        console.log("✅ AuthProvider: Initialization complete");
      }
    };

    initialize();
  }, [dispatch]);

  if (!isInitialized) {
    return <Loader fullScreen text="Initializing application..." />;
  }

  return children;
};

export default AuthProvider;