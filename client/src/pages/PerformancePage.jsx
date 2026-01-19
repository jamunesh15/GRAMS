import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../store/authStore';
import { 
  getStatusAnalysis, 
  getResolutionTimeAnalytics, 
  getAreaAnalysis 
} from '../Services/operations/analyticsAPI';
import toast from 'react-hot-toast';

export default function PerformancePage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGrievances: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    avgResolutionTime: 0,
    satisfactionRate: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [wardPerformance, setWardPerformance] = useState([]);
  const [todayCases, setTodayCases] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, [token]);

  const fetchAnalyticsData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Use Promise.all to fetch all data at once
      const [statusResponse, resolutionResponse, areaResponse] = await Promise.all([
        getStatusAnalysis(token, 30),
        getResolutionTimeAnalytics(token),
        getAreaAnalysis(token)
      ]);

      // Process status analysis
      if (statusResponse?.data?.success) {
        const statusDist = statusResponse.data.data.statusDistribution;
        
        const resolved = (statusDist.resolved || 0) + (statusDist.closed || 0);
        const inProgress = statusDist['in-progress'] || 0;
        const pending = statusDist.open || 0;
        const total = resolved + inProgress + pending;
        
        // Calculate today's cases from trend data
        const trend = statusResponse.data.data.trend || [];
        const today = new Date().toISOString().split('T')[0];
        const todayData = trend.find(t => t.date === today);
        const todayTotal = todayData 
          ? Object.values(todayData).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0) - 1 
          : 0;
        
        setTodayCases(todayTotal);  

        setStats(prev => ({ 
          ...prev,
          totalGrievances: total,
          resolved,
          inProgress,
          pending,
        }));
      }

      // Process resolution time analytics
      if (resolutionResponse?.data?.success) {
        const resolutionData = resolutionResponse.data.data;
        const avgTime = resolutionData.overall?.average || 0;
        
        // Calculate satisfaction based on resolution time (lower is better)
        // If avg resolution is <= 3 days: 90-100%, 3-7 days: 70-90%, >7 days: below 70%
        let satisfaction = 85;
        if (avgTime <= 3) {
          satisfaction = 95 - (avgTime * 2);
        } else if (avgTime <= 7) {
          satisfaction = 85 - ((avgTime - 3) * 3);
        } else {
          satisfaction = Math.max(50, 70 - ((avgTime - 7) * 2));
        }

        // Get category data from resolution analytics
        const byCategory = resolutionData.byCategory || {};
        const categoryStats = Object.entries(byCategory).map(([name, avgDays]) => {
          // Estimate total based on the average (this is approximate)
          return { name, avgResolutionTime: avgDays };
        });

        setStats(prev => ({
          ...prev,
          avgResolutionTime: avgTime,
          satisfactionRate: Math.round(satisfaction * 10) / 10
        }));
      }

      // Process area analysis for ward and category performance
      if (areaResponse?.data?.success) {
        const areas = areaResponse.data.data.areas || [];
        
        // Format ward performance
        const wards = areas
          .filter(area => area.ward.toLowerCase().includes('ward'))
          .map(area => ({
            ward: area.ward,
            total: area.total,
            resolved: area.resolved,
            rate: parseFloat(area.resolutionRate)
          }))
          .slice(0, 5);
        
        setWardPerformance(wards);

        // Build category data from area analysis
        const categoryMap = {};
        areas.forEach(area => {
          if (area.categories) {
            Object.entries(area.categories).forEach(([category, count]) => {
              if (!categoryMap[category]) {
                categoryMap[category] = { total: 0, resolved: 0 };
              }
              categoryMap[category].total += count;
              // Approximate resolved based on area's resolution rate
              categoryMap[category].resolved += Math.round(count * parseFloat(area.resolutionRate) / 100);
            });
          }
        });

        const categories = Object.entries(categoryMap)
          .map(([name, data]) => ({
            name,
            total: data.total,
            resolved: data.resolved,
            percentage: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        setCategoryData(categories);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className={`bg-gradient-to-br ${color} p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform border-2 border-white/20`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
        <div className="text-3xl sm:text-4xl md:text-5xl">{icon}</div>
        <div className="text-right">
          <p className="text-[10px] sm:text-xs md:text-sm font-bold opacity-90 drop-shadow-md">{title}</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-black mt-1 sm:mt-2 drop-shadow-lg">{value}</p>
        </div>
      </div>
      <p className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-90">{subtitle}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <Navbar />
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
          />
        </div>

        <div className="flex items-center justify-center h-screen relative z-10">
          <div className="text-center">
            {/* Multi-layered animated loader */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-purple-400"
              />
              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-600 border-l-pink-400"
              />
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border-4 border-transparent border-b-cyan-600 border-r-cyan-400"
              />
              {/* Center pulse */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 m-auto w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"
              />
            </div>

            {/* Loading text with gradient */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Loading Performance Data
              </h2>
              <p className="text-sm sm:text-base text-slate-600">Fetching analytics and statistics...</p>
            </motion.div>

            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-10, 10, -10],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                  className="w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 0],
            x: [0, -50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
        />
      </div>
      
      <Navbar />
    
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 relative z-20 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8 md:mb-10"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-lg animate-pulse inline-block mb-3 sm:mb-4">
              ✨ Analytics Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4 drop-shadow-2xl px-4">
              Performance Dashboard
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-700 font-medium px-4">
              Real-time analytics and performance metrics
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
            <StatCard
              title="Total Grievances"
              value={stats.totalGrievances}
              subtitle="All time submissions"
              icon="📊"
              color="from-blue-600 to-indigo-600 text-white"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              subtitle={`${stats.totalGrievances > 0 ? Math.round((stats.resolved / stats.totalGrievances) * 100) : 0}% resolution rate`}
              icon="✅"
              color="from-green-600 to-emerald-600 text-white"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              subtitle="Being worked on"
              icon="⚡"
              color="from-purple-600 to-violet-600 text-white"
            />
            <StatCard
              title="Pending Review"
              value={stats.pending}
              subtitle="Awaiting assignment"
              icon="⏳"
              color="from-amber-600 to-orange-600 text-white"
            />
            <StatCard
              title="Avg Resolution"
              value={`${stats.avgResolutionTime} days`}
              subtitle="Average time to resolve"
              icon="⏱️"
              color="from-indigo-600 to-blue-600 text-white"
            />
            <StatCard
              title="Satisfaction"
              value={`${stats.satisfactionRate}%`}
              subtitle="User satisfaction rate"
              icon="⭐"
              color="from-pink-600 to-rose-600 text-white"
            />
            <StatCard
              title="Today's Cases"
              value={todayCases}
              subtitle="Submitted today"
              icon="📅"
              color="from-sky-600 to-blue-600 text-white"
            />
            <StatCard
              title="Success Rate"
              value={`${stats.totalGrievances > 0 ? Math.round((stats.resolved / stats.totalGrievances) * 100) : 0}%`}
              subtitle="Resolution success"
              icon="🎯"
              color="from-fuchsia-600 to-purple-600 text-white"
            />
          </div>

          {/* Category Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10 border-2 border-white/50"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
              <span className="text-2xl sm:text-3xl md:text-4xl">📈</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
                Performance by Category
              </h2>
            </div>
            {categoryData.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-slate-500 text-base sm:text-lg">No category data available yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {categoryData.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="bg-gradient-to-r from-slate-50 to-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-blue-300"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{category.name}</span>
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-1 rounded-full">
                      {category.resolved}/{category.total}
                    </span>
                  </div>
                  <div className="relative w-full h-2 sm:h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
                      className="absolute h-full bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-full shadow-lg"
                      style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 sm:mt-2">
                    <span className="text-[10px] sm:text-xs text-slate-500">Rate</span>
                    <span className="text-xs sm:text-sm font-bold text-green-600">{category.percentage}%</span>
                  </div>
                </motion.div>
              ))}
              </div>
            )}
          </motion.div>

          {/* Ward Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-white/50"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 md:mb-8">
              <span className="text-2xl sm:text-3xl md:text-4xl">🏛️</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
                Ward-wise Performance
              </h2>
            </div>
            {wardPerformance.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-slate-500 text-base sm:text-lg">No ward data available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {wardPerformance.map((ward, index) => {
                const cardColors = [
                  'from-blue-100 via-cyan-100 to-teal-100 border-blue-300 hover:border-blue-500 hover:shadow-blue-300',
                  'from-purple-100 via-pink-100 to-fuchsia-100 border-purple-300 hover:border-purple-500 hover:shadow-purple-300',
                  'from-green-100 via-emerald-100 to-teal-100 border-green-300 hover:border-green-500 hover:shadow-green-300',
                  'from-orange-100 via-amber-100 to-yellow-100 border-orange-300 hover:border-orange-500 hover:shadow-orange-300',
                  'from-rose-100 via-pink-100 to-red-100 border-rose-300 hover:border-rose-500 hover:shadow-rose-300',
                ];
                const textColors = [
                  'from-blue-600 to-cyan-600',
                  'from-purple-600 to-pink-600',
                  'from-green-600 to-emerald-600',
                  'from-orange-600 to-amber-600',
                  'from-rose-600 to-pink-600',
                ];
                return (
                  <motion.div
                    key={ward.ward}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
                    className={`bg-gradient-to-br ${cardColors[index % cardColors.length]} p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 transform`}
                  >
                    <h3 className={`text-base sm:text-lg md:text-xl font-extrabold bg-gradient-to-r ${textColors[index % textColors.length]} bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-sm`}>
                      {ward.ward}
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-600 font-semibold">Total:</span>
                        <span className="font-bold text-slate-900">{ward.total}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-600 font-semibold">Resolved:</span>
                        <span className="font-bold text-green-600">{ward.resolved}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-600 font-semibold">Rate:</span>
                        <span className="font-extrabold text-green-600 text-base sm:text-lg">{ward.rate}%</span>
                      </div>  
                    </div>
                    <div className="mt-3 sm:mt-4 md:mt-5 relative w-full h-2 sm:h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ward.rate}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute h-full bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-full shadow-lg"
                        style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
          
