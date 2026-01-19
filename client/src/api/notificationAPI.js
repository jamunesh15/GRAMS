import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://grams-lyart.vercel.app/api';
const API_URL = `${BASE_URL}/notifications`;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get last 3 notifications
export const getRecentNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/recent`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    throw error;
  }
};

// Get all notifications with pagination
export const getAllNotifications = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/all?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/unread-count`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`${API_URL}/${notificationId}/read`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put(`${API_URL}/mark-all-read`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${notificationId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Create notification (admin only)
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, notificationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
