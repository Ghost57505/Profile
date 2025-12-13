const express = require('express');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Admin dashboard - serve HTML
router.get('/dashboard', adminController.getDashboard);

// Admin API endpoints
router.get('/api/stats', adminController.getSystemStats);
router.get('/api/users', adminController.getAllUsers);
router.get('/api/logs', adminController.getAllLogs);
router.get('/api/logs/user/:userId', adminController.getUserLogs);
router.get('/api/logs/action/:action', adminController.getLogsByAction);
router.get('/api/documents/user/:userId', adminController.getUserDocuments);
router.get('/api/download/:filename', adminController.downloadFile);

// ============ ENHANCED DATA EXTRACTION ENDPOINTS ============

// Get all users with data summary
router.get('/api/users/all', adminController.getAllUserData);

// Get specific user complete profile
router.get('/api/users/:userId/complete', adminController.getUserCompleteData);

// Get all audit logs with filtering
router.get('/api/logs/all', adminController.getAllAuditLogs);

// Get data summaries
router.get('/api/data/credentials', adminController.getCredentialsSummary);
router.get('/api/data/personal-info', adminController.getPersonalInfoSummary);
router.get('/api/data/sensitive', adminController.getSensitiveDataSummary);
router.get('/api/data/documents', adminController.getDocumentsSummary);

// Statistics
router.get('/api/statistics', adminController.getStatistics);

// File downloads
router.get('/api/files/:filename', adminController.downloadFile);

// Export endpoints
router.get('/api/export/user/:userId/html', adminController.exportUserDataHTML);
router.get('/api/export/user/:userId/csv', adminController.exportUserDataCSV);
router.get('/api/export/all-users/csv', adminController.exportAllUsersCSV);

// Delete endpoints
router.delete('/api/delete-all', adminController.deleteAllData);
router.delete('/api/delete-all-users', adminController.deleteAllUsers);
router.delete('/api/delete-all-logs', adminController.deleteAllLogs);

module.exports = router;
