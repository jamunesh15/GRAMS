import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { engineerEndpoints } from '../../Services/apis';

export default function CompletedTasks() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('token');

  // Filter tasks based on search query
  const filteredTasks = completedTasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.trackingId?.toLowerCase().includes(query) ||
      task.title?.toLowerCase().includes(query) ||
      task.category?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.location?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    fetchCompletedTasks();  
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      // Add status=resolved query parameter to get only completed tasks
      const response = await axios.get(
        `${engineerEndpoints.GET_MY_ASSIGNED_GRIEVANCES_API}?status=resolved`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Backend returns 'data' not 'grievances'
        setCompletedTasks(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load completed tasks');
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (task) => {
    console.log('Selected task:', task);
    console.log('Completion Images:', task.completionImages);
    console.log('Bill Images:', task.budget?.billImages);
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-12 shadow-2xl border-2 border-green-200 text-center relative overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="absolute top-0 left-0 w-64 h-64 bg-green-400 rounded-full filter blur-3xl opacity-30"
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
          }}
          className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400 rounded-full filter blur-3xl opacity-30"
        />
        
        <div className="relative z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            ✅
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-800 font-bold text-xl"
          >
            Loading completed tasks...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (completedTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-12 shadow-2xl border-2 border-green-200 relative overflow-hidden"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-green-300 rounded-full opacity-20 blur-3xl"
        />
        
        <div className="relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-8"
          >
            ✅ Completed Tasks
          </motion.h2>
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            ✅
          </motion.div>
          <p className="text-gray-700 text-xl font-bold mb-2">No completed tasks yet</p>
          <p className="text-gray-500">Your completed tasks will appear here</p>
        </div>
      </motion.div>
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
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-green-200 relative overflow-hidden">
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
            backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 2px, transparent 2px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 flex items-center gap-3"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                ✅
              </motion.span>
              Completed Tasks
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                🎉
              </motion.span>
              <span className="font-bold">{filteredTasks.length} Completed</span>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 mb-6"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by tracking ID, title, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-gray-700 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-green-600">
                Found {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
          </motion.div>

          <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, type: "spring" }}
              whileHover={{ scale: 1.02, y: -5, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)" }}
              className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 border-2 border-green-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              {/* Success indicator animation */}
              <motion.div
                animate={{
                  opacity: [0, 0.15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400"
              />

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="px-2 sm:px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-md"
                      >
                        ✓ RESOLVED
                      </motion.span>
                      <span className="text-gray-500 text-xs sm:text-sm font-mono break-all">{task.trackingId}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 break-words">{task.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200"
                      >
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 capitalize break-words">{task.category}</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`bg-gradient-to-br p-3 rounded-xl border ${
                          task.priority === 'high' ? 'from-red-50 to-pink-50 border-red-200' :
                          task.priority === 'medium' ? 'from-yellow-50 to-orange-50 border-yellow-200' : 
                          'from-blue-50 to-cyan-50 border-blue-200'
                        }`}
                      >
                        <p className="text-xs text-gray-500 mb-1">Priority</p>
                        <p className={`text-xs sm:text-sm font-semibold capitalize break-words ${
                          task.priority === 'high' ? 'text-red-600' :
                          task.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>{task.priority}</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200"
                      >
                        <p className="text-xs text-gray-500 mb-1">Days Taken</p>
                        <p className="text-xs sm:text-sm font-bold text-purple-600 break-words">
                          {task.daysToComplete || 'N/A'} days
                        </p>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200"
                      >
                        <p className="text-xs text-gray-500 mb-1">Completed On</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 break-words">
                          {formatDate(task.resolvedAt)}
                        </p>
                      </motion.div>
                    </div>

                    {task.budget && (
                      <motion.div
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)" }}
                        className="flex flex-wrap items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl mb-3 border border-blue-200"
                      >
                        <div>
                          <p className="text-xs text-gray-600">Budget Allocated</p>
                          <p className="text-xs sm:text-sm font-bold text-gray-800 break-words">₹{task.budget.allocated?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Amount Used</p>
                          <p className="text-xs sm:text-sm font-bold text-green-600 break-words">₹{task.budget.spent?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Remaining</p>
                          <p className="text-xs sm:text-sm font-bold text-indigo-600 break-words">₹{task.budget.remainingBudget?.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    )}

                    {task.completionNotes && (
                      <motion.div
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 250, 251, 1)" }}
                        className="p-2 sm:p-3 bg-gray-50 rounded-xl mb-3 border border-gray-200"
                      >
                        <p className="text-xs text-gray-600 mb-1">Completion Notes</p>
                        <p className="text-xs sm:text-sm text-gray-700 break-words">{task.completionNotes}</p>
                      </motion.div>
                    )}

                  {/* Show attachments count */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    {task.completionImages && task.completionImages.length > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.1, color: "#10b981" }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200"
                      >
                        <motion.svg
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </motion.svg>
                        <span className="font-medium">{task.completionImages.length} completion image(s)</span>
                      </motion.div>
                    )}
                    {task.budget?.billImages && task.budget.billImages.length > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.1, color: "#3b82f6" }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <motion.svg
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </motion.svg>
                        <span className="font-medium">{task.budget.billImages.length} bill(s)</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={() => handleViewDetails(task)}
                  whileHover={{ scale: 1.05, boxShadow: "0 12px 24px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="lg:ml-4 w-full lg:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs sm:text-sm rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
                >
                  <motion.svg
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </motion.svg>
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>
          ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl"
            >
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">✅ Task Completed</h2>
                    <p className="text-green-100 text-xs sm:text-sm mt-1 break-all">{selectedTask.trackingId}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                {/* Task Details */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 break-words">{selectedTask.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 break-words">{selectedTask.description}</p>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-bold text-gray-800 capitalize">{selectedTask.category}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Priority</p>
                      <p className={`text-sm font-bold capitalize ${
                        selectedTask.priority === 'high' ? 'text-red-600' :
                        selectedTask.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>{selectedTask.priority}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Days Taken</p>
                      <p className="text-sm font-bold text-indigo-600">{selectedTask.daysToComplete || 'N/A'} days</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Completed On</p>
                      <p className="text-sm font-bold text-gray-800">{formatDate(selectedTask.resolvedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Budget & Expenses */}
                {selectedTask.budget && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Budget & Expenses
                    </h4>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Allocated Budget</p>
                        <p className="text-2xl font-bold text-blue-600">₹{selectedTask.budget.allocated?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Amount Used</p>
                        <p className="text-2xl font-bold text-green-600">₹{selectedTask.budget.spent?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-sm text-gray-600 mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-indigo-600">₹{selectedTask.budget.remainingBudget?.toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedTask.budget.expenseBreakdown && selectedTask.budget.expenseBreakdown.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-bold text-gray-700 mb-3">Expense Breakdown</h5>
                        <div className="space-y-2">
                          {selectedTask.budget.expenseBreakdown.map((expense, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">{expense.description}</span>
                              <span className="font-bold text-gray-800">₹{expense.amount?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bill Images */}
                    {selectedTask.budget.billImages && selectedTask.budget.billImages.length > 0 && (selectedTask.budget.billImages.filter(img => img).length > 0) && (
                      <div>
                        <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Bills & Receipts ({selectedTask.budget.billImages.filter(img => img).length})
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {selectedTask.budget.billImages.filter(img => img).map((billPath, index) => {
                            // Check if it's already a full URL (Cloudinary) or a local path
                            const imageSrc = billPath.startsWith('http') 
                              ? billPath 
                              : `http://localhost:5000/${billPath.replace(/\\/g, '/')}`;
                            if (!imageSrc) return null;
                            return (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="relative group cursor-pointer"
                              >
                                <img
                                  src={imageSrc}
                                  alt={`Bill ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                  onClick={() => window.open(imageSrc, '_blank')}
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                                <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs py-1 px-2 rounded text-center">
                                  Bill {index + 1}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Completion Images */}
                {selectedTask.completionImages && selectedTask.completionImages.length > 0 && (selectedTask.completionImages.filter(img => img).length > 0) && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Completion Images ({selectedTask.completionImages.filter(img => img).length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedTask.completionImages.filter(img => img).map((imagePath, index) => {
                        // Check if it's already a full URL (Cloudinary) or a local path
                        const imageSrc = imagePath.startsWith('http') 
                          ? imagePath 
                          : `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
                        if (!imageSrc) return null;
                        return (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="relative group cursor-pointer"
                          >
                            <img
                              src={imageSrc}
                              alt={`Completion ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                              onClick={() => window.open(imageSrc, '_blank')}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completion Notes */}
                {selectedTask.completionNotes && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Completion Notes
                    </h4>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.completionNotes}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {selectedTask.location && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </h4>
                    <p className="text-gray-700">{selectedTask.location}</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
