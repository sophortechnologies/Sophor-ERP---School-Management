// src/modules/authentication/utils/authValidators.js
export const validateUsername = (username) => {
  if (!username || username.trim() === "") {
    return { isValid: false, error: "Username is required" };
  }
  return { isValid: true, error: null };
};

export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }
  return { isValid: true, error: null };
};

export const validateLoginForm = (formData) => {
  const errors = {};

  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
