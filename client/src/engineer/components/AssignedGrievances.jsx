import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { engineerEndpoints } from '../../Services/apis';
import GrievanceDetailModal from './GrievanceDetailModal';
import TaskCompletionForm from './TaskCompletionForm';

export default function AssignedGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    urgent: 0,
    completed: 0
  });
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const { user } = useAuthStore();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAssignedGrievances();
    fetchDashboardStats();
    
    // Refresh grievances every 10 seconds to show updated budget
    // But don't refresh if completion form is open to avoid re-renders
    const refreshInterval = setInterval(() => {
      if (!showCompletionForm) {
        fetchAssignedGrievances();
      }
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [showCompletionForm]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(engineerEndpoints.GET_ENGINEER_DASHBOARD_STATS_API, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAssignedGrievances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(engineerEndpoints.GET_MY_ASSIGNED_GRIEVANCES_API, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Fetched grievances:', response.data);
      if (response.data.success) {
        console.log('All grievances with budgets:', response.data.data.map(g => ({ 
          id: g._id, 
          trackingId: g.trackingId, 
          status: g.status,
          budget: g.budget 
        })));
        setGrievances(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch assigned grievances');
      }
    } catch (error) {
      console.error('Error fetching grievances:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch assigned grievances');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (grievanceId) => {
    setSelectedGrievanceId(grievanceId);
    setShowDetailModal(true);
  };

  const handleCompleteTask = (grievance) => {
    setSelectedGrievance(grievance);
    setShowCompletionForm(true);
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const assignedDate = new Date(date);
    const diffMs = now - assignedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const handleStartWork = async (grievanceId) => {
    try {
      const response = await fetch(engineerEndpoints.START_WORK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ grievanceId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Work started! Task moved to Active Tasks.');
        fetchAssignedGrievances();
        fetchDashboardStats();
      } else {
        toast.error(data.message || 'Failed to start work');
      }
    } catch (error) {
      console.error('Error starting work:', error);
      toast.error('Failed to start work');
    }
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedGrievanceId(null);
  };

  const handleCompletionFormClose = () => {
    setShowCompletionForm(false);
    setSelectedGrievance(null);
  };

  const handleUpdate = () => {
    fetchAssignedGrievances();
    fetchDashboardStats();
  };

  const filteredGrievances = grievances.filter(g => {
    if (filter === 'all') return true;
    // Show both pending and assigned in 'assigned' filter
    if (filter === 'assigned') return g.status === 'assigned' || g.status === 'pending';
    return g.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      assigned: 'bg-blue-100 text-blue-700 border-blue-300',
      'in-progress': 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      water: '💧',
      roads: '🛣️',
      electric: '⚡',
      waste: '🗑️',
      healthcare: '🏥',
      education: '🎓',
      sanitation: '🚿',
      administrative: '📋',
      other: '📌'
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8 shadow-lg border border-indigo-100">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading assigned grievances...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div className="space-y-4 sm:space-y-6 hide-scrollbar">
        {/* Header with Stats */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">📋</span>
              Assigned Grievances
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  fetchAssignedGrievances();
                  fetchDashboardStats();
                  toast.success('Budget data refreshed');
                }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2"
                title="Refresh budget and grievance data"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {['all', 'pending', 'in-progress'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 transform ${
                    filter === f
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-blue-200 transform hover:scale-105 transition-all duration-200 shadow-md">
              <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-1">Total Assigned</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-800">{stats.totalAssigned}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-yellow-200 transform hover:scale-105 transition-all duration-200 shadow-md">
              <p className="text-xs sm:text-sm text-yellow-700 font-semibold mb-1">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-purple-200 transform hover:scale-105 transition-all duration-200 shadow-md">
              <p className="text-xs sm:text-sm text-purple-700 font-semibold mb-1">In Progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-800">{stats.inProgress}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-green-200 transform hover:scale-105 transition-all duration-200 shadow-md">
              <p className="text-xs sm:text-sm text-green-700 font-semibold mb-1">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-800">{stats.completed}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-orange-200 transform hover:scale-105 transition-all duration-200 shadow-md col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-1">Urgent</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-800">{stats.urgent}</p>
            </div>
          </div>
        </div>

        {/* Grievances List */}
        <div className="space-y-4">
          {filteredGrievances.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-12 shadow-md text-center border border-blue-100">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-gray-700 text-lg font-semibold">No grievances found</p>
              <p className="text-gray-500 text-sm mt-2">
                {filter === 'all' ? 'You have no assigned grievances' : `No ${filter} grievances`}
              </p>
            </div>
          ) : (
            filteredGrievances.map((grievance, index) => (
              <motion.div
                key={grievance._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-indigo-100 transform hover:scale-[1.02] backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">
                        {getCategoryIcon(grievance.category)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 break-words">{grievance.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          ID: {grievance.trackingId} • {new Date(grievance.createdAt).toLocaleDateString()}
                        </p>
                        {grievance.assignedAt && (
                          <p className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Assigned {getTimeAgo(grievance.assignedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{grievance.description}</p>

                    {/* Location Preview */}
                    {grievance.location && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        📍 <span className="font-medium">Location:</span> {grievance.location}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(grievance.status)}`}>
                        {grievance.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(grievance.priority)}`}>
                        {grievance.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {grievance.category}
                      </span>
                    </div>

                    {/* Citizen Info */}
                    {grievance.userId && (
                      <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        <span className="font-medium">Reported by:</span> {grievance.userId.name}
                      </div>
                    )}

                    {/* Budget Info */}
                    <div className="mt-2 sm:mt-3">
                      {grievance.budget && grievance.budget.allocated > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold rounded-lg border border-green-300 flex items-center gap-1.5 text-xs sm:text-sm">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ₹{grievance.budget.allocated.toLocaleString()} Allocated
                          </span>
                        </div>
                      ) : (
                        <span className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 font-medium rounded-lg border border-gray-300 text-xs sm:text-sm inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Budget Not Allocated Yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col gap-2 mt-3 lg:mt-0">
                    <button
                      onClick={() => handleViewDetails(grievance._id)}
                      className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">View</span> Details
                    </button>
                    
                    {/* Start Work Button - Show only for assigned/pending tasks */}
                    {(grievance.status === 'assigned' || grievance.status === 'pending') && (
                      <button
                        onClick={() => handleStartWork(grievance._id)}
                        className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-pink-600 transition text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg"
                      >
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Start Work
                      </button>
                    )}
                    
                    {/* Complete Task Button - Show only for in-progress tasks */}
                    {grievance.status === 'in-progress' && (
                      <button
                        onClick={() => handleCompleteTask(grievance)}
                        className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <GrievanceDetailModal
        grievanceId={selectedGrievanceId}
        isOpen={showDetailModal}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />

      {/* Task Completion Form Modal */}
      {showCompletionForm && selectedGrievance && (
        <TaskCompletionForm
          grievance={selectedGrievance}
          isOpen={showCompletionForm}
          onClose={handleCompletionFormClose}
          onComplete={handleUpdate}
        />
      )}
    </>
  );
}
