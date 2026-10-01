import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // Add this import
import { loginUser } from "../store/slices/authSlice";

const DebugLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add this hook

  const handleQuickLogin = (role) => {
    const users = {
      admin: {
        id: 1,
        username: "admin",
        role: "admin",
        name: "System Administrator",
      },
      teacher: {
        id: 2,
        username: "teacher",
        role: "teacher",
        name: "Tesfaye Alemu",
      },
      student: {
        id: 3,
        username: "student",
        role: "student",
        name: "Abrha Hailu",
      },
      parent: {
        id: 4,
        username: "parent",
        role: "parent",
        name: "Hailu Abate",
      },
    };

    const user = users[role];

    // Store tokens
    localStorage.setItem("accessToken", `debug-token-${role}`);
    localStorage.setItem("refreshToken", `debug-refresh-${role}`);

    // Dispatch login success
    dispatch(
      loginUser.fulfilled({
        user,
        accessToken: `debug-token-${role}`,
        refreshToken: `debug-refresh-${role}`,
      })
    );

    // FIX: Use React Router navigation instead of window.location.href
    navigate(`/${role}/dashboard`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#1f2937",
          }}
        >
          Debug Mode
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          The app is stuck in loading. Use this to bypass authentication.
        </p>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <button
            onClick={() => handleQuickLogin("admin")}
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Login as Admin
          </button>
          <button
            onClick={() => handleQuickLogin("teacher")}
            style={{
              background: "#10b981",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Login as Teacher
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              console.log("Storage cleared");
              window.location.reload();
            }}
            style={{
              background: "#6b7280",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Clear Storage & Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugLogin;
