import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createEngineer, 
  getAllEngineers, 
  getEngineerStats,
  updateEngineer,
  deleteEngineer,
  assignGrievance,
  sendMessageToEngineer
} from '../../Services/operations/engineerAPI';
import { getAllGrievancesAdmin } from '../../Services/operations/adminAPI';
import CompletedTasksReview from './CompletedTasksReview';

const EngineersManagement = () => {
  const [activeTab, setActiveTab] = useState('engineers'); // New state for tabs
  const [engineers, setEngineers] = useState([]);
  const [allGrievances, setAllGrievances] = useState([]);
  const [stats, setStats] = useState({
    totalEngineers: 0,
    activeEngineers: 0,
    totalTasksAssigned: 0,
    totalTasksCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', specialization: 'all' });
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Selected items
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  
  // Form data
  const [newEngineer, setNewEngineer] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'General',
    department: '',
  });
  
  const [assignmentData, setAssignmentData] = useState({
    engineerId: '',
    grievanceIds: [], // Changed to array for multiple selection
    instructions: '',
  });
  
  const [messageData, setMessageData] = useState({
    engineerId: '',
    message: '',
    priority: 'medium',
  });

  const token = localStorage.getItem('token');
  const dropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ direction: 'bottom', top: 0, left: 0 });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button container and the dropdown menu
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate dropdown position
  const handleActionMenuClick = (engineerId, event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 350; // Approximate dropdown height

    // Calculate position
    let direction = 'bottom';
    let top = rect.bottom + 8; // 8px gap from button
    
    // Open upward if not enough space below but enough space above
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      direction = 'top';
      top = rect.top - dropdownHeight - 8;
    } else if (spaceBelow < dropdownHeight && spaceAbove < dropdownHeight) {
      // If not enough space on either side, center it or use what's available
      if (spaceAbove > spaceBelow) {
        direction = 'top';
        top = Math.max(10, rect.top - dropdownHeight - 8);
      } else {
        direction = 'bottom';
        top = rect.bottom + 8;
      }
    }

    setDropdownPosition({
      direction,
      top,
      left: rect.right - 256 // 256px = w-64 (dropdown width)
    });

    setOpenActionMenu(openActionMenu === engineerId ? null : engineerId);
  };

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('Starting to fetch data...');
      
      // Note: getAllGrievancesAdmin returns the data directly, not wrapped in a response object
      const [engineersData, statsData, grievancesData] = await Promise.all([
        getAllEngineers(token, filter.status !== 'all' ? { status: filter.status } : {}),
        getEngineerStats(token),
        getAllGrievancesAdmin(token),
      ]);
      
      console.log('Engineers response:', engineersData);
      console.log('Stats response:', statsData);
      console.log('Grievances response:', grievancesData);
      
      // getAllEngineers and getEngineerStats return {data: ...}
      // getAllGrievancesAdmin returns the data directly (already unwrapped)
      setEngineers(engineersData.data || []);
      setStats(statsData.data || {});
      setAllGrievances(Array.isArray(grievancesData) ? grievancesData : []);
      
      console.log('Final grievances array:', Array.isArray(grievancesData) ? grievancesData : []);
      console.log('Total grievances count:', Array.isArray(grievancesData) ? grievancesData.length : 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEngineer = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await createEngineer(newEngineer, token);
      setShowAddModal(false);
      setNewEngineer({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: 'General',
        department: '',
      });
      await fetchData();
      showToast(`Engineer created successfully! ID: ${response.data.engineerId}`, 'success');
    } catch (error) {
      console.error('Error adding engineer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add engineer';
      showToast(errorMessage, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateEngineer = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateEngineer(selectedEngineer._id, selectedEngineer, token);
      setShowEditModal(false);
      setSelectedEngineer(null);
      fetchData();
      showToast('Engineer updated successfully', 'success');
    } catch (error) {
      console.error('Error updating engineer:', error);
      showToast(error.response?.data?.message || 'Failed to update engineer', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEngineer = async () => {
    try {
      await deleteEngineer(selectedEngineer._id, token);
      setShowDeleteModal(false);
      setSelectedEngineer(null);
      fetchData();
      showToast('Engineer deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting engineer:', error);
      showToast(error.response?.data?.message || 'Failed to delete engineer', 'error');
    }
  };

  const handleAssignGrievance = async (e) => {
    e.preventDefault();
    try {
      // Assign each selected grievance
      for (const grievanceId of assignmentData.grievanceIds) {
        await assignGrievance({
          engineerId: assignmentData.engineerId,
          grievanceId: grievanceId,
          instructions: assignmentData.instructions,
        }, token);
      }
      setShowAssignModal(false);
      setAssignmentData({ engineerId: '', grievanceIds: [], instructions: '' });
      fetchData();
      showToast(`${assignmentData.grievanceIds.length} grievance(s) assigned successfully`, 'success');
    } catch (error) {
      console.error('Error assigning grievance:', error);
      showToast(error.response?.data?.message || 'Failed to assign grievance', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await sendMessageToEngineer(messageData, token);
      setShowMessageModal(false);
      setMessageData({ engineerId: '', message: '', priority: 'medium' });
      showToast('Message sent successfully', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast(error.response?.data?.message || 'Failed to send message', 'error');
    }
  };

  const openEditModal = (engineer) => {
    setSelectedEngineer({ ...engineer });
    setShowEditModal(true);
  };

  const openDeleteModal = (engineer) => {
    setSelectedEngineer(engineer);
    setShowDeleteModal(true);
  };

  const openViewModal = (engineer) => {
    setSelectedEngineer(engineer);
    setShowViewModal(true);
  };

  const openAssignModal = (engineer) => {
    setAssignmentData({ ...assignmentData, engineerId: engineer._id });
    setShowAssignModal(true);
  };

  const openMessageModal = (engineer) => {
    setMessageData({ ...messageData, engineerId: engineer._id });
    setShowMessageModal(true);
  };

  // Get available grievances (not assigned or assigned to current engineer)
  const getAvailableGrievances = (engineerId) => {
    if (!allGrievances || !Array.isArray(allGrievances)) {
      return [];
    }
    return allGrievances.filter(g => 
      !g.assignedTo || g.assignedTo === engineerId
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            <span className="text-xl">{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            👷 Engineers Management
          </h1>
          <p className="text-gray-600 mt-1">Manage engineers and task assignments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Engineer
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('engineers')}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
              activeTab === 'engineers'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            👷 Engineers List
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
              activeTab === 'completed'
                ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            ✅ Completed Tasks Review
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'completed' ? (
        <CompletedTasksReview />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-3 sm:p-5 text-white shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-[10px] sm:text-sm font-medium">Total Engineers</p>
              <h3 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{stats.totalEngineers}</h3>
            </div>
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl sm:text-4xl">👷</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-emerald-300 rounded-lg sm:rounded-xl p-3 sm:p-5 text-white shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-[10px] sm:text-sm font-medium">Active Engineers</p>
              <h3 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{stats.activeEngineers}</h3>
            </div>
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl sm:text-4xl">✅</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl p-3 sm:p-5 text-white shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-[10px] sm:text-sm font-medium">Active Tasks</p>
              <h3 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{stats.totalTasksAssigned}</h3>
            </div>
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl sm:text-4xl">📋</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl p-3 sm:p-5 text-white shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-[10px] sm:text-sm font-medium">Completed Tasks</p>
              <h3 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{stats.totalTasksCompleted}</h3>
            </div>
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl sm:text-4xl">🎯</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              📊 Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Engineers Table - Desktop View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Engineer ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Specialization</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Active Tasks</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Completed</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {engineers.map((engineer, index) => (
                  <motion.tr
                    key={engineer._id}
                    data-engineer-id={engineer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-green-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <td className="px-6 py-8 text-sm font-medium text-green-600">
                      {engineer.engineerId || `ENG-${engineer._id.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-8 text-sm font-medium text-gray-900">
                      {engineer.name}
                    </td>
                    <td className="px-6 py-8 text-sm text-gray-600">
                      {engineer.email}
                    </td>
                    <td className="px-6 py-8 text-sm">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {engineer.specialization || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-8 text-sm text-gray-900 font-semibold">
                      {engineer.activeTasks || 0}
                    </td>
                    <td className="px-6 py-8 text-sm text-gray-900">
                      {engineer.completedTasks || 0}
                    </td>
                    <td className="px-6 py-8 text-sm">
                      {engineer.isActive ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-8 text-sm">
                      <div ref={dropdownRef} className="relative inline-block">
                        <button
                          onClick={(e) => handleActionMenuClick(engineer._id, e)}
                          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2.5"
                        >
                          <span>Actions</span>
                          <span className={`transition-transform duration-300 text-lg ${
                            openActionMenu === engineer._id ? 'rotate-180' : ''
                          }`}>▼</span>
                        </button>
                        
                        {/* Dropdown Menu - Fixed Positioning */}
                        {openActionMenu === engineer._id && (
                          <motion.div 
                            ref={dropdownMenuRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: 'fixed',
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`,
                            }}
                            className="w-64 bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-2xl border-2 border-purple-200 py-3 z-[9999] max-h-[400px] overflow-y-auto"
                          >
                            <div className="px-3 pb-2 mb-2 border-b border-purple-200">
                              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Quick Actions</p>
                            </div>
                            <button
                              onClick={() => {
                                openViewModal(engineer);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-3.5 mx-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-50 transition-all duration-200 flex items-center gap-3 text-gray-800 font-semibold rounded-xl hover:shadow-md hover:scale-[1.02]"
                            >
                              <span className="text-2xl">👁️</span>
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => {
                                openAssignModal(engineer);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-3.5 mx-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-purple-50 transition-all duration-200 flex items-center gap-3 text-gray-800 font-semibold rounded-xl hover:shadow-md hover:scale-[1.02]"
                            >
                              <span className="text-2xl">📋</span>
                              <span>Assign Task</span>
                            </button>
                            <button
                              onClick={() => {
                                openMessageModal(engineer);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-3.5 mx-2 hover:bg-gradient-to-r hover:from-cyan-100 hover:to-cyan-50 transition-all duration-200 flex items-center gap-3 text-gray-800 font-semibold rounded-xl hover:shadow-md hover:scale-[1.02]"
                            >
                              <span className="text-2xl">💬</span>
                              <span>Send Message</span>
                            </button>
                            <button
                              onClick={() => {
                                openEditModal(engineer);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-3.5 mx-2 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-50 transition-all duration-200 flex items-center gap-3 text-gray-800 font-semibold rounded-xl hover:shadow-md hover:scale-[1.02]"
                            >
                              <span className="text-2xl">✏️</span>
                              <span>Edit Engineer</span>
                            </button>
                            <div className="border-t border-purple-200 my-2 mx-3"></div>
                            <button
                              onClick={() => {
                                openDeleteModal(engineer);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-3.5 mx-2 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 transition-all duration-200 flex items-center gap-3 text-red-600 font-semibold rounded-xl hover:shadow-md hover:scale-[1.02]"
                            >
                              <span className="text-2xl">🗑️</span>
                              <span>Delete Engineer</span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {engineers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No engineers found</p>
              <p className="text-sm mt-2">Add your first engineer to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Engineers Cards - Mobile View */}
      <div className="lg:hidden space-y-4">
        {engineers.length > 0 ? (
          <AnimatePresence>
            {engineers.map((engineer, index) => (
              <motion.div
                key={engineer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold">
                    {engineer.engineerId || `ENG-${engineer._id.slice(-8).toUpperCase()}`}
                  </span>
                  {engineer.isActive ? (
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">Active</span>
                  ) : (
                    <span className="text-xs bg-gray-500/20 px-3 py-1 rounded-full font-semibold">Inactive</span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Name */}
                  <h3 className="text-gray-800 font-bold text-lg">
                    {engineer.name}
                  </h3>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span className="break-all">{engineer.email}</span>
                  </div>

                  {/* Specialization & Tasks Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Specialization</p>
                      <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium inline-block">
                        {engineer.specialization || 'General'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                      {engineer.isActive ? (
                        <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium inline-block">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium inline-block">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tasks Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-700 font-semibold mb-1">Active Tasks</p>
                      <p className="text-2xl font-bold text-orange-600">{engineer.activeTasks || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-700 font-semibold mb-1">Completed</p>
                      <p className="text-2xl font-bold text-purple-600">{engineer.completedTasks || 0}</p>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={(e) => handleActionMenuClick(engineer._id, e)}
                      className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                    >
                      <span>Actions</span>
                      <span className={`transition-transform duration-300 text-lg ${
                        openActionMenu === engineer._id ? 'rotate-180' : ''
                      }`}>▼</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openActionMenu === engineer._id && (
                      <motion.div 
                        ref={dropdownMenuRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'fixed',
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                        }}
                        className="w-64 bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-2xl border-2 border-purple-200 py-3 z-[9999] max-h-[400px] overflow-y-auto"
                      >
                        <div className="px-3 pb-2 mb-2 border-b border-purple-200">
                          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Quick Actions</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedEngineer(engineer);
                            setShowViewModal(true);
                            setOpenActionMenu(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center gap-3 text-gray-700 hover:text-purple-700 rounded-lg mx-1"
                        >
                          <span className="text-2xl">👁️</span>
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setAssignmentData({ ...assignmentData, engineerId: engineer._id });
                            setShowAssignModal(true);
                            setOpenActionMenu(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center gap-3 text-gray-700 hover:text-purple-700 rounded-lg mx-1"
                        >
                          <span className="text-2xl">📋</span>
                          <span>Assign Task</span>
                        </button>
                        <button
                          onClick={() => {
                            setMessageData({ ...messageData, engineerId: engineer._id });
                            setShowMessageModal(true);
                            setOpenActionMenu(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center gap-3 text-gray-700 hover:text-purple-700 rounded-lg mx-1"
                        >
                          <span className="text-2xl">💬</span>
                          <span>Send Message</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEngineer(engineer);
                            setShowEditModal(true);
                            setOpenActionMenu(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center gap-3 text-gray-700 hover:text-purple-700 rounded-lg mx-1"
                        >
                          <span className="text-2xl">✏️</span>
                          <span>Edit Engineer</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEngineer(engineer);
                            setShowDeleteModal(true);
                            setOpenActionMenu(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 transition-all duration-200 flex items-center gap-3 text-red-600 hover:text-red-700 rounded-lg mx-1"
                        >
                          <span className="text-2xl">🗑️</span>
                          <span>Delete Engineer</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center text-gray-500">
              <p className="text-lg">No engineers found</p>
              <p className="text-sm mt-2">Add your first engineer to get started!</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Engineer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  ➕ Add New Engineer
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddEngineer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEngineer.name}
                    onChange={(e) => setNewEngineer({ ...newEngineer, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Engineer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEngineer.email}
                    onChange={(e) => setNewEngineer({ ...newEngineer, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="engineer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newEngineer.password}
                    onChange={(e) => setNewEngineer({ ...newEngineer, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newEngineer.phone}
                    onChange={(e) => setNewEngineer({ ...newEngineer, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <select
                    value={newEngineer.specialization}
                    onChange={(e) => setNewEngineer({ ...newEngineer, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Roads">Roads</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Sanitation">Sanitation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newEngineer.department}
                    onChange={(e) => setNewEngineer({ ...newEngineer, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Department name"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Engineer'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={creating}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Engineer Modal */}
      <AnimatePresence>
        {showEditModal && selectedEngineer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                  ✏️ Edit Engineer
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUpdateEngineer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={updating}
                    value={selectedEngineer.name}
                    onChange={(e) => setSelectedEngineer({ ...selectedEngineer, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={updating}
                    value={selectedEngineer.email}
                    onChange={(e) => setSelectedEngineer({ ...selectedEngineer, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    disabled={updating}
                    value={selectedEngineer.phone || ''}
                    onChange={(e) => setSelectedEngineer({ ...selectedEngineer, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <select
                    disabled={updating}
                    value={selectedEngineer.specialization || 'General'}
                    onChange={(e) => setSelectedEngineer({ ...selectedEngineer, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="General">General</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Roads">Roads</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Sanitation">Sanitation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    disabled={updating}
                    value={selectedEngineer.department || ''}
                    onChange={(e) => setSelectedEngineer({ ...selectedEngineer, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      disabled={updating}
                      checked={selectedEngineer.isActive}
                      onChange={(e) => setSelectedEngineer({ ...selectedEngineer, isActive: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      'Update Engineer'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Grievance Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  📋 Assign Task
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAssignGrievance} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Grievances * 
                    <span className="text-xs font-normal text-purple-600 ml-2">
                      (Hold Ctrl/Cmd to select multiple)
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      multiple
                      value={assignmentData.grievanceIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setAssignmentData({ ...assignmentData, grievanceIds: selected });
                      }}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[280px] bg-gradient-to-br from-purple-50 to-white"
                      style={{
                        backgroundImage: 'linear-gradient(to bottom right, #faf5ff, #ffffff)',
                      }}
                    >
                      {getAvailableGrievances(assignmentData.engineerId).map(g => (
                        <option 
                          key={g._id} 
                          value={g._id} 
                          className="py-2.5 px-3 hover:bg-purple-100 rounded-lg my-1 cursor-pointer transition-colors"
                          style={{
                            padding: '10px',
                            margin: '4px 0',
                            borderRadius: '8px',
                          }}
                        >
                          {g.trackingId} - {g.title?.substring(0, 80) || 'No title'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {assignmentData.grievanceIds.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <span className="text-green-600 text-lg">✓</span>
                        <span className="text-sm font-semibold text-green-700">
                          {assignmentData.grievanceIds.length} grievance(s) selected
                        </span>
                      </div>
                    )}
                    {getAvailableGrievances(assignmentData.engineerId).length === 0 && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                        <span className="text-red-600 text-lg">⚠️</span>
                        <span className="text-sm font-semibold text-red-700">
                          No grievances available to assign. All grievances may already be assigned.
                        </span>
                      </div>
                    )}
                    {allGrievances.length > 0 && getAvailableGrievances(assignmentData.engineerId).length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <span className="text-xs text-blue-600">
                          📊 Total available: <strong>{getAvailableGrievances(assignmentData.engineerId).length}</strong> grievances
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none bg-gradient-to-br from-gray-50 to-white"
                    rows="4"
                    placeholder="Special instructions for the engineer..."
                  />
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={assignmentData.grievanceIds.length === 0}
                    className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Assign {assignmentData.grievanceIds.length > 0 ? `${assignmentData.grievanceIds.length} ` : ''}Task{assignmentData.grievanceIds.length > 1 ? 's' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                  💬 Send Message
                </h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    value={messageData.message}
                    onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    rows="6"
                    placeholder="Type your message here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={messageData.priority}
                    onChange={(e) => setMessageData({ ...messageData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedEngineer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Delete Engineer?
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{selectedEngineer.name}</strong>? 
                  All assigned tasks will be unassigned. This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteEngineer}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Engineer Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedEngineer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  👤 Engineer Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <label className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Engineer ID</label>
                    <p className="font-bold text-blue-700 text-lg mt-1">{selectedEngineer.engineerId}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <label className="text-xs text-green-600 font-semibold uppercase tracking-wide">Status</label>
                    <p className="mt-1">
                      {selectedEngineer.isActive ? (
                        <span className="px-3 py-1.5 rounded-full bg-green-500 text-white text-sm font-medium inline-block">
                          ✓ Active
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-gray-500 text-white text-sm font-medium inline-block">
                          ✗ Inactive
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <label className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Name</label>
                  <p className="font-bold text-purple-900 text-lg mt-1">{selectedEngineer.name}</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl">
                  <label className="text-xs text-cyan-600 font-semibold uppercase tracking-wide">Email</label>
                  <p className="font-semibold text-cyan-900 mt-1">{selectedEngineer.email}</p>
                </div>

                {selectedEngineer.phone && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                    <label className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Phone</label>
                    <p className="font-semibold text-orange-900 mt-1">{selectedEngineer.phone}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
                    <label className="text-xs text-pink-600 font-semibold uppercase tracking-wide">Specialization</label>
                    <p className="font-semibold text-pink-900 mt-1">{selectedEngineer.specialization || 'General'}</p>
                  </div>
                  {selectedEngineer.department && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
                      <label className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Department</label>
                      <p className="font-semibold text-indigo-900 mt-1">{selectedEngineer.department}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <label className="text-xs text-blue-100 font-semibold uppercase tracking-wide">Active Tasks</label>
                    <p className="font-bold text-4xl mt-2">{selectedEngineer.activeTasks || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <label className="text-xs text-green-100 font-semibold uppercase tracking-wide">Completed Tasks</label>
                    <p className="font-bold text-4xl mt-2">{selectedEngineer.completedTasks || 0}</p>
                  </div>
                </div>

                {selectedEngineer.assignedGrievances && selectedEngineer.assignedGrievances.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                    <label className="text-xs text-gray-700 font-semibold uppercase tracking-wide mb-3 block">Assigned Grievances ({selectedEngineer.assignedGrievances.length})</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedEngineer.assignedGrievances.map(g => (
                        <div key={g._id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <p className="font-bold text-sm text-blue-600">{g.trackingId}</p>
                          <p className="text-sm text-gray-700 mt-1">{g.title}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              g.status === 'open' ? 'bg-blue-100 text-blue-700' :
                              g.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                              g.status === 'resolved' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {g.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              g.priority === 'low' ? 'bg-gray-100 text-gray-700' :
                              g.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {g.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all mt-6"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default EngineersManagement;
