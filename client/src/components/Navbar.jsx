import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import GramsLogo from './GramsLogo';
import NotificationDropdown from './NotificationDropdown';
import { getUnreadCount } from '../api/notificationAPI';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredLink, setHoveredLink] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const dropdownRef = useRef(null);

  // Fetch unread notification count
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const data = await getUnreadCount();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setActiveDropdown(false);
  };

  const handleNavClick = () => {
    setShowMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const activeKey = useMemo(() => {
    if (isActive('/')) return 'home';
    if (isActive('/transparency')) return 'transparency';
    if (isActive('/community')) return 'community';
    if (isActive('/track')) return 'track';
    if (isActive('/performance')) return 'performance';
    return null;
  }, [location.pathname]);

  const underlineTarget = hoveredLink || activeKey;

  const underlineTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 36, mass: 0.8 };

  // Animation variants for smooth interactions
  const navItemVariants = {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.08, 
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 15, mass: 0.5 }
    },
    tap: { scale: 0.97 }
  };

  const iconVariants = {
    rest: { rotate: 0 },
    hover: { 
      rotate: [0, -8, 8, -8, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-500 ease-in-out shadow-lg">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group shrink-0 transition-all duration-300 ease-out"
        >
          <motion.div 
            className="shadow-md group-hover:shadow-green-500/30 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <GramsLogo size={40} />
          </motion.div>
          <div className="text-left leading-tight">
            <span className="text-sm font-black text-slate-800 block group-hover:text-green-600 transition-colors duration-300">GRAMS</span>
            <span className="text-[9px] text-green-700 uppercase font-bold tracking-wider">Grievance</span>
          </div>
        </Link>

        {/* Center: Navigation Links - Desktop */}
        <div className={`hidden lg:flex items-center gap-1.5 text-sm transition-all duration-300 ease-in-out`}>
          
          {/* Main Navigation */}
          <div className="flex items-center gap-1">
            <motion.div
              variants={navItemVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/" 
                onMouseEnter={() => setHoveredLink('home')}
                onMouseLeave={() => setHoveredLink(null)}
                className={`top-nav-link px-3 py-2 rounded-lg text-slate-700 font-semibold flex items-center gap-2 transition-all duration-300 ease-out relative group text-xs ${
                  isActive('/track') ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <motion.svg 
                  variants={iconVariants}
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </motion.svg>
                <span className="hidden lg:inline">Home</span>
                {underlineTarget === 'home' && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-green-600 rounded-full shadow-sm"
                    transition={underlineTransition}
                  />
                )}
              </Link>
            </motion.div>
            
            <motion.div
              variants={navItemVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/transparency"
                onMouseEnter={() => setHoveredLink('transparency')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={handleNavClick}
                className={`top-nav-link px-3 py-2 rounded-lg text-slate-700 font-semibold flex items-center gap-2 transition-all duration-300 ease-out relative group text-xs ${
                  isActive('/transparency') ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <motion.svg 
                  variants={iconVariants}
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </motion.svg>
                <span className="hidden lg:inline">Transparency</span>
                {underlineTarget === 'transparency' && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-green-600 rounded-full shadow-sm"
                    transition={underlineTransition}
                  />
                )}
              </Link>
            </motion.div>
            
            <motion.div
              variants={navItemVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/community"
                onMouseEnter={() => setHoveredLink('community')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={handleNavClick}
                className={`top-nav-link px-3 py-2 rounded-lg text-slate-700 font-semibold flex items-center gap-2 transition-all duration-300 ease-out relative group text-xs ${
                  isActive('/community') ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <motion.svg 
                  variants={iconVariants}
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-2a4 4 0 00-8 0v2h8z" />
                </motion.svg>
                <span className="hidden lg:inline">Community</span>
                {underlineTarget === 'community' && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-green-600 rounded-full shadow-sm"
                    transition={underlineTransition}
                  />
                )}
              </Link>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-300 mx-2 transition-all duration-300"></div>

          {/* Secondary Navigation */}
          <div className="flex items-center gap-1">
            <motion.div
              variants={navItemVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="/track"
                onMouseEnter={() => setHoveredLink('track')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={handleNavClick}
                className={`top-nav-link px-3 py-2 rounded-lg text-slate-700 font-medium flex items-center gap-2 transition-all duration-300 ease-out hover:bg-green-50 hover:text-green-600 relative group ${
                  isActive('/track') ? 'bg-green-100 text-green-700 shadow-md' : ''
                }`}
              >
                <motion.svg 
                  variants={iconVariants}
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
                <span className="hidden xl:inline text-sm">Track</span>
                {underlineTarget === 'track' && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-3 right-3 h-0.5 bg-green-600 rounded-full shadow-sm"
                    transition={underlineTransition}
                  />
                )}
              </Link>
            </motion.div>

            <motion.div
              variants={navItemVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="/performance"
                onMouseEnter={() => setHoveredLink('performance')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={handleNavClick}
                className={`top-nav-link px-3 py-2 rounded-lg text-slate-700 font-medium flex items-center gap-2 transition-all duration-300 ease-out hover:bg-green-50 hover:text-green-600 relative group text-xs ${
                  isActive('/performance') ? 'bg-green-100 text-green-700 shadow-sm' : ''
                }`}
              >
                <motion.svg 
                  variants={iconVariants}
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </motion.svg>
                <span className="hidden xl:inline text-sm">Performance</span>
                {underlineTarget === 'performance' && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-3 right-3 h-0.5 bg-green-600 rounded-full shadow-sm"
                    transition={underlineTransition}
                  />
                )}
              </Link>
            </motion.div>

            <motion.div
              variants={navItemVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="/help"
                onMouseEnter={() => setHoveredLink('help')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={handleNavClick}
                className={`top-nav-link px-3 py-2 rounded-lg text-slate-700 font-medium flex items-center gap-2 transition-all duration-300 ease-out hover:bg-green-50 hover:text-green-600 relative group text-xs ${
                  isActive('/help') ? 'bg-green-100 text-green-700 shadow-sm' : ''
                }`}
              >
                <motion.svg 
                  variants={iconVariants}
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </motion.svg>
                <span className="hidden xl:inline text-sm">Help</span>
                {underlineTarget === 'help' && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-3 right-3 h-0.5 bg-green-600 rounded-full shadow-sm"
                    transition={underlineTransition}
                  />
                )}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right: User Profile + Actions */}
        <div className="flex items-center gap-2 lg:gap-3 transition-all duration-300 relative">
          {/* Notifications Icon (shown when logged in) */}
          {isAuthenticated && (
            <div className="relative">
              <motion.button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-300 text-slate-700 relative"
                title="Notifications"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </motion.svg>
                {unreadCount > 0 && (
                  <motion.span 
                    layoutId="unread-badge"
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
              <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            </div>
          )}

          {/* Profile Dropdown (shown when logged in) */}
          {isAuthenticated ? (
            <motion.div 
              ref={dropdownRef}
              className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-xl border border-green-200 hover:border-green-400 transition-all duration-300 cursor-pointer group relative hover:shadow-lg"
              onClick={() => setActiveDropdown(!activeDropdown)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-md overflow-hidden"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {user?.profileImage?.url ? (
                  <img 
                    src={user.profileImage.url} 
                    alt={user?.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.substring(0, 2).toUpperCase() || 'PK'}</span>
                )}
              </motion.div>
              
              <div className="text-left leading-tight hidden sm:block transition-all duration-300">
                <span className="text-sm font-bold text-slate-800 block group-hover:text-green-700 transition-colors duration-300">{user?.name || 'Pradeep'}</span>
                <span className="text-[10px] text-green-700 uppercase font-semibold tracking-wide">{user?.role || 'Admin'}</span>
              </div>

              {/* Dropdown Menu */}
              <motion.div
                className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 min-w-[200px] origin-top"
                initial={false}
                animate={
                  shouldReduceMotion
                    ? { opacity: activeDropdown ? 1 : 0 }
                    : { opacity: activeDropdown ? 1 : 0, scaleY: activeDropdown ? 1 : 0.9, y: activeDropdown ? 0 : -8 }
                }
                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
                style={{ pointerEvents: activeDropdown ? 'auto' : 'none' }}
              >
                <Link 
                  to="/dashboard" 
                  className="block w-full text-left px-4 py-2.5 hover:bg-green-50 rounded-lg text-sm text-slate-700 font-semibold transition-all duration-200 hover:text-green-600 hover:translate-x-1 relative group"
                  onClick={() => setActiveDropdown(false)}
                >
                  📊 Dashboard
                  <motion.span 
                    className="absolute bottom-0 left-0 h-0.5 bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
                <hr className="my-2 transition-all duration-300" />
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2.5 hover:bg-red-50 rounded-lg text-sm text-red-600 font-semibold transition-all duration-200 hover:translate-x-1 relative group"
                >
                  🚪 Logout
                  <motion.span 
                    className="absolute bottom-0 left-0 h-0.5 bg-red-500 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* Login Button (shown when logged out) - HIDDEN ON MOBILE */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden lg:block"
              >
                <Link 
                  to="/login" 
                  className="px-4 py-2.5 text-sm font-bold bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                  onClick={handleNavClick}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Login</span>
                </Link>
              </motion.div>
            </>
          )}

          {/* New Complaint Button - HIDDEN ON MOBILE */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:block"
          >
            <Link 
              to="/file-grievance" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl relative group overflow-hidden"
              onClick={handleNavClick}
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-all duration-500"></span>
              <motion.svg 
                className="w-5 h-5 relative z-10" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                whileHover={{ rotate: [0, -12, 12, -12, 0] }}
                transition={{ duration: 0.6 }}
              >
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </motion.svg>
              <span className="relative z-10 font-extrabold">New Complaint</span>
            </Link>
          </motion.div>

          {/* Hamburger Menu Button - Beautiful Design */}
          <motion.button 
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg relative group"
            onClick={() => setShowMenu(!showMenu)}
            title="Toggle Menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col gap-1.5 items-center justify-center">
              <motion.span 
                className="w-6 h-0.5 bg-white rounded-full shadow-sm"
                animate={{ 
                  rotate: showMenu ? 45 : 0, 
                  y: showMenu ? 7 : 0,
                  width: showMenu ? '24px' : '20px'
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
              <motion.span 
                className="w-6 h-0.5 bg-white rounded-full shadow-sm"
                animate={{ 
                  opacity: showMenu ? 0 : 1,
                  scale: showMenu ? 0.5 : 1
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.span 
                className="w-6 h-0.5 bg-white rounded-full shadow-sm"
                animate={{ 
                  rotate: showMenu ? -45 : 0, 
                  y: showMenu ? -7 : 0,
                  width: showMenu ? '24px' : '20px'
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </div>
          </motion.button>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: showMenu ? 1 : 0,
          height: showMenu ? 'auto' : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl"
      >
        <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile Nav Links */}
          <Link
            to="/"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/') ? 'bg-green-100 text-green-700' : 'text-slate-700 hover:bg-green-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="font-semibold">Home</span>
          </Link>

          <Link
            to="/transparency"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/transparency') ? 'bg-green-100 text-green-700' : 'text-slate-700 hover:bg-green-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Transparency</span>
          </Link>

          <Link
            to="/community"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/community') ? 'bg-green-100 text-green-700' : 'text-slate-700 hover:bg-green-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-2a4 4 0 00-8 0v2h8z" />
            </svg>
            <span className="font-semibold">Community</span>
          </Link>

          <Link
            to="/track"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/track') ? 'bg-green-100 text-green-700' : 'text-slate-700 hover:bg-green-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">Track</span>
          </Link>

          <Link
            to="/performance"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/performance') ? 'bg-green-100 text-green-700' : 'text-slate-700 hover:bg-green-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="font-semibold">Performance</span>
          </Link>

          <Link
            to="/help"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/help') ? 'bg-green-100 text-green-700' : 'text-slate-700 hover:bg-green-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Help</span>
          </Link>

          {/* Action Buttons in Mobile Menu */}
          <div className="mt-4 pt-4 border-t-2 border-slate-200 space-y-3">
            {/* New Complaint Button - Mobile */}
            <Link
              to="/file-grievance"
              onClick={handleNavClick}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>New Complaint</span>
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={handleNavClick}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-green-600 text-green-700 rounded-xl font-bold shadow-md hover:bg-green-50 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Dashboard/Logout for authenticated users */}
          {isAuthenticated && (
            <>
              <hr className="my-3 border-slate-200" />
              <Link
                to="/dashboard"
                onClick={handleNavClick}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-green-50 transition-all duration-200"
              >
                <span>📊</span>
                <span className="font-semibold">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <span>🚪</span>
                <span className="font-semibold">Logout</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
