import React from "react";
import "./Input.css";

const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  autoComplete,
  maxLength,
  icon: Icon,
  onIconClick,
}) => {
  return (
    <div className="shared-ui-input-input-input-group">
      {label && (
        <label htmlFor={name} className="shared-ui-input-input-input-label">
          {label}
          {required && <span className="shared-ui-input-input-required-asterisk">*</span>}
        </label>
      )}
      <div className="shared-ui-input-input-input-wrapper">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`shared-ui-input-input-input-field ${error ? "error" : ""} ${
            Icon ? "with-icon" : ""
          }`}
        />
        {Icon && (
          <button
            type="button"
            className="shared-ui-input-input-input-icon-button"
            onClick={onIconClick}
            disabled={disabled}
          >
            <Icon size={20} />
          </button>
        )}
      </div>
      {error && <span className="shared-ui-input-input-input-error">{error}</span>}
    </div>
  );
};

export default Input;
