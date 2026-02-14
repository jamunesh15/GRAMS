import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateReport, getReportHistory, downloadReport, getReportPreview, getRecentReports } from '../../Services/operations/reportsAPI';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const token = localStorage.getItem('token');

  const periods = [
    { value: 'weekly', label: 'Weekly', icon: '📅', description: 'Last 7 days' },
    { value: 'monthly', label: 'Monthly', icon: '📆', description: 'Last 30 days' },
    { value: 'quarterly', label: 'Quarterly', icon: '🗓️', description: 'Last 3 months' },
    { value: 'yearly', label: 'Yearly', icon: '📊', description: 'Last 12 months' },
    { value: 'alltime', label: 'All Time', icon: '♾️', description: 'All records' }
  ];

  useEffect(() => {
    fetchReportHistory();
    fetchRecentReports();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPreview();
    }
  }, [selectedPeriod]);

  const fetchReportHistory = async () => {
    try {
      const response = await getReportHistory(token);
      if (response.data.success) {
        setReportHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report history:', error);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const response = await getRecentReports(token);
      if (response.data.success) {
        setRecentReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching recent reports:', error);
    }
  };

  const fetchPreview = async () => {
    setLoadingPreview(true);
    try {
      const response = await getReportPreview(token, selectedPeriod);
      if (response.data.success) {
        setPreviewData(response.data.data);
        setLastFetchTime(new Date()); 
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      toast.error('Failed to load preview data');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating report with latest data...');
    
    try {
      const response = await generateReport(token, selectedPeriod);
      
      if (response.data.success) {
        toast.success('Report generated successfully with fresh data!', { id: loadingToast });
        
        // Small delay to ensure file is written
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trigger download using period to get the newly generated report
        await downloadReport(token, selectedPeriod);
        
        // Refresh preview to show the data that was just reported
        await fetchPreview();
        
        // Refresh history and recent reports
        fetchReportHistory();
        fetchRecentReports();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (period) => {
    try {
      await downloadReport(token, period);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const handleDownloadReportFile = async (fileName) => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const url = `${baseURL}/reports/download-file/${fileName}`;
      window.open(url, '_blank');
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl mb-8"
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl">📄</span>
          <div>
            <h1 className="text-4xl font-bold">Reports & Analytics</h1>
            <p className="text-blue-100 mt-2">Generate comprehensive reports with detailed insights</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Report Generation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Period Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">📅</span>
              Select Report Period
            </h2>

            {/* Info Banner */}
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-semibold mb-1">Report Period Filtering</p>
                  <p className="text-xs text-blue-800">
                    Reports show only grievances <strong>created within</strong> the selected period. 
                    <br />For example: "Weekly" shows grievances from the last 7 days. 
                    <br />Select <strong>"All Time"</strong> to match dashboard totals (all records).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedPeriod === period.value
                      ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-3">{period.icon}</div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-800">{period.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{period.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span className="text-2xl">⬇️</span>
                  Generate & Download Report
                </>
              )}
            </button>
          </motion.div>

          {/* Preview Section */}
          {previewData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  Report Preview
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-semibold text-green-700">Live Data</span>
                  </div>
                  <button
                    onClick={fetchPreview}
                    disabled={loadingPreview}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh data"
                  >
                    <span className={`text-sm ${loadingPreview ? 'animate-spin' : ''}`}>🔄</span>
                    <span className="text-xs font-semibold text-blue-700">Refresh</span>
                  </button>
                </div>
              </div>

              {lastFetchTime && (
                <div className="mb-4 text-xs text-gray-500 flex items-center gap-2">
                  <span>⏰</span>
                  <span>Last updated: {lastFetchTime.toLocaleTimeString()}</span>
                </div>
              )}

              {loadingPreview ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }} className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-4 rounded-xl text-white shadow-xl relative overflow-hidden">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
                      <div className="relative z-10">
                        <div className="text-blue-100 text-sm font-medium mb-1">Total Grievances</div>
                        <div className="text-3xl font-extrabold">{previewData.totalGrievances}</div>
                        <div className="mt-2 h-1 bg-blue-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5 }} className="h-full bg-white" /></div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }} className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-4 rounded-xl text-white shadow-xl relative overflow-hidden">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 0.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
                      <div className="relative z-10">
                        <div className="text-green-100 text-sm font-medium mb-1">Resolved</div>
                        <div className="text-3xl font-extrabold">{previewData.resolved}</div>
                        <div className="mt-2 h-1 bg-green-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: previewData.totalGrievances > 0 ? `${(previewData.resolved / previewData.totalGrievances) * 100}%` : '0%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-white" /></div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)' }} className="bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 p-4 rounded-xl text-white shadow-xl relative overflow-hidden">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
                      <div className="relative z-10">
                        <div className="text-yellow-100 text-sm font-medium mb-1">In Progress</div>
                        <div className="text-3xl font-extrabold">{previewData.inProgress}</div>
                        <div className="mt-2 h-1 bg-yellow-300 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: previewData.totalGrievances > 0 ? `${(previewData.inProgress / previewData.totalGrievances) * 100}%` : '0%' }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-white" /></div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }} className="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 p-4 rounded-xl text-white shadow-xl relative overflow-hidden">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
                      <div className="relative z-10">
                        <div className="text-purple-100 text-sm font-medium mb-1">Resolution Rate</div>
                        <div className="text-3xl font-extrabold">{previewData.resolutionRate}%</div>
                        <div className="mt-2 h-1 bg-purple-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${previewData.resolutionRate}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-white" /></div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">⏱️</span>
                        <span className="font-semibold text-gray-700">Avg Resolution Time</span>
                      </div>
                      <div className="text-2xl font-black text-gray-900">{previewData.avgResolutionTime} days</div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">✅</span>
                        <span className="font-semibold text-gray-700">New Users</span>
                      </div>
                      <div className="text-2xl font-black text-gray-900">{previewData.totalUsers}</div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="mt-8 space-y-6">
                    {/* Status Distribution Pie Chart */}
                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Status Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Resolved', value: previewData.resolved, color: '#10b981' },
                              { name: 'In Progress', value: previewData.inProgress, color: '#f59e0b' },
                              { name: 'Pending', value: previewData.pending || 0, color: '#3b82f6' },
                              { name: 'Blocked', value: previewData.blocked || 0, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Resolved', value: previewData.resolved, color: '#10b981' },
                              { name: 'In Progress', value: previewData.inProgress, color: '#f59e0b' },
                              { name: 'Pending', value: previewData.pending || 0, color: '#3b82f6' },
                              { name: 'Blocked', value: previewData.blocked || 0, color: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Category Breakdown Bar Chart */}
                    {previewData.categoryStats && Object.keys(previewData.categoryStats).length > 0 && (
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl">📈</span>
                          Category Breakdown
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={Object.entries(previewData.categoryStats).map(([name, value]) => ({
                              name,
                              grievances: value
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="grievances" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Priority Distribution */}
                    {previewData.priorityStats && Object.keys(previewData.priorityStats).length > 0 && (
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl">⚡</span>
                          Priority Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={Object.entries(previewData.priorityStats).map(([name, value]) => ({
                                name: name.charAt(0).toUpperCase() + name.slice(1),
                                value,
                                color: name === 'high' ? '#ef4444' : name === 'medium' ? '#f59e0b' : '#10b981'
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(previewData.priorityStats).map(([name], index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={name === 'high' ? '#ef4444' : name === 'medium' ? '#f59e0b' : '#10b981'}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Area Distribution */}
                    {previewData.areaStats && Object.keys(previewData.areaStats).length > 0 && (
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl">🗺️</span>
                          Area/Ward Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={Object.entries(previewData.areaStats)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 10)
                              .map(([name, value]) => ({
                                name,
                                grievances: value
                              }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="grievances" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Engineer Performance */}
                    {previewData.engineerPerformance && previewData.engineerPerformance.length > 0 && (
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl">👷</span>
                          Engineer Performance
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={previewData.engineerPerformance
                              .sort((a, b) => b.resolved - a.resolved)
                              .slice(0, 10)}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="assigned" fill="#6366f1" name="Assigned" />
                            <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Panel - Report History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 max-h-[600px] overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2">
            <span className="text-2xl">📄</span>
            Recent Reports
          </h2>

          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">⚠️</span>
              <p className="text-gray-500 mt-3 text-sm">No reports generated yet</p>
              <p className="text-xs text-gray-400 mt-1">Generate your first report to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReports.map((report, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 capitalize text-sm">{report.period} Report</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(report.generatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(report.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadReportFile(report.fileName)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      title="Download Report"
                    >
                      <span className="text-xl">⬇️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 What's Included in Reports?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-800">Executive Summary</p>
              <p className="text-sm text-gray-600">Overall statistics and key metrics</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-800">Category Analysis</p>
              <p className="text-sm text-gray-600">Breakdown by grievance categories</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-800">Area Distribution</p>
              <p className="text-sm text-gray-600">Ward-wise performance metrics</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-800">Engineer Performance</p>
              <p className="text-sm text-gray-600">Individual engineer statistics</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-800">Resolution Metrics</p>
              <p className="text-sm text-gray-600">Average times and trends</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-800">Priority Analysis</p>
              <p className="text-sm text-gray-600">Distribution by priority levels</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
