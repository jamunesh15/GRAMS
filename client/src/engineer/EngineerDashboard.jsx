import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import ResourceRequestForm from './components/ResourceRequestForm';
import MyResourceRequests from './components/MyResourceRequests';
import AssignedGrievances from './components/AssignedGrievances';
import ActiveTasks from './components/ActiveTasks';
import CompletedTasks from './components/CompletedTasks';
import EngineerReports from './components/EngineerReports';
import SupportRequestForm from './components/SupportRequestForm';


export default function EngineerDashboard() {
  const [activeTab, setActiveTab] = useState('assigned');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

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



  const menuItems = [
    { id: 'assigned', label: 'Assigned to Me', icon: '📋', badge: null },
    { id: 'active', label: 'Active Tasks', icon: '⚙️', badge: null },
    { id: 'completed', label: 'Completed', icon: '✅', badge: null },
    { id: 'request-resources', label: 'Request Resources', icon: '📝', badge: null },
    { id: 'my-requests', label: 'My Requests', icon: '📦', badge: null },
    { id: 'reports', label: 'Reports', icon: '📄', badge: null },
    { id: 'profile', label: 'Profile', icon: '👤', badge: null },
  ];

  const handleMenuClick = (menuId) => {
    setActiveTab(menuId);
    setIsSidebarOpen(false); // Close sidebar on mobile when menu item is clicked
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100/40 to-purple-100/30">
      {/* Mobile Hamburger Button - Bottom right position */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all"
      >
        {isSidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[999] mt-16"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed left-0 top-16 w-64 bg-gradient-to-b from-blue-100 via-indigo-100 to-purple-100/80 backdrop-blur-sm shadow-lg transition-transform duration-300 h-[calc(100vh-4rem)] z-[1000] flex flex-col overflow-hidden`}
      >
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-gray-800 font-bold text-xl">⚙️ Engineer Panel</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 z-[1001]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:pl-64">
        {/* Content Area */}
        <div className="pt-20 px-3 sm:px-6 lg:px-8 pb-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg">Engineer Dashboard</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'assigned' && (
              <motion.div
                key="assigned"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AssignedGrievances />
              </motion.div>
            )}

            {activeTab === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveTasks />
              </motion.div>
            )}

            {activeTab === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CompletedTasks />
              </motion.div>
            )}

            {activeTab === 'request-resources' && (
              <motion.div
                key="request-resources"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResourceRequestForm />
              </motion.div>
            )}

            {activeTab === 'my-requests' && (
              <motion.div
                key="my-requests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MyResourceRequests />
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EngineerReports />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                {/* Profile Information */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">👤</span>
                    Profile Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200"
                    >
                      <p className="text-sm text-blue-600 font-semibold mb-2 flex items-center gap-2">
                        <span>👨‍💼</span>
                        Name
                      </p>
                      <p className="text-lg font-bold text-gray-800">{user?.name}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200"
                    >
                      <p className="text-sm text-purple-600 font-semibold mb-2 flex items-center gap-2">
                        <span>📧</span>
                        Email
                      </p>
                      <p className="text-lg font-bold text-gray-800">{user?.email}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200"
                    >
                      <p className="text-sm text-green-600 font-semibold mb-2 flex items-center gap-2">
                        <span>🎯</span>
                        Role
                      </p>
                      <p className="text-lg font-bold text-gray-800 capitalize">{user?.role}</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Contact Support Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    Contact Support
                  </h2>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-green-500 p-3 rounded-full">
                        <span className="text-2xl">☎️</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Helpline Number</p>
                        <a 
                          href="tel:+919909246267" 
                          className="text-lg font-bold text-green-600 hover:text-green-700 transition-colors"
                        >
                          +91 99092 46267
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Available Monday to Saturday, 9:00 AM - 6:00 PM
                    </p>
                  </motion.div>

                  {/* Support Request Form */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span>✉️</span>
                      Submit Support Request
                    </h3>
                    <SupportRequestForm />
                  </motion.div>
                </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
