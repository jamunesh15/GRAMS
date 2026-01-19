import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  getResolutionTimeAnalytics,
  getEngineerPerformance,
  getStatusAnalysis,
  getCitizenAnalytics,
  getAreaAnalysis,
  getBacklogAnalysis,
} from '../../Services/operations/analyticsAPI';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resolution');
  const [resolutionData, setResolutionData] = useState(null);
  const [engineerData, setEngineerData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [citizenData, setCitizenData] = useState(null);
  const [areaData, setAreaData] = useState(null);
  const [backlogData, setBacklogData] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [resolution, engineer, status, citizen, area, backlog] = await Promise.all([
        getResolutionTimeAnalytics(token),
        getEngineerPerformance(token),
        getStatusAnalysis(token),
        getCitizenAnalytics(token),
        getAreaAnalysis(token),
        getBacklogAnalysis(token),
      ]);

      console.log('Resolution data:', resolution);
      console.log('Engineer data:', engineer);
      console.log('Status data:', status);
      console.log('Citizen data:', citizen);
      console.log('Area data:', area);
      console.log('Backlog data:', backlog);

      // Extract the actual data from the backend response structure {success: true, data: {...}}
      setResolutionData(resolution.data?.data || resolution.data);
      setEngineerData(engineer.data?.data || engineer.data);
      setStatusData(status.data?.data || status.data);
      setCitizenData(citizen.data?.data || citizen.data);
      setAreaData(area.data?.data || area.data);
      setBacklogData(backlog.data?.data || backlog.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'resolution', label: '⏱️ Resolution Time', icon: '📊' },
    { id: 'engineer', label: '👷 Engineer Performance', icon: '🎯' },
    { id: 'status', label: '📈 Status Analysis', icon: '📊' },
    { id: 'citizen', label: '👤 Citizen Analytics', icon: '👥' },
    { id: 'area', label: '📍 Area Analysis', icon: '🗺️' },
    { id: 'backlog', label: '⏰ Backlog Aging', icon: '⚠️' },
  ];

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full pb-16">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
            📊 Advanced Analytics
          </h1>
          <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
            Comprehensive insights and performance metrics
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-2"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline text-xs lg:text-sm">{tab.label.split(' ').slice(1).join(' ')}</span>
                <span className="sm:hidden text-xs">{tab.label.split(' ')[1] || tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </motion.div>

      {/* Resolution Time Analytics */}
      {activeTab === 'resolution' && resolutionData && resolutionData.overall && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
              <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-0.5 sm:mb-1">Average Resolution Time</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{resolutionData.overall.average} days</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
              <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-0.5 sm:mb-1">Minimum Time</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{resolutionData.overall.minimum} days</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
              <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-0.5 sm:mb-1">Maximum Time</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{resolutionData.overall.maximum} days</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
              <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-0.5 sm:mb-1">Total Resolved</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{resolutionData.overall.total}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            {/* By Priority */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl shadow-lg p-4 sm:p-6 border border-purple-100 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎯</span> <span className="break-words">Average Resolution Time by Priority</span>
              </h3>
              {resolutionData.byPriority && Object.keys(resolutionData.byPriority).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={Object.entries(resolutionData.byPriority).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), days: value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #8b5cf6', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="days" radius={[8, 8, 0, 0]}>
                      {Object.keys(resolutionData.byPriority).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-lg">📊</p>
                    <p className="mt-2">No data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* By Category */}
            <div className="bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 rounded-xl shadow-lg p-4 sm:p-6 border border-cyan-100 overflow-x-hidden">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📂</span> <span className="break-words">Average Resolution Time by Category</span>
              </h3>
              {resolutionData.byCategory && Object.keys(resolutionData.byCategory).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={Object.entries(resolutionData.byCategory).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), days: value }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #10b981', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="days" radius={[0, 8, 8, 0]}>
                      {Object.keys(resolutionData.byCategory).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-lg">📊</p>
                    <p className="mt-2">No data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg p-4 sm:p-6 border border-blue-100 overflow-x-hidden">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📈</span> <span className="break-words">Daily Resolution Trend (Last 30 Days)</span>
            </h3>
            {resolutionData.dailyTrend && resolutionData.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resolutionData.dailyTrend} margin={{ left: -20, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #6366f1', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 7, fill: '#818cf8' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg">📈</p>
                  <p className="mt-2">No resolution trend data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Engineer Performance */}
      {activeTab === 'engineer' && engineerData && engineerData.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
              <div className="text-xs sm:text-sm opacity-90 mb-1">Total Engineers</div>
              <div className="text-2xl sm:text-3xl font-bold">{engineerData.summary.totalEngineers}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
              <div className="text-xs sm:text-sm opacity-90 mb-1">Avg Resolution Rate</div>
              <div className="text-2xl sm:text-3xl font-bold">{engineerData.summary.avgResolutionRate}%</div>
            </div>
          </div>

          {/* Engineer Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            {/* Workload Distribution */}
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-xl shadow-lg p-4 sm:p-6 border border-indigo-100 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span> <span className="break-words">Workload Distribution</span>
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={engineerData.engineers.map(e => ({ name: e.name, value: e.assigned }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {engineerData.engineers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #818cf8', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Resolution Rate Comparison */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl shadow-lg p-4 sm:p-6 border border-green-100 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎯</span> <span className="break-words">Resolution Rate Comparison</span>
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={engineerData.engineers.map(e => ({ name: e.name.split(' ')[0], rate: e.resolutionRate }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #10b981', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                    {engineerData.engineers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.resolutionRate >= 60 ? '#10b981' : entry.resolutionRate >= 40 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engineer Performance Table */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>👷</span> Engineer Performance Leaderboard
              </h3>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {engineerData.engineers.map((engineer, index) => (
                    <tr key={engineer.engineerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{engineer.name}</div>
                        <div className="text-sm text-gray-500">{engineer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{engineer.assigned}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{engineer.resolved}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{engineer.inProgress}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{engineer.avgResolutionTime} days</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                engineer.resolutionRate >= 80 ? 'bg-green-500' :
                                engineer.resolutionRate >= 60 ? 'bg-blue-500' :
                                engineer.resolutionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${engineer.resolutionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{engineer.resolutionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {engineerData.engineers.map((engineer, index) => (
                <motion.div
                  key={engineer.engineerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                >
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 break-words">{engineer.name}</div>
                      <div className="text-xs text-gray-500 break-all">{engineer.email}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">Assigned</div>
                      <div className="text-sm font-semibold text-gray-900">{engineer.assigned}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">Resolved</div>
                      <div className="text-sm font-semibold text-green-600">{engineer.resolved}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">In Progress</div>
                      <div className="text-sm font-semibold text-blue-600">{engineer.inProgress}</div>
                    </div>
                  </div>

                  {/* Avg Time */}
                  <div className="mb-3 text-center bg-purple-50 rounded-lg p-2">
                    <span className="text-xs text-gray-500">Avg Resolution Time: </span>
                    <span className="text-sm font-semibold text-gray-900">{engineer.avgResolutionTime} days</span>
                  </div>

                  {/* Resolution Rate Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Resolution Rate</span>
                      <span className="text-sm font-bold text-gray-900">{engineer.resolutionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          engineer.resolutionRate >= 80 ? 'bg-green-500' :
                          engineer.resolutionRate >= 60 ? 'bg-blue-500' :
                          engineer.resolutionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${engineer.resolutionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Analysis */}
      {activeTab === 'status' && statusData && statusData.statusDistribution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full overflow-x-hidden">
            {/* Current Distribution */}
            <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-xl shadow-lg p-4 sm:p-6 border border-violet-100 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span> Current Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(statusData.statusDistribution).map(([name, value]) => ({
                      name: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {Object.keys(statusData.statusDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #a855f7', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statusData.statusDistribution).map(([status, count], index) => (
                <div key={status} className={`bg-gradient-to-br ${
                  status === 'open' ? 'from-yellow-400 to-yellow-500' :
                  status === 'in-progress' ? 'from-blue-400 to-blue-500' :
                  status === 'resolved' ? 'from-green-400 to-green-500' :
                  'from-gray-400 to-gray-500'
                } rounded-xl p-4 sm:p-6 text-white shadow-lg`}>
                  <div className="text-xs sm:text-sm opacity-90 mb-1">{status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                  <div className="text-2xl sm:text-3xl font-bold">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Line */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-xl shadow-lg p-4 sm:p-6 border border-amber-100 overflow-x-hidden w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📈</span> <span className="break-words">Status Trend Over Time</span>
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={statusData.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #f59e0b', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend />
                {Object.keys(statusData.statusDistribution).map((status, index) => (
                  <Line
                    key={status}
                    type="monotone"
                    dataKey={status}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Citizen Analytics */}
      {activeTab === 'citizen' && citizenData && citizenData.topReporters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Reporters */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>🏆</span> Top 10 Active Citizens
              </h3>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Complaints</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {citizenData.topReporters.map((reporter, index) => (
                    <tr key={reporter._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reporter.user.name}</div>
                        <div className="text-sm text-gray-500">{reporter.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{reporter.totalComplaints}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{reporter.resolved}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{reporter.pending}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ((reporter.resolved / reporter.totalComplaints) * 100) >= 80 ? 'bg-green-100 text-green-700' :
                          ((reporter.resolved / reporter.totalComplaints) * 100) >= 50 ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {((reporter.resolved / reporter.totalComplaints) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {citizenData.topReporters.map((reporter, index) => (
                <motion.div
                  key={reporter._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                >
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 break-words">{reporter.user.name}</div>
                      <div className="text-xs text-gray-500 break-all">{reporter.user.email}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">Total</div>
                      <div className="text-sm font-semibold text-gray-900">{reporter.totalComplaints}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">Resolved</div>
                      <div className="text-sm font-semibold text-green-600">{reporter.resolved}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">Pending</div>
                      <div className="text-sm font-semibold text-orange-600">{reporter.pending}</div>
                    </div>
                  </div>

                  {/* Success Rate Badge */}
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block mb-2">Success Rate</span>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      ((reporter.resolved / reporter.totalComplaints) * 100) >= 80 ? 'bg-green-100 text-green-700' :
                      ((reporter.resolved / reporter.totalComplaints) * 100) >= 50 ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {((reporter.resolved / reporter.totalComplaints) * 100).toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Frequency Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full overflow-x-hidden">
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-xl shadow-lg p-4 sm:p-6 border border-pink-100 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span> Complaint Frequency Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={citizenData.frequencyDistribution.map(item => ({ name: item._id, value: item.users }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={40}
                    dataKey="value"
                  >
                    {citizenData.frequencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #ec4899', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 rounded-xl shadow-lg p-4 sm:p-6 border border-indigo-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>⚡</span> Citizen Engagement Score
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={citizenData.topReporters.slice(0, 5).map(r => ({
                  citizen: r.user.name.split(' ')[0],
                  complaints: (r.totalComplaints / Math.max(...citizenData.topReporters.map(x => x.totalComplaints))) * 100,
                  resolved: (r.resolved / Math.max(...citizenData.topReporters.map(x => x.resolved))) * 100,
                  rate: (r.resolved / r.totalComplaints) * 100
                }))}>
                  <PolarGrid stroke="#d1d5db" />
                  <PolarAngleAxis dataKey="citizen" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                  <Radar name="Total Complaints" dataKey="complaints" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Radar name="Resolved" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '2px solid #6366f1', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Area Analysis */}
      {activeTab === 'area' && areaData && areaData.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-4 sm:p-6 text-white shadow-xl border-2 border-teal-300">
              <div className="text-xs sm:text-sm font-semibold opacity-90 mb-1">🗺️ Total Areas</div>
              <div className="text-3xl sm:text-4xl font-black">{areaData.summary.totalAreas}</div>
              <div className="text-xs opacity-75 mt-2">Active Wards</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-xl border-2 border-cyan-300">
              <div className="text-xs sm:text-sm font-semibold opacity-90 mb-1">🎯 Avg Resolution</div>
              <div className="text-3xl sm:text-4xl font-black">{areaData.summary.avgResolutionRate}%</div>
              <div className="text-xs opacity-75 mt-2">Success Rate</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white shadow-xl border-2 border-purple-300">
              <div className="text-xs sm:text-sm font-semibold opacity-90 mb-1">📈 Total Grievances</div>
              <div className="text-3xl sm:text-4xl font-black">{areaData.areas.reduce((sum, a) => sum + a.total, 0)}</div>
              <div className="text-xs opacity-75 mt-2">Across All Areas</div>
            </div>
          </div>

          {/* Area Performance Heatmap with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Heatmap Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-blue-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <span>🔥</span> Area Performance Heatmap
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {areaData.areas.map((area, index) => {
                    const performanceLevel = area.resolutionRate >= 80 ? 'excellent' : area.resolutionRate >= 60 ? 'good' : area.resolutionRate >= 40 ? 'average' : 'poor';
                    const gradientClass = 
                      performanceLevel === 'excellent' ? 'from-green-400 via-emerald-500 to-teal-600' :
                      performanceLevel === 'good' ? 'from-blue-400 via-cyan-500 to-sky-600' :
                      performanceLevel === 'average' ? 'from-yellow-400 via-amber-500 to-orange-600' :
                      'from-red-400 via-rose-500 to-pink-600';
                    
                    return (
                      <div key={area.ward} className={`bg-gradient-to-br ${gradientClass} rounded-xl p-4 sm:p-6 text-white shadow-xl border-2 border-white/30 hover:scale-105 transition-transform cursor-pointer`}>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h4 className="text-lg sm:text-xl font-black">{area.ward}</h4>
                          <span className="text-2xl sm:text-3xl">📍</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                          <div className="bg-white/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
                            <div className="text-xs font-semibold opacity-90">Total</div>
                            <div className="text-xl sm:text-2xl font-black">{area.total}</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
                            <div className="text-xs font-semibold opacity-90">Resolved</div>
                            <div className="text-xl sm:text-2xl font-black">{area.resolved}</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
                            <div className="text-xs font-semibold opacity-90">Pending</div>
                            <div className="text-xl sm:text-2xl font-black">{area.pending}</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
                            <div className="text-xs font-semibold opacity-90">Avg Days</div>
                            <div className="text-xl sm:text-2xl font-black">{area.avgResolutionTime}</div>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-white/40">
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <span className="text-xs sm:text-sm font-bold">SUCCESS RATE</span>
                            <span className="text-2xl sm:text-3xl font-black">{area.resolutionRate}%</span>
                          </div>
                          <div className="h-3 sm:h-4 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-full shadow-lg"
                              style={{ width: `${area.resolutionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Add Performance Insights Card below heatmap */}
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl shadow-2xl p-6 border-2 border-amber-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💡</span> Performance Insights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white/60 rounded-xl p-3 sm:p-4 text-center border border-amber-200">
                    <div className="text-2xl sm:text-3xl mb-2">⚡</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Fastest Response</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-700">
                      {Math.min(...areaData.areas.map(a => a.avgResolutionTime))}d
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 sm:p-4 text-center border border-amber-200">
                    <div className="text-2xl sm:text-3xl mb-2">🎯</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Active Areas</div>
                    <div className="text-xl sm:text-2xl font-black text-blue-700">{areaData.summary.totalAreas}</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 sm:p-4 text-center border border-amber-200">
                    <div className="text-2xl sm:text-3xl mb-2">📈</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Efficiency</div>
                    <div className="text-xl sm:text-2xl font-black text-green-700">{areaData.summary.avgResolutionRate}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats Sidebar - Takes 1 column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl p-4 sm:p-6 text-white shadow-2xl border-2 border-blue-300">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">🏆</div>
                  <div className="text-sm font-semibold opacity-90">Top Performer</div>
                </div>
                <div className="text-2xl font-black text-center">
                  {areaData.areas.reduce((max, area) => area.resolutionRate > max.resolutionRate ? area : max, areaData.areas[0]).ward}
                </div>
                <div className="text-center mt-2">
                  <div className="text-3xl font-black">
                    {areaData.areas.reduce((max, area) => area.resolutionRate > max.resolutionRate ? area : max, areaData.areas[0]).resolutionRate}%
                  </div>
                  <div className="text-xs opacity-75 mt-1">Success Rate</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 rounded-2xl p-6 text-white shadow-2xl border-2 border-red-300">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">⚠️</div>
                  <div className="text-sm font-semibold opacity-90">Needs Attention</div>
                </div>
                <div className="text-2xl font-black text-center">
                  {areaData.areas.reduce((min, area) => area.resolutionRate < min.resolutionRate ? area : min, areaData.areas[0]).ward}
                </div>
                <div className="text-center mt-2">
                  <div className="text-3xl font-black">
                    {areaData.areas.reduce((min, area) => area.resolutionRate < min.resolutionRate ? area : min, areaData.areas[0]).resolutionRate}%
                  </div>
                  <div className="text-xs opacity-75 mt-1">Success Rate</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-2xl border-2 border-green-300">
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-xs font-semibold opacity-90">Overall Stats</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white/20 rounded-lg p-2">
                    <span className="text-xs font-semibold">Total</span>
                    <span className="text-lg font-black">{areaData.areas.reduce((sum, a) => sum + a.total, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/20 rounded-lg p-2">
                    <span className="text-xs font-semibold">Resolved</span>
                    <span className="text-lg font-black">{areaData.areas.reduce((sum, a) => sum + a.resolved, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/20 rounded-lg p-2">
                    <span className="text-xs font-semibold">Pending</span>
                    <span className="text-lg font-black">{areaData.areas.reduce((sum, a) => sum + a.pending, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full overflow-x-hidden">
            {/* Donut Chart */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-indigo-200 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🍯</span> <span className="break-words">Grievance Distribution by Area</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={areaData.areas.map(a => ({ name: a.ward, value: a.total }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    innerRadius={50}
                    dataKey="value"
                  >
                    {areaData.areas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                      border: '2px solid #a855f7', 
                      borderRadius: '12px', 
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '12px'
                    }} 
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Pyramid */}
            <div className="bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-orange-200 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔺</span> <span className="break-words">Resolution Performance Funnel</span>
              </h3>
              <div className="space-y-3">
                {areaData.areas
                  .sort((a, b) => b.resolutionRate - a.resolutionRate)
                  .map((area, index) => {
                    const widthPercent = 100 - (index * (80 / Math.max(areaData.areas.length - 1, 1)));
                    const barColor = area.resolutionRate >= 80 ? 'from-green-300 via-emerald-200 to-teal-300' :
                                    area.resolutionRate >= 60 ? 'from-blue-300 via-cyan-200 to-sky-300' :
                                    area.resolutionRate >= 40 ? 'from-yellow-300 via-amber-200 to-orange-300' :
                                    'from-red-300 via-rose-200 to-pink-300';
                    
                    return (
                      <div key={area.ward} className="flex flex-col items-center">
                        <div 
                          className={`bg-gradient-to-r ${barColor} rounded-xl p-4 text-gray-900 shadow-xl transition-all hover:scale-105 w-full`}
                          style={{ maxWidth: `${widthPercent}%` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-black">{area.ward}</div>
                              <div className="text-xs font-semibold opacity-75 mt-1">
                                {area.resolved} of {area.total} resolved
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="text-2xl font-black text-green-700">{area.resolutionRate}%</div>
                              <div className="text-xs font-semibold bg-black/10 px-2 py-1 rounded mt-1">
                                {area.avgResolutionTime}d avg
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-4 text-center text-gray-700 text-xs font-bold bg-gray-200 rounded-lg p-2">
                ▲ Ranked by Resolution Performance ▲
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {/* Backlog Aging */}
      {activeTab === 'backlog' && backlogData && backlogData.aging && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 rounded-xl p-3 sm:p-4 text-white shadow-xl border-2 border-red-300">
              <div className="text-xs opacity-90 mb-1 font-semibold">Total Backlog</div>
              <div className="text-xl sm:text-2xl font-black">{backlogData.total}</div>
              <div className="text-xs opacity-75 mt-1">⚠️ tickets</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-xl p-3 sm:p-4 text-white shadow-xl border-2 border-green-300">
              <div className="text-xs opacity-90 mb-1 font-semibold">0-24 hours</div>
              <div className="text-xl sm:text-2xl font-black">{backlogData.aging['0-24h']}</div>
              <div className="text-xs opacity-75 mt-1">✅ Fresh</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-xl p-3 sm:p-4 text-white shadow-xl border-2 border-yellow-300">
              <div className="text-xs opacity-90 mb-1 font-semibold">1-3 days</div>
              <div className="text-xl sm:text-2xl font-black">{backlogData.aging['1-3days']}</div>
              <div className="text-xs opacity-75 mt-1">🕒 Recent</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 rounded-xl p-3 sm:p-4 text-white shadow-xl border-2 border-orange-300">
              <div className="text-xs opacity-90 mb-1 font-semibold">3-7 days</div>
              <div className="text-xl sm:text-2xl font-black">{backlogData.aging['3-7days']}</div>
              <div className="text-xs opacity-75 mt-1">⏳ Aging</div>
            </div>
            <div className="bg-gradient-to-br from-red-600 via-rose-700 to-pink-800 rounded-xl p-3 sm:p-4 text-white shadow-xl border-2 border-red-400 animate-pulse">
              <div className="text-xs opacity-90 mb-1 font-semibold">&gt; 7 days</div>
              <div className="text-xl sm:text-2xl font-black">{backlogData.aging['7days+']}</div>
              <div className="text-xs opacity-75 mt-1">🔥 Critical</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full overflow-x-hidden">
            {/* Donut Chart */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-purple-200 overflow-x-hidden w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🍯</span> Aging Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={Object.entries(backlogData.aging).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    innerRadius={50}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#fbbf24" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                      border: '2px solid #ec4899', 
                      borderRadius: '12px', 
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '12px'
                    }} 
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#374151', fontSize: '12px', fontWeight: 'bold' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Pyramid/Funnel Visualization */}
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-indigo-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔺</span> Priority Pyramid
              </h3>
              <div className="space-y-3">
                {[
                  { label: '0-24h', value: backlogData.aging['0-24h'], color: 'from-green-400 to-emerald-500', width: 100 },
                  { label: '1-3 days', value: backlogData.aging['1-3days'], color: 'from-yellow-400 to-amber-500', width: 75 },
                  { label: '3-7 days', value: backlogData.aging['3-7days'], color: 'from-orange-400 to-red-500', width: 50 },
                  { label: '7+ days', value: backlogData.aging['7days+'], color: 'from-red-500 to-rose-600', width: 25 }
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center justify-center">
                    <div 
                      className={`bg-gradient-to-r ${item.color} rounded-lg p-3 text-white shadow-lg flex items-center justify-between transition-all hover:scale-105`}
                      style={{ width: `${item.width}%` }}
                    >
                      <span className="text-sm font-bold">{item.label}</span>
                      <span className="text-xl font-black">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center text-gray-700 text-xs font-semibold bg-gray-200 rounded-lg p-2">
                ▲ Urgency increases as pyramid narrows
              </div>
            </div>
          </div>

          {/* Status Timeline Heatmap */}
          <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-xl shadow-2xl p-6 border-2 border-gray-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span>🔥</span> Backlog Heatmap Overview
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(backlogData.aging).map(([key, value]) => {
                const total = backlogData.total;
                const percentage = ((value / total) * 100).toFixed(1);
                const intensity = value / total;
                const bgColor = 
                  key === '0-24h' ? `rgba(16, 185, 129, ${0.3 + intensity * 0.7})` :
                  key === '1-3days' ? `rgba(251, 191, 36, ${0.3 + intensity * 0.7})` :
                  key === '3-7days' ? `rgba(245, 158, 11, ${0.3 + intensity * 0.7})` :
                  `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;
                
                return (
                  <div 
                    key={key} 
                    className="rounded-lg p-6 text-center border-2 border-gray-300 hover:scale-105 transition-all cursor-pointer shadow-lg"
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="text-gray-800 text-sm font-semibold mb-2">{key}</div>
                    <div className="text-gray-900 text-3xl font-black mb-1">{value}</div>
                    <div className="text-gray-700 text-xs">{percentage}% of total</div>
                    <div className="mt-3 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-700 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default Analytics;
