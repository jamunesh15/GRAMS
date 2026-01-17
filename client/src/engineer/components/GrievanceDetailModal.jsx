import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { engineerEndpoints } from '../../Services/apis';
import TaskCompletionForm from './TaskCompletionForm';

export default function GrievanceDetailModal({ grievanceId, isOpen, onClose, onUpdate }) {
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [startingWork, setStartingWork] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen && grievanceId) {
      setGrievance(null);
      setLoading(true);
      setShowCompletionForm(false);
      fetchGrievanceDetails();
    } else if (!isOpen) {
      // Reset state when modal closes
      setGrievance(null);
      setLoading(true);
      setShowCompletionForm(false);
    }
  }, [isOpen, grievanceId]);

  const fetchGrievanceDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching grievance details for ID:', grievanceId);
      console.log('API endpoint:', `${engineerEndpoints.GET_GRIEVANCE_DETAILS_API}/${grievanceId}`);
      
      const response = await fetch(`${engineerEndpoints.GET_GRIEVANCE_DETAILS_API}/${grievanceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setGrievance(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch grievance details');
        setGrievance(null);
      }
    } catch (error) {
      console.error('Error fetching grievance details:', error);
      toast.error('Failed to fetch grievance details');
      setGrievance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      setStartingWork(true);
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
        toast.success('Work started! Navigate to location and complete the task.');
        setGrievance(data.data);
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.message || 'Failed to start work');
      }
    } catch (error) {
      console.error('Error starting work:', error);
      toast.error('Failed to start work');
    } finally {
      setStartingWork(false);
    }
  };

  const openLocationInMaps = () => {
    if (grievance?.coordinates?.latitude && grievance?.coordinates?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${grievance.coordinates.latitude},${grievance.coordinates.longitude}`;
      window.open(url, '_blank');
    } else if (grievance?.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(grievance.location)}`;
      window.open(url, '_blank');
    } else {
      toast.error('Location information not available');
    }
  };

  const handleCompletionSuccess = () => {
    setShowCompletionForm(false);
    if (onUpdate) onUpdate();
    onClose();
    toast.success('Task completed successfully!');
  };

  if (!isOpen) return null;

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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      assigned: 'bg-blue-100 text-blue-700 border-blue-300',
      'in-progress': 'bg-purple-100 text-purple-700 border-purple-300',
      resolved: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

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
      
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4"
            style={{ zIndex: 9999 }}
            onClick={onClose}
          >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between z-10 shadow-lg">
            <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Grievance Details
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:rotate-90 hover:scale-110"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6 overflow-y-scroll hide-scrollbar flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading details...</p>
              </div>
            ) : showCompletionForm ? (
              <TaskCompletionForm
                grievanceId={grievanceId}
                onSuccess={handleCompletionSuccess}
                onCancel={() => setShowCompletionForm(false)}
              />
            ) : grievance ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-md">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <div className="text-3xl sm:text-5xl">
                      {getCategoryIcon(grievance.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 break-words">
                        {grievance.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 break-all">
                        Tracking ID: <span className="font-semibold text-blue-600">{grievance.trackingId}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 shadow-sm transform hover:scale-105 transition-all ${getStatusColor(grievance.status)}`}>
                          {grievance.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transform hover:scale-105 transition-all ${getPriorityColor(grievance.priority)}`}>
                          {grievance.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 capitalize shadow-sm transform hover:scale-105 transition-all">
                          {grievance.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-5 rounded-xl border border-gray-200 leading-relaxed">{grievance.description}</p>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location
                  </h4>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 sm:p-5 rounded-xl border border-red-200 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-gray-800 font-medium mb-2 break-words">{grievance.location || 'Location not specified'}</p>
                        {grievance.coordinates?.latitude && grievance.coordinates?.longitude && (
                          <p className="text-xs sm:text-sm text-gray-600 break-all">
                            Coordinates: {grievance.coordinates.latitude.toFixed(6)}, {grievance.coordinates.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={openLocationInMaps}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md font-semibold text-sm sm:text-base w-full sm:w-auto"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Open in Maps
                      </button>
                    </div>
                  </div>
                </div>

                {/* Citizen Info */}
                {grievance.userId && (
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      Reported By
                    </h4>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-sm sm:text-base text-gray-700 break-words"><strong>Name:</strong> {grievance.userId.name}</p>
                      <p className="text-sm sm:text-base text-gray-700 break-all"><strong>Email:</strong> {grievance.userId.email}</p>
                      {grievance.userId.phone && (
                        <p className="text-gray-700"><strong>Phone:</strong> {grievance.userId.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {grievance.attachments && grievance.attachments.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">📷 Attachments</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {grievance.attachments.map((attachment, index) => (
                        <div key={index} className="relative group">
                          {attachment.type === 'image' ? (
                            <img
                              src={attachment.url}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <video
                              src={attachment.url}
                              controls
                              className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Info */}
                {grievance.budget && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-green-100 shadow-md">
                    <h4 className="text-base sm:text-lg font-bold text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Budget Information
                    </h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-sm border border-green-200">
                        <p className="text-xs text-gray-600 font-medium mb-1">Allocated</p>
                        <p className="text-sm sm:text-xl lg:text-2xl font-bold text-green-600 break-words">₹{(grievance.budget.allocated || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-sm border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium mb-1">Spent</p>
                        <p className="text-sm sm:text-xl lg:text-2xl font-bold text-blue-600 break-words">₹{(grievance.budget.spent || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-sm border border-indigo-200">
                        <p className="text-xs text-gray-600 font-medium mb-1">Remaining</p>
                        <p className={`text-sm sm:text-xl lg:text-2xl font-bold break-words ${(grievance.budget.allocated || 0) - (grievance.budget.spent || 0) >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                          ₹{((grievance.budget.allocated || 0) - (grievance.budget.spent || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">⏱️ Timeline</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-gray-700">
                      <strong>Reported:</strong> {new Date(grievance.createdAt).toLocaleString()}
                    </p>
                    {grievance.assignedAt && (
                      <p className="text-gray-700">
                        <strong>Assigned:</strong> {new Date(grievance.assignedAt).toLocaleString()}
                      </p>
                    )}
                    {grievance.workStartedAt && (
                      <p className="text-gray-700">
                        <strong>Work Started:</strong> {new Date(grievance.workStartedAt).toLocaleString()}
                      </p>
                    )}
                    {grievance.workStartedAt && (
                      <p className="text-blue-600 font-semibold">
                        Time elapsed: {Math.ceil((new Date() - new Date(grievance.workStartedAt)) / (1000 * 60 * 60 * 24))} day(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load grievance details</p>
              </div>
            )}
          </div>

          {/* Sticky Footer with Action Buttons */}
          {!loading && !showCompletionForm && grievance && (
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-lg">
              <div className="flex gap-2 sm:gap-3">
                {grievance.status === 'assigned' || grievance.status === 'pending' ? (
                  <button
                    onClick={handleStartWork}
                    disabled={startingWork}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {startingWork ? (
                      <>
                        <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Starting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start Work
                      </>
                    )}
                  </button>
                ) : grievance.status === 'in-progress' ? (
                  <button
                    onClick={() => setShowCompletionForm(true)}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete Task
                  </button>
                ) : null}
                
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
        )}
      </AnimatePresence>
    </>
  );
}
