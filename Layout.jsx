import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensor } from '../context/SensorContext';
import {
  LayoutDashboard, Cpu, FileText, Bell, AlertTriangle,
  Shield, User, LogOut, Menu, X, Wifi, WifiOff, Flame
} from 'lucide-react';

const navLinks = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/devices', icon: Cpu, label: 'Device Monitor' },
  { path: '/logs', icon: FileText, label: 'Gas Logs' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/emergency', icon: AlertTriangle, label: 'Emergency' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { sensorData, isConnected, alerts } = useSensor();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadAlerts = alerts.filter(a => !a.resolved).length;
  const isDanger = sensorData.status === 'danger';
  const isWarning = sensorData.status === 'warning';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-800/95 backdrop-blur-xl border-r border-white/5
          z-30 transform transition-transform duration-300 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">Smart LPG</h1>
              <p className="text-xs text-gray-500">Gas Detection System</p>
            </div>
          </Link>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg
            ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isConnected ? 'Sensor Online' : 'Sensor Offline'}
            {isConnected && (
              <span className={`ml-auto font-mono font-bold
                ${isDanger ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-green-400'}`}>
                {sensorData.gasLevel} PPM
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {path === '/alerts' && unreadAlerts > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400
              hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-dark-800/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1">
            <h2 className="text-white font-semibold capitalize">
              {location.pathname.replace('/', '') || 'dashboard'}
            </h2>
          </div>

          {/* Live status badge */}
          {isDanger && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1.5 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="text-red-400 text-sm font-semibold">DANGER DETECTED</span>
            </div>
          )}

          {isWarning && !isDanger && (
            <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 text-sm font-semibold">WARNING LEVEL</span>
            </div>
          )}
        </header>

        {/* Danger Banner */}
        {isDanger && (
          <div className="alert-danger-banner mx-4 mt-4 p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-red-400 font-bold">⚠️ CRITICAL GAS LEAK DETECTED!</p>
              <p className="text-red-300 text-sm">Gas level: {sensorData.gasLevel} PPM at {sensorData.location}. Evacuate immediately!</p>
            </div>
            <Link to="/emergency" className="ml-auto btn-danger text-sm py-2 px-4">
              Emergency
            </Link>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
