import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getCompletedTasksByEngineers, confirmCompletedTask, confirmAllCompletedTasks } from '../../Services/operations/adminAPI';

export default function CompletedTasksReview() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState({
    status: 'closed',
    adminNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [showConfirmAllModal, setShowConfirmAllModal] = useState(false);
  const [confirmAllNotes, setConfirmAllNotes] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      const response = await getCompletedTasksByEngineers(token);
      if (response.success) {
        setCompletedTasks(response.data);
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      toast.error('Failed to fetch completed tasks');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleOpenConfirmModal = (task) => {
    setSelectedTask(task);
    setConfirmData({ status: 'closed', adminNotes: '' });
    setShowConfirmModal(true);
  };

  const handleConfirmTask = async () => {
    if (!selectedTask) return;

    try {
      setSubmitting(true);
      await confirmCompletedTask(token, {
        grievanceId: selectedTask._id,
        status: confirmData.status,
        adminNotes: confirmData.adminNotes,
      });
      
      toast.success('Task status updated successfully!');
      setShowConfirmModal(false);
      setSelectedTask(null);
      fetchCompletedTasks(); // Refresh the list
    } catch (error) {
      console.error('Error confirming task:', error);
      // Error toast is handled in the API function
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAllTasks = async () => {
    const pendingCount = completedTasks.filter((t) => t.status === 'resolved').length;
    
    if (pendingCount === 0) {
      toast.error('No pending tasks to confirm!');
      return;
    }

    try {
      setConfirmingAll(true);
      await confirmAllCompletedTasks(token, confirmAllNotes);
      setShowConfirmAllModal(false);
      setConfirmAllNotes('');
      fetchCompletedTasks(); // Refresh the list
    } catch (error) {
      console.error('Error confirming all tasks:', error);
      // Error toast is handled in the API function
    } finally {
      setConfirmingAll(false);
    }
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
      other: '📌',
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading completed tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>✅</span>
                Completed Tasks Review
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Review and confirm tasks completed by engineers
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowConfirmAllModal(true)}
                disabled={completedTasks.filter((t) => t.status === 'resolved').length === 0}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Confirm All ({completedTasks.filter((t) => t.status === 'resolved').length})</span>
                <span className="sm:hidden">Confirm ({completedTasks.filter((t) => t.status === 'resolved').length})</span>
              </button>
              <button
                onClick={fetchCompletedTasks}
                className="px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-2 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border border-green-200">
              <p className="text-xs sm:text-sm text-green-600 font-medium">Total Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700">{completedTasks.length}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Pending Review</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-700">
                {completedTasks.filter((t) => t.status === 'resolved').length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border border-purple-200">
              <p className="text-xs sm:text-sm text-purple-600 font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-purple-700">
                {completedTasks.filter((t) => t.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>

        {/* Completed Tasks List */}
        <div className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-gray-500 text-lg font-medium">No completed tasks</p>
              <p className="text-gray-400 text-sm mt-2">
                Completed tasks will appear here for review
              </p>
            </div>
          ) : (
            completedTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition border-l-4 border-green-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{getCategoryIcon(task.category)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 break-words">{task.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.status === 'closed'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {task.status === 'closed' ? 'CONFIRMED' : 'PENDING REVIEW'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 break-all">ID: {task.trackingId}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{task.description}</p>

                    {/* Engineer Info */}
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl flex-shrink-0">👨‍💼</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-semibold text-gray-800 break-words">{task.assignedTo?.name || 'N/A'}</p>
                          <p className="text-xs sm:text-sm text-gray-600 break-all">{task.assignedTo?.email || 'N/A'}</p>
                          {task.assignedTo?.specialization && (
                            <p className="text-xs text-blue-600 mt-1">
                              Specialization: {task.assignedTo.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion Details */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-3 rounded-lg border border-green-200">
                        <p className="text-[10px] sm:text-xs text-green-700 font-semibold mb-1">Days to Complete</p>
                        <p className="text-sm sm:text-lg font-bold text-green-900">
                          {task.daysToComplete || 'N/A'} days
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg border border-blue-200">
                        <p className="text-[10px] sm:text-xs text-blue-700 font-semibold mb-1">Total Spent</p>
                        <p className="text-sm sm:text-lg font-bold text-blue-900 break-words">
                          {formatCurrency(task.budget?.totalSpent || 0)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-3 rounded-lg border border-purple-200">
                        <p className="text-[10px] sm:text-xs text-purple-700 font-semibold mb-1">Allocated Budget</p>
                        <p className="text-sm sm:text-lg font-bold text-purple-900 break-words">
                          {formatCurrency(task.budget?.allocated || 0)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 sm:p-3 rounded-lg border border-orange-200">
                        <p className="text-[10px] sm:text-xs text-orange-700 font-semibold mb-1">Completed On</p>
                        <p className="text-xs sm:text-sm font-bold text-orange-900 break-words">
                          {formatDate(task.workCompletedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Images and Bills Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {task.completionImages && task.completionImages.length > 0 && (
                        <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 sm:mb-2">
                            📸 Completion Images ({task.completionImages.length})
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">Click "View Details" to see images</p>
                        </div>
                      )}
                      {task.budget?.billImages && task.budget.billImages.length > 0 && (
                        <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 sm:mb-2">
                            🧾 Bills/Receipts ({task.budget.billImages.length})
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">Click "View Details" to see bills</p>
                        </div>
                      )}
                    </div>

                    {/* Completion Notes */}
                    {task.completionNotes && (
                      <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-200 mb-3 sm:mb-4">
                        <p className="text-[10px] sm:text-xs font-semibold text-yellow-700 mb-1">📝 Engineer Notes:</p>
                        <p className="text-xs sm:text-sm text-gray-700 break-words">{task.completionNotes}</p>
                      </div>
                    )}

                    {/* Citizen Info */}
                    {task.userId && (
                      <div className="text-xs sm:text-sm text-gray-600 mt-3">
                        <span className="font-medium">Reported by:</span> <span className="break-words">{task.userId.name} ({task.userId.email})</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => handleViewDetails(task)}
                      className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </button>

                    {task.status !== 'closed' && (
                      <button
                        onClick={() => handleOpenConfirmModal(task)}
                        className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="hidden sm:inline">Review & Confirm</span>
                        <span className="sm:hidden">Review</span>
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
      <AnimatePresence>
        {showDetailModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{selectedTask.title}</h3>
                    <p className="text-green-100 text-sm">
                      {selectedTask.trackingId} • {getCategoryIcon(selectedTask.category)} {selectedTask.category}
                    </p>
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

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 scrollbar-hide" style={{ maxHeight: 'calc(90vh - 220px)' }}>
                {/* Engineer Info */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-3">👨‍💼 Engineer Details</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold text-gray-800">{selectedTask.assignedTo?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{selectedTask.assignedTo?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">{selectedTask.assignedTo?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Specialization</p>
                        <p className="font-semibold text-gray-800">
                          {selectedTask.assignedTo?.specialization || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget & Expenses */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-3">💰 Budget & Expenses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-700 font-semibold">Allocated Budget</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {formatCurrency(selectedTask.budget?.allocated || 0)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 font-semibold">Total Spent</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {formatCurrency(selectedTask.budget?.totalSpent || 0)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-semibold">Remaining</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatCurrency(
                          (selectedTask.budget?.allocated || 0) - (selectedTask.budget?.totalSpent || 0)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  {selectedTask.budget?.expenseBreakdown && selectedTask.budget.expenseBreakdown.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-3">📊 Expense Breakdown</p>
                      <div className="space-y-2">
                        {selectedTask.budget.expenseBreakdown.map((expense, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg">
                            <span className="text-gray-700">{expense.description}</span>
                            <span className="font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion Images */}
                {selectedTask.completionImages && selectedTask.completionImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">📸 Completion Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedTask.completionImages.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition"
                        >
                          <img
                            src={img}
                            alt={`Completion ${idx + 1}`}
                            className="w-full h-48 object-cover hover:scale-110 transition"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bill Images */}
                {selectedTask.budget?.billImages && selectedTask.budget.billImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">🧾 Bills & Receipts</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedTask.budget.billImages.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition"
                        >
                          <img
                            src={img}
                            alt={`Bill ${idx + 1}`}
                            className="w-full h-48 object-cover hover:scale-110 transition"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Notes */}
                {selectedTask.completionNotes && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">📝 Engineer Notes</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-gray-700">{selectedTask.completionNotes}</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">⏰ Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-semibold text-gray-800">{formatDate(selectedTask.createdAt)}</p>
                      </div>
                    </div>
                    {selectedTask.workStartedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Work Started</p>
                          <p className="font-semibold text-gray-800">{formatDate(selectedTask.workStartedAt)}</p>
                        </div>
                      </div>
                    )}
                    {selectedTask.workCompletedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Work Completed</p>
                          <p className="font-semibold text-gray-800">{formatDate(selectedTask.workCompletedAt)}</p>
                        </div>
                      </div>
                    )}
                    {selectedTask.daysToComplete && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-semibold">
                          ⏱️ Total Days: {selectedTask.daysToComplete} days
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                {selectedTask.status !== 'closed' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenConfirmModal(selectedTask);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Review & Confirm
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Review & Confirm Task</h3>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                    disabled={submitting}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Task:</span> {selectedTask.title}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">ID:</span> {selectedTask.trackingId}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Update Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={confirmData.status}
                      onChange={(e) => setConfirmData({ ...confirmData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={submitting}
                    >
                      <option value="closed">✅ Closed - Approved</option>
                      <option value="resolved">🔄 Resolved - Needs Review</option>
                      <option value="in-progress">⏳ In Progress - Needs Rework</option>
                      <option value="rejected">❌ Rejected</option>
                    </select>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={confirmData.adminNotes}
                      onChange={(e) => setConfirmData({ ...confirmData, adminNotes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Add any comments or feedback for the engineer..."
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTask}
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm All Modal */}
      <AnimatePresence>
        {showConfirmAllModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm All Tasks
                    </h3>
                    <p className="text-green-100 text-sm mt-1">
                      Bulk confirm all pending review tasks
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConfirmAllModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                    disabled={confirmingAll}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-1">About to confirm {completedTasks.filter((t) => t.status === 'resolved').length} tasks</h4>
                      <p className="text-blue-700 text-sm">
                        This will:
                      </p>
                      <ul className="text-blue-700 text-sm mt-2 space-y-1 list-disc list-inside">
                        <li>Mark all pending tasks as "Closed"</li>
                        <li>Process budget reconciliation for all tasks</li>
                        <li>Return unused budget to the system</li>
                        <li>Send confirmation emails to all engineers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={confirmAllNotes}
                    onChange={(e) => setConfirmAllNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Add a message that will be sent to all engineers (optional)..."
                    disabled={confirmingAll}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmAllModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                  disabled={confirmingAll}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAllTasks}
                  disabled={confirmingAll}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                >
                  {confirmingAll ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Confirming {completedTasks.filter((t) => t.status === 'resolved').length} tasks...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirm All Tasks</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
