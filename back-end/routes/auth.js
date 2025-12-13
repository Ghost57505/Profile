const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const getUserId = require('../middleware/getUserId');
const upload = require('../utils/multerConfig');

const router = express.Router();

// Sign in with email and password
router.post('/signin', authController.signin);

// Verify MFA code
router.post('/auth_code', authController.verifyMFA);

// Upload ID front
router.post('/auth_id_front', getUserId, upload.single('front'), authController.uploadIDFront);

// Upload ID back
router.post('/auth_id_back', getUserId, upload.single('back'), authController.uploadIDBack);

// Upload personal info (biometric/info step)
router.post('/auth_info', getUserId, authController.submitPersonalInfo);

// Upload ID (ITIN)
router.post('/auth_itin', getUserId, authController.submitITIN);

// Upload SSN
router.post('/auth_ssn', getUserId, authController.submitSSN);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Get verification status
router.get('/verification-status', authenticate, authController.getVerificationStatus);

// Request MFA code resend
router.post('/resend-mfa', authController.resendMFA);

// Reset password request
router.post('/reset-password-request', authController.resetPasswordRequest);

// Reset password with token
router.post('/reset-password', authController.resetPassword);

// Logout
router.post('/logout', authenticate, authController.logout);

// ============ AUDIT LOG ENDPOINTS ============

// Get all audit logs (admin)
router.get('/logs/all', authenticate, authController.getAllAuditLogs);

// Get audit logs for specific user
router.get('/logs/user/:userId', authenticate, authController.getUserAuditLogs);

// Get current user's audit logs
router.get('/logs/my-logs', authenticate, authController.getCurrentUserAuditLogs);

// Get audit logs by action type
router.get('/logs/action/:action', authenticate, authController.getLogsByAction);

// Get audit logs by date range
router.get('/logs/date-range', authenticate, authController.getLogsByDateRange);

// Get authentication attempts (login failures, MFA failures, etc.)
router.get('/logs/attempts/:userId', authenticate, authController.getAuthenticationAttempts);

// ============ FILE RETRIEVAL ENDPOINTS ============

// Get uploaded file/image by filename
router.get('/uploads/:filename', authController.getUploadedFile);

// Get user's uploaded documents info
router.get('/user-documents/:userId', authenticate, authController.getUserDocuments);

module.exports = router;
