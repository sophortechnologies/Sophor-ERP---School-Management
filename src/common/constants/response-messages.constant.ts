/** 
* Standard Response Messages 
* Consistent messaging across the application 
*/ 
export const RESPONSE_MESSAGES = { 
// Success 
SUCCESS: 'Operation successful', 
CREATED: 'Resource created successfully', 
UPDATED: 'Resource updated successfully', 
DELETED: 'Resource deleted successfully', 
// Auth 
LOGIN_SUCCESS: 'Login successful', 
LOGOUT_SUCCESS: 'Logout successful', 
REGISTER_SUCCESS: 'Registration successful', 
INVALID_CREDENTIALS: 'Invalid email or password', 
UNAUTHORIZED: 'Unauthorized access', 
TOKEN_EXPIRED: 'Token has expired', 
// Validation 
VALIDATION_ERROR: 'Validation failed', 
NOT_FOUND: 'Resource not found', 
ALREADY_EXISTS: 'Resource already exists', 
INVALID_INPUT: 'Invalid input data', 
// Server 
SERVER_ERROR: 'Internal server error', 
SERVICE_UNAVAILABLE: 'Service temporarily unavailable', 
} as const;