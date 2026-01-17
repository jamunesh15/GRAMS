import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { resourceRequestEndpoints } from '../../Services/apis';

export default function TaskResourceRequestModal({ grievanceId, grievanceTitle, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fundRequired: '',
    resources: [],
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { name: '', reason: '' }]
    }));
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...formData.resources];
    updatedResources[index][field] = value;
    setFormData(prev => ({ ...prev, resources: updatedResources }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fundRequired || formData.fundRequired <= 0) {
      toast.error('Please enter valid fund amount');
      return;
    }

    if (formData.resources.length === 0 || formData.resources.every(r => !r.name.trim())) {
      toast.error('Please add at least one resource');
      return;
    }

    const invalidResources = formData.resources.filter(r => r.name.trim() && !r.reason.trim());
    if (invalidResources.length > 0) {
      toast.error('Please provide a reason for all resources');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    try {
      setSubmitting(true);

      const materials = formData.resources
        .filter(r => r.name.trim())
        .map(resource => ({
          name: resource.name.trim(),
          quantity: 1,
          unit: 'set',
          estimatedCost: parseFloat(formData.fundRequired) / formData.resources.filter(r => r.name.trim()).length,
          reason: resource.reason.trim()
        }));

      const requestData = {
        grievanceId: grievanceId,
        requestType: 'materials',
        priority: 'medium',
        justification: formData.description,
        materials: materials,
        equipment: [],
        manpower: {}
      };

      const response = await axios.post(
        resourceRequestEndpoints.CREATE_RESOURCE_REQUEST,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Resource request submitted successfully! 🎉');
        if (onSuccess) onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error('Error submitting resource request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit resource request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fundRequired: '',
      resources: [],
      description: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .hide-scrollbar-modal::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar-modal {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="resource-request-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-8 py-6 flex items-center justify-between flex-shrink-0">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold">Request Resources</h2>
                  <p className="text-sm text-orange-100 mt-1">{grievanceTitle}</p>
                </motion.div>
                <motion.button
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  disabled={submitting}
                  className="p-2 hover:bg-white/20 rounded-xl transition disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto hide-scrollbar-modal">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Info Banner */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-900 font-semibold">Request Additional Resources</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Submit a request to the administrator for additional funds and resources needed to complete this task.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Resources List */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Resources Needed <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-3">
                      {formData.resources.map((resource, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-2 border-purple-200 rounded-2xl p-4 bg-purple-50/50 space-y-3"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Resource {index + 1} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={resource.name}
                                  onChange={(e) => updateResource(index, 'name', e.target.value)}
                                  placeholder="e.g., Cement - 10 bags"
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Why needed? <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  value={resource.reason}
                                  onChange={(e) => updateResource(index, 'reason', e.target.value)}
                                  placeholder="Explain why this resource is required..."
                                  rows={2}
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                                />
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => removeResource(index)}
                              className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition mt-6"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={addResource}
                        className="w-full px-4 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <Plus className="w-5 h-5" />
                        Add Resource
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 ml-1">
                      Add each resource with name (e.g., "Cement - 10 bags") and why it's needed
                    </p>
                  </motion.div>

                  {/* Fund Required */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fund Required (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-lg">₹</span>
                      <input
                        type="number"
                        name="fundRequired"
                        value={formData.fundRequired}
                        onChange={(e) => setFormData(prev => ({ ...prev, fundRequired: e.target.value }))}
                        min="1"
                        step="0.01"
                        required
                        className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-semibold"
                        placeholder="Enter amount"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 ml-1">
                      Specify the total estimated cost for the resources
                    </p>
                  </motion.div>

                  {/* Description/Justification */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Description/Justification <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      rows={4}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Explain why these resources are required, how they will be used, and their necessity for task completion..."
                    />
                    <p className="text-xs text-gray-600 mt-2 ml-1">
                      Provide a clear justification for the administrator
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="flex gap-3 pt-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (  
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Submit Request</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-bold rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
