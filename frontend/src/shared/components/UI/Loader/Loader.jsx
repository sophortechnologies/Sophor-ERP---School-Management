import React from "react";
import "./Loader.css";

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-spinner"></div>
        <p className="shared-ui-loader-loader-loader-text">{text}</p>
      </div>
    );
  }

  return (
    <div className="shared-ui-loader-loader-loader-inline">
      <div className="loader-spinner-small"></div>
      <span>{text}</span>
    </div>
  );
};

export default Loader;
