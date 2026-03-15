import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('lpg_token');
    const storedUser = localStorage.getItem('lpg_user');

    if (!token) {
      setLoading(false);
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('lpg_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('lpg_token');
      localStorage.removeItem('lpg_user');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('lpg_token', data.token);
    localStorage.setItem('lpg_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('lpg_token', data.token);
    localStorage.setItem('lpg_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lpg_token');
    localStorage.removeItem('lpg_user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/update-profile', profileData);
    setUser(data.user);
    localStorage.setItem('lpg_user', JSON.stringify(data.user));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateProfile, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
