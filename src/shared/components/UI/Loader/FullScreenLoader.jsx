// src/shared/components/UI/Loader/FullScreenLoader.jsx
import React from "react";
import { Loader2 } from "lucide-react";
import "./FullScreenLoader.css";

const FullScreenLoader = ({ 
  text = "Loading...", 
  subText = "Please wait while we process your request",
  showLogo = false 
}) => {
  return (
    <div className="shared-ui-loader-fullscreenloader-full-screen-loader">
      <div className="shared-ui-loader-fullscreenloader-loader-container">
        {showLogo && (
          <div className="shared-ui-loader-fullscreenloader-loader-logo">
            <div className="shared-ui-loader-fullscreenloader-logo-icon-large">🏫</div>
            <span className="shared-ui-loader-fullscreenloader-logo-text-large">SophorERP</span>
          </div>
        )}
        
        <div className="shared-ui-loader-fullscreenloader-loader-spinner-container">
          <div className="shared-ui-loader-fullscreenloader-spinner-ring">
            <Loader2 size={60} className="shared-ui-loader-fullscreenloader-spinner-icon" />
          </div>
          <div className="shared-ui-loader-fullscreenloader-loader-text-content">
            <h3 className="shared-ui-loader-fullscreenloader-loader-main-text">{text}</h3>
            {subText && (
              <p className="shared-ui-loader-fullscreenloader-loader-sub-text">{subText}</p>
            )}
          </div>
        </div>

        <div className="shared-ui-loader-fullscreenloader-loader-progress">
          <div className="shared-ui-loader-fullscreenloader-progress-bar">
            <div className="shared-ui-loader-fullscreenloader-progress-fill"></div>
          </div>
          <span className="shared-ui-loader-fullscreenloader-progress-text">Initializing system...</span>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;