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
  
  const [grievanceSearch, setGrievanceSearch] = useState('');
  
  const [messageData, setMessageData] = useState({
    engineerId: '',
    message: '',
    priority: 'medium',
  });

  const token = localStorage.getItem('token');

  // Refs for dropdown elements
  const dropdownRefs = useRef({});
  const dropdownMenuRefs = useRef({});
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    if (!openActionMenu) return;

    const handleClickOutside = (event) => {
      const menuRef = dropdownMenuRefs.current[openActionMenu];
      const buttonRef = dropdownRefs.current[openActionMenu];
      
      if (menuRef && menuRef.contains(event.target)) return;
      if (buttonRef && buttonRef.contains(event.target)) return;
      
      setOpenActionMenu(null);
    };

    const handleScroll = () => {
      setOpenActionMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openActionMenu]);

  // Prevent mousedown on button from triggering click-outside handler
  const handleButtonMouseDown = (event) => {
    event.stopPropagation();
  };

  // Calculate position and toggle menu
  const handleActionMenuClick = (engineerId, event) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (openActionMenu === engineerId) {
      setOpenActionMenu(null);
      return;
    }
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const menuWidth = Math.min(256, window.innerWidth - 20);
    const menuHeight = 280;
    const isMobile = window.innerWidth < 768;
    
    let top, left;
    
    if (isMobile) {
      // For mobile - center horizontally, position above or below button
      left = (window.innerWidth - menuWidth) / 2;
      
      // Check if there's space below
      if (window.innerHeight - rect.bottom > menuHeight + 20) {
        top = rect.bottom + 8;
      } else {
        // Show above
        top = Math.max(10, rect.top - menuHeight - 8);
      }
    } else {
      // Desktop - align to right edge of button
      left = rect.right - menuWidth;
      top = rect.bottom + 8;
      
      // If not enough space below, show above
      if (window.innerHeight - rect.bottom < menuHeight + 20) {
        top = rect.top - menuHeight - 8;
      }
      
      // Keep menu within viewport
      if (left < 10) left = 10;
    }
    
    // Ensure top is never negative
    if (top < 10) top = 10;
    
    setMenuPosition({ top, left });
    setOpenActionMenu(engineerId);
  };

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Client-side filtering function
  const getFilteredEngineers = () => {
    if (filter.status === 'all') {
      return engineers;
    }
    return engineers.filter(engineer => {
      if (filter.status === 'active') return engineer.isActive === true;
      if (filter.status === 'inactive') return engineer.isActive === false;
      return true;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('Starting to fetch data...');
      
      // Note: getAllGrievancesAdmin returns the data directly, not wrapped in a response object
      const [engineersData, statsData, grievancesData] = await Promise.all([
        getAllEngineers(token),
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient"
          >
            👷 Engineers Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-600 mt-1"
          >
            Manage engineers and task assignments
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold flex items-center gap-2 relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          <span className="relative text-xl">+</span>
          <span className="relative">Add Engineer</span>
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100"
      >
        <div className="flex border-b border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('engineers')}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all duration-300 relative overflow-hidden group ${
              activeTab === 'engineers'
                ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {activeTab === 'engineers' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">👷 Engineers List</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-6 py-4 font-medium text-sm transition-all duration-300 relative overflow-hidden group ${
              activeTab === 'completed'
                ? 'text-green-600 bg-gradient-to-r from-green-50 to-emerald-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {activeTab === 'completed' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">✅ Completed Tasks Review</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'completed' ? (
          <motion.div
            key="completed-tasks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CompletedTasksReview />
          </motion.div>
        ) : (
          <motion.div
            key="engineers-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
          <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
            {/* Total Engineers Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full"></div>
              </div>
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-blue-100 mb-2">Total Engineers</p>
                  <motion.h3 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-3xl sm:text-4xl font-bold text-white"
                  >
                    {stats.totalEngineers}
                  </motion.h3>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                >
                  <span className="text-2xl sm:text-3xl">👷</span>
                </motion.div>
              </div>
              <div className="w-16 h-1 bg-white/40 rounded-full relative z-10"></div>
            </motion.div>

            {/* Active Engineers Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-28 h-28 bg-white rounded-full -ml-14 -mt-14"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white rounded-full -mr-10 -mb-10"></div>
                <div className="absolute top-2/3 left-1/3 w-12 h-12 bg-white rounded-full"></div>
              </div>
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-green-100 mb-2">Active Engineers</p>
                  <motion.h3 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="text-3xl sm:text-4xl font-bold text-white"
                  >
                    {stats.activeEngineers}
                  </motion.h3>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                >
                  <span className="text-2xl sm:text-3xl">✅</span>
                </motion.div>
              </div>
              <div className="w-16 h-1 bg-white/40 rounded-full relative z-10"></div>
            </motion.div>

            {/* Active Tasks Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white rounded-full -mr-18 -mt-18"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full -ml-10 -mb-10"></div>
                <div className="absolute top-1/3 left-1/2 w-14 h-14 bg-white rounded-full"></div>
              </div>
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-orange-100 mb-2">Active Tasks</p>
                  <motion.h3 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="text-3xl sm:text-4xl font-bold text-white"
                  >
                    {stats.totalTasksAssigned}
                  </motion.h3>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                >
                  <span className="text-2xl sm:text-3xl">📋</span>
                </motion.div>
              </div>
              <div className="w-16 h-1 bg-white/40 rounded-full relative z-10"></div>
            </motion.div>

            {/* Completed Tasks Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mt-16"></div>
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-white rounded-full -mr-14 -mb-14"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white rounded-full"></div>
              </div>
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-purple-100 mb-2">Completed Tasks</p>
                  <motion.h3 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="text-3xl sm:text-4xl font-bold text-white"
                  >
                    {stats.totalTasksCompleted}
                  </motion.h3>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                >
                  <span className="text-2xl sm:text-3xl">🎯</span>
                </motion.div>
              </div>
              <div className="w-16 h-1 bg-white/40 rounded-full relative z-10"></div>
            </motion.div>
          </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg mb-6 border border-gray-200 overflow-visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative z-10"
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              <span className="text-lg sm:text-xl">📊</span> Filter by Status
            </label>
            <div className="relative">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full appearance-none px-4 py-3 sm:px-5 sm:py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-purple-400 shadow-sm font-medium text-gray-700 cursor-pointer text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              {/* Custom Dropdown Arrow */}
              <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Filter Result Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 sm:mt-3 inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold border border-purple-100"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Showing {getFilteredEngineers().length} of {engineers.length} engineers</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Engineers Table - Desktop View */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white">
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
                {getFilteredEngineers().map((engineer, index) => (
                  <motion.tr
                    key={engineer._id}
                    data-engineer-id={engineer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    whileHover={{ scale: 1.01 }}
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
                      <div className="flex items-center">
                        <span className="inline-block px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium whitespace-nowrap">
                          {engineer.specialization || 'General'}
                        </span>
                      </div>
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
                      <div ref={el => dropdownRefs.current[engineer._id] = el}>
                        <button
                          onMouseDown={handleButtonMouseDown}
                          onClick={(e) => handleActionMenuClick(engineer._id, e)}
                          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2.5"
                        >
                          <span>Actions</span>
                          <span className={`transition-transform duration-300 text-lg ${
                            openActionMenu === engineer._id ? 'rotate-180' : ''
                          }`}>▼</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {/* Fixed Position Dropdown Menu - Rendered outside table */}
          
          {getFilteredEngineers().length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 text-gray-500"
            >
              <p className="text-lg">No engineers found</p>
              <p className="text-sm mt-2">{filter.status !== 'all' ? 'Try changing the filter' : 'Add your first engineer to get started!'}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Engineers Cards - Mobile View */}
      <div className="lg:hidden space-y-4">
        {getFilteredEngineers().length > 0 ? (
          <AnimatePresence>
            {getFilteredEngineers().map((engineer, index) => (
              <motion.div
                key={engineer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.02 }}
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
                  <div ref={el => dropdownRefs.current[engineer._id] = el}>
                    <button
                      onMouseDown={handleButtonMouseDown}
                      onClick={(e) => handleActionMenuClick(engineer._id, e)}
                      className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                    >
                      <span>Actions</span>
                      <span className={`transition-transform duration-300 text-lg ${
                        openActionMenu === engineer._id ? 'rotate-180' : ''
                      }`}>▼</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <div className="text-center text-gray-500">
              <p className="text-lg">No engineers found</p>
              <p className="text-sm mt-2">{filter.status !== 'all' ? 'Try changing the filter' : 'Add your first engineer to get started!'}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Global Actions Dropdown Menu - Works for both Desktop and Mobile */}
      {openActionMenu && getFilteredEngineers().find(e => e._id === openActionMenu) && (
        <div 
          ref={el => dropdownMenuRefs.current[openActionMenu] = el}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            maxWidth: 'calc(100vw - 20px)',
          }}
          className="w-64 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 py-3 z-[99999]"
        >
          <div className="px-4 pb-2 mb-2 border-b border-purple-200">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Quick Actions</p>
          </div>
          {(() => {
            const engineer = getFilteredEngineers().find(e => e._id === openActionMenu);
            return (
              <>
                <button
                  onClick={() => {
                    openViewModal(engineer);
                    setOpenActionMenu(null);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-all duration-200 flex items-center gap-3 text-gray-800 font-medium"
                >
                  <span className="text-lg">👁️</span>
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    openAssignModal(engineer);
                    setOpenActionMenu(null);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-all duration-200 flex items-center gap-3 text-gray-800 font-medium"
                >
                  <span className="text-lg">📋</span>
                  <span>Assign Task</span>
                </button>
                <button
                  onClick={() => {
                    openMessageModal(engineer);
                    setOpenActionMenu(null);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-all duration-200 flex items-center gap-3 text-gray-800 font-medium"
                >
                  <span className="text-lg">💬</span>
                  <span>Send Message</span>
                </button>
                <div className="border-t border-purple-200 my-2 mx-3"></div>
                <button
                  onClick={() => {
                    openDeleteModal(engineer);
                    setOpenActionMenu(null);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 transition-all duration-200 flex items-center gap-3 text-red-600 font-medium"
                >
                  <span className="text-lg">🗑️</span>
                  <span>Delete Engineer</span>
                </button>
              </>
            );
          })()}
        </div>
      )}

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
            className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-[10000] border border-gray-200"
              style={{ maxWidth: '600px', width: '95%' }}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-2xl">✏️</span>
                  </div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">
                    Edit Engineer
                  </h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/80 hover:text-white text-3xl leading-none hover:rotate-90 transition-all duration-300"
                >
                  ×
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5">
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
              </div>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-[9999] p-6"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-[10000] border border-gray-200"
              style={{ maxWidth: '950px', width: '92%' }}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">
                    Assign Task
                  </h2>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-white/80 hover:text-white text-2xl leading-none hover:rotate-90 transition-all duration-300"
                >
                  ×
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5">
              <form onSubmit={handleAssignGrievance} className="space-y-3.5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Select Grievances * 
                    <span className="text-xs font-normal text-purple-600 ml-2">
                      (Click to select multiple)
                    </span>
                  </label>
                  
                  {/* Search Bar */}
                  <div className="relative mb-2.5">
                    <input
                      type="text"
                      placeholder="Search grievances..."
                      value={grievanceSearch}
                      onChange={(e) => setGrievanceSearch(e.target.value)}
                      className="w-full px-4 py-3 pl-11 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-sm"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Grievance Cards with Priority Badges */}
                  <div className="border-2 border-purple-200 rounded-xl bg-white max-h-[270px] overflow-y-auto p-2.5 space-y-2">
                    {getAvailableGrievances(assignmentData.engineerId)
                      .filter(g => {
                        const searchLower = grievanceSearch.toLowerCase();
                        return g.trackingId?.toLowerCase().includes(searchLower) ||
                               g.title?.toLowerCase().includes(searchLower) ||
                               g.location?.toLowerCase().includes(searchLower);
                      })
                      .map(g => {
                        const isSelected = assignmentData.grievanceIds.includes(g._id);
                        return (
                          <div
                            key={g._id}
                            onClick={() => {
                              const isAlreadySelected = assignmentData.grievanceIds.includes(g._id);
                              if (isAlreadySelected) {
                                setAssignmentData({
                                  ...assignmentData,
                                  grievanceIds: assignmentData.grievanceIds.filter(id => id !== g._id)
                                });
                              } else {
                                setAssignmentData({
                                  ...assignmentData,
                                  grievanceIds: [...assignmentData.grievanceIds, g._id]
                                });
                              }
                            }}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-purple-500 bg-purple-50 shadow-md' 
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="font-bold text-sm text-purple-700">{g.trackingId}</span>
                                  {g.priority && (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                      g.priority.toLowerCase() === 'critical' 
                                        ? 'bg-rose-600 text-white' 
                                        : g.priority.toLowerCase() === 'high' 
                                        ? 'bg-red-500 text-white' 
                                        : g.priority.toLowerCase() === 'medium' 
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-green-500 text-white'
                                    }`}>
                                      {g.priority}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-700 font-semibold line-clamp-1 mb-1">{g.title || 'No title'}</p>
                                {g.location && (
                                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                    <span>📍</span>
                                    <span className="line-clamp-1">{g.location}</span>
                                  </p>
                                )}
                              </div>
                              <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-purple-600 border-purple-600' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {getAvailableGrievances(assignmentData.engineerId)
                      .filter(g => {
                        const searchLower = grievanceSearch.toLowerCase();
                        return g.trackingId?.toLowerCase().includes(searchLower) ||
                               g.title?.toLowerCase().includes(searchLower) ||
                               g.location?.toLowerCase().includes(searchLower);
                      }).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-sm">No grievances found.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {assignmentData.grievanceIds.length > 0 && (
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <span className="text-green-600 text-sm">✓</span>
                        <span className="text-sm font-semibold text-green-700">
                          {assignmentData.grievanceIds.length} selected
                        </span>
                      </div>
                    )}
                    {getAvailableGrievances(assignmentData.engineerId).length === 0 && (
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
                        <span className="text-red-600 text-base">⚠️</span>
                        <span className="text-sm font-semibold text-red-700">
                          No grievances available to assign.
                        </span>
                      </div>
                    )}
                    {allGrievances.length > 0 && getAvailableGrievances(assignmentData.engineerId).length > 0 && (
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <span className="text-sm text-blue-600">
                          📊 Total available: <strong>{getAvailableGrievances(assignmentData.engineerId).length}</strong> grievances
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none bg-gradient-to-br from-gray-50 to-white text-sm"
                    rows="2"
                    placeholder="Special instructions..."
                  />
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={assignmentData.grievanceIds.length === 0}
                    className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                  >
                    Assign {assignmentData.grievanceIds.length > 0 ? `${assignmentData.grievanceIds.length} ` : ''}Task{assignmentData.grievanceIds.length > 1 ? 's' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </div>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-[10000] border border-gray-200"
              style={{ maxWidth: '600px', width: '95%' }}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">
                    Send Message
                  </h2>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-white/80 hover:text-white text-3xl leading-none hover:rotate-90 transition-all duration-300"
                >
                  ×
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5">
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
              </div>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-[10000] border border-gray-200"
              style={{ maxWidth: '500px', width: '95%' }}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-500 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">
                    Delete Engineer
                  </h2>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white/80 hover:text-white text-3xl leading-none hover:rotate-90 transition-all duration-300"
                >
                  ×
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
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
            className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden relative z-[10000] border border-gray-200"
              style={{ maxWidth: '1100px', width: '95%' }}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">
                    Engineer Details
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setTimeout(() => openEditModal(selectedEngineer), 100);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                    title="Edit Engineer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white/80 hover:text-white text-3xl leading-none hover:rotate-90 transition-all duration-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-2.5">
                {/* ID and Status Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border-2 border-blue-200 shadow-sm">
                    <label className="text-xs text-blue-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span>🆔</span> Engineer ID
                    </label>
                    <p className="font-black text-blue-900 text-xl">{selectedEngineer.engineerId}</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border-2 border-green-200 shadow-sm">
                    <label className="text-xs text-green-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span>📊</span> Status
                    </label>
                    <p className="mt-1">
                      {selectedEngineer.isActive ? (
                        <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-black inline-flex items-center gap-1.5 shadow-md">
                          <span>✓</span> Active
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-black inline-flex items-center gap-1.5 shadow-md">
                          <span>✗</span> Inactive
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Personal Details Grid */}
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border-2 border-purple-200 shadow-sm">
                    <label className="text-xs text-purple-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span>👨‍💼</span> Name
                    </label>
                    <p className="font-black text-purple-900 text-lg">{selectedEngineer.name}</p>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border-2 border-cyan-200 shadow-sm">
                    <label className="text-xs text-cyan-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span>📧</span> Email
                    </label>
                    <p className="font-bold text-cyan-900 text-base">{selectedEngineer.email}</p>
                  </div>

                  {selectedEngineer.phone && (
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border-2 border-orange-200 shadow-sm">
                      <label className="text-xs text-orange-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <span>📱</span> Phone
                      </label>
                      <p className="font-bold text-orange-900 text-base">{selectedEngineer.phone}</p>
                    </div>
                  )}
                </div>

                {/* Specialization and Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border-2 border-pink-200 shadow-sm">
                    <label className="text-xs text-pink-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span>🎯</span> Specialization
                    </label>
                    <p className="font-bold text-pink-900 text-base">{selectedEngineer.specialization || 'General'}</p>
                  </div>
                  {selectedEngineer.department && (
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border-2 border-indigo-200 shadow-sm">
                      <label className="text-xs text-indigo-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <span>🏢</span> Department
                      </label>
                      <p className="font-bold text-indigo-900 text-base">{selectedEngineer.department}</p>
                    </div>
                  )}
                </div>

                {/* Task Counters - Eye Catching */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4 rounded-2xl text-white shadow-xl overflow-hidden group hover:shadow-2xl transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 drop-shadow-md">
                      <span className="text-lg">📋</span> Active Tasks
                    </label>
                    <p className="font-black text-5xl mt-1 relative z-10 drop-shadow-lg">{selectedEngineer.activeTasks || 0}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/40"></div>
                  </div>
                  <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-4 rounded-2xl text-white shadow-xl overflow-hidden group hover:shadow-2xl transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 drop-shadow-md">
                      <span className="text-lg">✅</span> Completed Tasks
                    </label>
                    <p className="font-black text-5xl mt-1 relative z-10 drop-shadow-lg">{selectedEngineer.completedTasks || 0}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/40"></div>
                  </div>
                </div>

                {/* Assigned Grievances */}
                {selectedEngineer.assignedGrievances && selectedEngineer.assignedGrievances.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border-2 border-gray-200 shadow-sm mt-3">
                    <label className="text-xs text-gray-800 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>📝</span> Assigned Grievances <span className="ml-1 px-2.5 py-0.5 bg-green-500 text-white rounded-full text-xs font-black">{selectedEngineer.assignedGrievances.length}</span>
                    </label>
                    <div className="space-y-2 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedEngineer.assignedGrievances.map(g => (
                        <div key={g._id} className="p-2.5 bg-white rounded-lg shadow border-2 border-gray-200 hover:shadow-md transition-all hover:border-green-300">
                          <div className="flex justify-between items-start">
                            <p className="font-black text-sm text-green-700">{g.trackingId}</p>
                            <div className="flex gap-1.5">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                g.status === 'open' ? 'bg-blue-500 text-white' :
                                g.status === 'in-progress' ? 'bg-yellow-500 text-white' :
                                g.status === 'resolved' ? 'bg-green-500 text-white' :
                                'bg-red-500 text-white'
                              }`}>
                                {g.status}
                              </span>
                              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                g.priority === 'low' ? 'bg-gray-500 text-white' :
                                g.priority === 'medium' ? 'bg-orange-500 text-white' :
                                'bg-red-600 text-white'
                              }`}>
                                {g.priority}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-800 font-semibold mt-1.5 line-clamp-1">{g.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white rounded-xl text-base font-black uppercase tracking-wide hover:from-gray-800 hover:to-black transition-all mt-3 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EngineersManagement;
