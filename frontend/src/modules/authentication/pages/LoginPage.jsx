// src/modules/authentication/pages/LoginPage.jsx
import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <div className="authentication-loginpage-login-page">
      <div className="authentication-loginpage-login-container">
        <div className="authentication-loginpage-login-branding">
          <div className="authentication-loginpage-login-branding-content">
            <div className="authentication-loginpage-login-school-logo">
              <div className="authentication-loginpage-logo-icon">
                <span className="authentication-loginpage-logo-placeholder">🏫</span>
              </div>
              <span className="authentication-loginpage-logo-text">SophorERP</span>
            </div>
            <h1 className="authentication-loginpage-branding-title">Sophor Academy</h1>
            <h2 className="authentication-loginpage-branding-subtitle">School Management System</h2>
            <p className="authentication-loginpage-branding-description">
              Streamline your educational institution's operations with our
              comprehensive ERP solution. Manage students, staff, academics, and
              finances all in one place.
            </p>
            <div className="authentication-loginpage-branding-features">
              <div className="authentication-loginpage-feature-item">
                <span className="authentication-loginpage-feature-icon">📚</span>
                <span className="authentication-loginpage-feature-text">Academic Management</span>
              </div>
              <div className="authentication-loginpage-feature-item">
                <span className="authentication-loginpage-feature-icon">👥</span>
                <span className="authentication-loginpage-feature-text">Student & Staff Portal</span>
              </div>
            </div>
          </div>
        </div>
        <div className="authentication-loginpage-login-form-section">
          <div className="authentication-loginpage-login-form-wrapper">
            <LoginForm />
          </div>
          <div className="authentication-loginpage-login-footer">
            <p className="authentication-loginpage-copyright">
              © 2025{" "}
              <a
                href="https://sophortechnologies.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="company-link"
              >
                Sophor Technologies
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


