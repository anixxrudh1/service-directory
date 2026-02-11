const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['customer', 'business', 'admin'],
      required: true
    },
    loginTime: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success'
    },
    reason: {
      type: String,
      default: null // Reason for failure if status is 'failed'
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    deviceInfo: {
      browser: String,
      os: String,
      device: String
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create index for faster queries
loginHistorySchema.index({ userId: 1, loginTime: -1 });
loginHistorySchema.index({ email: 1, loginTime: -1 });
loginHistorySchema.index({ role: 1, loginTime: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
