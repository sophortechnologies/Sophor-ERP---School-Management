// src/App.jsx
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { store } from "./store";
import AppRoutes from "./AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthProvider from "./core/auth/AuthProvider";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
