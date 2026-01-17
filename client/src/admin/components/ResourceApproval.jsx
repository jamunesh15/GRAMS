import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getPendingRequests,
  getAllResourceRequests,
  getRequestStats,
  approveResourceRequest,
  rejectResourceRequest,
  markAsDelivered,
  getAllocatedResources,
  refetchRemainingAmount,
} from '../../Services/operations/resourceRequestAPI';

export default function ResourceApproval() {
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [allocatedResources, setAllocatedResources] = useState([]);
  const [allocatedTotals, setAllocatedTotals] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRefetchModal, setShowRefetchModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refetchAmount, setRefetchAmount] = useState('');
  const [refetchMessage, setRefetchMessage] = useState('');
  const [refetchReason, setRefetchReason] = useState('');
  const [refetchLoading, setRefetchLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'allocated') {
        // Fetch allocated resources
        const [allocatedRes, statsRes] = await Promise.all([
          getAllocatedResources(token),
          getRequestStats(token),
        ]);
        
        if (allocatedRes.data.success) {
          setAllocatedResources(allocatedRes.data.data);
          setAllocatedTotals(allocatedRes.data.totals);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } else {
        // Fetch regular requests
        const [requestsRes, statsRes] = await Promise.all([
          activeTab === 'pending' ? getPendingRequests(token) : getAllResourceRequests(token),
          getRequestStats(token),
        ]);

        if (requestsRes.data.success) {
          setRequests(requestsRes.data.data);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await approveResourceRequest(token, requestId, {});
      if (response.data.success) {
        toast.success('Request approved successfully');
        fetchData();
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      const response = await rejectResourceRequest(token, selectedRequest._id, { rejectionReason: rejectionReason });
      if (response.data.success) {
        toast.success('Request rejected');
        fetchData();
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedRequest(null);
      }
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleDeliver = async (requestId) => {
    try {
      const response = await markAsDelivered(token, requestId);
      if (response.data.success) {
        toast.success('Marked as delivered');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to mark as delivered');
    }
  };

  const handleRefetch = async () => {
    if (!refetchAmount || parseFloat(refetchAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(refetchAmount);
    const available = selectedRequest.remainingAmount || 0;

    if (amount > available) {
      toast.error(`Cannot refetch ₹${amount}. Only ₹${available.toFixed(2)} is available.`);
      return;
    }

    setRefetchLoading(true);
    try {
      const response = await refetchRemainingAmount(token, selectedRequest._id, {
        refetchAmount: amount,
        adminMessage: refetchMessage,
        reason: refetchReason,
      });

      if (response.data.success) {
        toast.success('Amount refetched successfully and notification sent to engineer');
        setShowRefetchModal(false);
        setRefetchAmount('');
        setRefetchMessage('');
        setRefetchReason('');
        setSelectedRequest(null);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to refetch amount');
    } finally {
      setRefetchLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      'partially-approved': 'bg-blue-100 text-blue-700',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <span>📦</span>
          <span className="break-words">Resource Requests</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Review and approve engineer resource requests</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Requests</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <span className="text-3xl sm:text-4xl">📊</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <span className="text-3xl sm:text-4xl">⏳</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Approved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <span className="text-3xl sm:text-4xl">✅</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Approved Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1 break-words">{formatCurrency(stats.totalApproved)}</p>
              </div>
              <span className="text-3xl sm:text-4xl">💰</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 px-3 sm:px-6 overflow-x-auto scrollbar-hide">
            {['pending', 'all', 'allocated'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'allocated' ? 'Allocated Resources' : tab} 
                {tab === 'pending' && stats && `(${stats.pending})`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-6xl">⏳</div>
            </div>
          ) : activeTab === 'allocated' ? (
            // Allocated Resources Tab Content
            allocatedResources.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">📭</span>
                <p className="text-gray-500 mt-4">No allocated resources found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Allocated Resources Stats */}
                {allocatedTotals && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Allocated</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-1 break-words">
                        {formatCurrency(allocatedTotals.totalAllocated)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <p className="text-xs sm:text-sm text-green-700 font-medium">Total Used</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-900 mt-1 break-words">
                        {formatCurrency(allocatedTotals.totalUsed)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                      <p className="text-xs sm:text-sm text-yellow-700 font-medium">Total Remaining</p>
                      <p className="text-xl sm:text-2xl font-bold text-yellow-900 mt-1 break-words">
                        {formatCurrency(allocatedTotals.totalRemaining)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs sm:text-sm text-purple-700 font-medium">Total Refetched</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-900 mt-1 break-words">
                        {formatCurrency(allocatedTotals.totalRefetched)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Allocated Resources List */}
                <div className="space-y-4">
                  {allocatedResources.map((resource) => (
                    <motion.div
                      key={resource._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                              {resource.grievanceId?.trackingId}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {resource.status}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 mb-2">{resource.grievanceId?.title}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>👨‍💼</span>
                              <span className="break-words">{resource.requestedBy?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>📧</span>
                              <span className="break-words">{resource.requestedBy?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🚚</span>
                              <span>Delivered: {new Date(resource.deliveredAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Resource Allocation Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                          <p className="text-xs text-blue-700 font-semibold mb-1">Allocated Amount</p>
                          <p className="text-base sm:text-lg font-bold text-blue-900 break-words">
                            {formatCurrency(resource.allocatedAmount)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                          <p className="text-xs text-green-700 font-semibold mb-1">Amount Used</p>
                          <p className="text-base sm:text-lg font-bold text-green-900 break-words">
                            {formatCurrency(resource.usedAmount || 0)}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                          <p className="text-xs text-yellow-700 font-semibold mb-1">Remaining Amount</p>
                          <p className="text-base sm:text-lg font-bold text-yellow-900 break-words">
                            {formatCurrency(resource.remainingAmount || resource.allocatedAmount)}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                          <p className="text-xs text-purple-700 font-semibold mb-1">Total Refetched</p>
                          <p className="text-base sm:text-lg font-bold text-purple-900 break-words">
                            {formatCurrency(resource.totalRefetched || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Materials/Equipment/Manpower Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {resource.materials?.length > 0 && (
                          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                            <p className="text-xs font-semibold text-indigo-700 mb-2">
                              📦 Materials ({resource.materials.length})
                            </p>
                            <div className="space-y-1">
                              {resource.materials.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-xs text-gray-700">
                                  • {item.name}
                                </p>
                              ))}
                              {resource.materials.length > 2 && (
                                <p className="text-xs text-indigo-600">+{resource.materials.length - 2} more</p>
                              )}
                            </div>
                          </div>   
                        )}
                        {resource.equipment?.length > 0 && (
                          <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                            <p className="text-xs font-semibold text-pink-700 mb-2">
                              🔧 Equipment ({resource.equipment.length})
                            </p>
                            <div className="space-y-1">
                              {resource.equipment.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-xs text-gray-700">
                                  • {item.name}
                                </p>
                              ))}
                              {resource.equipment.length > 2 && (
                                <p className="text-xs text-pink-600">+{resource.equipment.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        )}
                        {resource.manpower?.workers > 0 && (
                          <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                            <p className="text-xs font-semibold text-teal-700 mb-2">👷 Manpower</p>
                            <p className="text-xs text-gray-700">
                              {resource.manpower.workers} workers × {resource.manpower.days} days
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Refetch History */}
                      {resource.refetchHistory?.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
                          <p className="text-sm font-bold text-purple-800 mb-3">🔄 Refetch History</p>
                          <div className="space-y-2">
                            {resource.refetchHistory.map((refetch, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 border border-purple-200">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {formatCurrency(refetch.refetchedAmount)} refetched
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(refetch.refetchedAt).toLocaleString()}
                                  </p>
                                </div>
                                {refetch.adminMessage && (
                                  <p className="text-xs text-gray-700 mt-2 italic">
                                    💬 "{refetch.adminMessage}"
                                  </p>
                                )}
                                {refetch.reason && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Reason: {refetch.reason}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {resource.canRefetch && resource.remainingAmount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedRequest(resource);
                            setShowRefetchModal(true);
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-700 transition shadow-md"
                        >
                          💸 Refetch Remaining Amount
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📭</span>
              <p className="text-gray-500 mt-4">No {activeTab} requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                          {request.grievanceId?.trackingId}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <p className="text-gray-600 text-xs sm:text-sm mb-2">{request.grievanceId?.title}</p>
                      <p className="text-gray-500 text-xs sm:text-sm mb-4">{request.justification}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        {/* Materials */}
                        {request.materials?.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs sm:text-sm font-medium text-blue-700 mb-2">Materials ({request.materials.length})</p>
                            <div className="space-y-1">
                              {request.materials.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-xs text-gray-700 break-words">
                                  • {item.name} - {formatCurrency(item.estimatedCost)}
                                </p>
                              ))}
                              {request.materials.length > 2 && (
                                <p className="text-xs text-blue-600">+{request.materials.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Equipment */}
                        {request.equipment?.length > 0 && (
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs sm:text-sm font-medium text-purple-700 mb-2">Equipment ({request.equipment.length})</p>
                            <div className="space-y-1">
                              {request.equipment.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-xs text-gray-700 break-words">
                                  • {item.name} - {formatCurrency(item.estimatedCost)}
                                </p>
                              ))}
                              {request.equipment.length > 2 && (
                                <p className="text-xs text-purple-600">+{request.equipment.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Manpower */}
                        {request.manpower?.workers > 0 && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs sm:text-sm font-medium text-green-700 mb-2">Manpower</p>
                            <div className="space-y-1 text-xs text-gray-700">
                              <p>• {request.manpower.workers} workers</p>
                              <p>• {request.manpower.days} days</p>
                              <p className="break-words">• {formatCurrency(request.manpower.totalCost)}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-4 gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>👨‍💼</span>
                            <span className="break-words">{request.requestedBy?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-xs sm:text-sm text-gray-600">Total Estimate</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600 break-words">{formatCurrency(request.totalEstimatedCost)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="w-full sm:flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                      >
                        📋 View Details
                      </button>
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="w-full sm:flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
                        className="w-full sm:flex-1 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {request.status === 'approved' && request.deliveryStatus !== 'delivered' && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleDeliver(request._id)}
                        className="w-full px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition"
                      >
                        🚚 Mark as Delivered
                      </button>
                    </div>
                  )}

                  {request.deliveryStatus === 'delivered' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <span className="text-green-700 font-medium">✅ Delivered on {new Date(request.deliveredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto max-h-[85vh] scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 sm:p-8 rounded-t-3xl">
              <h2 className="text-2xl sm:text-3xl font-bold">Resource Request Details</h2>
              <p className="text-blue-100 mt-2 text-sm sm:text-base break-words">{selectedRequest.grievanceId?.trackingId}</p>
            </div>

            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Grievance Information</h3>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 text-sm sm:text-base">
                  <p className="break-words"><span className="font-semibold">Title:</span> {selectedRequest.grievanceId?.title}</p>
                  <p className="break-words"><span className="font-semibold">Tracking ID:</span> {selectedRequest.grievanceId?.trackingId}</p>
                  <p className="break-words"><span className="font-semibold">Requested By:</span> {selectedRequest.requestedBy?.name}</p>
                  <p className="break-words"><span className="font-semibold">Date:</span> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Justification</h3>
                <p className="text-sm sm:text-base text-gray-700 bg-blue-50 rounded-xl p-3 sm:p-4">{selectedRequest.justification}</p>
              </div>

              {selectedRequest.materials?.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Materials Required</h3>
                  <div className="space-y-3">
                    {selectedRequest.materials.map((item, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 border-2 border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1 text-sm sm:text-base">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-base sm:text-lg mb-2 break-words">{item.name}</p>
                            {item.reason && (
                              <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                                <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Why needed:</p>
                                <p className="text-xs sm:text-sm text-gray-700">{item.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-700 font-semibold mb-2">Total Estimated Cost</p>
                <p className="text-3xl sm:text-4xl font-bold text-green-600 break-words">{formatCurrency(selectedRequest.totalEstimatedCost)}</p>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm sm:text-base rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
                  >
                    ✅ Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowRejectModal(true);
                    }}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-sm sm:text-base rounded-xl hover:from-red-600 hover:to-pink-700 transition shadow-lg"
                  >
                    ❌ Reject Request
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)} 
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 text-gray-800 font-bold text-sm sm:text-base rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-8 rounded-t-3xl">
              <h2 className="text-3xl font-bold">Reject Resource Request</h2>
              <p className="text-red-100 mt-2">Please provide a reason for rejection</p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                  placeholder="Explain why this request is being rejected..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReject}
                  className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-sm sm:text-base rounded-xl hover:from-red-600 hover:to-pink-700 transition shadow-lg"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 text-gray-800 font-bold text-sm sm:text-base rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Refetch Modal */}
      {showRefetchModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRefetchModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto max-h-[90vh] scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 sm:p-8 rounded-t-3xl">
              <h2 className="text-2xl sm:text-3xl font-bold">💸 Refetch Remaining Amount</h2>
              <p className="text-purple-100 mt-2 text-sm sm:text-base">Reclaim unused funds from engineer</p>
            </div>

            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              {/* Resource Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-purple-200">
                <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">Resource Details</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Grievance</p>
                    <p className="font-semibold text-gray-800 break-words">{selectedRequest.grievanceId?.trackingId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Engineer</p>
                    <p className="font-semibold text-gray-800 break-words">{selectedRequest.requestedBy?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Allocated Amount</p>
                    <p className="font-semibold text-blue-600 break-words">{formatCurrency(selectedRequest.allocatedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Used Amount</p>
                    <p className="font-semibold text-green-600 break-words">{formatCurrency(selectedRequest.usedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available to Refetch</p>
                    <p className="font-semibold text-yellow-600 text-base sm:text-lg break-words">{formatCurrency(selectedRequest.remainingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Already Refetched</p>
                    <p className="font-semibold text-purple-600 break-words">{formatCurrency(selectedRequest.totalRefetched || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Refetch Amount Input */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">
                  Refetch Amount (₹) *
                </label>
                <input
                  type="number"
                  value={refetchAmount}
                  onChange={(e) => setRefetchAmount(e.target.value)}
                  min="0"
                  max={selectedRequest.remainingAmount}
                  step="0.01"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base sm:text-lg font-semibold"
                  placeholder={`Max: ₹${selectedRequest.remainingAmount?.toFixed(2) || 0}`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Maximum refetchable: {formatCurrency(selectedRequest.remainingAmount)}
                </p>
              </div>

              {/* Admin Message */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">
                  Message to Engineer (Optional)
                </label>
                <textarea
                  value={refetchMessage}
                  onChange={(e) => setRefetchMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  placeholder="Explain to the engineer why the amount is being refetched..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 This message will be sent to the engineer via email and notification
                </p>
              </div>

              {/* Refetch Reason */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-3">
                  Reason for Refetch (Optional)
                </label>
                <textarea
                  value={refetchReason}
                  onChange={(e) => setRefetchReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  placeholder="Internal reason for refetching (e.g., Task completed with less budget, Unused resources)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={handleRefetch}
                  disabled={refetchLoading}
                  className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm sm:text-base rounded-xl hover:from-purple-600 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {refetchLoading ? (
                    <>
                      <div className="animate-spin text-xl sm:text-2xl">⏳</div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>✅ Confirm Refetch & Notify Engineer</>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowRefetchModal(false);
                    setRefetchAmount('');
                    setRefetchMessage('');
                    setRefetchReason('');
                    setSelectedRequest(null);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 text-gray-800 font-bold text-sm sm:text-base rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-yellow-800">
                  ⚠️ <strong>Note:</strong> Once refetched, the amount will be returned to the system budget 
                  and the engineer will be notified via email and in-app notification.
                </p>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
