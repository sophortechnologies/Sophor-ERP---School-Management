// src/modules/authentication/components/LoginForm/LoginForm.jsx
import React from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useLogin } from "../../hooks/useLogin";
import "./LoginForm.css";

const LoginForm = () => {
  const {
    formData,
    errors,
    showPassword,
    isLoading,
    authError,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
  } = useLogin();

  return (
    <div className="authentication-loginform-loginform-form-container">
      <div className="authentication-loginform-loginform-form-header">
        <h2 className="authentication-loginform-loginform-form-title">
          Welcome Back
        </h2>
        <p className="authentication-loginform-loginform-form-subtitle">
          Sign in to your ERP dashboard
        </p>
      </div>

      {authError && (
        <div className="authentication-loginform-loginform-error-message">
          <div className="error-icon"></div>
          {authError}
        </div>
      )}

      <form
        className="authentication-loginform-loginform-login-form"
        onSubmit={handleSubmit}
      >
        <div className="authentication-loginform-loginform-input-group">
          <label className="authentication-loginform-loginform-input-label">
            <User size={16} />
            Username or Email
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username or email"
            className={`authentication-loginform-loginform-input-field ${errors.username ? "error" : ""}`}
            disabled={isLoading}
            autoComplete="username"
          />
          {errors.username && (
            <span className="authentication-loginform-loginform-error-text">
              {errors.username}
            </span>
          )}
        </div>

        <div className="authentication-loginform-loginform-input-group">
          <label className="authentication-loginform-loginform-input-label">
            <Lock size={16} />
            Password
          </label>
          <div className="authentication-loginform-loginform-password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`authentication-loginform-loginform-input-field ${errors.password ? "error" : ""}`}
              disabled={isLoading}
              autoComplete="off"
            />

            <button
              type="button"
              className="authentication-loginform-loginform-password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <span className="authentication-loginform-loginform-error-text">
              {errors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`login-button ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="authentication-loginform-loginform-wave-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
