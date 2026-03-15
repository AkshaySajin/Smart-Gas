import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Shield, Bell, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    smsNotifications: user?.smsNotifications !== false,
    emailNotifications: user?.emailNotifications !== false,
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relation: user?.emergencyContact?.relation || '',
    },
  });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) return toast.error('Passwords do not match');
    if (password.new.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: password.current, newPassword: password.new });
      toast.success('Password changed!');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'emergency', icon: Shield, label: 'Emergency Contact' },
    { id: 'security', icon: Lock, label: 'Security' },
  ];

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and notification preferences</p>
      </div>

      {/* Avatar */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize font-semibold
            ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${activeTab === id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'btn-ghost py-2'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card p-6">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Personal Information</h3>
            {[
              { label: 'Full Name', key: 'name', type: 'text', icon: User, placeholder: 'Your name' },
              { label: 'Phone Number', key: 'phone', type: 'tel', icon: Phone, placeholder: '+91 98765 43210' },
              { label: 'Address', key: 'address', type: 'text', icon: MapPin, placeholder: 'Your address' },
            ].map(({ label, key, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={type}
                    className="input-field pl-10"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    id={`profile-${key}`}
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="text-gray-400 text-sm font-medium mb-1.5 block">Email (read-only)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" className="input-field pl-10 opacity-60 cursor-not-allowed" value={user?.email} readOnly />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Notification Preferences</h3>
            <p className="text-gray-400 text-sm">Configure how you receive gas leakage alerts</p>
            {[
              { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive SMS alerts when gas exceeds threshold', icon: '📱' },
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email reports and alerts', icon: '📧' },
            ].map(({ key, label, desc, icon }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{label}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form[key] ? 'bg-orange-500' : 'bg-gray-600'}`}
                  id={`toggle-${key}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[key] ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Emergency Contact</h3>
            <p className="text-gray-400 text-sm">This person will be notified in case of a gas emergency</p>
            {[
              { label: 'Contact Name', key: 'name', placeholder: 'Family member name' },
              { label: 'Contact Phone', key: 'phone', placeholder: '+91 98765 43210' },
              { label: 'Relationship', key: 'relation', placeholder: 'e.g. Spouse, Parent' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">{label}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={placeholder}
                  value={form.emergencyContact[key]}
                  onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, [key]: e.target.value } })}
                  id={`emergency-${key}`}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Change Password</h3>
            {[
              { label: 'Current Password', key: 'current', placeholder: '••••••••' },
              { label: 'New Password', key: 'new', placeholder: 'Min 6 characters' },
              { label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat password' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    className="input-field pl-10"
                    placeholder={placeholder}
                    value={password[key]}
                    onChange={e => setPassword({ ...password, [key]: e.target.value })}
                    id={`security-${key}`}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
              id="change-password-btn"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}

        {activeTab !== 'security' && (
          <div className="pt-5 mt-5 border-t border-white/5">
            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
              id="save-profile-btn"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
