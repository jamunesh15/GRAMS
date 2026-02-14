import React from 'react';
import { motion } from 'framer-motion';
import Reveal from '../../components/Reveal';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

export default function DashboardOverview({ stats, loading, onTabChange }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center items-center h-96"
      >
        <div className="text-center relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-green-200 rounded-full blur-3xl -z-10"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            📊
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-600 font-medium text-lg"
          >
            Loading dashboard...
          </motion.p>
          <div className="flex justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Prepare data for charts
  const categoryData = stats?.grievancesByCategory?.map(cat => ({
    name: cat._id || 'Other',
    value: cat.count
  })) || [];

  const statusData = stats?.grievancesByStatus?.map(status => ({
    name: status._id,
    count: status.count
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  const getStatusColor = (status) => {
    const colors = {
      'open': '#f59e0b',
      'in-progress': '#3b82f6',
      'resolved': '#10b981',
      'closed': '#6b7280',
      'rejected': '#ef4444',
      'blocked': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-5"
    >
      {/* Stats Cards */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-5">
          {/* Total Users */}
          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-blue-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-1">Total Users</p>
                  <p className="text-2xl sm:text-3xl lg:text-5xl font-extrabold">{stats?.totalUsers || 0}</p>
                </div>
                <span className="text-3xl sm:text-4xl">👥</span>
              </div>
              <div className="h-1 bg-blue-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>

          {/* Total Grievances */}
          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
            className="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 0.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-purple-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-1">Total Grievances</p>
                  <p className="text-2xl sm:text-3xl lg:text-5xl font-extrabold">{stats?.totalGrievances || 0}</p>
                </div>
                <span className="text-3xl sm:text-4xl">📋</span>
              </div>
              <div className="h-1 bg-purple-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5, delay: 0.2 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>

          {/* Resolved */}
          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
            className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-green-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-1">Resolved</p>
                  <p className="text-2xl sm:text-3xl lg:text-5xl font-extrabold">{stats?.resolvedGrievances || 0}</p>
                </div>
                <span className="text-3xl sm:text-4xl">✅</span>
              </div>
              <div className="h-1 bg-green-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${stats?.totalGrievances ? (stats.resolvedGrievances / stats.totalGrievances) * 100 : 0}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>

          {/* Open Issues */}
          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)' }}
            className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-orange-100 text-[10px] sm:text-xs lg:text-sm font-medium mb-1">Open Issues</p>
                  <p className="text-2xl sm:text-3xl lg:text-5xl font-extrabold">{stats?.openGrievances || 0}</p>
                </div>
                <span className="text-3xl sm:text-4xl">⏳</span>
              </div>
              <div className="h-1 bg-orange-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${stats?.totalGrievances ? (stats.openGrievances / stats.totalGrievances) * 100 : 0}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>
        </div>
      </Reveal>

      {/* Key Metrics */}
      <Reveal delay={0.15}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-5">
          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4)' }}
            className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-red-100 text-[10px] sm:text-xs font-medium mb-1">Critical Issues</p>
                  <p className="text-xl sm:text-2xl lg:text-4xl font-extrabold">{Math.floor((stats?.openGrievances || 0) * 0.15)}</p>
                </div>
                <span className="text-2xl sm:text-3xl">🔴</span>
              </div>
              <div className="h-1 bg-red-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 0.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-blue-100 text-[10px] sm:text-xs font-medium mb-1">Avg Response Time</p>
                  <p className="text-xl sm:text-2xl lg:text-4xl font-extrabold">2.4 hrs</p>
                </div>
                <span className="text-2xl sm:text-3xl">⏱️</span>
              </div>
              <div className="h-1 bg-blue-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 0.5, delay: 0.2 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
            className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-green-100 text-[10px] sm:text-xs font-medium mb-1">Resolution Rate</p>
                  <p className="text-xl sm:text-2xl lg:text-4xl font-extrabold">{stats?.totalGrievances ? Math.round((stats.resolvedGrievances / stats.totalGrievances) * 100) : 0}%</p>
                </div>
                <span className="text-2xl sm:text-3xl">📈</span>
              </div>
              <div className="h-1 bg-green-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${stats?.totalGrievances ? Math.round((stats.resolvedGrievances / stats.totalGrievances) * 100) : 0}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
            className="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-purple-100 text-[10px] sm:text-xs font-medium mb-1">In Progress</p>
                  <p className="text-xl sm:text-2xl lg:text-4xl font-extrabold">{Math.floor((stats?.openGrievances || 0) * 0.6)}</p>
                </div>
                <span className="text-2xl sm:text-3xl">⏳</span>
              </div>
              <div className="h-1 bg-purple-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 0.5, delay: 0.4 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>
        </div>
      </Reveal>

      {/* Charts */}
      <Reveal delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Category Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, type: 'spring' }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-blue-100 relative overflow-hidden group"
          >
            {/* Animated gradient overlay */}
            <motion.div
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg"
                >
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Grievances by Category
                </h3>
              </div>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <defs>
                      <linearGradient id="adminBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} 
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} 
                      stroke="#9ca3af"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #e5e7eb',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        padding: '12px',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#adminBarGradient)" 
                      radius={[10, 10, 0, 0]} 
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl sm:text-6xl mb-4"
                    >
                      📊
                    </motion.div>
                    <p className="text-gray-500 font-semibold">No category data available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, type: 'spring' }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-orange-100 relative overflow-hidden group"
          >
            {/* Animated gradient overlay */}
            <motion.div
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, delay: 1, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 opacity-0 group-hover:opacity-10 transition-opacity"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg"
                >
                  <PieChartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Grievances by Status
                </h3>
              </div>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <filter id="adminPieShadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4"/>
                      </filter>
                    </defs>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                      label={({ name, percent, count }) => {
                        if (window.innerWidth < 640) {
                          return `${name}: ${count}`;
                        }
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      labelLine={{ stroke: '#64748b', strokeWidth: 2 }}
                      style={{ filter: 'url(#adminPieShadow)' }}
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getStatusColor(entry.name)} 
                          stroke="#fff"
                          strokeWidth={4}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #e5e7eb',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        padding: '12px',
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={50}
                      iconType="circle"
                      wrapperStyle={{ fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="text-5xl sm:text-6xl mb-4"
                    >
                      🎯
                    </motion.div>
                    <p className="text-gray-500 font-semibold">No status data available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </Reveal>

      {/* Quick Actions */}
      <Reveal delay={0.25}>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2 text-sm sm:text-base">
            <span className="text-base sm:text-lg">⚡</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button 
              onClick={() => onTabChange && onTabChange('grievances')}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 px-3 sm:px-5 py-4 sm:py-5 rounded-xl transition-all font-medium flex flex-col items-center gap-2 hover:shadow-md hover:scale-105"
            >
              <span className="text-2xl sm:text-3xl">📋</span>
              <span className="text-xs sm:text-sm">View Grievances</span>
            </button>
            <button 
              onClick={() => onTabChange && onTabChange('engineers')}
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600 px-3 sm:px-5 py-4 sm:py-5 rounded-xl transition-all font-medium flex flex-col items-center gap-2 hover:shadow-md hover:scale-105"
            >
              <span className="text-2xl sm:text-3xl">👷</span>
              <span className="text-xs sm:text-sm">Manage Engineers</span>
            </button>
            <button 
              onClick={() => onTabChange && onTabChange('escalations')}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 px-3 sm:px-5 py-4 sm:py-5 rounded-xl transition-all font-medium flex flex-col items-center gap-2 hover:shadow-md hover:scale-105"
            >
              <span className="text-2xl sm:text-3xl">⚠️</span>
              <span className="text-xs sm:text-sm">Escalations</span>
            </button>
            <button 
              onClick={() => onTabChange && onTabChange('reports')}
              className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 px-3 sm:px-5 py-4 sm:py-5 rounded-xl transition-all font-medium flex flex-col items-center gap-2 hover:shadow-md hover:scale-105"
            >
              <span className="text-2xl sm:text-3xl">📄</span>
              <span className="text-xs sm:text-sm">Generate Report</span>
            </button>
          </div>
        </div>
      </Reveal>
    </motion.div>
  );
}
