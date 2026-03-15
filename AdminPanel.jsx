import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Shield, Users, Cpu, Activity, Trash2, UserCheck, UserX, RefreshCw,
  TrendingUp, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card p-5">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, sensorsRes, statsRes] = await Promise.all([
        api.get('/users'),
        api.get('/sensors'),
        api.get('/logs/stats'),
      ]);
      setUsers(usersRes.data.users);
      setSensors(sensorsRes.data.sensors);
      setStats(statsRes.data.stats);
    } catch {
      // Demo data
      setUsers([
        { _id: '1', name: 'Admin User', email: 'admin@smartlpg.com', role: 'admin', isActive: true, createdAt: new Date().toISOString(), phone: '+91 9876543210' },
        { _id: '2', name: 'John Doe', email: 'john@example.com', role: 'user', isActive: true, createdAt: new Date().toISOString(), phone: '+91 9999999999' },
        { _id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user', isActive: false, createdAt: new Date().toISOString(), phone: '+91 8888888888' },
      ]);
      setSensors([
        { sensorId: 'SENSOR-001', name: 'Kitchen Sensor', location: 'Kitchen', currentGasLevel: 145, status: 'safe', isActive: true, batteryLevel: 87 },
        { sensorId: 'SENSOR-002', name: 'Garage Sensor', location: 'Garage', currentGasLevel: 0, status: 'offline', isActive: false, batteryLevel: 12 },
      ]);
      setStats({ total: 1547, today: 48, dangers: 23, warnings: 89, avgGasLevel: 142 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/toggle-active`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const statusConfig = {
    safe: 'text-green-400 bg-green-400/10',
    warning: 'text-orange-400 bg-orange-400/10',
    danger: 'text-red-400 bg-red-400/10',
    offline: 'text-gray-400 bg-gray-400/10',
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm">System management & monitoring</p>
          </div>
        </div>
        <button onClick={fetchData} className="btn-ghost py-2 flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} color="from-blue-500 to-indigo-600" />
        <StatCard label="Active Sensors" value={sensors.filter(s => s.isActive).length} icon={Cpu} color="from-orange-500 to-amber-500" />
        <StatCard label="Total Logs" value={stats?.total?.toLocaleString() || '—'} icon={Activity} color="from-green-500 to-emerald-600" />
        <StatCard label="Danger Events" value={stats?.dangers || '—'} icon={AlertTriangle} color="from-red-500 to-rose-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'users', icon: Users, label: 'Users' },
          { id: 'sensors', icon: Cpu, label: 'Sensors' },
          { id: 'overview', icon: TrendingUp, label: 'Overview' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${activeTab === id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'btn-ghost py-2'}`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white font-semibold">User Management</h3>
            <span className="text-gray-400 text-sm">{users.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j}><div className="skeleton h-4 rounded w-20" /></td>)}</tr>
                  ))
                ) : users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.[0]}
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{user.role}</span>
                    </td>
                    <td className="text-xs font-mono">{user.phone || '—'}</td>
                    <td className="text-xs">{format(new Date(user.createdAt), 'dd MMM yyyy')}</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sensors Tab */}
      {activeTab === 'sensors' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold">Sensor Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sensor ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Gas Level</th>
                  <th>Status</th>
                  <th>Battery</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map(sensor => (
                  <tr key={sensor.sensorId}>
                    <td className="font-mono text-xs text-orange-400">{sensor.sensorId}</td>
                    <td className="text-sm">{sensor.name}</td>
                    <td className="text-xs text-gray-400">{sensor.location}</td>
                    <td className="font-mono font-bold text-sm">{sensor.currentGasLevel} PPM</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${statusConfig[sensor.status] || ''}`}>
                        {sensor.status}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs font-bold ${sensor.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`}>
                        🔋 {sensor.batteryLevel}%
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs ${sensor.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {sensor.isActive ? '✅' : '❌'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: 'Total Readings', value: stats.total, icon: '📊', color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400' },
            { label: "Today's Readings", value: stats.today, icon: '📅', color: 'from-orange-500/20 to-orange-600/10', text: 'text-orange-400' },
            { label: 'Danger Events', value: stats.dangers, icon: '🚨', color: 'from-red-500/20 to-red-600/10', text: 'text-red-400' },
            { label: 'Warning Events', value: stats.warnings, icon: '⚠️', color: 'from-yellow-500/20 to-yellow-600/10', text: 'text-yellow-400' },
          ].map(({ label, value, icon, color, text }) => (
            <div key={label} className={`glass-card p-6 bg-gradient-to-br ${color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{label}</p>
                  <p className={`text-4xl font-black ${text} mt-1`}>{value?.toLocaleString()}</p>
                </div>
                <span className="text-5xl opacity-20">{icon}</span>
              </div>
            </div>
          ))}

          <div className="glass-card p-6 md:col-span-2">
            <h3 className="text-white font-semibold mb-3">System Health</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded-xl">
                <p className="text-green-400 text-2xl font-bold">{stats.avgGasLevel || 0}</p>
                <p className="text-gray-500 text-xs">Avg PPM</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                <p className="text-blue-400 text-2xl font-bold">{sensors.filter(s => s.isActive).length}</p>
                <p className="text-gray-500 text-xs">Active Sensors</p>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-xl">
                <p className="text-orange-400 text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
                <p className="text-gray-500 text-xs">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
