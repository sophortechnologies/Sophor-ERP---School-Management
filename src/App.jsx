import React, { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login
    setTimeout(() => {
      setLoading(false);
      if (username && password) {
        alert(`Welcome ${username}!`);
      } else {
        alert("Please enter both username and password");
      }
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="school-logo">
              <div className="logo-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect width="64" height="64" rx="12" fill="#ffffff" />
                  <path
                    d="M32 16L16 26V36C16 44 24 50 32 50C40 50 48 44 48 36V26L32 16Z"
                    fill="#3B82F6"
                  />
                  <path
                    d="M32 22L22 28V36C22 40 26 44 32 44C38 44 42 40 42 36V28L32 22Z"
                    fill="#ffffff"
                  />
                </svg>
              </div>
            </div>
            <h1 className="branding-title">Sophor Technologies</h1>
            <h2 className="branding-subtitle">School Management System</h2>
            <p className="branding-description">
              Streamline your educational institution's operations with our
              comprehensive ERP solution.
            </p>
          </div>
        </div>

        <div className="login-form-section">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-header">
              <h2 className="login-form-title">Welcome Back</h2>
              <p className="login-form-subtitle">
                Sign in to access your dashboard
              </p>
            </div>

            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="login-form-footer">
              <p className="login-help-text">
                Having trouble? Contact your administrator.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
