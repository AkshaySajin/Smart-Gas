# 🔥 Smart LPG Gas Leakage Detection & Alert System

> **IoT-Based Real-Time Gas Safety Monitoring Web Application**

A full-stack web application for detecting LPG gas leaks using IoT sensors (Arduino/ESP8266 + MQ-2), with a real-time dashboard, SMS alerts, and automatic safety shutoff.

---

## 📸 Features

- ✅ **Real-Time Dashboard** — Live gas concentration charts with Chart.js
- 🚨 **Instant Alerts** — SMS via Twilio + browser toast + sound alarm
- 🔒 **Auto-Shutoff Simulation** — One-click LPG regulator shutoff
- 📊 **Gas Logs** — Full history with date/time/status table + CSV export
- 📡 **IoT Integration** — Arduino/ESP8266 sends data via REST API
- 🛡️ **Admin Panel** — Manage users, sensors, and view stats
- 🌐 **WebSocket Live Streaming** — Socket.IO for real-time updates
- 📱 **Mobile Responsive** — Works on all screen sizes

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Vite, Tailwind CSS, Chart.js |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| SMS | Twilio |
| IoT | Arduino / ESP8266, MQ-2 Gas Sensor |
| Deployment | Vercel (Frontend) + Railway/Render (Backend) |

---

## 📁 Project Structure

```
SmartLPG/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Sensor.js
│   │   ├── GasLog.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sensors.js
│   │   ├── logs.js
│   │   ├── alerts.js
│   │   ├── users.js
│   │   └── iot.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SensorContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DeviceMonitor.jsx
│   │   │   ├── GasLogs.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── Emergency.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── arduino/
    └── gas_sensor.ino
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-lpg-detection.git
cd smart-lpg-detection/SmartLPG
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env with your values
notepad .env

# Start backend (development)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies  
npm install

# Start development server
npm run dev
```

### 4. Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health check**: http://localhost:5000/api/health

---

## ⚙️ Environment Variables (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_lpg
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Twilio (for SMS alerts)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Gas Thresholds
GAS_WARNING_THRESHOLD=300
GAS_DANGER_THRESHOLD=600

CLIENT_URL=http://localhost:5173
```

---

## 📡 IoT API Endpoints

### Send Gas Reading from Arduino
```
POST /api/iot/reading
Content-Type: application/json

{
  "sensorId": "SENSOR-001",
  "gasLevel": 450,
  "temperature": 28.5,
  "humidity": 65,
  "location": "Kitchen"
}
```

### Check Sensor Status
```
GET /api/iot/status/SENSOR-001
```

---

## 🔌 Arduino Setup

1. Install Arduino IDE
2. Install libraries: `ESP8266WiFi`, `ESP8266HTTPClient`, `ArduinoJson`
3. Open `arduino/gas_sensor.ino`
4. Edit WiFi credentials and server URL
5. Upload to NodeMCU/ESP8266

**Hardware Connections:**
```
MQ-2 Sensor:
  VCC → 3.3V
  GND → GND
  AO  → A0 (analog reading)
  
Red LED    → D2 (through 220Ω resistor)
Green LED  → D3 (through 220Ω resistor)
Buzzer     → D4
```

---

## 👥 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartlpg.com | Admin@123 |
| User | demo@smartlpg.com | Demo@123 |

> Create users via the `/register` page. First registered admin must be set manually in MongoDB.

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

Create `vercel.json` in frontend:
```json
{
  "builds": [{ "src": "dist/**", "use": "@vercel/static" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.html" }]
}
```

### Backend (Railway / Render)
1. Push to GitHub
2. Connect to Railway/Render
3. Add environment variables
4. Deploy

---

## 📊 Gas Level Guide

| PPM Range | Status | Color | Action |
|-----------|--------|-------|--------|
| 0 - 299 | ✅ Safe | Green | Normal operation |
| 300 - 599 | ⚠️ Warning | Orange | Increase ventilation |
| 600+ | 🚨 Danger | Red | Evacuate immediately |

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

---

## 📄 License

MIT License — Free to use for educational and commercial purposes.

---

**Made with ❤️ for IoT Safety — Smart LPG Gas Detection System**
