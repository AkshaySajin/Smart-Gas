import { useEffect, useState } from 'react';
import { useSensor } from '../context/SensorContext';
import api from '../utils/api';
import { Bell, CheckCircle, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const severityConfig = {
  warning: { label: 'Warning', textColor: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  danger: { label: 'Danger', textColor: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  critical: { label: 'Critical', textColor: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/30' },
};

export default function AlertsPage() {
  const { alerts: liveAlerts, clearAlerts } = useSensor();
  const [dbAlerts, setDbAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = filter === 'resolved' ? '?resolved=true' : filter === 'all' ? '' : '?resolved=false';
      const { data } = await api.get(`/alerts${params}`);
      setDbAlerts(data.alerts);
    } catch {
      // Demo data
      setDbAlerts(liveAlerts.map((a, i) => ({
        _id: `alert-${i}`,
        type: a.status === 'danger' ? 'gas_leak' : 'high_concentration',
        severity: a.status,
        message: `Gas level ${a.gasLevel} PPM at ${a.location}`,
        sensorId: a.sensorId,
        gasLevel: a.gasLevel,
        location: a.location,
        isResolved: a.resolved || false,
        smsSent: false,
        createdAt: a.timestamp,
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [filter]);

  const resolveAlert = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      setDbAlerts(prev => prev.map(a => a._id === id ? { ...a, isResolved: true } : a));
      toast.success('Alert resolved');
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const activeCount = dbAlerts.filter(a => !a.isResolved).length;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert System</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeCount > 0 ? `${activeCount} active alerts require attention` : 'No active alerts'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearAlerts} className="btn-ghost py-2 text-sm flex items-center gap-2">
            <X className="w-4 h-4" />Clear Live
          </button>
          <button onClick={fetchAlerts} className="btn-ghost py-2 text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
        </div>
      </div>

      {/* Live alerts from socket */}
      {liveAlerts.length > 0 && (
        <div className="glass-card border border-red-500/30 p-5">
          <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 animate-pulse" />
            Live Socket Alerts ({liveAlerts.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {liveAlerts.map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                alert.status === 'danger' ? 'bg-red-500/10' : 'bg-orange-500/10'
              }`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${alert.status === 'danger' ? 'text-red-400' : 'text-orange-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    Gas: {alert.gasLevel} PPM at {alert.location}
                  </p>
                  <p className="text-gray-500 text-xs">{format(new Date(alert.timestamp), 'HH:mm:ss')}</p>
                </div>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                  alert.status === 'danger' ? 'text-red-400 bg-red-400/10' : 'text-orange-400 bg-orange-400/10'
                }`}>{alert.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['active', 'resolved', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
              ${filter === f ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'btn-ghost py-2'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* DB Alerts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : dbAlerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No alerts found</p>
          <p className="text-gray-500 text-sm mt-1">System is operating normally</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dbAlerts.map(alert => {
            const cfg = severityConfig[alert.severity] || severityConfig.warning;
            return (
              <div key={alert._id} className={`glass-card p-5 border ${cfg.border} ${alert.isResolved ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <AlertTriangle className={`w-5 h-5 ${cfg.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.textColor}`}>
                          {cfg.label}
                        </span>
                        <span className="text-gray-500 text-xs font-mono">{alert.sensorId}</span>
                        {alert.smsSent && (
                          <span className="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full">📱 SMS Sent</span>
                        )}
                        {alert.isResolved && (
                          <span className="text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full">✅ Resolved</span>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>📍 {alert.location}</span>
                        <span>💨 {alert.gasLevel} PPM</span>
                        <span>🕐 {format(new Date(alert.createdAt), 'dd MMM HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  {!alert.isResolved && (
                    <button
                      onClick={() => resolveAlert(alert._id)}
                      className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 bg-green-400/10 hover:bg-green-400/20 px-3 py-2 rounded-xl transition-all flex-shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
