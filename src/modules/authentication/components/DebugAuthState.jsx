import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const DebugAuthState = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("👁️ DEBUG - Auth state changed:", {
      isAuthenticated: auth.isAuthenticated,
      user: auth.user?.username,
      role: auth.user?.role,
      isLoading: auth.isLoading,
      error: auth.error,
      timestamp: new Date().toISOString(),
    });
  }, [auth]);

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "white",
        border: "1px solid #ccc",
        padding: "10px",
        zIndex: 1000,
        fontSize: "12px",
      }}
    >
      <h4>Auth State</h4>
      <div>Authenticated: {auth.isAuthenticated ? "✅" : "❌"}</div>
      <div>User: {auth.user?.username || "None"}</div>
      <div>Role: {auth.user?.role || "None"}</div>
      <div>Loading: {auth.isLoading ? "⏳" : "✅"}</div>
      <button
        onClick={() => {
          console.log("LocalStorage:", {
            accessToken: localStorage.getItem("accessToken"),
            user: localStorage.getItem("user"),
            refreshToken: localStorage.getItem("refreshToken"),
          });
        }}
      >
        Check Storage
      </button>
      <button
        onClick={() => {
          localStorage.clear();
          console.log("Storage cleared");
          window.location.reload();
        }}
      >
        Clear & Reload
      </button>
    </div>
  );
};

export default DebugAuthState;
