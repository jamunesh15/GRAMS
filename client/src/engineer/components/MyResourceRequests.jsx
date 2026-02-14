import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getMyRequests } from '../../Services/operations/resourceRequestAPI';
import { buildRequestStats, getStatusBucket } from './requestStatusUtils';
import EngineerRequestStatsCards from './EngineerRequestStatsCards';

export default function MyResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyRequests(token);
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const normalizedStatus = getStatusBucket(status);
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[normalizedStatus] || colors.pending;
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

  const getDeliveryStatusColor = (status) => {
    const colors = {
      'not-started': 'bg-gray-100 text-gray-700',
      'in-transit': 'bg-blue-100 text-blue-700',
      'delivered': 'bg-green-100 text-green-700',
      'completed': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || colors['not-started'];
  };

  const filteredRequests = requests.filter((req) => {
    const normalizedStatus = getStatusBucket(req.status);
    if (filter === 'all') return true;
    return normalizedStatus === filter;
  });

  const stats = buildRequestStats(requests);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl p-12 shadow-2xl border-2 border-cyan-200 text-center relative overflow-hidden"
      >
        {/* Animated background circles */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-300 to-blue-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 1,
          }}
          className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-300 to-cyan-300 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4 inline-block"
          >
            📦
          </motion.div>
          <p className="text-gray-700 font-bold text-xl">Loading requests...</p>
          <motion.div
            className="mt-4 flex justify-center gap-2"
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
                className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 shadow-2xl border border-cyan-400 relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              📦
            </motion.span>
            My Resource Requests
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 text-sm font-medium mt-2"
          >
            Track your resource request submissions and approvals
          </motion.p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <EngineerRequestStatsCards stats={stats} isLoading={loading} />

      {/* Filter Tabs */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 rounded-xl shadow-lg border border-blue-100">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-1 px-3 sm:px-6">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm capitalize transition-all ${
                  filter === status
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {status} {status === 'all' ? `(${stats.total})` : `(${stats[status]})`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📭</span>
              <p className="text-gray-500 mt-4">No {filter} requests found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredRequests.map((request) => {
                const isApprovedBucket = getStatusBucket(request.status) === 'approved';

                return (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-3 sm:p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-3 mb-2">
                          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 break-words">
                            {request.grievanceId?.trackingId || 'N/A'}
                          </h3>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {getStatusBucket(request.status)}
                          </span>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm break-words">{request.grievanceId?.title}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 sm:mb-4 text-sm break-words">{request.justification}</p>

                    {/* Resources Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {request.materials?.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                          <p className="text-sm font-medium text-blue-700 mb-2">Materials ({request.materials.length})</p>
                          <div className="space-y-1">
                            {request.materials.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-700">
                                <span>• {item.name}</span>
                                <span className={item.approved ? 'text-green-600 font-medium' : ''}>
                                  {formatCurrency(item.approved ? item.approvedCost : item.estimatedCost)}
                                  {item.approved && ' ✓'}
                                </span>
                              </div>
                            ))}
                            {request.materials.length > 2 && (
                              <p className="text-xs text-blue-600">+{request.materials.length - 2} more</p>
                            )}
                          </div>
                        </div>
                      )}

                      {request.equipment?.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-2 sm:p-3">
                          <p className="text-sm font-medium text-purple-700 mb-2">Equipment ({request.equipment.length})</p>
                          <div className="space-y-1">
                            {request.equipment.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-700">
                                <span>• {item.name}</span>
                                <span className={item.approved ? 'text-green-600 font-medium' : ''}>
                                  {formatCurrency(item.approved ? item.approvedCost : item.estimatedCost)}
                                  {item.approved && ' ✓'}
                                </span>
                              </div>
                            ))}
                            {request.equipment.length > 2 && (
                              <p className="text-xs text-purple-600">+{request.equipment.length - 2} more</p>
                            )}
                          </div>
                        </div>
                      )}

                      {request.manpower?.workers > 0 && (
                        <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                          <p className="text-sm font-medium text-green-700 mb-2">Manpower</p>
                          <div className="space-y-1 text-xs text-gray-700">
                            <p>• {request.manpower.workers} workers ({request.manpower.skillLevel})</p>
                            <p>• {request.manpower.days} days</p>
                            <p className={request.manpower.approved ? 'text-green-600 font-medium' : ''}>
                              • {formatCurrency(request.manpower.approved ? request.manpower.approvedCost : request.manpower.totalCost)}
                              {request.manpower.approved && ' ✓'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-t pt-3 sm:pt-4">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-sm sm:text-base">📅</span>
                          <span className="text-xs sm:text-sm">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        {isApprovedBucket && (
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(request.deliveryStatus)}`}>
                            🚚 {request.deliveryStatus}
                          </span>
                        )}
                      </div>

                      <div className="text-right w-full sm:w-auto">
                        <p className="text-xs sm:text-xs text-gray-600">
                          {isApprovedBucket ? 'Approved Amount' : 'Estimated Cost'}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-green-600 break-words">
                          {formatCurrency(
                            isApprovedBucket ? request.totalApprovedCost : request.totalEstimatedCost
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-3 sm:mt-4 bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                        <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                        <p className="text-sm text-red-600 mt-1">{request.rejectionReason}</p>
                      </div>
                    )}

                    {/* Approval Info */}
                    {request.status === 'approved' && request.approvedBy && (
                      <div className="mt-3 sm:mt-4 bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                          <span className="text-green-700">
                            Approved by <span className="font-medium">{request.approvedBy.name}</span>
                          </span>
                          <span className="text-green-600">{new Date(request.approvedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
