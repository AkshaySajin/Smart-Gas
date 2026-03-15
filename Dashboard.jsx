import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSensor } from '../context/SensorContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Activity, Thermometer, Droplets, Clock, AlertTriangle, CheckCircle,
  Wifi, WifiOff, TrendingUp, Power
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function GaugeBar({ value, max = 1000 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 600 ? '#ef4444' : value >= 300 ? '#f97316' : '#22c55e';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span>0 PPM</span>
        <span className="font-mono text-lg font-bold" style={{ color }}>{value}</span>
        <span>1000 PPM</span>
      </div>
      <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22c55e, ${color})` }}
        />
        {/* Threshold markers */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-orange-500/60" style={{ left: '30%' }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/60" style={{ left: '60%' }} />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span className="text-green-500">Safe</span>
        <span className="text-orange-500">Warning ≥300</span>
        <span className="text-red-500">Danger ≥600</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    safe: { label: 'SAFE', cls: 'status-safe', icon: CheckCircle },
    warning: { label: 'WARNING', cls: 'status-warning', icon: AlertTriangle },
    danger: { label: 'DANGER', cls: 'status-danger', icon: AlertTriangle },
  };
  const { label, cls, icon: Icon } = cfg[status] || cfg.safe;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${cls}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}

export default function Dashboard() {
  const { sensorData, readings, isConnected, shutoffActivated } = useSensor();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [lastDanger, setLastDanger] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/logs/stats');
        setStats(data.stats);
        setLastDanger(data.stats.lastDanger);
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleShutoff = async () => {
    try {
      await api.post('/sensors/SENSOR-001/shutoff');
      toast.success('✅ LPG Auto-Shutoff activated!');
    } catch {
      toast.error('Failed to activate shutoff');
    }
  };

  const isDanger = sensorData.status === 'danger';
  const isWarning = sensorData.status === 'warning';

  const chartData = {
    labels: readings.map((r) => r.time || ''),
    datasets: [
      {
        label: 'Gas Level (PPM)',
        data: readings.map((r) => r.gasLevel),
        borderColor: isDanger ? '#ef4444' : isWarning ? '#f97316' : '#22c55e',
        backgroundColor: isDanger
          ? 'rgba(239,68,68,0.08)'
          : isWarning
          ? 'rgba(249,115,22,0.08)'
          : 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Danger Threshold (600)',
        data: readings.map(() => 600),
        borderColor: 'rgba(239,68,68,0.4)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Warning Threshold (300)',
        data: readings.map(() => 300),
        borderColor: 'rgba(249,115,22,0.4)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { size: 11 }, boxWidth: 20 },
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        callbacks: {
          label: (ctx) => ` ${ctx.raw} PPM`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', maxTicksLimit: 8, font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.03)' },
      },
      y: {
        ticks: { color: '#6b7280', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        min: 0,
        max: 1000,
      },
    },
  };

  const statCards = [
    {
      label: 'Total Readings',
      value: stats?.total?.toLocaleString() || '—',
      icon: Activity,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Today\'s Events',
      value: stats?.today || '—',
      icon: Clock,
      color: 'from-orange-500 to-amber-500',
    },
    {
      label: 'Danger Alerts',
      value: stats?.dangers || '—',
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-600',
    },
    {
      label: 'Avg Gas Level',
      value: stats?.avgGasLevel ? `${stats.avgGasLevel} PPM` : '—',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name}! Monitor your gas safety system.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg
            ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Main Sensor Card */}
      <div className={`glass-card p-6 border transition-all duration-500 ${
        isDanger ? 'border-red-500/40 neon-red' : isWarning ? 'border-orange-500/40' : 'border-green-500/20'
      }`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          {/* Left: Main reading */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Sensor: SENSOR-001 · Kitchen</p>
                <StatusBadge status={sensorData.status} />
              </div>
              <div className="text-right">
                <p className="text-5xl font-black font-mono text-white">{sensorData.gasLevel}</p>
                <p className="text-gray-400 text-sm">PPM</p>
              </div>
            </div>

            <GaugeBar value={sensorData.gasLevel} />

            {/* Extra readings */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Thermometer className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <p className="text-white font-bold">{sensorData.temperature?.toFixed(1)}°C</p>
                <p className="text-gray-500 text-xs">Temperature</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-white font-bold">{sensorData.humidity?.toFixed(0)}%</p>
                <p className="text-gray-500 text-xs">Humidity</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-bold text-xs">
                  {sensorData.timestamp ? format(new Date(sensorData.timestamp), 'HH:mm:ss') : '—'}
                </p>
                <p className="text-gray-500 text-xs">Last Read</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="glass-card-dark p-4 rounded-xl">
              <p className="text-gray-500 text-xs mb-1">Last Danger Event</p>
              <p className="text-white text-sm font-semibold">
                {lastDanger ? format(new Date(lastDanger), 'dd MMM HH:mm') : 'No events'}
              </p>
            </div>

            <button
              onClick={handleShutoff}
              disabled={shutoffActivated}
              className={`flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-all duration-300
                ${shutoffActivated
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50'
                }`}
              id="auto-shutoff-btn"
            >
              <Power className="w-4 h-4" />
              {shutoffActivated ? 'Shutoff Active' : 'LPG Auto-Shutoff'}
            </button>

            {isDanger && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                <p className="text-red-400 font-bold text-sm">EVACUATE NOW</p>
                <p className="text-red-300 text-xs">Gas level critical!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-400 text-xs font-medium">{label}</p>
            <p className="text-white text-xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Live Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold">Live Gas Readings</h3>
            <p className="text-gray-500 text-xs mt-0.5">Real-time sensor data (last 50 readings)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-400 text-xs">Live</span>
          </div>
        </div>
        <div className="h-64">
          {readings.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Waiting for sensor data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
