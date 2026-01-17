import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getEscalatedGrievances, escalateGrievance, deEscalateGrievance, bulkEscalateGrievances } from '../../Services/operations/escalationAPI';
import { getAllGrievancesAdmin } from '../../Services/operations/adminAPI';

export default function EscalationsManagement() {
  const [escalatedGrievances, setEscalatedGrievances] = useState([]);
  const [allGrievances, setAllGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    sortBy: 'daysOpen',
  });
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    blocked: 0,
    avgDaysOpen: 0,
  });
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showDeEscalateModal, setShowDeEscalateModal] = useState(false);
  const [showBulkEscalateModal, setShowBulkEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationPriority, setEscalationPriority] = useState('critical');
  const [selectedGrievances, setSelectedGrievances] = useState([]);

  useEffect(() => {
    fetchEscalations();
    fetchAllGrievances();
  }, [filters]);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const response = await getEscalatedGrievances(token, params);
      
      setEscalatedGrievances(response.data || []);
      setStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching escalations:', error);
      toast.error('Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGrievances = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getAllGrievancesAdmin(token, {});
      console.log('All grievances fetched:', data.length);
      // Filter only non-escalated grievances
      const nonEscalated = data.filter(g => !g.isEscalated);
      console.log('Non-escalated grievances:', nonEscalated.length);
      console.log('Sample grievance:', nonEscalated[0]);
      setAllGrievances(nonEscalated);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      toast.error('Please provide a reason for escalation');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await escalateGrievance({
        grievanceId: selectedGrievance._id,
        reason: escalationReason,
        priority: escalationPriority,
      }, token);
      
      setShowEscalateModal(false);
      setEscalationReason('');
      setEscalationPriority('critical');
      fetchEscalations();
      fetchAllGrievances();
    } catch (error) {
      console.error('Error escalating:', error);
    }
  };

  const handleDeEscalate = async () => {
    if (!escalationReason.trim()) {
      toast.error('Please provide a reason for de-escalation');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await deEscalateGrievance({
        grievanceId: selectedGrievance._id,
        reason: escalationReason,
      }, token);
      
      setShowDeEscalateModal(false);
      setEscalationReason('');
      fetchEscalations();
      fetchAllGrievances();
    } catch (error) {
      console.error('Error de-escalating:', error);
    }
  };

  const handleBulkEscalate = async () => {
    if (selectedGrievances.length === 0) {
      toast.error('Please select grievances to escalate');
      return;
    }

    if (!escalationReason.trim()) {
      toast.error('Please provide a reason for bulk escalation');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await bulkEscalateGrievances({
        grievanceIds: selectedGrievances,
        reason: escalationReason,
        priority: escalationPriority,
      }, token);
      
      setShowBulkEscalateModal(false);
      setEscalationReason('');
      setSelectedGrievances([]);
      fetchEscalations();
      fetchAllGrievances();
    } catch (error) {
      console.error('Error bulk escalating:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-gradient-to-r from-orange-400 to-orange-500 text-white border border-orange-300',
      'in-progress': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-blue-400',
      'resolved': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400',
      'closed': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border border-gray-400',
      'rejected': 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400',
      'blocked': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border border-purple-400',
    };
    return colors[status] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border border-gray-400';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-red-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-red-500 border-r-red-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading escalations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 pb-10">
      {/* Stats Cards */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Total Escalated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-rose-700 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🚨</span>
                <span className="text-4xl font-bold">{stats.total}</span>
              </div>
              <p className="text-white/90 text-sm font-semibold">Total Escalated</p>
              <p className="text-white/60 text-xs mt-1">Urgent cases</p>
            </div>
          </motion.div>

          {/* Critical */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-red-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">⚠️</span>
                <div className="text-right">
                  <p className="text-4xl font-bold">{stats.critical}</p>
                </div>
              </div>
              <p className="text-white/90 text-sm font-semibold">Critical Priority</p>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out" 
                     style={{ width: stats.total > 0 ? `${(stats.critical / stats.total) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </motion.div>

          {/* High */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🔥</span>
                <div className="text-right">
                  <p className="text-4xl font-bold">{stats.high}</p>
                </div>
              </div>
              <p className="text-white/90 text-sm font-semibold">High Priority</p>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out" 
                     style={{ width: stats.total > 0 ? `${(stats.high / stats.total) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </motion.div>

          {/* Avg Days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">⏱️</span>
                <div className="text-right">
                  <p className="text-4xl font-bold">{stats.avgDaysOpen}</p>
                </div>
              </div>
              <p className="text-white/90 text-sm font-semibold">Avg Days Open</p>
              <p className="text-white/60 text-xs mt-1">Average resolution time</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Escalations Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage escalated grievances</p>
        </div>
        <button
          onClick={() => setShowBulkEscalateModal(true)}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          ⚡ Bulk Escalate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-red-600 transition-colors">
              📊 Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white hover:border-gray-300"
            >
              <option value="all">All Status</option>
              <option value="blocked">Blocked</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-red-600 transition-colors">
              🎯 Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white hover:border-gray-300"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-red-600 transition-colors">
              🔄 Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white hover:border-gray-300"
            >
              <option value="daysOpen">Days Open</option>
              <option value="recent">Recently Escalated</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Escalations Table - Desktop View */}
      <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold">Tracking ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Title</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Days Open</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Escalated On</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {escalatedGrievances.length > 0 ? (
                escalatedGrievances.map((grievance, index) => (
                  <tr
                    key={grievance._id}
                    className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-orange-50/50 transition-all duration-200 group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-red-600 font-semibold group-hover:text-red-700">
                      {grievance.trackingId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium max-w-xs truncate group-hover:text-gray-900">
                      {grievance.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${getPriorityColor(grievance.priority)} shadow-sm`}>
                        {grievance.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap inline-block ${getStatusColor(grievance.status)} shadow-sm`}>
                        {grievance.status === 'in-progress' ? 'In Progress' : grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⏰</span>
                        <span className={`px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm ${
                          grievance.daysOpen > 30 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                          grievance.daysOpen > 14 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                          grievance.daysOpen > 7 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white' :
                          'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        }`}>
                          {grievance.daysOpen || 0} days
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {formatDate(grievance.escalatedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedGrievance(grievance);
                          setShowDeEscalateModal(true);
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      >
                        De-escalate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-6xl mb-4 opacity-50">🎯</div>
                      <p className="text-lg font-semibold text-gray-600">No escalated grievances found</p>
                      <p className="text-sm text-gray-400 mt-1">All grievances are on track!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalations Cards - Mobile View */}
      <div className="lg:hidden space-y-4">
        {escalatedGrievances.length > 0 ? (
          escalatedGrievances.map((grievance, index) => (
            <motion.div
              key={grievance._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between">
                <span className="font-mono text-sm font-bold">{grievance.trackingId}</span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                  {formatDate(grievance.escalatedAt)}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-gray-800 font-semibold text-base line-clamp-2 leading-snug">
                  {grievance.title}
                </h3>

                {/* Priority & Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Priority</p>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize inline-block ${getPriorityColor(grievance.priority)} shadow-sm`}>
                      {grievance.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${getStatusColor(grievance.status)} shadow-sm`}>
                      {grievance.status === 'in-progress' ? 'In Progress' : grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Days Open */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <span className="text-xs text-gray-600 font-semibold">Days Open</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg font-bold text-xs shadow-sm ${
                    grievance.daysOpen > 30 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                    grievance.daysOpen > 14 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                    grievance.daysOpen > 7 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white' :
                    'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                  }`}>
                    {grievance.daysOpen || 0} days
                  </span>
                </div>

                {/* De-escalate Button */}
                <button
                  onClick={() => {
                    setSelectedGrievance(grievance);
                    setShowDeEscalateModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  De-escalate
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl mb-4 opacity-50">🎯</div>
              <p className="text-lg font-semibold text-gray-600">No escalated grievances found</p>
              <p className="text-sm text-gray-400 mt-1">All grievances are on track!</p>
            </div>
          </div>
        )}
      </div>

      {/* De-Escalate Modal */}
      {showDeEscalateModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-300 scale-100 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">De-escalate Grievance</h3>
              <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                {selectedGrievance.trackingId}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Reason for De-escalation</label>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                rows="4"
                placeholder="Provide a reason for de-escalating this grievance..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeEscalate}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowDeEscalateModal(false);
                  setEscalationReason('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 border-2 border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Escalate Modal */}
      {showBulkEscalateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl transform transition-all duration-300 scale-100 animate-scale-in flex flex-col">
            <div className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-600 text-white p-6 rounded-t-3xl flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span>⚡</span>
                  Bulk Escalate Grievances
                </h3>
                <button
                  onClick={() => {
                    setShowBulkEscalateModal(false);
                    setSelectedGrievances([]);
                    setEscalationReason('');
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:rotate-90"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-grow scrollbar-thin">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Grievances to Escalate</label>
                <div className="max-h-60 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 space-y-2">
                  {allGrievances.map((grievance) => (
                    <label
                      key={grievance._id}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGrievances.includes(grievance._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGrievances([...selectedGrievances, grievance._id]);
                          } else {
                            setSelectedGrievances(selectedGrievances.filter(id => id !== grievance._id));
                          }
                        }}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-sm text-gray-800">{grievance.trackingId}</p>
                        <p className="text-xs text-gray-500 truncate">{grievance.title}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{grievance.daysOpen || 0} days</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Selected: {selectedGrievances.length} grievances</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Priority Level</label>
                <select
                  value={escalationPriority}
                  onChange={(e) => setEscalationPriority(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Escalation Reason</label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows="4"
                  placeholder="Provide a reason for bulk escalation..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex-shrink-0">
              <button
                onClick={handleBulkEscalate}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Escalate {selectedGrievances.length} Grievances
              </button>
              <button
                onClick={() => {
                  setShowBulkEscalateModal(false);
                  setSelectedGrievances([]);
                  setEscalationReason('');
                }}
                className="px-6 py-3.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all duration-200 border-2 border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
