import { useEffect, useState } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { FileText, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const STATUS_COLORS = {
  safe: 'text-green-400 bg-green-400/10',
  warning: 'text-orange-400 bg-orange-400/10',
  danger: 'text-red-400 bg-red-400/10',
};

export default function GasLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', sensorId: '' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.sensorId) params.append('sensorId', filters.sensorId);

      const { data } = await api.get(`/logs?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      // Generate sample logs for demo
      setLogs(Array.from({ length: 20 }, (_, i) => ({
        _id: `log-${i}`,
        sensorId: 'SENSOR-001',
        gasLevel: Math.floor(50 + Math.random() * 800),
        status: ['safe', 'safe', 'warning', 'danger'][Math.floor(Math.random() * 4)],
        location: 'Kitchen',
        alertSent: Math.random() > 0.7,
        smsSent: Math.random() > 0.8,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      })));
      setTotal(200);
      setPages(10);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const exportCSV = () => {
    const headers = ['Date', 'Time', 'Sensor ID', 'Location', 'Gas Level (PPM)', 'Status', 'Alert Sent', 'SMS Sent'];
    const rows = logs.map(l => [
      format(new Date(l.createdAt), 'dd-MM-yyyy'),
      format(new Date(l.createdAt), 'HH:mm:ss'),
      l.sensorId,
      l.location,
      l.gasLevel,
      l.status.toUpperCase(),
      l.alertSent ? 'Yes' : 'No',
      l.smsSent ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gas-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const summaryStats = {
    total: logs.length,
    safe: logs.filter(l => l.status === 'safe').length,
    warning: logs.filter(l => l.status === 'warning').length,
    danger: logs.filter(l => l.status === 'danger').length,
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gas Leakage Logs</h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total readings recorded</p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-ghost flex items-center gap-2 py-2 text-sm"
          id="export-csv-btn"
        >
          <Download className="w-4 h-4" />Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: summaryStats.total, color: 'text-white' },
          { label: 'Safe', value: summaryStats.safe, color: 'text-green-400' },
          { label: 'Warning', value: summaryStats.warning, color: 'text-orange-400' },
          { label: 'Danger', value: summaryStats.danger, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-1">{label} Readings</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filters.status}
          onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-orange-500/50"
          id="filter-status"
        >
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="warning">Warning</option>
          <option value="danger">Danger</option>
        </select>
        <input
          type="text"
          placeholder="Filter by Sensor ID..."
          value={filters.sensorId}
          onChange={(e) => { setFilters(f => ({ ...f, sensorId: e.target.value })); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-orange-500/50 w-48"
          id="filter-sensor"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="border-b border-white/5">
                <th>Date</th>
                <th>Time</th>
                <th>Sensor ID</th>
                <th>Location</th>
                <th>Gas Level</th>
                <th>Status</th>
                <th>Alert</th>
                <th>SMS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j}><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="font-mono text-xs">{format(new Date(log.createdAt), 'dd MMM yyyy')}</td>
                    <td className="font-mono text-xs">{format(new Date(log.createdAt), 'HH:mm:ss')}</td>
                    <td className="font-mono text-xs text-orange-400">{log.sensorId}</td>
                    <td className="text-xs">{log.location}</td>
                    <td>
                      <span className={`font-bold font-mono ${STATUS_COLORS[log.status]?.split(' ')[0] || 'text-gray-400'}`}>
                        {log.gasLevel} PPM
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${STATUS_COLORS[log.status] || ''}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${log.alertSent ? 'bg-orange-400/10 text-orange-400' : 'text-gray-600'}`}>
                        {log.alertSent ? '⚠️ Sent' : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${log.smsSent ? 'bg-blue-400/10 text-blue-400' : 'text-gray-600'}`}>
                        {log.smsSent ? '📱 Sent' : '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4 border-t border-white/5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost py-2 px-3 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-gray-400 text-sm">Page {page} of {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="btn-ghost py-2 px-3 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
