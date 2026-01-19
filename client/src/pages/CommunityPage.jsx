import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getAllGrievances, upvoteGrievance } from '../Services/operations/grievanceAPI';
import useAuthStore from '../store/authStore';

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [grievances, setGrievances] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [upvoting, setUpvoting] = React.useState({});
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    fetchGrievances();
  }, []); 

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllGrievances();
      setGrievances(data || []);
    } catch (err) {
      setError('Failed to load community issues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId) => {
    if (upvoting[issueId]) return;
    
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to upvote issues', {
        position: 'bottom-right',
        style: { background: '#1e293b', color: '#fff', borderRadius: '12px' },
      });
      return;
    }

    // Check if user already upvoted this issue
    const grievance = grievances.find(g => g._id === issueId);
    if (grievance?.upvotedBy?.some(id => id === user._id || id === user.id)) {
      toast.error('You have already upvoted this issue', {
        position: 'bottom-right',
        style: { background: '#1e293b', color: '#fff', borderRadius: '12px' },
      });
      return;
    }

    
    setUpvoting((prev) => ({ ...prev, [issueId]: true }));
    try {
      const token = localStorage.getItem('token');
      const data = await upvoteGrievance(issueId, token);
      if (data) {
        setGrievances((prev) =>
          prev.map((g) =>
            g._id === issueId
              ? { ...g, upvotes: data.upvotes, priority: data.priority, upvotedBy: data.upvotedBy || [...(g.upvotedBy || []), user._id || user.id] }
              : g
          )
        );
        toast.success('Upvote recorded! 🎉', {
          position: 'bottom-right',
          style: { background: '#059669', color: '#fff', borderRadius: '12px' },
        });
      }
    } catch (e) {
      console.error('Failed to upvote:', e);
    } finally {
      setUpvoting((prev) => ({ ...prev, [issueId]: false }));
    }
  };

  const filters = React.useMemo(
    () => [
      { key: 'all', label: 'All Issues' },
      { key: 'high', label: 'High Priority' },
      { key: 'infrastructure', label: 'Infrastructure' },
      { key: 'health', label: 'Health' },
      { key: 'academic', label: 'Academic' },
      { key: 'administrative', label: 'Administrative' },
    ],
    []
  );

  const getCategoryIcon = (category) => {
    const icons = {
      infrastructure: 'construction',
      health: 'local_hospital',
      academic: 'school',
      administrative: 'description',
      other: 'report_problem',
    };
    return icons[category] || 'help';
  };

  const getCategoryColor = (category) => {
    const colors = {
      infrastructure: { iconBg: 'bg-orange-100', iconText: 'text-orange-600', vote: { bg: 'bg-orange-50 hover:bg-orange-100', text: 'text-orange-700' } },
      health: { iconBg: 'bg-red-100', iconText: 'text-red-600', vote: { bg: 'bg-red-50 hover:bg-red-100', text: 'text-red-700' } },
      academic: { iconBg: 'bg-blue-100', iconText: 'text-blue-600', vote: { bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-700' } },
      administrative: { iconBg: 'bg-purple-100', iconText: 'text-purple-600', vote: { bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-700' } },
      other: { iconBg: 'bg-gray-100', iconText: 'text-gray-600', vote: { bg: 'bg-gray-50 hover:bg-gray-100', text: 'text-gray-700' } },
    };
    return colors[category] || colors.other;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now - created) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const issues = React.useMemo(() => {
    return grievances.map((g) => {
      const colors = getCategoryColor(g.category);
      const isHighPriority = g.priority === 'high' || g.priority === 'critical';
      const hasUpvoted = user && g.upvotedBy?.some(id => id === user._id || id === user.id);
      return {
        id: g._id,
        title: g.title,
        location: g.userId?.name || 'Community Member',
        description: g.description,
        upvotes: g.upvotes || 0,
        upvotedBy: g.upvotedBy || [],
        hasUpvoted,
        filed: formatTimeAgo(g.createdAt),
        category: g.category,
        priority: g.priority,
        status: g.status,
        icon: getCategoryIcon(g.category),
        iconBg: colors.iconBg,
        iconText: colors.iconText,
        border: isHighPriority ? 'border-2 border-red-200' : 'border border-slate-200',
        chip: isHighPriority ? { text: g.priority === 'critical' ? 'Critical' : 'High Priority', className: 'bg-red-100 text-red-700' } : null,
        vote: colors.vote,
      };
    });
  }, [grievances, user]);

  const visibleIssues = React.useMemo(() => {
    if (activeFilter === 'all') return issues;
    if (activeFilter === 'high') return issues.filter((i) => i.priority === 'high' || i.priority === 'critical');
    return issues.filter((i) => i.category === activeFilter);
  }, [activeFilter, issues]);

  const stats = React.useMemo(() => {
    const activeNearby = grievances.filter((g) => g.status === 'open' || g.status === 'in-progress').length;
    const resolvedToday = grievances.filter((g) => {
      if (g.status !== 'resolved') return false;
      const resolved = new Date(g.resolutionDate || g.updatedAt);
      const today = new Date();
      return resolved.toDateString() === today.toDateString();
    }).length;
    return { activeNearby, resolvedToday };
  }, [grievances]);

  const ease = [0.22, 1, 0.36, 1];
  const fade = shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease };
  const fadeFast = shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease };

  return (
    <section id="community" className="page-enter bg-gradient-to-br from-purple-100 via-indigo-100 to-violet-100 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-600 py-12 mt-10 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-10 right-10 w-96 h-96 bg-violet-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-fuchsia-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <motion.div
          className="max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={fade}
        >
          <span className="bg-white/20 backdrop-blur-md text-white border border-white/40 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg animate-bounce">
            ● Neighborhood Watch
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mt-4 drop-shadow-2xl">Nearby Issues</h1>
          <p className="text-white/90 mt-3 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t file duplicate complaints. Upvote existing ones to prioritize them. Community support makes issues
            get resolved faster.
          </p>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 -mt-6 mb-8">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease }}
        >
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl border-2 border-purple-200 p-4 sm:p-6 hover:shadow-purple-300 transition-all duration-200">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <div className="hover:scale-105 transition-transform">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">{stats.activeNearby}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase mt-1 tracking-wide">Active Nearby</p>
              </div>
              <div className="border-l-2 border-r-2 border-purple-200 hover:scale-105 transition-transform">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg">{stats.resolvedToday}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase mt-1 tracking-wide">Resolved Today</p>
              </div>
              <div className="hover:scale-105 transition-transform">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent drop-shadow-lg">{grievances.length}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase mt-1 tracking-wide">Total Issues</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 mb-6">
        <motion.div
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease }}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <motion.button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                className="relative px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap border-2 overflow-hidden shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600"
                  aria-hidden="true"
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={fadeFast}
                />
                <motion.span
                  className="absolute inset-0 border-2"
                  aria-hidden="true"
                  initial={false}
                  animate={{ 
                    borderColor: isActive ? 'rgba(147, 51, 234, 0.5)' : 'rgba(226, 232, 240, 1)'
                  }}
                  transition={fadeFast}
                />
                <span className={`relative z-10 ${isActive ? 'text-white drop-shadow-md' : 'text-slate-700'}`}>{filter.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Issue Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 pb-16">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 shadow-lg"></div>
            <p className="mt-4 text-slate-700 font-bold">Loading community issues...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-8 text-center shadow-xl">
            <span className="text-5xl mb-3 block">⚠️</span>
            <p className="text-red-700 font-bold text-lg">{error}</p>
            <button
              onClick={fetchGrievances}
              className="mt-5 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && visibleIssues.length === 0 && (
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-12 text-center shadow-lg">
            <span className="text-6xl mb-4 block animate-bounce">📋</span>
            <p className="text-slate-700 font-bold text-xl">No issues found in this category</p>
            <p className="text-slate-600 text-sm mt-2">Try selecting a different filter</p>
          </div>
        )}
        
        {!loading && !error && visibleIssues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <AnimatePresence initial={false}>
            {visibleIssues.map((issue) => (
              <motion.div
                key={issue.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className={`bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6 rounded-2xl shadow-xl ${issue.border} hover:shadow-2xl hover:scale-105 hover:-rotate-1 transition-all duration-200 transform`}
              >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${issue.iconBg} rounded-xl flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-12 transition-transform flex-shrink-0`}>
                    <span className={`material-symbols-rounded ${issue.iconText} text-xl sm:text-2xl`} aria-hidden="true">
                      {issue.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 drop-shadow-sm truncate">{issue.title}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">{issue.location}</p>
                  </div>
                </div>
                {issue.chip && (
                  <span className={`${issue.chip.className} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border-2 border-red-300 shadow-md animate-pulse flex-shrink-0 ml-2`}>{issue.chip.text}</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mb-3 sm:mb-4 leading-relaxed font-medium line-clamp-3">{issue.description}</p>
              <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3 sm:pt-4">
                <motion.button
                  type="button"
                  onClick={() => handleUpvote(issue.id)}
                  disabled={upvoting[issue.id] || issue.hasUpvoted}
                  title={issue.hasUpvoted ? 'You already upvoted this issue' : 'Upvote this issue'}
                  whileHover={!issue.hasUpvoted && !upvoting[issue.id] ? { scale: 1.05 } : {}}
                  whileTap={!issue.hasUpvoted && !upvoting[issue.id] ? { scale: 0.95 } : {}}
                  animate={{
                    backgroundColor: issue.hasUpvoted ? '#dcfce7' : '#fef2f2',
                    borderColor: issue.hasUpvoted ? '#86efac' : '#fecaca',
                    color: issue.hasUpvoted ? '#15803d' : '#b91c1c',
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm border-2 ${upvoting[issue.id] ? 'cursor-not-allowed opacity-70' : issue.hasUpvoted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <motion.span
                    className="text-sm sm:text-base"
                    animate={{ rotate: issue.hasUpvoted ? [0, -10, 10, 0] : 0, scale: issue.hasUpvoted ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {upvoting[issue.id] ? '⏳' : issue.hasUpvoted ? '✓' : '👍'}
                  </motion.span>
                  <motion.span
                    key={`${issue.id}-upvotes-full`}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hidden xs:inline sm:inline"
                  >
                    {issue.upvotes} Upvotes
                  </motion.span>
                  <motion.span
                    key={`${issue.id}-upvotes-short`}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="xs:hidden sm:hidden"
                  >
                    {issue.upvotes}
                  </motion.span>
                </motion.button>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold">🕒 {issue.filed}</p>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}
      </div>

      {/* Community Guidelines */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-violet-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={fade}
          >
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/40 px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg">
              ✨ Guidelines
            </span>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-white mt-4 drop-shadow-2xl">How to Use Neighborhood Watch</h3>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease }}
              className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 hover:-rotate-2 transition-all duration-200 transform shadow-xl hover:shadow-2xl"
            >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl hover:scale-110 hover:rotate-12 transition-transform duration-200">
                  <span className="material-symbols-rounded text-white text-2xl" aria-hidden="true">
                    search
                  </span>
                </div>
                <h4 className="font-bold text-white mb-2 text-lg drop-shadow-md">Search First</h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Before filing a new complaint, check if someone already reported the same issue nearby.
                </p>
            </motion.div>
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 transform shadow-xl hover:shadow-2xl"
            >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl hover:scale-110 hover:rotate-12 transition-transform">
                  <span className="material-symbols-rounded text-white text-2xl" aria-hidden="true">
                    thumb_up
                  </span>
                </div>
                <h4 className="font-bold text-white mb-2 text-lg drop-shadow-md">Upvote Instead</h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  If you find a matching issue, upvote it. More upvotes = higher priority for authorities.
                </p>
            </motion.div>
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease, delay: 0.14 }}
              className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 hover:rotate-2 transition-all duration-300 transform shadow-xl hover:shadow-2xl"
            >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl hover:scale-110 hover:rotate-12 transition-transform">
                  <span className="material-symbols-rounded text-white text-2xl" aria-hidden="true">
                    groups
                  </span>
                </div>
                <h4 className="font-bold text-white mb-2 text-lg drop-shadow-md">Build Pressure</h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Community support speeds up resolution. Share with neighbors to gather more upvotes.
                </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
