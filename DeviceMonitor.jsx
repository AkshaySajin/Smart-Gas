import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useSensor } from '../context/SensorContext';
import { Cpu, MapPin, Activity, Clock, Power, RefreshCw, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function StatusDot({ status }) {
  const cfg = {
    safe: 'bg-green-400',
    warning: 'bg-orange-400 animate-pulse',
    danger: 'bg-red-500 animate-ping',
    offline: 'bg-gray-500',
  };
  return (
    <span className="relative flex h-3 w-3">
      <span className={`absolute inline-flex h-full w-full rounded-full ${cfg[status] || 'bg-gray-500'} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg[status]?.replace('animate-pulse', '').replace('animate-ping', '') || 'bg-gray-500'}`} />
    </span>
  );
}

export default function DeviceMonitor() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sensorData } = useSensor();

  const fetchSensors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sensors');
      setSensors(data.sensors);
    } catch {
      // If no sensors in DB, create demo data from socket
      setSensors([{
        sensorId: 'SENSOR-001',
        name: 'Kitchen Sensor',
        location: 'Kitchen',
        currentGasLevel: sensorData.gasLevel,
        status: sensorData.status,
        isActive: true,
        warningThreshold: 300,
        dangerThreshold: 600,
        batteryLevel: 87,
        firmwareVersion: '2.1.4',
        ipAddress: '192.168.1.105',
        autoShutoff: true,
        shutoffActivated: false,
        lastReading: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  // Update live sensor reading
  useEffect(() => {
    setSensors(prev => prev.map(s =>
      s.sensorId === 'SENSOR-001'
        ? { ...s, currentGasLevel: sensorData.gasLevel, status: sensorData.status, lastReading: sensorData.timestamp }
        : s
    ));
  }, [sensorData]);

  const handleShutoff = async (sensorId) => {
    try {
      await api.post(`/sensors/${sensorId}/shutoff`);
      toast.success('✅ LPG Shutoff activated!');
      setSensors(prev => prev.map(s => s.sensorId === sensorId ? { ...s, shutoffActivated: true } : s));
    } catch {
      toast.error('Failed to activate shutoff');
    }
  };

  const statusConfig = {
    safe: { label: 'Safe', textColor: 'text-green-400', bg: 'bg-green-400/10' },
    warning: { label: 'Warning', textColor: 'text-orange-400', bg: 'bg-orange-400/10' },
    danger: { label: 'Danger', textColor: 'text-red-400', bg: 'bg-red-400/10' },
    offline: { label: 'Offline', textColor: 'text-gray-400', bg: 'bg-gray-400/10' },
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Device Monitor</h1>
          <p className="text-gray-400 text-sm mt-1">{sensors.length} sensor(s) connected</p>
        </div>
        <button onClick={fetchSensors} className="btn-ghost flex items-center gap-2 py-2 text-sm">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sensors.map((sensor) => {
            const cfg = statusConfig[sensor.status] || statusConfig.offline;
            const pct = Math.min((sensor.currentGasLevel / 1000) * 100, 100);
            return (
              <div key={sensor.sensorId} className={`glass-card p-6 border transition-all duration-300 hover:scale-[1.01]
                ${sensor.status === 'danger' ? 'border-red-500/40' : sensor.status === 'warning' ? 'border-orange-500/30' : 'border-white/5'}`}>

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                      <Cpu className={`w-5 h-5 ${cfg.textColor}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{sensor.name}</h3>
                      <p className="text-gray-500 text-xs font-mono">{sensor.sensorId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot status={sensor.status} />
                    <span className={`text-xs font-bold ${cfg.textColor}`}>{cfg.label}</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-white/3 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" /> Location
                    </div>
                    <p className="text-white font-medium text-xs">{sensor.location}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <Activity className="w-3 h-3" /> Gas Level
                    </div>
                    <p className={`font-bold text-sm ${cfg.textColor}`}>{sensor.currentGasLevel} PPM</p>
                  </div>
                  <div className="bg-white/3 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <Clock className="w-3 h-3" /> Last Read
                    </div>
                    <p className="text-white text-xs">
                      {sensor.lastReading ? format(new Date(sensor.lastReading), 'HH:mm:ss') : '—'}
                    </p>
                  </div>
                  <div className="bg-white/3 rounded-lg p-2.5">
                    <div className="text-gray-500 text-xs mb-1">🔋 Battery</div>
                    <p className={`font-bold text-sm ${sensor.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`}>
                      {sensor.batteryLevel}%
                    </p>
                  </div>
                </div>

                {/* Gas bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Gas Concentration</span>
                    <span>{sensor.currentGasLevel} / 1000 PPM</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: sensor.status === 'danger' ? '#ef4444' : sensor.status === 'warning' ? '#f97316' : '#22c55e'
                      }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                  <span>IP: {sensor.ipAddress || 'N/A'}</span>
                  <span>FW: v{sensor.firmwareVersion}</span>
                  <span>Warn: {sensor.warningThreshold} PPM</span>
                  <span>Danger: {sensor.dangerThreshold} PPM</span>
                </div>

                {/* Action */}
                <button
                  onClick={() => handleShutoff(sensor.sensorId)}
                  disabled={sensor.shutoffActivated}
                  id={`shutoff-${sensor.sensorId}`}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${sensor.shutoffActivated
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-not-allowed'
                      : 'border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors'
                    }`}
                >
                  <Power className="w-4 h-4" />
                  {sensor.shutoffActivated ? '✅ Shutoff Activated' : 'Emergency Shutoff'}
                </button>
              </div>
            );
          })}

          {/* Add sensor placeholder */}
          <div className="glass-card p-6 border border-dashed border-white/10 flex flex-col items-center justify-center text-center min-h-[300px] hover:border-orange-500/30 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-gray-400 font-medium mb-1">Add New Sensor</p>
            <p className="text-gray-600 text-xs">Connect your IoT device to expand monitoring</p>
          </div>
        </div>
      )}

      {/* IoT Setup Info */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-orange-400" />
          Arduino / ESP8266 Integration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-900/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">Send readings to API endpoint:</p>
            <code className="text-orange-400 text-xs font-mono break-all">
              POST /api/iot/reading
            </code>
            <p className="text-gray-600 text-xs mt-2">Body: {"{ sensorId, gasLevel, temperature, humidity, location }"}</p>
          </div>
          <div className="bg-dark-900/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">IoT example (Arduino):</p>
            <code className="text-green-400 text-xs font-mono block leading-relaxed">
              http.POST("/api/iot/reading");<br />
              {`{ "sensorId": "SENSOR-001",`}<br />
              {`  "gasLevel": analogRead(A0) }`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
