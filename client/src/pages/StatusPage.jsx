import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function StatusPage() {
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    lastUpdated: new Date().toLocaleString()
  });

  const [services] = useState([
    { 
      name: 'Web Portal', 
      status: 'operational', 
      uptime: 99.9,
      responseTime: '125ms',
      icon: '🌐'
    },
    { 
      name: 'Mobile App', 
      status: 'operational', 
      uptime: 99.8,
      responseTime: '98ms',
      icon: '📱'
    },
    { 
      name: 'API Services', 
      status: 'operational', 
      uptime: 99.95,
      responseTime: '45ms',
      icon: '⚡'
    },
    { 
      name: 'Database', 
      status: 'operational', 
      uptime: 99.99,
      responseTime: '12ms',
      icon: '💾'
    },
    { 
      name: 'SMS Gateway', 
      status: 'operational', 
      uptime: 98.5,
      responseTime: '2.5s',
      icon: '📨'
    },
    { 
      name: 'Email Service', 
      status: 'operational', 
      uptime: 99.2,
      responseTime: '1.8s',
      icon: '📧'
    }
  ]);

  const [recentIncidents] = useState([
    {
      date: '2024-12-20',
      title: 'Database Maintenance',
      status: 'resolved',
      duration: '2 hours',
      impact: 'Minor slowdown in response times'
    },
    {
      date: '2024-12-10',
      title: 'SMS Gateway Issue',
      status: 'resolved',
      duration: '45 minutes',
      impact: 'Delayed SMS notifications'
    }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-green-100 text-green-700 border-green-300',
      degraded: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      down: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || colors.operational;
  };

  const getStatusIcon = (status) => {
    const icons = {
      operational: '✅',
      degraded: '⚠️',
      down: '❌'
    };
    return icons[status] || icons.operational;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-black text-slate-800 mb-3">
              System Status
            </h1>
            <p className="text-lg text-slate-600">
              Real-time monitoring of all services
            </p>
          </motion.div>

          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-xl p-8 mb-8 text-center"
          >
            <div className="text-6xl mb-4">
              {getStatusIcon(systemStatus.overall)}
            </div>
            <h2 className="text-3xl font-bold mb-2">All Systems Operational</h2>
            <p className="text-green-100">
              Last updated: {systemStatus.lastUpdated}
            </p>
          </motion.div>

          {/* Services Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Service Status
            </h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200 hover:border-green-500 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{service.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-800">{service.name}</h3>
                        <p className="text-sm text-slate-600">Uptime: {service.uptime}%</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl font-semibold border-2 ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)} {service.status}
                    </span>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Response Time</p>
                      <p className="text-lg font-bold text-green-600">{service.responseTime}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Uptime (30 days)</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${service.uptime}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          />
                        </div>
                        <span className="text-sm font-bold text-green-600">{service.uptime}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Incidents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Recent Incidents
            </h2>
            {recentIncidents.length > 0 ? (
              <div className="space-y-4">
                {recentIncidents.map((incident, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-50 p-5 rounded-xl border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800">{incident.title}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {incident.date} • Duration: {incident.duration}
                    </p>
                    <p className="text-sm text-slate-700">
                      Impact: {incident.impact}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg text-slate-600">No incidents in the past 30 days!</p>
              </div>
            )}
          </motion.div>

          {/* Subscribe for Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold mb-3">Stay Updated</h3>
            <p className="mb-6">Subscribe to receive notifications about system status updates</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>


    </div>
  );
}
