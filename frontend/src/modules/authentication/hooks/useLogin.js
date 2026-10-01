// src/modules/authentication/hooks/useLogin.js
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../../store/slices/authSlice";
import { validateLoginForm } from "../utils/authValidators";

export const useLogin = () => {
  const dispatch = useDispatch();
  const { isLoading, error: authError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null); // Rename for clarity

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear errors when user starts typing
    if (loginError || authError) {
      setLoginError(null);
      dispatch(clearError());
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("🔍 Login form submitted", formData);

  // Clear ALL errors before starting
  setErrors({});
  setLoginError(null);
  dispatch(clearError());

  // Set local loading state IMMEDIATELY
  setIsSubmitting(true);

  // Validate form
  const validation = validateLoginForm(formData);
  if (!validation.isValid) {
    console.log("❌ Form validation failed", validation.errors);
    setErrors(validation.errors);
    setIsSubmitting(false);
    return;
  }

  console.log("✅ Form validation passed");

  // ========== CHANGE THIS LINE ==========
  // Increase from 1000ms to 2000ms (2 seconds)
  const minimumLoadTime = 2000; // ⬅️ CHANGE THIS NUMBER
  // ======================================
  
  const startTime = Date.now();

  try {
    console.log("🔄 Dispatching loginUser action...");

    // Dispatch login action
    const loginPromise = dispatch(loginUser(formData)).unwrap();

    // Wait for login OR minimum time - whichever is longer
    const [result] = await Promise.all([
      loginPromise,
      new Promise(resolve => setTimeout(resolve, minimumLoadTime))
    ]);

    console.log("🎉 Login successful!", result);
    
  } catch (error) {
    console.error("💥 LOGIN FAILED:", error);
    
    // Ensure minimum time has passed even for errors
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    // Set error message after minimum time
    const errorMessage = authError || error.message || "Login failed. Please check your credentials.";
    setLoginError(errorMessage);
    
  } finally {
    // Always reset loading state
    setIsSubmitting(false);
  }
};
  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
    });
    setErrors({});
    setShowPassword(false);
    setLoginError(null);
    dispatch(clearError());
  };

  return {
    formData,
    errors,
    showPassword,
    isLoading: isLoading || isSubmitting,
    authError: loginError, // Use the local loginError state
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
    resetForm,
  };
};