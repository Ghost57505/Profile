const mongoose = require('mongoose');

const mfaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    code: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  },
  { timestamps: true }
);

// Auto-delete expired MFA codes
mfaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('MFA', mfaSchema);
