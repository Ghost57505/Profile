/**
 * Standardized Response Utility
 * Provides consistent formatting for API responses across the backend
 */

// Response status codes and messages
const RESPONSE_TYPES = {
  // Success responses
  SUCCESS: {
    code: 200,
    type: 'success',
    icon: '✓'
  },
  CREATED: {
    code: 201,
    type: 'success',
    icon: '✓'
  },
  ACCEPTED: {
    code: 202,
    type: 'success',
    icon: '✓'
  },

  // Client error responses
  BAD_REQUEST: {
    code: 400,
    type: 'error',
    icon: '✗'
  },
  UNAUTHORIZED: {
    code: 401,
    type: 'error',
    icon: '🔒'
  },
  FORBIDDEN: {
    code: 403,
    type: 'error',
    icon: '⛔'
  },
  NOT_FOUND: {
    code: 404,
    type: 'error',
    icon: '❌'
  },
  CONFLICT: {
    code: 409,
    type: 'error',
    icon: '⚠️'
  },
  VALIDATION_ERROR: {
    code: 422,
    type: 'error',
    icon: '⚠️'
  },
  LOCKED: {
    code: 423,
    type: 'error',
    icon: '🔐'
  },

  // Server error responses
  INTERNAL_ERROR: {
    code: 500,
    type: 'error',
    icon: '💥'
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    type: 'error',
    icon: '⚙️'
  }
};

// Predefined error messages for common scenarios
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked due to multiple failed login attempts. Please try again in 30 minutes.',
  INVALID_MFA_CODE: 'Invalid or expired verification code. Please request a new one.',
  MFA_CODE_EXPIRED: 'Verification code has expired. A new code has been sent to your email.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED_ACCESS: 'You do not have permission to access this resource.',

  // Validation
  MISSING_FIELDS: 'Missing required fields',
  INVALID_EMAIL: 'Invalid email address format',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters',
  EMAIL_EXISTS: 'An account with this email already exists',

  // File uploads
  NO_FILE_UPLOADED: 'No file was uploaded',
  INVALID_FILE_TYPE: 'Invalid file type. Accepted formats: JPG, PNG, PDF',
  FILE_TOO_LARGE: 'File size exceeds maximum limit of 5MB',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',

  // User/Account
  USER_NOT_FOUND: 'User account not found',
  ACCOUNT_NOT_VERIFIED: 'Account has not completed verification',
  DUPLICATE_SUBMISSION: 'This document has already been submitted',

  // Server
  DATABASE_ERROR: 'Database operation failed. Please try again later.',
  EMAIL_SERVICE_ERROR: 'Failed to send email. Please try again later.',
  SERVER_ERROR: 'Internal server error. Please try again later.',

  // Generic
  OPERATION_FAILED: 'Operation failed. Please try again.',
  INVALID_REQUEST: 'Invalid request'
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Additional data to include
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    type: 'success',
    message: message,
    timestamp: new Date().toISOString(),
    data: data
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Array} errors - Detailed errors array (optional)
 */
const sendError = (res, message, statusCode = 400, errors = []) => {
  return res.status(statusCode).json({
    status: 'error',
    type: 'error',
    message: message,
    timestamp: new Date().toISOString(),
    ...(errors.length > 0 && { errors: errors })
  });
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} validationErrors - Array of validation error objects
 */
const sendValidationError = (res, validationErrors = []) => {
  const errors = validationErrors.map(err => ({
    field: err.field || err.path,
    message: err.message
  }));

  return res.status(422).json({
    status: 'error',
    type: 'validation_error',
    message: 'Validation failed',
    timestamp: new Date().toISOString(),
    errors: errors
  });
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendUnauthorized = (res, message = ERROR_MESSAGES.UNAUTHORIZED_ACCESS) => {
  return sendError(res, message, 401);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendNotFound = (res, message = ERROR_MESSAGES.USER_NOT_FOUND) => {
  return sendError(res, message, 404);
};

/**
 * Send server error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Error} error - Original error object (for logging)
 */
const sendServerError = (res, message = ERROR_MESSAGES.SERVER_ERROR, error = null) => {
  if (error) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  return sendError(res, message, 500);
};

/**
 * Send locked response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendLocked = (res, message = ERROR_MESSAGES.ACCOUNT_LOCKED) => {
  return sendError(res, message, 423);
};

module.exports = {
  RESPONSE_TYPES,
  ERROR_MESSAGES,
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendNotFound,
  sendServerError,
  sendLocked
};
