import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getUserGrievances, deleteGrievance } from '../Services/operations/grievanceAPI';
import { getUserProfile, updateUserProfile, requestGrievanceCancellation } from '../Services/operations/authAPI';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const { user, setUser, token } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });
  
  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [grievanceToDelete, setGrievanceToDelete] = useState(null);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update profile data when user data loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      if (user.profileImage?.url) {
        setProfileImagePreview(user.profileImage.url);
      }
    }
  }, [user]);

  // Close sidebar when resizing to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage or authStore
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        toast.error('Please login to continue');
        navigate('/login');
        return;
      }

      // Fetch user profile if not loaded
      if (!user || !user.name) {
        try {
          const userData = await getUserProfile(authToken);
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }

      // Fetch grievances with token
      const grievancesData = await getUserGrievances(authToken);
      
      if (grievancesData && Array.isArray(grievancesData)) {
        setGrievances(grievancesData);
        
        // Calculate statistics - normalize status to lowercase for comparison
        const total = grievancesData.length;
        const open = grievancesData.filter(g => 
          g.status?.toLowerCase() === 'open'
        ).length;
        const inProgress = grievancesData.filter(g => 
          g.status?.toLowerCase() === 'in-progress' || g.status?.toLowerCase() === 'in progress'
        ).length;
        const resolved = grievancesData.filter(g => 
          g.status?.toLowerCase() === 'resolved'
        ).length;
        const rejected = grievancesData.filter(g => 
          g.status?.toLowerCase() === 'rejected'
        ).length;
        
        setStats({ total, open, inProgress, resolved, rejected });
      } else {
        setGrievances([]);
        setStats({ total: 0, open: 0, inProgress: 0, resolved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { id: 'account', label: 'Account Details', icon: '👤', badge: null },
    { id: 'password', label: 'Change Password', icon: '🔒', badge: null },
    { id: 'complaints', label: 'My Complaints', icon: '📝', badge: stats.total },
    { id: 'settings', label: 'Settings', icon: '⚙️', badge: null },
    { id: 'help', label: 'Help', icon: '❓', badge: null },
  ];

  const statCards = [
    {
      title: 'Total Complaints',
      value: `${stats.total}`,
      subtitle: 'ALL SUBMISSIONS',
      gradient: 'from-purple-400 to-pink-500',
      icon: '📋'
    },
    {
      title: 'In Progress',
      value: `${stats.inProgress}`,
      subtitle: 'BEING PROCESSED',
      gradient: 'from-indigo-400 to-purple-500',
      icon: '⏳'
    },
    {
      title: 'Resolved',
      value: `${stats.resolved}`,
      subtitle: 'SUCCESSFULLY CLOSED',
      gradient: 'from-pink-400 to-rose-500',
      icon: '✅'
    },
    {
      title: 'Success Rate',
      value: stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%',
      subtitle: 'RESOLUTION RATE',
      gradient: 'from-fuchsia-400 to-purple-500',
      icon: '📈'
    }
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setIsSidebarOpen(false); // Close sidebar on mobile when menu item is clicked
    
    if (menuId === 'help') {
      navigate('/help', { state: { fromDashboard: true } });
    }
  };

  const openCancelModal = (grievance) => {
    const normalizedStatus = grievance.status?.toLowerCase();
    if (['resolved', 'rejected', 'cancelled', 'closed'].includes(normalizedStatus)) {
      toast.error(`Cannot cancel a ${grievance.status} grievance`);
      return;
    }
    setSelectedGrievance(grievance);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedGrievance(null);
    setCancellationReason('');
  };

  const handleSubmitCancellation = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (cancellationReason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const cancelData = {
        grievanceId: selectedGrievance._id,
        reason: cancellationReason
      };

      const response = await requestGrievanceCancellation(cancelData, token);
      
      if (response?.success) {
        toast.success('Cancellation request submitted successfully');
        closeCancelModal();
        await fetchDashboardData(); // Refresh the grievances list
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error(error?.message || 'Failed to submit cancellation request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (grievance) => {
    navigate(`/track/${grievance._id}`, {
      state: {
        trackingId: grievance.trackingId,
        grievance: grievance
      }
    });
  };

  const openDeleteModal = (grievance) => {
    setGrievanceToDelete(grievance);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setGrievanceToDelete(null);
  };

  const handleDeleteGrievance = async () => {
    if (!grievanceToDelete) return;

    setSubmitting(true);
    try {
      const success = await deleteGrievance(grievanceToDelete._id, token);
      
      if (success) {
        closeDeleteModal();
        await fetchDashboardData(); // Refresh the grievances list
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.message || 'Failed to delete grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      // Implement password change API call here
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettingsUpdate = () => {
    toast.success('Settings updated successfully');
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setProfileImage(null);
    if (user.profileImage?.url) {
      setProfileImagePreview(user.profileImage.url);
    } else {
      setProfileImagePreview(null);
    }
  };

  const handleUpdateProfile = async () => {
    setSubmitting(true);
    try {
      console.log('========== HANDLE UPDATE PROFILE ==========');
      console.log('Current user state:', user);
      
      const authToken = token || localStorage.getItem('token');
      const updateData = {};

      // Only include fields that have been changed
      if (profileData.name !== user.name) {
        updateData.name = profileData.name;
        console.log('Name change detected:', user.name, '->', profileData.name);
      }
      if (profileData.email !== user.email) {
        updateData.email = profileData.email;
        console.log('Email change detected:', user.email, '->', profileData.email);
      }
      if (profileData.phone !== user.phone) {
        updateData.phone = profileData.phone;
        console.log('Phone change detected:', user.phone, '->', profileData.phone);
      }

      if (profileImage) {
        updateData.profileImage = profileImage;
        console.log('Profile image detected for upload');
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to update');
        setIsEditingProfile(false);
        return;
      }

      console.log('Update data to send:', updateData);
      
      const response = await updateUserProfile(updateData, authToken);
      
      console.log('Response from API:', response);
      
      if (response?.success && response?.user) {
        console.log('Update successful. New user data:', response.user);
        console.log('Calling setUser with:', response.user);
        setUser(response.user);
        console.log('After setUser - user state:', response.user);
        setIsEditingProfile(false);
        setProfileImage(null);
        console.log('========== PROFILE UPDATE COMPLETE ==========');
      } else {
        console.error('Response was not successful:', response);
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br mt-[65px] from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      
      {/* Mobile Overlay - positioned to cover entire viewport below navbar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-200"
          style={{ 
            top: '65px',
            zIndex: 999
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex relative">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ 
            x: window.innerWidth >= 1024 ? 0 : (isSidebarOpen ? 0 : -300),
            transition: { 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              mass: 0.8
            }
          }}
          className={`fixed lg:sticky w-64 min-h-screen bg-white shadow-xl border-r border-gray-200 transition-all duration-200 ease-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ 
            zIndex: 1000, 
            top: window.innerWidth >= 1024 ? '65px' : '65px',
            height: window.innerWidth >= 1024 ? 'calc(100vh - 65px)' : '100vh'
          }}
        >
          {/* Close button for mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(false);
            }}
            className="lg:hidden absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-500 hover:to-pink-500 text-gray-600 hover:text-white shadow-md hover:shadow-lg border border-gray-300 hover:border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 z-[1001] group"
          >
            <svg 
              className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">G</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Grams</h2>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeMenu === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    activeMenu === item.id ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

          </nav>
        </motion.div>

        {/* Main Content */}
        <div className={`flex-1 w-full lg:ml-0 transition-all duration-200 ${isSidebarOpen ? 'lg:blur-none blur-sm' : ''}`}>
          {/* Mobile Hamburger Button - Top position after navbar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed top-[72px] left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-[999]"
          >
            {isSidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
          
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                  Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    Welcome Back {user?.name || 'User'}!
                  </span>
                </h1>
                <p className="text-gray-500 mt-1 text-xs sm:text-sm">Home &gt; Dashboard</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
            {statCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer`}
              >
                {/* Animated background circle */}
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <motion.span 
                      className="text-3xl sm:text-4xl lg:text-5xl"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      {card.icon}
                    </motion.span>
                    <motion.div 
                      className="text-right"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: index * 0.1 + 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{card.value}</h3>
                    </motion.div>
                  </div>
                  <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm font-bold tracking-wider uppercase">
                    {card.subtitle}
                  </p>
                  
                  {/* Progress bar for percentage values */}
                  {card.value.includes('%') && (
                    <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className="bg-white h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: card.value }}
                        transition={{ 
                          delay: index * 0.1 + 0.5,
                          duration: 1,
                          ease: "easeOut"
                        }} 
                      />
                    </div>
                  )}
                </div>

                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </motion.div>
            ))}
          </div>

          {/* Content Area Based on Active Menu */}
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 backdrop-blur-sm"
          >
            {activeMenu === 'dashboard' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Recent Complaints</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>
                ) : grievances.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No complaints filed yet</p>
                    <button
                      onClick={() => navigate('/file-grievance', { state: { fromDashboard: true } })}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      File Your First Complaint
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {grievances.slice(0, 5).map((grievance, index) => (
                      <motion.div
                        key={grievance._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-2 border-purple-100 rounded-lg sm:rounded-xl bg-gradient-to-r from-white to-purple-50/30 hover:shadow-lg hover:border-purple-300 transition-all duration-200 gap-3 sm:gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-2 truncate">
                            {grievance.title || (grievance.description?.length > 60 ? grievance.description.substring(0, 60) + '...' : grievance.description) || 'Untitled'}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">
                              {grievance.trackingId || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 capitalize truncate">{grievance.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start flex-shrink-0">
                          <button
                            onClick={() => navigate(`/track`, { state: { trackingId: grievance.trackingId, grievance } })}
                            className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-xs sm:text-sm whitespace-nowrap"
                          >
                            OPEN
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeMenu === 'account' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Account Details</h2>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center space-x-2"
                    >
                      <span>✏️</span>
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleCancelEdit}
                        disabled={submitting}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={submitting}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            <span>Update Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <motion.div 
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-inner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Profile Image Section */}
                  <motion.div 
                    className="flex flex-col items-center mb-6 sm:mb-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <motion.div 
                      className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center"
                      whileHover={isEditingProfile ? { scale: 1.05 } : {}}
                    >
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl sm:text-5xl lg:text-6xl text-white font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </motion.div>
                    {isEditingProfile && (
                      <motion.div
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8 w-full sm:w-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <motion.label 
                          className="w-full sm:w-40 flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                          />
                          Change Photo
                        </motion.label>
                        {profileImagePreview && (
                          <motion.button
                            type="button"
                            onClick={() => {
                              setProfileImagePreview(null);
                              setProfileImage(null);
                            }}
                            className="w-full sm:w-40 flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          >
                            Remove
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {/* Name */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                        <span className="text-xl sm:text-2xl">👤</span>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">Full Name</label>
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your name"
                        />
                      ) : (
                        <p className="text-base sm:text-lg font-medium text-gray-900">{user?.name || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">📧</span>
                        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900 truncate">{user?.email || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">📱</span>
                        <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Role */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">🎯</span>
                        <label className="block text-sm font-semibold text-gray-700">Account Role</label>
                      </div>
                      <p className="text-lg font-medium text-gray-900 capitalize">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm">
                          {user?.role || 'User'}
                        </span>
                      </p>
                    </div>

                    {/* Account Created */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">📅</span>
                        <label className="block text-sm font-semibold text-gray-700">Member Since</label>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>

                    {/* Total Complaints */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">📊</span>
                        <label className="block text-sm font-semibold text-gray-700">Total Complaints</label>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        <span className="text-2xl font-bold text-purple-600">{stats.total}</span>
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            )}

            {activeMenu === 'password' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-inner">
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <span className="text-xl">🔐</span>
                          <span>Current Password</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your current password"
                        />
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <span className="text-xl">🆕</span>
                          <span>New Password</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your new password (min. 6 characters)"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <span className="text-xl">✅</span>
                          <span>Confirm New Password</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Confirm your new password"
                        />
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-purple-800 mb-2">Password Requirements:</p>
                        <ul className="text-sm text-purple-700 space-y-1 ml-5 list-disc">
                          <li>At least 6 characters long</li>
                          <li>Mix of letters and numbers recommended</li>
                          <li>Should be different from your current password</li>
                        </ul>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                          className="w-full sm:flex-1 px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all font-medium"
                        >
                          Reset Form
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full sm:flex-1 px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                        >
                          {submitting ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'complaints' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span>📝</span> Manage My Complaints
                  </h2>
                  <button
                    onClick={() => navigate('/file-grievance', { state: { fromDashboard: true } })}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-shadow font-semibold text-sm"
                  >
                    + New Complaint
                  </button>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>
                ) : grievances.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No complaints filed yet</p>
                    <button
                      onClick={() => navigate('/file-grievance', { state: { fromDashboard: true } })}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      File Your First Complaint
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grievances.map((grievance) => (
                      <motion.div
                        key={grievance._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-300 transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:justify-between mb-4 gap-3">
                          <div className="flex-1 w-full">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">{grievance.title || grievance.subject || grievance.description?.substring(0, 50)}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                {grievance.trackingId || 'N/A'}
                              </span>
                              <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                              <span className="text-xs text-gray-500">Filed {new Date(grievance.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewDetails(grievance)}
                            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap w-full sm:w-auto sm:ml-4 cursor-pointer hover:shadow-md transition-all ${
                              ['resolved', 'Resolved'].includes(grievance.status) ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              ['in-progress', 'In Progress'].includes(grievance.status) ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                              ['rejected', 'Rejected'].includes(grievance.status) ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                              ['closed', 'Closed', 'Cancelled', 'cancelled'].includes(grievance.status) ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                              ['blocked', 'Blocked'].includes(grievance.status) ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                              'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {(grievance.status || 'open').replace(/-/g, ' ').toUpperCase()}
                          </button>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{grievance.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="text-xs font-semibold text-blue-600 uppercase">📁 Category</span>
                            <p className="text-sm font-bold text-gray-800 capitalize mt-1">{grievance.category}</p>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <span className="text-xs font-semibold text-orange-600 uppercase">🚨 Priority</span>
                            <p className="text-sm font-bold text-gray-800 capitalize mt-1">{grievance.priority}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="text-xs font-semibold text-green-600 uppercase">📍 Location</span>
                            <p className="text-sm font-bold text-gray-800 mt-1 truncate">{grievance.location || 'N/A'}</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="text-xs font-semibold text-purple-600 uppercase">⏱️ Days Open</span>
                            <p className="text-sm font-bold text-gray-800 mt-1">{grievance.daysOpen || 0} days</p>
                          </div>
                        </div>

                        {grievance.cancellationRequest && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-semibold text-yellow-800">Cancellation Request Pending</p>
                            <p className="text-sm text-yellow-700 mt-1">Reason: {grievance.cancellationRequest.reason}</p>
                            <p className="text-xs text-yellow-600 mt-1">Submitted on {new Date(grievance.cancellationRequest.requestedAt).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                          <button
                            onClick={() => handleViewDetails(grievance)}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => openDeleteModal(grievance)}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeMenu === 'settings' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Settings</h2>
                <div className="space-y-6">
                  {/* Notification Settings */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-inner">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center space-x-2">
                      <span className="text-xl sm:text-2xl">🔔</span>
                      <span>Notification Preferences</span>
                    </h3>
                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <span className="text-xl sm:text-2xl">📧</span>
                          <div>
                            <p className="font-semibold text-sm sm:text-base text-gray-800">Email Notifications</p>
                            <p className="text-xs sm:text-sm text-gray-500">Receive updates via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      {/* SMS Notifications */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <span className="text-xl sm:text-2xl">💬</span>
                          <div>
                            <p className="font-semibold text-sm sm:text-base text-gray-800">SMS Notifications</p>
                            <p className="text-xs sm:text-sm text-gray-500">Receive updates via text message</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      {/* Push Notifications */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <span className="text-xl sm:text-2xl">🔔</span>
                          <div>
                            <p className="font-semibold text-sm sm:text-base text-gray-800">Push Notifications</p>
                            <p className="text-xs sm:text-sm text-gray-500">Receive browser push notifications</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSettingsUpdate}
                      className="mt-6 w-full px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      Save Notification Settings
                    </button>
                  </div>

                  {/* Privacy Settings */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-inner">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center space-x-2">
                      <span className="text-xl sm:text-2xl">🔒</span>
                      <span>Privacy & Security</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <span className="text-xl sm:text-2xl">🛡️</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-800 mb-2">Two-Factor Authentication</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                            <button className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                              Enable 2FA
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <span className="text-xl sm:text-2xl">📊</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-800 mb-2">Data Privacy</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4">Review and download your personal data</p>
                            <button className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                              Download My Data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeCancelModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-white via-red-50/30 to-pink-50 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">Cancel Complaint</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCancelModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="text-2xl">×</span>
              </motion.button>
            </div>

            {selectedGrievance && (
              <>
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-2">Complaint Details:</p>
                  <p className="text-sm text-gray-700">{selectedGrievance.subject}</p>
                  <p className="text-xs text-gray-500 mt-2">ID: {selectedGrievance.grievanceId}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Please explain why you want to cancel this complaint (minimum 10 characters)..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">{cancellationReason.length}/500</p>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">Note:</span> This action will submit a cancellation request. It will be reviewed by an administrator.
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeCancelModal}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all font-medium disabled:opacity-50"
                  >
                    Keep Complaint
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitCancellation}
                    disabled={submitting || !cancellationReason.trim()}
                    className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Cancellation'
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDeleteModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-white via-red-50/30 to-pink-50 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="text-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <motion.span 
                  className="text-4xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: 0.3, repeat: 2 }}
                >
                  ⚠️
                </motion.span>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2">Cancel Complaint?</h3>
              <p className="text-gray-600 mb-4">This will permanently delete your complaint from the system.</p>
              
              {grievanceToDelete && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 text-left">
                  <p className="text-sm font-semibold text-purple-700 mb-1">Complaint Details:</p>
                  <p className="text-sm text-gray-700 mb-2">{grievanceToDelete.title || grievanceToDelete.description?.substring(0, 60) + '...'}</p>
                  <p className="text-xs text-gray-500">ID: {grievanceToDelete.trackingId}</p>
                </div>
              )}
              
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800">
                  <span className="font-semibold">Warning:</span> This action cannot be undone. The complaint will be removed from the database.
                </p>
              </div>
            </motion.div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeDeleteModal}
                disabled={submitting}
                className="flex-1 px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all font-medium disabled:opacity-50"
              >
                Keep It
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteGrievance}
                disabled={submitting}
                className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </span>
                ) : (
                  'Yes, Delete'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLogoutModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-purple-200"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="text-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <motion.span 
                  className="text-4xl"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  🚪
                </motion.span>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2">Confirm Logout</h3>
              <p className="text-gray-600">Are you sure you want to logout from your account?</p>
            </motion.div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Yes, Logout
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
