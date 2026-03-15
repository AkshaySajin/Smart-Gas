import { Link } from 'react-router-dom';
import { Shield, Zap, Bell, Cpu, ArrowRight, Activity, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const features = [
  { icon: Activity, title: 'Real-Time Monitoring', desc: 'Live gas concentration data every 2 seconds from IoT sensors', color: 'from-orange-500 to-red-500' },
  { icon: Bell, title: 'Instant SMS Alerts', desc: 'Immediate SMS notifications when gas levels exceed safe thresholds', color: 'from-blue-500 to-indigo-600' },
  { icon: Shield, title: 'Auto Safety Shutoff', desc: 'Automatic LPG regulator shutoff simulation when danger is detected', color: 'from-green-500 to-emerald-600' },
  { icon: Cpu, title: 'IoT Integration', desc: 'Compatible with Arduino/ESP8266 with MQ-2 gas sensors via WiFi', color: 'from-purple-500 to-violet-600' },
  { icon: Zap, title: 'Live Dashboard', desc: 'Beautiful real-time charts and graphs for sensor data visualization', color: 'from-yellow-500 to-orange-500' },
  { icon: Users, title: 'Multi-User System', desc: 'Role-based access for admins and users with full sensor management', color: 'from-pink-500 to-rose-600' },
];

const stats = [
  { value: '99.9%', label: 'Uptime Reliability' },
  { value: '<2s', label: 'Alert Response Time' },
  { value: '1000+', label: 'Sensors Supported' },
  { value: '24/7', label: 'Continuous Monitoring' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-hero-pattern text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl">
              🔥
            </div>
            <span className="font-bold text-white text-lg">Smart LPG</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm py-2 px-5">Log In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-5 py-2.5 mb-8">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-orange-400 text-sm font-semibold">IoT-Powered • Real-Time Detection</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">IoT-Based </span>
            <span className="text-gradient">LPG Gas</span>
            <br />
            <span className="text-white">Leakage Detection</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Protect your home and family with our advanced gas leakage detection system.
            Real-time monitoring, instant alerts, and automatic safety measures — powered by IoT.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base py-4 px-8">
              <Activity className="w-5 h-5" />
              View Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="btn-ghost flex items-center gap-2 text-base py-4 px-8">
              <Shield className="w-5 h-5" />
              Register Now
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="glass-card p-4 text-center">
                <div className="text-2xl font-black text-gradient">{value}</div>
                <div className="text-gray-400 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sensor Visual Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It <span className="text-gradient">Works</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From sensor to alert in under 2 seconds — our system ensures maximum safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '01', icon: '📡', title: 'Sensor Detects', desc: 'MQ-2 sensor continuously monitors LPG/gas concentration in the air' },
              { step: '02', icon: '📶', title: 'WiFi Transmits', desc: 'ESP8266 sends gas readings to the cloud server via WiFi API' },
              { step: '03', icon: '🚨', title: 'Instant Alert', desc: 'Dashboard updates in real-time and SMS alert is sent immediately' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="glass-card p-8 text-center relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                  {step}
                </div>
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful <span className="text-gradient">Features</span></h2>
            <p className="text-gray-400 text-lg">Everything you need for complete gas safety monitoring</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card p-6 hover:border-white/20 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass-card p-10 text-center border-orange-500/20">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Gas Leaks Are Dangerous</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              LPG gas leaks can cause fires, explosions, and health hazards. Our system provides
              <strong className="text-orange-400"> continuous 24/7 protection</strong> with instant alerts
              to keep your family safe.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '✅', text: 'Immediate SMS Alerts' },
                { icon: '✅', text: 'Auto Safety Shutoff' },
                { icon: '✅', text: 'Evacuation Guidance' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 justify-center text-gray-300">
                  <span>{icon}</span> <span>{text}</span>
                </div>
              ))}
            </div>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Start Protecting Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Smart LPG Gas Detection System | IoT-Based Safety Solution
          </p>
        </div>
      </footer>
    </div>
  );
}
