const mongoose = require('mongoose');

const ScanLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Success', 'Failed'], required: true },
  productsScanned: { type: Number, default: 0 },
  emailsSent: { type: Number, default: 0 },
  durationMs: Number,
  triggerSource: String, // e.g., "GitHub Action", "Manual"
  error: String
});

module.exports = mongoose.model('ScanLog', ScanLogSchema);