import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWardMapData, getWardDetails, getGeoJSONData } from '../../Services/operations/wardMapAPI';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const WardMap = () => {
  const [wardData, setWardData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    script.onload = () => {
      setMapLoaded(true);
    };
    
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      fetchMapData();
    }
  }, [filters, mapLoaded]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const [wardResponse, geoResponse] = await Promise.all([
        getWardMapData(token, filters),
        getGeoJSONData(token, filters),
      ]);
      
      const data = wardResponse.data;
      
      // Calculate distributions from locations data
      const categoryDist = {};
      const statusDist = {};
      const priorityDist = {};
      
      if (data.locations && Array.isArray(data.locations)) {
        data.locations.forEach(loc => {
          // Category
          categoryDist[loc.category] = (categoryDist[loc.category] || 0) + 1;
          // Status
          statusDist[loc.status] = (statusDist[loc.status] || 0) + 1;
          // Priority
          priorityDist[loc.priority] = (priorityDist[loc.priority] || 0) + 1;
        });
      }
      
      data.categoryDistribution = categoryDist;
      data.statusDistribution = statusDist;
      data.priorityDistribution = priorityDist;
      
      setWardData(data);
      setGeoData(geoResponse.data);
      
      setTimeout(() => initializeMap(geoResponse.data), 100);
    } catch (error) {
      console.error('Error fetching map data:', error);
      showToast('Failed to load ward map data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const handleWardClick = async (ward) => {
    try {
      // Pass the ward name for proper details fetching
      const wardIdentifier = ward.wardNumber && ward.wardNumber !== '0' ? ward.wardNumber : encodeURIComponent(ward.wardName);
      const details = await getWardDetails(token, wardIdentifier);
      // Add ward name to the response for display
      setSelectedWard({ ...details.data, wardName: ward.wardName, wardNumber: ward.wardNumber });
    } catch (error) {
      console.error('Error fetching ward details:', error);
      showToast('Failed to load ward details', 'error');
    }
  };

  const downloadData = () => {
    if (wardData) {
      const dataStr = JSON.stringify(wardData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ward-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Ward data downloaded successfully', 'success');
    }
  };

  const getMarkerColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getWardColor = (count) => {
    if (count >= 20) return '#dc2626';
    if (count >= 10) return '#f59e0b';
    return '#10b981';
  };

  const initializeMap = (geoData) => {
    const mapContainer = document.getElementById('ward-map-container');
    if (!mapContainer || !window.L || !geoData) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    markersRef.current = [];

    const map = window.L.map('ward-map-container', {
      center: [21.1702, 72.8311], // Surat, Gujarat coordinates
      zoom: 12,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (geoData.features && geoData.features.length > 0) {
      geoData.features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        const iconColor = getMarkerColor(props.priority);
        const icon = window.L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${iconColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = window.L.marker([lat, lng], { icon }).addTo(map);

        const popupContent = `
          <div style="min-width: 200px;">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">
              ${props.trackingId}
            </div>
            <div style="font-size: 0.875rem; color: #4b5563; margin-bottom: 8px;">
              ${props.title}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
              <span style="padding: 2px 8px; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 0.75rem;">
                ${props.category}
              </span>
              <span style="padding: 2px 8px; background: ${props.status === 'open' ? '#fef3c7' : props.status === 'in-progress' ? '#dbeafe' : '#d1fae5'}; color: ${props.status === 'open' ? '#92400e' : props.status === 'in-progress' ? '#1e40af' : '#065f46'}; border-radius: 9999px; font-size: 0.75rem;">
                ${props.status}
              </span>
              <span style="padding: 2px 8px; background: ${props.priority === 'critical' ? '#fee2e2' : props.priority === 'high' ? '#fed7aa' : props.priority === 'medium' ? '#fef3c7' : '#d1fae5'}; color: ${props.priority === 'critical' ? '#991b1b' : props.priority === 'high' ? '#9a3412' : props.priority === 'medium' ? '#92400e' : '#065f46'}; border-radius: 9999px; font-size: 0.75rem;">
                ${props.priority}
              </span>
            </div>
            <div style="font-size: 0.75rem; color: #6b7280;">
              📍 ${props.location || 'Location not specified'}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      if (markersRef.current.length > 0) {
        const group = window.L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  };

  if (loading || !mapLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading ward map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              🗺️ Ward Map
            </h1>
            <p className="text-blue-100 text-lg">
              Ticket density across wards (geo-spatial view)
            </p>
          </div>
          <button
            onClick={downloadData}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <span>⬇️</span>
            <span>Download Data</span>
          </button>
        </div>
      </motion.div>

      {wardData?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }} className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="text-blue-100 text-sm font-medium mb-1">Total Grievances</div>
              <div className="text-3xl font-extrabold">{wardData.summary.totalGrievances}</div>
              <div className="mt-2 h-1 bg-blue-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4)' }} className="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-xl sm:rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 0.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="text-red-100 text-sm font-medium mb-1">High Density (20+)</div>
              <div className="text-3xl font-extrabold">{wardData.summary.highDensityWards}</div>
              <div className="mt-2 h-1 bg-red-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5, delay: 0.2 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)' }} className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="text-amber-100 text-sm font-medium mb-1">Medium Density (10-19)</div>
              <div className="text-3xl font-extrabold">{wardData.summary.mediumDensityWards}</div>
              <div className="mt-2 h-1 bg-amber-300 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5, delay: 0.3 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }} className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity }} className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10" />
            <div className="relative z-10">
              <div className="text-green-100 text-sm font-medium mb-1">Low Density (&lt;10)</div>
              <div className="text-3xl font-extrabold">{wardData.summary.lowDensityWards}</div>
              <div className="mt-2 h-1 bg-green-400 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.5, delay: 0.4 }} className="h-full bg-white" /></div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-4 shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="water">Water</option>
              <option value="roads">Roads</option>
              <option value="electric">Electricity</option>
              <option value="waste">Waste Management</option>
              <option value="sanitation">Sanitation</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </motion.div>

      {wardData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Category Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📊</span>
              <h3 className="text-base font-semibold text-gray-800">Category Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={Object.entries(wardData.categoryDistribution || {}).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {Object.keys(wardData.categoryDistribution || {}).map((entry, index) => {
                    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Overview Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📈</span>
              <h3 className="text-base font-semibold text-gray-800">Status Overview</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={Object.entries(wardData.statusDistribution || {}).map(([name, value]) => ({
                name: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                value
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                  {Object.keys(wardData.statusDistribution || {}).map((entry, index) => {
                    const colors = ['#fbbf24', '#3b82f6', '#10b981', '#6b7280'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              🌍 Geographic View
            </h2>
            <p className="text-sm text-gray-600 mt-1">Interactive map showing grievance locations</p>
          </div>
          <div className="h-[450px] relative">
            <div 
              id="ward-map-container" 
              className="w-full h-full rounded-lg"
              style={{ background: '#f0f0f0', zIndex: 1 }}
            ></div>

            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
              <h3 className="font-semibold text-gray-800 mb-2 text-xs">Priority Legend</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white"></div>
                  <span className="text-gray-700">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600 border-2 border-white"></div>
                  <span className="text-gray-700">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></div>
                  <span className="text-gray-700">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                  <span className="text-gray-700">Low</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              � Individual Grievances
            </h2>
            <p className="text-sm text-gray-600 mt-1">All reported issues on map</p>
          </div>
          <div className="overflow-y-auto max-h-[410px]">
            {wardData?.locations && wardData.locations.length > 0 ? (
              wardData.locations.map((grievance, index) => (
                <motion.div
                  key={grievance._id || index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Priority Indicator & Title */}
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getMarkerColor(grievance.priority) }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {grievance.title || 'Untitled'}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        ID: {grievance.grievanceId || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Category & Status */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {grievance.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      grievance.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                      grievance.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      grievance.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {grievance.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      grievance.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      grievance.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      grievance.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {grievance.priority}
                    </span>
                  </div>

                  {/* Ward & Location */}
                  <div className="text-xs text-gray-600 space-y-1">
                    {grievance.ward && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">📍 Ward:</span>
                        <span>{grievance.ward}</span>
                      </div>
                    )}
                    {grievance.address && (
                      <div className="flex items-start gap-1">
                        <span className="font-medium flex-shrink-0">🏠</span>
                        <span className="line-clamp-2">{grievance.address}</span>
                      </div>
                    )}
                    {grievance.assignedEngineer && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">👷</span>
                        <span className="truncate">{grievance.assignedEngineer.name || 'Assigned'}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No grievances found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {wardData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Priority Distribution Radar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <h3 className="text-base font-semibold text-gray-800">Priority Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={Object.entries(wardData.priorityDistribution || {}).map(([name, value]) => ({
                priority: name.charAt(0).toUpperCase() + name.slice(1),
                count: value
              }))}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="priority" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar 
                  name="Grievances" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                  animationDuration={800}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Wards Horizontal Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <h3 className="text-base font-semibold text-gray-800">Top 10 Wards by Volume</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart 
                data={[...(wardData.wards || [])]
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 10)
                  .map(w => ({ name: w.wardName, total: w.total }))}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} animationDuration={800}>
                  {[...(wardData.wards || [])]
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 10)
                    .map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.total >= 20 ? '#dc2626' : entry.total >= 10 ? '#f59e0b' : '#10b981'} 
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedWard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  📊 {selectedWard.wardName || `Ward ${selectedWard.wardNumber}`} Details
                </h2>
                <button
                  onClick={() => setSelectedWard(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <motion.div whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)' }} className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg p-4 text-white shadow-lg relative overflow-hidden">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-6 -top-6 w-20 h-20 bg-white rounded-full opacity-10" />
                  <div className="relative z-10">
                    <div className="text-blue-100 text-sm mb-1">Total</div>
                    <div className="text-2xl font-extrabold">{selectedWard.stats.total}</div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(245, 158, 11, 0.3)' }} className="bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-lg p-4 text-white shadow-lg relative overflow-hidden">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 0.5, repeat: Infinity }} className="absolute -right-6 -top-6 w-20 h-20 bg-white rounded-full opacity-10" />
                  <div className="relative z-10">
                    <div className="text-yellow-100 text-sm mb-1">Open</div>
                    <div className="text-2xl font-extrabold">{selectedWard.stats.byStatus.open || 0}</div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.3)' }} className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-lg p-4 text-white shadow-lg relative overflow-hidden">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} className="absolute -right-6 -top-6 w-20 h-20 bg-white rounded-full opacity-10" />
                  <div className="relative z-10">
                    <div className="text-green-100 text-sm mb-1">Resolved</div>
                    <div className="text-2xl font-extrabold">{selectedWard.stats.byStatus.resolved || 0}</div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(239, 68, 68, 0.3)' }} className="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-lg p-4 text-white shadow-lg relative overflow-hidden">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity }} className="absolute -right-6 -top-6 w-20 h-20 bg-white rounded-full opacity-10" />
                  <div className="relative z-10">
                    <div className="text-red-100 text-sm mb-1">Overdue</div>
                    <div className="text-2xl font-extrabold">{selectedWard.stats.overdue}</div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Grievances</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedWard.grievances.slice(0, 10).map((grievance) => (
                    <div key={grievance._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-800">{grievance.trackingId}</div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          grievance.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                          grievance.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {grievance.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{grievance.title}</div>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {grievance.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          grievance.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          grievance.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {grievance.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardMap;
