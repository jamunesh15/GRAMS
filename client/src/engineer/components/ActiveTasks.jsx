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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-12 shadow-2xl border-2 border-purple-200 text-center relative overflow-hidden"
      >
        {/* Animated background circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400 rounded-full filter blur-3xl opacity-30"
        />
        
        <div className="relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-7xl mb-6 inline-block"
          >
            ⚙️
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-800 font-bold text-xl"
          >
            Loading active tasks...
          </motion.p>
          <motion.div
            className="mt-6 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Premium Styling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-6 sm:p-8 shadow-2xl border border-purple-400 relative overflow-hidden"
        >
          {/* Animated background pattern */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="text-3xl"
                  >
                    ⚙️
                  </motion.span>
                  Active Tasks
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-purple-100 text-sm font-medium mt-2"
                >
                  Tasks currently in progress
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchActiveTasks}
                className="px-4 py-3 bg-white text-purple-600 rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm group"
              >
                <svg className="w-4 h-4 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </motion.button>
            </div>

            {/* Stats Cards - Premium Design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
              >
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Total Active</p>
                      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="text-5xl font-extrabold">{activeTasks.length}</motion.p>
                    </div>
                    <span className="text-4xl">⚙️</span>
                  </div>
                  <div className="h-1 bg-blue-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5 }} className="h-full bg-white" /></div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)' }}
                className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
              >
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 0.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-orange-100 text-sm font-medium mb-1">High Priority</p>
                      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} className="text-5xl font-extrabold">{activeTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}</motion.p>
                    </div>
                    <span className="text-4xl">🔥</span>
                  </div>
                  <div className="h-1 bg-orange-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: activeTasks.length > 0 ? `${(activeTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length / activeTasks.length) * 100}%` : '0%' }} transition={{ delay: 0.8, duration: 1 }} className="h-full bg-white" /></div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
                className="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
              >
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-1">Avg. Days Working</p>
                      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring' }} className="text-5xl font-extrabold">{activeTasks.length > 0 ? Math.round(activeTasks.reduce((sum, t) => sum + calculateDaysWorking(t.workStartedAt), 0) / activeTasks.length) : 0}</motion.p>
                    </div>
                    <span className="text-4xl">📅</span>
                  </div>
                  <div className="h-1 bg-purple-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ delay: 0.9, duration: 1 }} className="h-full bg-white" /></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Active Tasks List */}
        <div className="space-y-4">
          {activeTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-12 shadow-xl text-center border-2 border-purple-200 relative overflow-hidden"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="text-7xl mb-4"
              >
                🎯
              </motion.div>
              <p className="text-gray-700 text-xl font-bold mb-2">No active tasks</p>
              <p className="text-gray-500 text-sm">
                Start working on assigned tasks to see them here
              </p>
            </motion.div>
          ) : (
            activeTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                whileHover={{ scale: 1.02, y: -5, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.2)" }}
                className="bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 relative overflow-hidden group"
              >
                {/* Animated gradient overlay on hover */}
                <motion.div
                  animate={{
                    opacity: [0, 0.15, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400"
                />

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-2xl sm:text-3xl flex-shrink-0"
                        >
                          {getCategoryIcon(task.category)}
                        </motion.span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 break-words">{task.title}</h3>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-md"
                            >
                              ⚙️ IN PROGRESS
                            </motion.span>
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
                      <motion.div
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 mb-3 bg-gray-50 p-2 sm:p-3 rounded-xl border border-blue-200"
                      >
                        <motion.svg
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </motion.svg>
                        <span className="font-medium flex-shrink-0">Location:</span>
                        <span className="break-words">{task.location}</span>
                      </motion.div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.toUpperCase()} PRIORITY
                      </motion.span>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize"
                      >
                        {task.category}
                      </motion.span>
                      {task.workStartedAt && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          ⏱️ Day {calculateDaysWorking(task.workStartedAt)}
                        </motion.span>
                      )}
                    </div>

                    {/* Budget Info */}
                    {task.budget && task.budget.allocated > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)" }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-2 sm:p-3 rounded-xl mb-3 sm:mb-4"
                      >
                        <div className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-base sm:text-lg"
                          >
                            💰
                          </motion.span>
                          <span className="text-xs sm:text-sm font-semibold text-green-800 break-words">
                            ₹{task.budget.allocated.toLocaleString()} Allocated
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Timeline */}
                    {task.workStartedAt && (
                      <motion.div
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="bg-blue-50 p-2 sm:p-3 rounded-xl border border-blue-200"
                      >
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
                      </motion.div>
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
                    <motion.button
                      onClick={() => handleViewDetails(task._id)}
                      whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl hover:from-blue-600 hover:to-indigo-600 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg"
                    >
                      <motion.svg
                        whileHover={{ rotate: 15, scale: 1.2 }}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </motion.svg>
                      <span className="hidden sm:inline">View</span> Details
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleRequestResources(task)}
                      whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(249, 115, 22, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-xs sm:text-sm rounded-xl hover:from-orange-600 hover:to-red-600 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg"
                    >
                      <motion.svg
                        whileHover={{ rotate: 90 }}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </motion.svg>
                      <span className="hidden sm:inline">Request</span> Resources
                    </motion.button>
                    
                    {task.coordinates?.latitude && task.coordinates?.longitude && (
                      <motion.button
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${task.coordinates.latitude},${task.coordinates.longitude}`;
                          window.open(url, '_blank');
                        }}
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(187, 247, 208, 1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-green-100 text-green-700 font-medium text-xs sm:text-sm rounded-xl hover:bg-green-200 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-green-300"
                      >
                        <motion.svg
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </motion.svg>
                        Navigate
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={() => handleCompleteTask(task)}
                      whileHover={{ scale: 1.05, boxShadow: "0 12px 24px rgba(16, 185, 129, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full lg:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:from-green-600 hover:to-emerald-700 transition whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl"
                    >
                      <motion.svg
                        whileHover={{ scale: 1.3, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </motion.svg>
                      Complete Task
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>

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
