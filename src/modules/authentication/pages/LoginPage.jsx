import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="school-logo">
              <div className="logo-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
              comprehensive ERP solution. Manage students, staff, academics, and
              finances all in one place.
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span className="feature-text">Academic Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span className="feature-text">Student & Staff Portal</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <span className="feature-text">Financial Operations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Reports & Analytics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-form-wrapper">
            <LoginForm />
          </div>
          <div className="login-footer">
            <p className="copyright">
              © 2025 Sophor Technologies. All rights reserved.
            </p>
            <div className="login-links">
              <a href="/privacy">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
