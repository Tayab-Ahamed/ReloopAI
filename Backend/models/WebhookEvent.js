const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true, maxlength: 128 },
  eventType: { type: String, required: true, maxlength: 80 },
  payloadHash: { type: String, required: true, maxlength: 128 },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing', index: true },
  receivedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
  completedAt: { type: Date },
  errorCode: { type: String, maxlength: 80 },
}, { versionKey: false });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
