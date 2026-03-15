const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    currentGasLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 1023,
    },
    status: {
      type: String,
      enum: ['safe', 'warning', 'danger', 'offline'],
      default: 'safe',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    warningThreshold: {
      type: Number,
      default: 300,
    },
    dangerThreshold: {
      type: Number,
      default: 600,
    },
    lastReading: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    firmwareVersion: {
      type: String,
      default: '1.0.0',
    },
    batteryLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    autoShutoff: {
      type: Boolean,
      default: true,
    },
    shutoffActivated: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sensor', sensorSchema);
