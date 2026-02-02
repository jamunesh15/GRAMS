import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecentNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead } from '../api/notificationAPI';
import { Link } from 'react-router-dom';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Debug logging
  console.log('🔔 NotificationDropdown render - isOpen:', isOpen);

  useEffect(() => {
    if (isOpen) {
      console.log('🔔 Dropdown opened, fetching notifications...');
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('🔔 Click outside detected, closing dropdown');
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔔 Fetching notifications from API...');
      const data = await getRecentNotifications();
      console.log('🔔 Notifications fetched:', data);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('🔔 Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'grievance_update':
        return 'bg-blue-50 border-l-4 border-blue-400';
      case 'status_change':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'response':
        return 'bg-purple-50 border-l-4 border-purple-400';
      case 'admin':
        return 'bg-red-50 border-l-4 border-red-400';
      default:
        return 'bg-slate-50 border-l-4 border-slate-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'grievance_update':
        return '📋';
      case 'status_change':
        return '✅';
      case 'response':
        return '💬';
      case 'admin':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  // Debug: log when rendering
  console.log('🔔 NotificationDropdown - isOpen:', isOpen, 'loading:', loading, 'notifications count:', notifications.length);

  // Use Portal to render outside of parent stacking context
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {console.log('🔔 Rendering notification modal via Portal...')}
          {/* Overlay for mobile and desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
            style={{ zIndex: 99998 }}
            onClick={onClose}
          />
          
          {/* Centered Modal Container */}
          <div 
            className="fixed inset-x-0 top-16 sm:top-20 bottom-0 flex items-start justify-center px-4 overflow-y-auto pointer-events-none"
            style={{ zIndex: 99999 }}
          >
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[calc(100vh-5rem)] sm:max-h-[75vh] overflow-hidden flex flex-col mt-2 mb-4 pointer-events-auto"
            >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                  >
                    {unreadCount} new
                  </motion.span>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-green-400 border-t-green-600 rounded-full"
                />
              </div>
            ) : notifications.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="divide-y divide-slate-100"
              >
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${
                      !notification.isRead ? 'bg-green-50/50' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification._id, { stopPropagation: () => {} })}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <motion.div
                              layoutId={`dot-${notification._id}`}
                              className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"
                            />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDelete(notification._id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        ✕
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <span className="text-3xl mb-2">🔔</span>
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-3 flex gap-2">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMarkAllAsRead}
                  className="flex-1 px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                >
                  Mark all as read
                </motion.button>
              )}
              <Link
                to="/notifications"
                onClick={onClose}
                className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-center"
              >
                View All
              </Link>
            </div>
          )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Render via Portal to escape stacking context
  return createPortal(modalContent, document.body);
};

export default NotificationDropdown;
