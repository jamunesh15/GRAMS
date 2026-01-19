import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import GramsLogo from '../components/GramsLogo';
import Reveal from '../components/Reveal';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 mt-16 flex">
      <style>{`
        /* Hide scrollbars but allow scrolling */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Smooth transitions for all elements */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Gradient animation */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        /* Floating animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Mobile Overlay */}
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
      
      {/* Sidebar */}
      <div
        className={`fixed lg:relative w-64 h-[calc(100vh-4rem)] animated-gradient bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-md shadow-2xl transition-all duration-200 ease-out border-r-2 border-white/20 flex-shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ 
          zIndex: 1000
        }}
      >
        {/* Close button for mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSidebarOpen(false);
          }}
          className="lg:hidden absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-500 hover:to-pink-500 text-gray-600 hover:text-white shadow-md hover:shadow-lg border border-gray-300 hover:border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 z-[1001] group"
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

        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/50 rounded-xl shadow-md float-animation">
                <GramsLogo size={40} />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-lg">
                Engineer Panel
              </span>
            </div>
          </div>

          <nav className="space-y-3 hide-scrollbar overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 transform ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/50 scale-105'
                    : 'bg-white/40 backdrop-blur-sm text-gray-700 hover:bg-white/60 hover:shadow-lg border border-white/50'
                }`}
              >
                <span className={`text-xl ${activeTab === item.id ? 'float-animation' : ''}`}>
                  {item.icon}
                </span>
                <span className={`font-semibold ${activeTab === item.id ? 'text-white' : 'text-gray-700'}`}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <span className="ml-auto">
                    <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                  </span>
                )}
              </motion.button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t-2 border-white/30">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 text-red-600 hover:from-red-100 hover:to-orange-100 transition-all duration-300 transform hover:shadow-lg border border-red-200/50"
            >
              <span className="text-xl">🚪</span>
              <span className="font-semibold">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ${isSidebarOpen ? 'lg:blur-none blur-sm' : ''}`}>
        {/* Mobile Hamburger Button - Bottom right position */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all z-[999]"
        >
          {isSidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen hide-scrollbar overflow-y-auto">
          <Reveal>
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-2 text-base sm:text-lg">Engineer Dashboard</p>
            </div>
          </Reveal>

          {activeTab === 'assigned' && (
            <Reveal delay={0.1}>
              <AssignedGrievances />
            </Reveal>
          )}

          {activeTab === 'active' && (
            <Reveal delay={0.1}>
              <ActiveTasks />
            </Reveal>
          )}

          {activeTab === 'completed' && (
            <Reveal delay={0.1}>
              <CompletedTasks />
            </Reveal>
          )}

          {activeTab === 'request-resources' && (
            <Reveal delay={0.1}>
              <ResourceRequestForm />
            </Reveal>
          )}

          {activeTab === 'my-requests' && (
            <Reveal delay={0.1}>
              <MyResourceRequests />
            </Reveal>
          )}

          {activeTab === 'reports' && (
            <Reveal delay={0.1}>
              <EngineerReports />
            </Reveal>
          )}

          {activeTab === 'profile' && (
            <Reveal delay={0.1}>
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-indigo-100">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">👤</span>
                    Profile Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border-2 border-indigo-200 transform hover:scale-105 transition-all duration-300"
                    >
                      <p className="text-sm text-indigo-600 font-semibold mb-2 flex items-center gap-2">
                        <span>👨‍💼</span>
                        Name
                      </p>
                      <p className="text-lg font-bold text-gray-800">{user?.name}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border-2 border-purple-200 transform hover:scale-105 transition-all duration-300"
                    >
                      <p className="text-sm text-purple-600 font-semibold mb-2 flex items-center gap-2">
                        <span>📧</span>
                        Email
                      </p>
                      <p className="text-lg font-bold text-gray-800">{user?.email}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border-2 border-pink-200 transform hover:scale-105 transition-all duration-300"
                    >
                      <p className="text-sm text-pink-600 font-semibold mb-2 flex items-center gap-2">
                        <span>🎯</span>
                        Role
                      </p>
                      <p className="text-lg font-bold text-gray-800 capitalize">{user?.role}</p>
                    </motion.div>
                  </div>
                </div>

                {/* Contact Support Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-blue-100">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">📞</span>
                    Contact Support
                  </h2>
                  
                  <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                        <span className="text-xl sm:text-2xl">☎️</span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Helpline Number</p>
                        <a 
                          href="tel:+919909246267" 
                          className="text-base sm:text-lg font-bold text-green-600 hover:text-green-700 transition-colors"
                        >
                          +91 99092 46267
                        </a>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Available Monday to Saturday, 9:00 AM - 6:00 PM
                    </p>
                  </div>

                  {/* Support Request Form */}
                  <div className="bg-white rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <span>✉️</span>
                      Submit Support Request
                    </h3>
                    <SupportRequestForm />
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
