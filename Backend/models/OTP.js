const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  otpHash: { type: String, required: true, select: false },
  purpose: { type: String, enum: ['registration', 'password-reset'], required: true },
  attemptCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});
otpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

module.exports = mongoose.model('OTP', otpSchema);
