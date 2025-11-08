/**
 * Validate username
 * @param {string} username
 * @returns {Object} { isValid, error }
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === "") {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }

  if (username.length > 50) {
    return { isValid: false, error: "Username must not exceed 50 characters" };
  }

  // Allow alphanumeric, underscore, and dot
  const usernameRegex = /^[a-zA-Z0-9_.]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, underscore, and dot",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password
 * @param {string} password
 * @returns {Object} { isValid, error }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }

  if (password.length > 100) {
    return { isValid: false, error: "Password must not exceed 100 characters" };
  }

  return { isValid: true, error: null };
};

/**
 * Validate login form
 * @param {Object} formData - { username, password }
 * @returns {Object} { isValid, errors }
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Validate username
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
