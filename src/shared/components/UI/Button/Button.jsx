import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const className = `btn btn-${variant} btn-${size} ${
    fullWidth ? "btn-full-width" : ""
  } ${loading ? "btn-loading" : ""}`;

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="btn-spinner" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
