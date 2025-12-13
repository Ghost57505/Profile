const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action, details = {}, req = {}, status = 'success', capturedData = {}) => {
  try {
    const user = await require('../models/User').findById(userId);
    
    const logEntry = {
      userId,
      userEmail: user?.email || 'unknown',
      action,
      details,
      status,
      ...capturedData
    };

    const log = await AuditLog.create(logEntry);
    console.log(`[${new Date().toISOString()}] [AUDIT] Action: ${action} | User: ${user?.email || userId} | Status: ${status}`);
    return log;
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

module.exports = logAction;
