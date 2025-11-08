import React from "react";
import "./Loader.css";

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
  const className = fullScreen ? "loader-fullscreen" : "loader-container";

  return (
    <div className={className}>
      <div className="loader-spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
