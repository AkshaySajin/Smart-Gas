import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SensorProvider } from './context/SensorContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DeviceMonitor from './pages/DeviceMonitor';
import GasLogs from './pages/GasLogs';
import AlertsPage from './pages/AlertsPage';
import AdminPanel from './pages/AdminPanel';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><SensorProvider><Layout><Dashboard /></Layout></SensorProvider></ProtectedRoute>} />
      <Route path="/devices" element={<ProtectedRoute><SensorProvider><Layout><DeviceMonitor /></Layout></SensorProvider></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><SensorProvider><Layout><GasLogs /></Layout></SensorProvider></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><SensorProvider><Layout><AlertsPage /></Layout></SensorProvider></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><SensorProvider><Layout><Emergency /></Layout></SensorProvider></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><SensorProvider><Layout><Profile /></Layout></SensorProvider></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><SensorProvider><Layout><AdminPanel /></Layout></SensorProvider></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' }, duration: 6000 },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
