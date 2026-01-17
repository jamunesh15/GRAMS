import React from 'react';
import Reveal from '../../components/Reveal';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardOverview({ stats, loading, onTabChange }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
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
      'rejected': '#ef4444' 
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stats Cards */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">👥</span>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-medium">↑ 8.3%</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">Total Users</p>
                <p className="text-2xl sm:text-4xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
            </div>
            <p className="text-white/70 text-xs">Registered platform users</p>
          </div>

          {/* Total Grievances */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">📋</span>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-medium">↑ 12.5%</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">Total Grievances</p>
                <p className="text-2xl sm:text-4xl font-bold">{stats?.totalGrievances || 0}</p>
              </div>
            </div>
            <p className="text-white/70 text-xs">All submissions</p>
          </div>

          {/* Resolved */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">✅</span>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-medium">↑ 15.7%</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">Resolved</p>
                <p className="text-2xl sm:text-4xl font-bold">{stats?.resolvedGrievances || 0}</p>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${stats?.totalGrievances ? (stats.resolvedGrievances / stats.totalGrievances) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Open Issues */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">⏳</span>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-medium">↑ 6.2%</span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">Open Issues</p>
                <p className="text-2xl sm:text-4xl font-bold">{stats?.openGrievances || 0}</p>
              </div>
            </div>
            <p className="text-white/70 text-xs">Pending action</p>
          </div>
        </div>
      </Reveal>

      {/* Key Metrics */}
      <Reveal delay={0.15}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">🔴</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Critical Issues</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{Math.floor((stats?.openGrievances || 0) * 0.15)}</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs">High priority grievances</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">⏱️</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Avg Response Time</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">2.4 hrs</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📈</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Resolution Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.totalGrievances ? Math.round((stats.resolvedGrievances / stats.totalGrievances) * 100) : 0}%</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs">Successfully resolved</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">⏳</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-xs">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{Math.floor((stats?.openGrievances || 0) * 0.6)}</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs">Being addressed</p>
          </div>
        </div>
      </Reveal>

      {/* Charts */}
      <Reveal delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
          {/* Category Chart */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-base sm:text-lg">📊</span>
              Grievances by Category
            </h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-20">No data available</p>
            )}
          </div>

          {/* Status Chart */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2 text-sm sm:text-base">
              <span className="text-base sm:text-lg">🎯</span>
              Grievances by Status
            </h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-20">No data available</p>
            )}
          </div>
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
    </div>
  );
}
