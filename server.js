const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO for real-time updates
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/iot', require('./routes/iot'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart LPG API Running', timestamp: new Date() });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-dashboard', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined dashboard room`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Simulate real-time gas sensor data (for demo without hardware)
let gasLevel = 150;
let trend = 1;

setInterval(() => {
  // Simulate gas fluctuation
  const change = (Math.random() - 0.45) * 20;
  gasLevel += change * trend;

  // Keep within realistic bounds
  if (gasLevel < 50) { gasLevel = 50; trend = 1; }
  if (gasLevel > 900) { gasLevel = 900; trend = -1; }

  // Occasionally spike (simulate leakage event)
  if (Math.random() < 0.02) {
    gasLevel = 650 + Math.random() * 200;
  }

  const roundedLevel = Math.round(gasLevel);
  let status = 'safe';
  if (roundedLevel >= parseInt(process.env.GAS_DANGER_THRESHOLD) || 600) status = 'danger';
  else if (roundedLevel >= parseInt(process.env.GAS_WARNING_THRESHOLD) || 300) status = 'warning';

  const sensorData = {
    sensorId: 'SENSOR-001',
    gasLevel: roundedLevel,
    status,
    timestamp: new Date().toISOString(),
    location: 'Kitchen',
    temperature: 25 + Math.random() * 5,
    humidity: 40 + Math.random() * 20,
  };

  io.emit('gas-reading', sensorData);

  // Auto-save critical readings to DB
  if (status !== 'safe') {
    const GasLog = require('./models/GasLog');
    GasLog.create({
      sensorId: 'SENSOR-001',
      gasLevel: roundedLevel,
      status,
      location: 'Kitchen',
    }).catch(() => {});
  }
}, 2000);

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_lpg';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

module.exports = { app, io };
