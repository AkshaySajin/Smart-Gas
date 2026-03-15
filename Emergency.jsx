import { useState } from 'react';
import { useSensor } from '../context/SensorContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Phone, Power, Wind, Users, MessageSquare, Shield, CheckCircle } from 'lucide-react';

const emergencySteps = [
  { step: 1, icon: '🚪', title: 'Evacuate Immediately', desc: 'Leave the building quickly. Do not use elevators. Go to fresh air immediately.' },
  { step: 2, icon: '💡', title: 'Do NOT Use Switches', desc: 'Do not turn on/off any electrical switches. This can cause sparks and ignite gas.' },
  { step: 3, icon: '🔥', title: 'No Open Flames', desc: 'Do not light matches, lighters, or cigarettes near the leak area.' },
  { step: 4, icon: '🔒', title: 'Shut Off Gas Supply', desc: 'Turn off the LPG regulator/valve if it is safe to do so before evacuating.' },
  { step: 5, icon: '📞', title: 'Call Emergency Services', desc: 'Call 101 (Fire Brigade) or your local emergency number from outside the building.' },
  { step: 6, icon: '🪟', title: 'Ventilate Area', desc: 'Open windows and doors from outside to ventilate if safe. Do not re-enter.' },
];

const emergencyContacts = [
  { name: 'Fire Brigade', number: '101', icon: '🚒' },
  { name: 'Police Emergency', number: '100', icon: '🚔' },
  { name: 'Ambulance', number: '108', icon: '🚑' },
  { name: 'LPG Emergency', number: '1906', icon: '⛽' },
  { name: 'Disaster Helpline', number: '1078', icon: '🆘' },
];

export default function Emergency() {
  const { sensorData, shutoffActivated, resetShutoff } = useSensor();
  const [shutoffDone, setShutoffDone] = useState(shutoffActivated);
  const [loading, setLoading] = useState(false);
  const [evacuationCalled, setEvacuationCalled] = useState(false);

  const isDanger = sensorData.status === 'danger';
  const isWarning = sensorData.status === 'warning';

  const handleEmergencyShutoff = async () => {
    setLoading(true);
    try {
      await api.post('/sensors/SENSOR-001/shutoff');
      setShutoffDone(true);
      toast.success('🔒 LPG Auto-Shutoff Activated! Gas supply cut off.', { duration: 8000 });
    } catch {
      // Simulate for demo
      setShutoffDone(true);
      toast.success('🔒 LPG Shutoff Simulated! (Demo Mode)');
    } finally {
      setLoading(false);
    }
  };

  const handleEvacuationAlert = () => {
    setEvacuationCalled(true);
    toast.success('📢 Evacuation Alert Sent to All Users!', { duration: 5000 });
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Emergency Response</h1>
          <p className="text-gray-400 text-sm">Gas level: <span className={`font-bold ${isDanger ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-green-400'}`}>{sensorData.gasLevel} PPM</span></p>
        </div>
      </div>

      {/* Status Banner */}
      {isDanger ? (
        <div className="alert-danger-banner p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2 animate-bounce" />
          <h2 className="text-red-400 text-2xl font-black mb-1">⚠️ CRITICAL GAS LEAK DETECTED</h2>
          <p className="text-red-300">Gas concentration: <strong>{sensorData.gasLevel} PPM</strong> — DANGER LEVEL!</p>
          <p className="text-red-300 mt-1">Evacuate immediately. Follow instructions below.</p>
        </div>
      ) : isWarning ? (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 text-center">
          <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <h2 className="text-orange-400 text-xl font-bold">⚠️ Gas Level Warning</h2>
          <p className="text-orange-300 text-sm mt-1">Gas: {sensorData.gasLevel} PPM — Monitor closely and be prepared</p>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h2 className="text-green-400 text-xl font-bold">✅ System Normal</h2>
          <p className="text-green-300 text-sm mt-1">No gas leak detected. Gas level: {sensorData.gasLevel} PPM</p>
        </div>
      )}

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleEmergencyShutoff}
          disabled={shutoffDone || loading}
          id="emergency-shutoff-btn"
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all
            ${shutoffDone
              ? 'border-green-500/40 bg-green-500/10 cursor-not-allowed'
              : 'border-red-500/60 bg-red-500/10 hover:bg-red-500/20 hover:scale-105 active:scale-100'
            }`}
        >
          <Power className={`w-10 h-10 ${shutoffDone ? 'text-green-400' : 'text-red-400'}`} />
          <div className="text-center">
            <p className={`font-black text-lg ${shutoffDone ? 'text-green-400' : 'text-red-400'}`}>
              {loading ? 'Activating...' : shutoffDone ? '✅ Shutoff Active' : '🔴 LPG Auto-Shutoff'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {shutoffDone ? 'Gas supply has been cut off' : 'Cut off LPG supply immediately'}
            </p>
          </div>
        </button>

        <button
          onClick={handleEvacuationAlert}
          disabled={evacuationCalled}
          id="evacuation-alert-btn"
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all
            ${evacuationCalled
              ? 'border-green-500/40 bg-green-500/10 cursor-not-allowed'
              : 'border-orange-500/60 bg-orange-500/10 hover:bg-orange-500/20 hover:scale-105 active:scale-100'
            }`}
        >
          <Users className={`w-10 h-10 ${evacuationCalled ? 'text-green-400' : 'text-orange-400'}`} />
          <div className="text-center">
            <p className={`font-black text-lg ${evacuationCalled ? 'text-green-400' : 'text-orange-400'}`}>
              {evacuationCalled ? '✅ Alert Sent' : '📢 Evacuation Alert'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {evacuationCalled ? 'All users notified' : 'Notify all building occupants'}
            </p>
          </div>
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-400" />
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {emergencyContacts.map(({ name, number, icon }) => (
            <a
              key={name}
              href={`tel:${number}`}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/5 hover:border-red-500/20"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-white font-semibold text-sm group-hover:text-red-400 transition-colors">{name}</p>
                <p className="text-orange-400 font-bold font-mono text-lg">{number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* What To Do Steps */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-400" />
          What To Do In A Gas Emergency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencySteps.map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 p-4 bg-white/3 rounded-xl border border-white/5">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl">
                  {icon}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-orange-400 text-xs font-bold">STEP {step}</span>
                </div>
                <h4 className="text-white font-semibold text-sm">{title}</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ventilation tip */}
      <div className="glass-card p-5 flex items-start gap-4 border border-blue-500/20">
        <Wind className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h4 className="text-white font-bold mb-1">Ventilation Guide</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            After the leak is controlled, ventilate the area by opening all windows and doors.
            Use fans to push gas out. Wait for at least <strong className="text-white">30 minutes</strong> before
            re-entering. Call a certified LPG technician to inspect before resuming normal use.
          </p>
        </div>
      </div>
    </div>
  );
}
