// src/modules/authentication/hooks/useLogin.js
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 🔑 1. Import useNavigate
import { loginUser, clearError } from "../../../store/slices/authSlice";
import { validateLoginForm } from "../utils/authValidators";
import { DASHBOARD_ROUTES } from "../../../constants/roles"; // 🔑 2. Import dashboard routes

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 🔑 3. Initialize navigate
  const { isLoading, error: authError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);

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

    setErrors({});
    setLoginError(null);
    dispatch(clearError());
    setIsSubmitting(true);

    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    const minimumLoadTime = 1000;
    const startTime = Date.now();

    try {
      // Dispatch login action and unwrap response
      const result = await dispatch(loginUser(formData)).unwrap();

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      // 🔑 4. Extract user role and navigate to their specific dashboard
      const userRole = result?.user?.role?.toLowerCase();
      const targetRoute = DASHBOARD_ROUTES[userRole] || "/admin/dashboard";

      console.log(`🚀 Redirecting user role '${userRole}' to: ${targetRoute}`);
      navigate(targetRoute, { replace: true });
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      const errorMessage =
        authError || error || "Login failed. Please check your credentials.";
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    showPassword,
    isLoading: isLoading || isSubmitting,
    authError: loginError,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
  };
};
