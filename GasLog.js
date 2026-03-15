const mongoose = require('mongoose');

const gasLogSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: true,
      uppercase: true,
    },
    gasLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 1023,
    },
    status: {
      type: String,
      enum: ['safe', 'warning', 'danger'],
      required: true,
    },
    location: {
      type: String,
      default: 'Unknown',
    },
    temperature: {
      type: Number,
      default: null,
    },
    humidity: {
      type: Number,
      default: null,
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    autoShutoffTriggered: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for faster queries
gasLogSchema.index({ createdAt: -1 });
gasLogSchema.index({ sensorId: 1, createdAt: -1 });
gasLogSchema.index({ status: 1 });

module.exports = mongoose.model('GasLog', gasLogSchema);
