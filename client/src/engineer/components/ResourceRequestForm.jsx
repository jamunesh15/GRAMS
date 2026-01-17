import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { resourceRequestEndpoints, engineerEndpoints } from '../../Services/apis';

export default function ResourceRequestForm() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    grievanceId: '',
    fundRequired: '',
    resources: [],
    description: '',
  });

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(engineerEndpoints.GET_MY_ASSIGNED_GRIEVANCES_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        // Filter only assigned grievances with status 'in-progress' or 'assigned'
        const assignedGrievances = response.data.data.filter(
          (g) => g.status === 'in-progress' || g.status === 'assigned'
        );
        setGrievances(assignedGrievances);
      } 
    } catch (error) {
      console.error('Error fetching grievances:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch grievances');
    } finally {
      setLoading(false);
    }
  };

  const addResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, { name: '', reason: '' }],
    });
  }; 

  const removeResource = (index) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index),
    });
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...formData.resources];
    updatedResources[index][field] = value;
    setFormData({ ...formData, resources: updatedResources });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.grievanceId) {
      toast.error('Please select a grievance');
      return;
    }

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
        grievanceId: formData.grievanceId,
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
        // Reset form
        setFormData({
          grievanceId: '',
          fundRequired: '',
          resources: [],
          description: '',
        });
        // Refresh grievances list
        fetchGrievances();
      }
    } catch (error) {
      console.error('Error submitting resource request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit resource request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl p-12 shadow-lg border border-orange-100 text-center">
        <div className="animate-spin text-6xl">⏳</div>
        <p className="text-gray-700 font-semibold mt-4">Loading grievances...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl p-6 shadow-lg border border-orange-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
          <span>📝</span>
          Create Resource Request
        </h1>
        <p className="text-gray-700 font-medium mt-2">Request materials, equipment, or manpower for your assigned grievances</p>
      </div>

      {grievances.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl shadow-lg border border-orange-100 p-12 text-center">
          <span className="text-6xl">📭</span>
          <p className="text-gray-700 font-semibold mt-4">No assigned grievances found</p>
          <p className="text-gray-500 text-sm mt-2">You need to be assigned to a grievance to request resources</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 rounded-xl shadow-lg border border-orange-100 p-8 space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-900 font-semibold">Request Additional Resources</p>
                <p className="text-xs text-blue-700 mt-1">
                  Submit a request to the administrator for additional funds and resources needed to complete your assigned task.
                </p>
              </div>
            </div>
          </div>

          {/* Grievance Selection */}
          <div>
            <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Select Grievance <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.grievanceId}
              onChange={(e) => setFormData({ ...formData, grievanceId: e.target.value })}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base font-medium"
              required
            >
              <option value="">Choose a grievance...</option>
              {grievances.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.trackingId} - {g.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-2 ml-1">
              Select which assigned task you need resources for
            </p>
          </div>

          {/* Resources List */}
          <div>
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
          </div>

          {/* Fund Required */}
          <div>
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
                onChange={(e) => setFormData({ ...formData, fundRequired: e.target.value })}
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
          </div>

          {/* Description/Justification */}
          <div>
            <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description/Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              placeholder="Explain why these resources are required, how they will be used, and their necessity for task completion..."
            />
            <p className="text-xs text-gray-600 mt-2 ml-1">
              Provide a clear justification for the administrator
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
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
              onClick={() =>
                setFormData({
                  grievanceId: '',
                  fundRequired: '',
                  resources: [],
                  description: '',
                })
              }
              className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-bold rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all"
            >
              Reset
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}
