import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead } from '../api/notificationAPI';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAllNotifications(currentPage, 15);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
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

  const getTypeColor = (type) => {
    const colors = {
      grievance_update: 'from-blue-50 to-blue-100 border-l-4 border-blue-400',
      status_change: 'from-green-50 to-green-100 border-l-4 border-green-400',
      response: 'from-purple-50 to-purple-100 border-l-4 border-purple-400',
      admin: 'from-red-50 to-red-100 border-l-4 border-red-400',
      general: 'from-slate-50 to-slate-100 border-l-4 border-slate-400',
    };
    return colors[type] || colors.general;
  };

  const getTypeIcon = (type) => {
    const icons = {
      grievance_update: '📋',
      status_change: '✅',
      response: '💬',
      admin: '⚠️',
      general: '🔔',
    };
    return icons[type] || icons.general;
  };

  const getTypeBadge = (type) => {
    const badges = {
      grievance_update: { text: 'Grievance Update', color: 'bg-blue-100 text-blue-800' },
      status_change: { text: 'Status Change', color: 'bg-green-100 text-green-800' },
      response: { text: 'Response', color: 'bg-purple-100 text-purple-800' },
      admin: { text: 'Admin Notice', color: 'bg-red-100 text-red-800' },
      general: { text: 'General', color: 'bg-slate-100 text-slate-800' },
    };
    return badges[type] || badges.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 pt-20 pb-8">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-slate-600">{unreadCount} unread</p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Mark all as read
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-3 border-green-400 border-t-green-600 rounded-full"
            />
          </div>
        ) : notifications.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {notifications.map((notification, index) => {
              const badge = getTypeBadge(notification.type);
              return (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gradient-to-r ${getTypeColor(
                    notification.type
                  )} rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group cursor-pointer`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <motion.span
                                layoutId={`dot-${notification._id}`}
                                className="inline-block w-3 h-3 bg-green-500 rounded-full"
                              />
                            )}
                          </div>
                          <span
                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-200/50 rounded-lg text-red-600 text-sm font-medium"
                        >
                          Delete
                        </motion.button>
                      </div>

                      <p className="text-slate-700 mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {new Date(notification.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-green-600 hover:text-green-700 underline"
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 inline-block">🔔</span>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              No notifications yet
            </h3>
            <p className="text-slate-600">Check back soon for updates on your grievances</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.total && pagination.total > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </motion.button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.total }, (_, i) => i + 1).map(
                (page) => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </motion.button>
                )
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === pagination.total}
              onClick={() => setCurrentPage((p) => Math.min(pagination.total, p + 1))}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
