import React from "react";
import "./Alert.css";

const Alert = ({ type = "info", message, onClose }) => {
  return (
    <div className={`shared-ui-alert-alert-alert alert-${type}`}>
      <div className="shared-ui-alert-alert-alert-content">
        <span className="shared-ui-alert-alert-alert-message">{message}</span>
      </div>
      {onClose && (
        <button className="shared-ui-alert-alert-alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
