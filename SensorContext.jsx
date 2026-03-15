import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SensorContext = createContext(null);

export const SensorProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sensorData, setSensorData] = useState({
    sensorId: 'SENSOR-001',
    gasLevel: 0,
    status: 'safe',
    location: 'Kitchen',
    temperature: 25,
    humidity: 50,
    timestamp: new Date().toISOString(),
  });
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [shutoffActivated, setShutoffActivated] = useState(false);
  const socketRef = useRef(null);
  const lastAlertRef = useRef(null);
  const audioContextRef = useRef(null);

  const playAlertSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
                      (window.location.origin.includes('localhost') 
                        ? window.location.origin.replace('5173', '5000') 
                        : window.location.origin);
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (isAuthenticated) socket.emit('join-dashboard', 'default');
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('gas-reading', (data) => {
      setSensorData(data);
      setReadings((prev) => {
        const newReading = { ...data, time: new Date(data.timestamp).toLocaleTimeString() };
        return [...prev.slice(-49), newReading];
      });
    });

    socket.on('gas-alert', (data) => {
      const now = Date.now();
      if (!lastAlertRef.current || now - lastAlertRef.current > 5000) {
        lastAlertRef.current = now;
        const alertMsg = `⚠️ GAS ALERT: ${data.gasLevel} PPM at ${data.location}`;
        if (data.status === 'danger') {
          toast.error(alertMsg, { duration: 8000, id: 'gas-alert' });
          playAlertSound();
        } else {
          toast(alertMsg, { icon: '⚠️', duration: 5000, id: 'gas-warning' });
        }
        setAlerts((prev) => [data, ...prev.slice(0, 19)]);
      }
    });

    socket.on('shutoff-activated', (data) => {
      setShutoffActivated(true);
      toast.success(`🔒 LPG Shutoff activated at ${data.location}`, { duration: 8000 });
    });

    socket.on('alert-resolved', () => {
      setAlerts((prev) => prev.map((a) => ({ ...a, resolved: true })));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, playAlertSound]);

  const clearAlerts = () => setAlerts([]);
  const resetShutoff = () => setShutoffActivated(false);

  return (
    <SensorContext.Provider value={{
      sensorData, readings, alerts, isConnected, shutoffActivated,
      clearAlerts, resetShutoff,
    }}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (!context) throw new Error('useSensor must be used within SensorProvider');
  return context;
};
