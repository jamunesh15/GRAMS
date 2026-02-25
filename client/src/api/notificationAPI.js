import { axiosInstance } from '../Services/apiconnector';

// Use centralized BASE_URL configuration for consistency
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 'https://grams-lyart.vercel.app/api' : 'http://localhost:5000/api');
const API_URL = `${BASE_URL}/notifications`;

// Log API URL for debugging
console.log('📡 NotificationAPI BASE_URL:', BASE_URL, 'isProd:', import.meta.env.PROD);

// Get last 3 notifications
export const getRecentNotifications = async () => {
  try {
    console.log('🔔 Fetching recent notifications from:', `${API_URL}/recent`);
    const response = await axiosInstance.get(`${API_URL}/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    throw error;
  }
};

// Get all notifications with pagination
export const getAllNotifications = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/all?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/unread-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${notificationId}/read`, {});
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.put(`${API_URL}/mark-all-read`, {});
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Create notification (admin only)
export const createNotification = async (notificationData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/create`, notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
