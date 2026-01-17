import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { trackByTrackingId, trackByEmail, getGrievanceById } from '../Services/operations/grievanceAPI';
import useAuthStore from '../store/authStore';

export default function TrackPage() {
  const location = useLocation();
  const { id } = useParams();
  const { token } = useAuthStore();
  const [trackingId, setTrackingId] = useState('');
  const [email, setEmail] = useState('');
  const [searchMethod, setSearchMethod] = useState('id'); // 'id' or 'email'
  const [grievance, setGrievance] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-load grievance if passed from dashboard or URL
  useEffect(() => {
    // Check if ID is in URL params (from dashboard navigation)
    if (id) {
      const fetchGrievance = async () => {
        setLoading(true);
        setError('');
        try {
          const authToken = token || localStorage.getItem('token');
          if (!authToken) {
            setError('Please login to view grievance details');
            setLoading(false);
            return;
          }
          
          // If grievance data is passed via state, use it
          if (location.state?.grievance) {
            setGrievance(location.state.grievance);
            if (location.state.trackingId) {
              setTrackingId(location.state.trackingId);
            }
          } else {
            // Fetch from API using ID
            const data = await getGrievanceById(id, authToken);
            setGrievance(data);
            if (data.trackingId) {
              setTrackingId(data.trackingId);
            }
          }
        } catch (err) {
          console.error('Error fetching grievance:', err);
          setError(err?.response?.data?.message || 'Failed to load grievance details');
        } finally {
          setLoading(false);
        }
      };
      fetchGrievance();
    } else if (location.state?.trackingId) {
      // Legacy support: trackingId passed via state
      setTrackingId(location.state.trackingId);
      setSearchMethod('id');
      if (location.state.grievance) {
        setGrievance(location.state.grievance);
      } else {
        const fetchGrievance = async () => {
          setLoading(true);
          try {
            const data = await trackByTrackingId(location.state.trackingId);
            setGrievance(data);
          } catch (err) {
            setError('Failed to load grievance details');
          } finally {
            setLoading(false);
          }
        };
        fetchGrievance();
      }
    }
  }, [id, location.state, token]);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGrievance(null);
    setGrievances([]);

    try {
      if (searchMethod === 'id') {
        const data = await trackByTrackingId(trackingId.trim());
        console.log('📋 Grievance data received:', data);
        console.log('📎 Attachments:', data?.attachments);
        setGrievance(data);
      } else {
        const data = await trackByEmail(email.trim());
        console.log('📋 Grievances data received:', data);
        // If multiple grievances returned, show first one in detail view
        if (Array.isArray(data)) {
          setGrievances(data);
          if (data.length > 0) {
            console.log('📎 First grievance attachments:', data[0]?.attachments);
            setGrievance(data[0]);
          }
        } else {
          console.log('📎 Attachments:', data?.attachments);
          setGrievance(data);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to track grievance. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700',
      submitted: 'bg-blue-100 text-blue-700',
      reviewed: 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-purple-100 text-purple-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
      rejected: 'bg-red-100 text-red-700',
      blocked: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 relative overflow-hidden">
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
          className="absolute top-20 left-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
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
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
      </div>
      
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-black text-slate-800 mb-3">
              Track Your Grievance
            </h1>
            <p className="text-lg text-slate-600">
              Enter your Tracking ID or Email to check status
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            {/* Toggle Search Method */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSearchMethod('id')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  searchMethod === 'id'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🎫 Track by ID
              </button>
              <button
                onClick={() => setSearchMethod('email')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  searchMethod === 'email'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📧 Track by Email
              </button>
            </div>

            <form onSubmit={handleTrack} className="space-y-4">
              {searchMethod === 'id' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g., GR2024001"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter registered email address"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    required
                  />
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Tracking...
                  </span>
                ) : (
                  '🔍 Track Grievance'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Grievance Details */}
          {grievance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl shadow-xl p-8 border border-blue-100"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
                <div className="flex-1">
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg text-xs font-bold mb-2">
                    #{grievance.trackingId}
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">
                    {grievance.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">{grievance.description}</p>
                </div>
                <span className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg ${getStatusColor(grievance.status)}`}>
                  {grievance.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              {/* Details Grid with Colorful Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-md">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-2">📁 Category</p>
                  <p className="font-bold text-slate-800 capitalize text-lg">{grievance.category}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200 shadow-md">
                  <p className="text-xs font-bold text-orange-600 uppercase mb-2">🚨 Priority</p>
                  <p className="font-bold text-slate-800 capitalize text-lg">{grievance.priority}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 shadow-md">
                  <p className="text-xs font-bold text-purple-600 uppercase mb-2">👤 Assigned To</p>
                  <p className="font-bold text-slate-800 text-lg">{grievance.assignedTo?.name || 'Pending'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow-md">
                  <p className="text-xs font-bold text-green-600 uppercase mb-2">📍 Location</p>
                  <p className="font-bold text-slate-800 text-sm">{grievance.location || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-xl border-2 border-cyan-200 shadow-md">
                  <p className="text-xs font-bold text-cyan-600 uppercase mb-2">📅 Submitted</p>
                  <p className="font-bold text-slate-800">{formatDate(grievance.createdAt)}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl border-2 border-pink-200 shadow-md">
                  <p className="text-xs font-bold text-pink-600 uppercase mb-2">⏱️ Days Open</p>
                  <p className="font-bold text-slate-800 text-lg">{grievance.daysOpen || 0} days</p>
                </div>
              </div>

              {/* Attachments Section */}
              {grievance.attachments && grievance.attachments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📎</span> Attachments
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {grievance.attachments.map((attachment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        {attachment.type === 'image' ? (
                          <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all">
                            <img
                              src={attachment.url}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-2 left-2 text-white text-xs font-semibold">
                                📷 Photo {index + 1}
                              </div>
                            </div>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-2 right-2 bg-white/90 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all bg-gradient-to-br from-purple-50 to-purple-100">
                            <video
                              src={attachment.url}
                              className="w-full h-full object-cover"
                              controls
                            />
                            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                              🎥 Video {index + 1}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">⏳</span> Timeline
                </h3>
                <div className="space-y-4">
                  {/* Created Event */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg" />
                      <div className="w-0.5 h-full bg-gradient-to-b from-blue-300 to-purple-300 mt-1" />
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">📝</span>
                          <p className="font-bold text-blue-800 text-lg">
                            Submitted
                          </p>
                        </div>
                        <p className="text-sm text-blue-700 font-semibold mb-2">
                          {formatDate(grievance.createdAt)} at {formatTime(grievance.createdAt)}
                        </p>
                        <p className="text-slate-700">Grievance submitted successfully</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Assignment Event */}
                  {grievance.assignedTo && grievance.assignedAt && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg" />
                        {grievance.status !== 'open' && <div className="w-0.5 h-full bg-gradient-to-b from-yellow-300 to-purple-300 mt-1" />}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-orange-200 shadow-md">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">👥</span>
                            <p className="font-bold text-orange-800 text-lg">
                              Assigned
                            </p>
                          </div>
                          <p className="text-sm text-orange-700 font-semibold mb-2">
                            {formatDate(grievance.assignedAt)} at {formatTime(grievance.assignedAt)}
                          </p>
                          <p className="text-slate-700">Assigned to <span className="font-bold text-orange-800">{grievance.assignedTo.name}</span></p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* In Progress Event */}
                  {['in-progress', 'resolved', 'closed'].includes(grievance.status) && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg" />
                        {['resolved', 'closed'].includes(grievance.status) && <div className="w-0.5 h-full bg-gradient-to-b from-purple-300 to-green-300 mt-1" />}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 shadow-md">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">⚙️</span>
                            <p className="font-bold text-purple-800 text-lg">
                              In Progress
                            </p>
                          </div>
                          <p className="text-sm text-purple-700 font-semibold mb-2">
                            Work in progress
                          </p>
                          <p className="text-slate-700">Your grievance is being worked on</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Resolution Event */}
                  {grievance.resolutionDate && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg" />
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 shadow-md">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">✅</span>
                            <p className="font-bold text-green-800 text-lg">
                              Resolved
                            </p>
                          </div>
                          <p className="text-sm text-green-700 font-semibold mb-2">
                            {formatDate(grievance.resolutionDate)} at {formatTime(grievance.resolutionDate)}
                          </p>
                          <p className="text-slate-700">{grievance.resolution || 'Grievance has been resolved'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Show list of all grievances if searched by email */}
              {searchMethod === 'email' && grievances.length > 1 && (
                <div className="mt-8 pt-8 border-t-2 border-gradient-to-r from-blue-200 to-purple-200">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">📋</span> All Your Grievances ({grievances.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grievances.map((g, index) => (
                      <motion.div
                        key={g._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setGrievance(g)}
                        className={`p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                          g._id === grievance._id
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-500 shadow-lg transform scale-105'
                            : 'bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded text-xs font-bold mb-2">
                              {g.trackingId}
                            </div>
                            <p className="font-bold text-slate-800 text-lg mb-1">{g.title}</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{g.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(g.status)}`}>
                            {g.status.toUpperCase().replace('-', ' ')}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {formatDate(g.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
