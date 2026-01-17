import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import { getUserProfile, updateUserProfile, requestGrievanceCancellation } from '../Services/operations/authAPI';
import { getUserGrievances } from '../Services/operations/grievanceAPI';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [grievances, setGrievances] = useState([]);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    publicProfile: false,
    language: 'en'
  });
  const [cancelRequest, setCancelRequest] = useState({
    grievanceId: '',
    reason: ''
  });

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: '👤' },
    { id: 'complaints', name: 'My Complaints', icon: '📋' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'cancel', name: 'Cancel Request', icon: '❌' }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const profileResponse = await getUserProfile(token);
      setProfileData({
        name: profileResponse.name || '',
        email: profileResponse.email || '',
        phone: profileResponse.phone || '',
        profilePicture: profileResponse.profilePicture || ''
      });
      
      // Fetch user's grievances
      const grievancesResponse = await getUserGrievances(token);
      setGrievances(grievancesResponse);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const updatedUser = await updateUserProfile(profileData, token);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await requestGrievanceCancellation(cancelRequest, token);
      toast.success('Cancellation request submitted successfully!');
      setCancelRequest({ grievanceId: '', reason: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to submit cancellation request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
      resolved: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      open: 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="min-h-screen mt-[100px] bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        />
      </div>

      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-slate-600">Manage your account and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Side Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 border-2 border-white/50 sticky top-24">
                {/* User Info */}
                <div className="text-center mb-6 pb-6 border-b-2 border-slate-200">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{profileData.name || 'User'}</h2>
                  <p className="text-sm text-slate-600">{profileData.email}</p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-2xl">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border-2 border-white/50">
                <AnimatePresence>
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                        Edit Profile
                      </h2>
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>

                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Updating...' : 'Update Profile'}
                        </motion.button>
                      </form>
                    </motion.div>
                  )}

                  {/* My Complaints Tab */}
                  {activeTab === 'complaints' && (
                    <motion.div
                      key="complaints"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                        My Complaints
                      </h2>
                      
                      {loading ? (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                          <p className="mt-4 text-slate-600">Loading complaints...</p>
                        </div>
                      ) : grievances.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📭</div>
                          <p className="text-xl text-slate-600">No complaints yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {grievances.map((grievance, index) => (
                            <motion.div
                              key={grievance._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-gradient-to-r from-slate-50 to-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="text-lg font-bold text-slate-900">{grievance.title}</h3>
                                  <p className="text-sm text-slate-600">ID: {grievance.trackingId || grievance._id}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(grievance.status)}`}>
                                  {grievance.status?.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-slate-700 mb-3">{grievance.description}</p>
                              <div className="flex gap-4 text-sm text-slate-600">
                                <span>📁 {grievance.category}</span>
                                <span>📍 {grievance.location || 'Not specified'}</span>
                                <span>📅 {new Date(grievance.createdAt).toLocaleDateString()}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                        Settings
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Notifications */}
                        <div className="bg-slate-50 p-6 rounded-2xl">
                          <h3 className="text-xl font-bold text-slate-900 mb-4">Notifications</h3>
                          <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="text-slate-700">Email Notifications</span>
                              <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                              />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="text-slate-700">SMS Notifications</span>
                              <input
                                type="checkbox"
                                checked={settings.smsNotifications}
                                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                                className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Privacy */}
                        <div className="bg-slate-50 p-6 rounded-2xl">
                          <h3 className="text-xl font-bold text-slate-900 mb-4">Privacy</h3>
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-slate-700">Public Profile</span>
                            <input
                              type="checkbox"
                              checked={settings.publicProfile}
                              onChange={(e) => setSettings({ ...settings, publicProfile: e.target.checked })}
                              className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                            />
                          </label>
                        </div>

                        {/* Language */}
                        <div className="bg-slate-50 p-6 rounded-2xl">
                          <h3 className="text-xl font-bold text-slate-900 mb-4">Language</h3>
                          <select
                            value={settings.language}
                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi (हिंदी)</option>
                            <option value="mr">Marathi (मराठी)</option>
                          </select>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => toast.success('Settings saved successfully!')}
                        >
                          Save Settings
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Cancel Request Tab */}
                  {activeTab === 'cancel' && (
                    <motion.div
                      key="cancel"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                        Cancel Grievance Request
                      </h2>
                      
                      <form onSubmit={handleCancelRequest} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Select Grievance
                          </label>
                          <select
                            value={cancelRequest.grievanceId}
                            onChange={(e) => setCancelRequest({ ...cancelRequest, grievanceId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                            required
                          >
                            <option value="">Select a grievance to cancel</option>
                            {grievances.filter(g => g.status !== 'resolved' && g.status !== 'rejected').map((grievance) => (
                              <option key={grievance._id} value={grievance._id}>
                                {grievance.title} - {grievance.trackingId || grievance._id}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Reason for Cancellation
                          </label>
                          <textarea
                            value={cancelRequest.reason}
                            onChange={(e) => setCancelRequest({ ...cancelRequest, reason: e.target.value })}
                            rows="6"
                            placeholder="Please provide a detailed reason for cancellation..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300 resize-none"
                            required
                          />
                        </div>

                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                          <p className="text-sm text-yellow-800">
                            ⚠️ <strong>Note:</strong> Cancellation requests are subject to approval. Once approved, the grievance will be marked as cancelled and cannot be reopened.
                          </p>
                        </div>

                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Submitting...' : 'Submit Cancellation Request'}
                        </motion.button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
