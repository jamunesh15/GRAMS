import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getAllGrievancesAdmin, getEngineers, assignGrievance, updateGrievanceStatus } from '../../Services/operations/adminAPI';

export default function GrievancesManagement() {
  const [grievances, setGrievances] = useState([]);
  const [allGrievances, setAllGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
  });
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,  
    inProgress: 0,
    resolved: 0,
    pending: 0,
    openPercent: 0,
    inProgressPercent: 0,
    resolvedPercent: 0,
    pendingPercent: 0,
  });

  useEffect(() => {
    fetchGrievances();
    fetchEngineers();
  }, [filters]);

  const fetchEngineers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getEngineers(token);
      setEngineers(data);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    }
  };

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all grievances for stats
      const allData = await getAllGrievancesAdmin(token, {});
      
      // Sort by most recent first
      const sortedData = allData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllGrievances(sortedData);
      
      // Calculate stats
      const total = sortedData.length;
      const open = sortedData.filter(g => g.status === 'open').length;
      const inProgress = sortedData.filter(g => g.status === 'in-progress').length;
      // Count both 'resolved' (pending admin review) and 'closed' (confirmed) as resolved
      const resolved = sortedData.filter(g => g.status === 'resolved' || g.status === 'closed').length;
      const pending = open + inProgress;
      
      setStats({
        total,
        open,
        inProgress,
        resolved,
        pending,
        openPercent: total > 0 ? ((open / total) * 100).toFixed(1) : 0,
        inProgressPercent: total > 0 ? ((inProgress / total) * 100).toFixed(1) : 0,
        resolvedPercent: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0,
        pendingPercent: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
      });
      
      // Apply filters for display
      let filtered = sortedData;
      if (filters.status !== 'all') {
        filtered = filtered.filter(g => g.status === filters.status);
      }
      if (filters.category !== 'all') {
        filtered = filtered.filter(g => g.category === filters.category);
      }
      if (filters.priority !== 'all') {
        filtered = filtered.filter(g => g.priority === filters.priority);
      }
      
      setGrievances(filtered);
    } catch (error) {
      console.error('Error fetching grievances:', error);
      toast.error('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-orange-100 text-orange-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-gray-100 text-gray-700',
      'rejected': 'bg-red-100 text-red-700',
      'blocked': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-orange-100 text-orange-700',
      'critical': 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAssignEngineer = async () => {
    if (!selectedEngineerId) {
      toast.error('Please select an engineer');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        grievanceId: selectedGrievance._id, 
        userId: selectedEngineerId 
      };
      
      // Add budget if provided
      if (budgetAmount && parseFloat(budgetAmount) > 0) {
        payload.budget = parseFloat(budgetAmount);
      }
      
      await assignGrievance(payload, token);
      setShowAssignModal(false);
      setSelectedEngineerId('');
      setBudgetAmount('');
      fetchGrievances();
      toast.success('Engineer assigned successfully!');
    } catch (error) {
      console.error('Error assigning engineer:', error);
      toast.error('Failed to assign engineer');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus && !selectedPriority) {
      toast.error('Please select status or priority to update');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const updateData = { grievanceId: selectedGrievance._id };
      if (selectedStatus) updateData.status = selectedStatus;
      if (selectedPriority) updateData.priority = selectedPriority;
      
      await updateGrievanceStatus(updateData, token);
      setShowStatusModal(false);
      setSelectedStatus('');
      setSelectedPriority('');
      fetchGrievances();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100"
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
            📋
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-600 font-medium text-lg"
          >
            Loading grievances...
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/30 pb-10"
    >
      {/* Stats Cards */}
      <div className="mb-4 sm:mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xl sm:text-3xl">📊</span>
                <span className="text-2xl sm:text-4xl font-bold">{stats.total}</span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm font-semibold">Total</p>
              <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1">All submissions</p>
            </div>
          </motion.div>

          {/* Open */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xl sm:text-3xl">🔴</span>
                <div className="text-right">
                  <p className="text-2xl sm:text-4xl font-bold">{stats.open}</p>
                  <p className="text-[10px] sm:text-xs text-white/80">{stats.openPercent}%</p>
                </div>
              </div>
              <p className="text-white/90 text-xs sm:text-sm font-semibold">Open</p>
              <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.openPercent}%` }}></div>
              </div>
            </div>
          </motion.div>

          {/* In Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xl sm:text-3xl">⚙️</span>
                <div className="text-right">
                  <p className="text-2xl sm:text-4xl font-bold">{stats.inProgress}</p>
                  <p className="text-[10px] sm:text-xs text-white/80">{stats.inProgressPercent}%</p>
                </div>
              </div>
              <p className="text-white/90 text-xs sm:text-sm font-semibold">In Progress</p>
              <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.inProgressPercent}%` }}></div>
              </div>
            </div>
          </motion.div>

          {/* Resolved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xl sm:text-3xl">✅</span>
                <div className="text-right">
                  <p className="text-2xl sm:text-4xl font-bold">{stats.resolved}</p>
                  <p className="text-[10px] sm:text-xs text-white/80">{stats.resolvedPercent}%</p>
                </div>
              </div>
              <p className="text-white/90 text-xs sm:text-sm font-semibold">Resolved</p>
              <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.resolvedPercent}%` }}></div>
              </div>
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xl sm:text-3xl">⏳</span>
                <div className="text-right">
                  <p className="text-2xl sm:text-4xl font-bold">{stats.pending}</p>
                  <p className="text-[10px] sm:text-xs text-white/80">{stats.pendingPercent}%</p>
                </div>
              </div>
              <p className="text-white/90 text-xs sm:text-sm font-semibold">Pending</p>
              <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.pendingPercent}%` }}></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Grievances Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track all submitted grievances</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <p className="text-xs text-gray-500 font-medium">Showing</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {grievances.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-green-600 transition-colors">
              📊 Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-green-600 transition-colors">
              🏷️ Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300"
            >
              <option value="all">All Categories</option>
              <option value="water">Water</option>
              <option value="waste">Waste Management</option>
              <option value="roads">Roads</option>
              <option value="electric">Electric</option>
              <option value="administrative">Administrative</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="sanitation">Sanitation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-green-600 transition-colors">
              🎯 Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grievances Table - Desktop */}
      <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold">Tracking ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Title</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Category</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Submitted By</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grievances.length > 0 ? (
                grievances.map((grievance, index) => (
                  <tr
                    key={grievance._id}
                    className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all duration-200 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedGrievance(grievance)}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-blue-600 font-semibold group-hover:text-blue-700">
                      {grievance.trackingId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium max-w-xs truncate group-hover:text-gray-900">
                      {grievance.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="capitalize text-gray-700 font-medium">{grievance.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${getPriorityColor(grievance.priority)} shadow-sm`}>
                        {grievance.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(grievance.status)} shadow-sm whitespace-nowrap`}>
                        {grievance.status === 'in-progress' ? 'In-Progress' : grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>
                        <p className="font-semibold">{grievance.userId?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{grievance.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {formatDate(grievance.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGrievance(grievance);
                        }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-6xl mb-4 opacity-50">📋</div>
                      <p className="text-lg font-semibold text-gray-600">No grievances found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grievances Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {grievances.length > 0 ? (
          grievances.map((grievance, index) => (
            <motion.div
              key={grievance._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedGrievance(grievance)}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Tracking ID Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
                  {grievance.trackingId}
                </span>
                <span className="text-xs text-gray-500">{formatDate(grievance.createdAt)}</span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-800 mb-3 text-sm line-clamp-2">{grievance.title}</h3>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-xs text-purple-600 font-semibold mb-1">Category</p>
                  <p className="text-xs font-bold text-gray-800 capitalize">{grievance.category}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="text-xs text-amber-600 font-semibold mb-1">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold capitalize ${getPriorityColor(grievance.priority)}`}>
                    {grievance.priority}
                  </span>
                </div>
              </div>

              {/* Status and Submitted By */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                  <p className="text-xs font-semibold text-gray-800">{grievance.userId?.name || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(grievance.status)} whitespace-nowrap`}>
                  {grievance.status === 'in-progress' ? 'In-Progress' : grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}
                </span>
              </div>

              {/* View Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGrievance(grievance);
                }}
                className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all"
              >
                View Details
              </button>
            </motion.div>
          ))
        ) : (
          <div className="bg-white/90 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4 opacity-50">📋</div>
            <p className="text-lg font-semibold text-gray-600">No grievances found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Grievance Detail Modal */}
      {selectedGrievance && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedGrievance(null)}
        >
          <div
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl max-w-4xl w-full max-h-[85vh] shadow-2xl transform transition-all duration-300 scale-100 animate-scale-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white p-6 rounded-t-3xl flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span>📄</span>
                  Grievance Details
                </h3>
                <button
                  onClick={() => setSelectedGrievance(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:rotate-90"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <p className="font-mono text-sm opacity-90 bg-white/10 px-3 py-1.5 rounded-lg inline-block">
                {selectedGrievance.trackingId}
              </p>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-5 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Title & Description */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📝</span>
                  {selectedGrievance.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{selectedGrievance.description}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <p className="text-xs text-purple-600 font-semibold mb-1.5">Category</p>
                  <p className="font-bold text-gray-800 capitalize text-lg">{selectedGrievance.category}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-600 font-semibold mb-1.5">Priority</p>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold capitalize ${getPriorityColor(selectedGrievance.priority)} shadow-sm`}>
                    {selectedGrievance.priority}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold mb-1.5">Status</p>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold capitalize ${getStatusColor(selectedGrievance.status)} shadow-sm`}>
                    {selectedGrievance.status}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 font-semibold mb-1.5">Submitted By</p>
                  <p className="font-bold text-gray-800">{selectedGrievance.userId?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{selectedGrievance.userEmail}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                  <p className="text-xs text-indigo-600 font-semibold mb-1.5">Created Date</p>
                  <p className="font-bold text-gray-800">{formatDate(selectedGrievance.createdAt)}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-4 rounded-xl border-2 border-rose-300 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">⏰</span>
                    <p className="text-xs text-white font-bold uppercase">Days Open</p>
                  </div>
                  <p className="font-bold text-white text-2xl">{selectedGrievance.daysOpen || 1}</p>
                  <p className="text-xs text-rose-100 mt-1">days active</p>
                </div>
              </div>

              {/* Assigned To */}
              {selectedGrievance.assignedTo && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-2xl text-white shadow-lg">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <span>👤</span>
                    Assigned Engineer:
                  </p>
                  <p className="font-bold text-lg">{selectedGrievance.assignedTo.name}</p>
                  <p className="text-sm opacity-90 mt-1">{selectedGrievance.assignedTo.email}</p>
                </div>
              )}

              {/* Attachments */}
              {selectedGrievance.attachments && selectedGrievance.attachments.length > 0 && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span>📎</span>
                    Attachments ({selectedGrievance.attachments.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedGrievance.attachments.map((attachment, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-xl">
                        {attachment.type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt={`Attachment ${idx + 1}`}
                            className="w-full h-40 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <video
                            src={attachment.url}
                            className="w-full h-40 object-cover rounded-xl shadow-md"
                            controls
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex-shrink-0">
              <button 
                onClick={() => {
                  setShowAssignModal(true);
                  setSelectedStatus(selectedGrievance.status);
                  setSelectedPriority(selectedGrievance.priority);
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                👤 Assign Engineer
              </button>
              <button 
                onClick={() => {
                  setShowStatusModal(true);
                  setSelectedStatus(selectedGrievance.status);
                  setSelectedPriority(selectedGrievance.priority);
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                ⚡ Update Status
              </button>
              <button 
                onClick={() => setSelectedGrievance(null)}
                className="px-6 py-3.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Engineer Modal */}
      {showAssignModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-300 scale-100 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Assign Engineer</h3>
              <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                {selectedGrievance.trackingId}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Select Engineer</label>
              <select
                value={selectedEngineerId}
                onChange={(e) => setSelectedEngineerId(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-300 font-medium"
              >
                <option value="">-- Choose Engineer --</option>
                {engineers.map((engineer) => (
                  <option key={engineer._id} value={engineer._id}>
                    {engineer.name} ({engineer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Budget Allocation (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="100"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300 font-medium"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Engineer can request additional funds if needed</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssignEngineer}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEngineerId('');
                  setBudgetAmount('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 border-2 border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-300 scale-100 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Update Grievance</h3>
              <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                {selectedGrievance.trackingId}
              </p>
            </div>
            
            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300 font-medium"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-300 font-medium"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus('');
                  setSelectedPriority('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 border-2 border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
