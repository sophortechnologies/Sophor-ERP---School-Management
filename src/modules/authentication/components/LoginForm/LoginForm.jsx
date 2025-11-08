import React from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../../../shared/components/UI/Input/Input";
import Button from "../../../../shared/components/UI/Button/Button";
import Alert from "../../../../shared/components/UI/Alert/Alert";
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
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form-header">
        <h2 className="login-form-title">Welcome Back</h2>
        <p className="login-form-subtitle">Sign in to access your dashboard</p>
      </div>

      {authError && <Alert type="error" message={authError} />}

      <Input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Enter your username"
        label="Username"
        error={errors.username}
        disabled={isLoading}
        required
        autoComplete="username"
      />

      <Input
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        label="Password"
        error={errors.password}
        disabled={isLoading}
        required
        autoComplete="current-password"
        icon={showPassword ? EyeOff : Eye}
        onIconClick={togglePasswordVisibility}
      />

      <div className="login-form-options">
        <label className="remember-me">
          <input type="checkbox" name="rememberMe" disabled={isLoading} />
          <span>Remember me</span>
        </label>
        <a
          href="/forgot-password"
          className="forgot-password-link"
          tabIndex={isLoading ? -1 : 0}
        >
          Forgot Password?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>

      <div className="login-form-footer">
        <p className="login-help-text">
          Having trouble logging in? Contact your administrator.
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
