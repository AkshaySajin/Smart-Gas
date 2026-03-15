const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['gas_leak', 'high_concentration', 'sensor_offline', 'auto_shutoff', 'emergency'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['warning', 'danger', 'critical'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sensorId: {
      type: String,
      required: true,
    },
    gasLevel: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: '',
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    smsRecipient: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

alertSchema.index({ createdAt: -1 });
alertSchema.index({ isResolved: 1 });

module.exports = mongoose.model('Alert', alertSchema);
