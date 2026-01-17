import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { engineerEndpoints } from '../../Services/apis';
import GrievanceDetailModal from './GrievanceDetailModal';
import TaskResourceRequestModal from './TaskResourceRequestModal';
import TaskCompletionForm from './TaskCompletionForm';

export default function ActiveTasks() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedTaskForResource, setSelectedTaskForResource] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState(null);
  const { user } = useAuthStore();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchActiveTasks();
  }, []);

  const fetchActiveTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${engineerEndpoints.GET_MY_ASSIGNED_GRIEVANCES_API}?status=in-progress`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setActiveTasks(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch active tasks');
      }
    } catch (error) {
      console.error('Error fetching active tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch active tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (grievanceId) => {
    setSelectedGrievanceId(grievanceId);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedGrievanceId(null);
  };

  const handleUpdate = () => {
    fetchActiveTasks();
  };

  const handleRequestResources = (task) => {
    setSelectedTaskForResource(task);
    setShowResourceModal(true);
  };

  const handleResourceModalClose = () => {
    setShowResourceModal(false);
    setSelectedTaskForResource(null);
  };

  const handleResourceRequestSuccess = () => {
    toast.success('Resource request submitted successfully!');
    handleResourceModalClose();
    fetchActiveTasks(); // Refresh to update any changes
  };

  const handleCompleteTask = (task) => {
    setSelectedTaskForCompletion(task);
    setShowCompletionModal(true);
  };

  const handleCompletionModalClose = () => {
    setShowCompletionModal(false);
    setSelectedTaskForCompletion(null);
  };

  const handleTaskCompleted = () => {
    toast.success('Task completed successfully!');
    handleCompletionModalClose();
    fetchActiveTasks(); // Refresh the task list
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-300';
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

  const calculateDaysWorking = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    return Math.ceil((now - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl p-8 shadow-lg border border-purple-100">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading active tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-purple-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">⚙️</span>
                Active Tasks
              </h2>
              <p className="text-gray-700 text-xs sm:text-sm mt-1 font-medium">
                Tasks currently in progress
              </p>
            </div>
            <button
              onClick={fetchActiveTasks}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-purple-200 transform hover:scale-105 transition-all duration-200 shadow-md">
              <p className="text-xs sm:text-sm text-purple-700 font-semibold mb-1">Total Active</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-800">{activeTasks.length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-orange-200 transform hover:scale-105 transition-all duration-200 shadow-md">
              <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-1">High Priority</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-800">
                {activeTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-blue-200 transform hover:scale-105 transition-all duration-200 shadow-md">
              <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-1">Avg. Days Working</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-800">
                {activeTasks.length > 0 
                  ? Math.round(activeTasks.reduce((sum, t) => sum + calculateDaysWorking(t.workStartedAt), 0) / activeTasks.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Active Tasks List */}
        <div className="space-y-4">
          {activeTasks.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-12 shadow-md text-center border border-purple-100">
              <p className="text-4xl mb-4">🎯</p>
              <p className="text-gray-700 text-lg font-semibold">No active tasks</p>
              <p className="text-gray-500 text-sm mt-2">
                Start working on assigned tasks to see them here
              </p>
            </div>
          ) : (
            activeTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500 backdrop-blur-sm transform hover:scale-[1.02]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{getCategoryIcon(task.category)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 break-words">{task.title}</h3>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full whitespace-nowrap">
                            IN PROGRESS
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 break-all">
                          ID: {task.trackingId}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{task.description}</p>

                    {/* Location */}
                    {task.location && (
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 mb-3 bg-gray-50 p-2 sm:p-3 rounded-lg">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium flex-shrink-0">Location:</span>
                        <span className="break-words">{task.location}</span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {task.category}
                      </span>
                      {task.workStartedAt && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          ⏱️ Day {calculateDaysWorking(task.workStartedAt)}
                        </span>
                      )}
                    </div>

                    {/* Budget Info */}
                    {task.budget && task.budget.allocated > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg">💰</span>
                          <span className="text-xs sm:text-sm font-semibold text-green-800 break-words">
                            ₹{task.budget.allocated.toLocaleString()} Allocated
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {task.workStartedAt && (
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-800 break-words">
                          <span className="font-semibold">Started:</span>{' '}
                          {new Date(task.workStartedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Working for {calculateDaysWorking(task.workStartedAt)} day(s)
                        </p>
                      </div>
                    )}

                    {/* Citizen Info */}
                    {task.userId && (
                      <div className="text-sm text-gray-600 mt-3">
                        <span className="font-medium">Reported by:</span> {task.userId.name}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
                    <button
                      onClick={() => handleViewDetails(task._id)}
                      className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium text-xs sm:text-sm rounded-lg hover:from-blue-600 hover:to-indigo-600 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">View</span> Details
                    </button>
                    
                    <button
                      onClick={() => handleRequestResources(task)}
                      className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-xs sm:text-sm rounded-lg hover:from-orange-600 hover:to-red-600 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="hidden sm:inline">Request</span> Resources
                    </button>
                    
                    {task.coordinates?.latitude && task.coordinates?.longitude && (
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${task.coordinates.latitude},${task.coordinates.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-green-100 text-green-700 font-medium text-xs sm:text-sm rounded-lg hover:bg-green-200 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Navigate
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="w-full lg:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium text-xs sm:text-sm rounded-lg hover:from-green-600 hover:to-emerald-700 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shadow-md"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Complete Task
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}

      {/* Resource Request Modal */}
      <TaskResourceRequestModal
        grievanceId={selectedTaskForResource?._id}
        grievanceTitle={selectedTaskForResource?.title}
        isOpen={showResourceModal}
        onClose={handleResourceModalClose}
        onSuccess={handleResourceRequestSuccess}
      />

      {/* Task Completion Modal */}
      <TaskCompletionForm
        grievance={selectedTaskForCompletion}
        isOpen={showCompletionModal}
        onClose={handleCompletionModalClose}
        onComplete={handleTaskCompleted}
      />
        </div>
      </div>

      {/* Detail Modal */}
      <GrievanceDetailModal
        grievanceId={selectedGrievanceId}
        isOpen={showDetailModal}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />
    </>
  );
}
