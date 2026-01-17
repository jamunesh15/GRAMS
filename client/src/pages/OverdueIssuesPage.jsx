import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Reveal from '../components/Reveal';
import { getOverdueIssues, upvoteIssue } from '../Services/operations/transparencyAPI';
import useAuthStore from '../store/authStore';

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OverdueIssuesPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('daysOpen');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [upvoting, setUpvoting] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const params = {
          page,
          limit: 10,
          sortBy,
        };
        if (categoryFilter) params.category = categoryFilter;
        if (priorityFilter) params.priority = priorityFilter;

        const data = await getOverdueIssues(params);
        if (!isMounted) return;
        setIssues(data || []);
        setPagination({});
      } catch (e) {
        if (!isMounted) return;
        setError('Failed to load overdue issues. Please try again.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [page, sortBy, categoryFilter, priorityFilter]);

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
    const issue = issues.find(i => i._id === issueId);
    if (issue?.upvotedBy?.some(id => id === user._id || id === user.id)) {
      toast.error('You have already upvoted this issue', {
        position: 'bottom-right',
        style: { background: '#1e293b', color: '#fff', borderRadius: '12px' },
      });
      return;
    }
    
    setUpvoting((prev) => ({ ...prev, [issueId]: true }));
    try {
      const token = localStorage.getItem('token');
      const data = await upvoteIssue(issueId, token);
      if (data) {
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId
              ? { ...issue, upvotes: data.upvotes, priority: data.priority, upvotedBy: [...(issue.upvotedBy || []), user._id || user.id] }
              : issue
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

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'health', label: 'Health' },
    { value: 'academic', label: 'Academic' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const sortOptions = [
    { value: 'daysOpen', label: 'Most Overdue' },
    { value: 'upvotes', label: 'Most Upvoted' },
    { value: 'priority', label: 'Highest Priority' },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <Reveal className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-xs font-bold uppercase border border-red-300">
                Public Pressure
              </span>
              <span className="bg-white/70 text-slate-700 px-4 py-2 rounded-full text-xs font-bold uppercase border border-slate-200 backdrop-blur-sm">
                {loading ? 'Loading…' : `${pagination.totalCount || 0} overdue`}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Issues Beyond 7 Days
            </h1>
            <p className="text-slate-700 max-w-3xl text-lg">
              Registered complaints pending for more than 7 days are listed here. Upvote issues to help prioritize urgent matters.
            </p>

            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-5 rounded-2xl shadow-lg border border-red-700/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">ℹ️</div>
                <div>
                  <div className="font-extrabold text-base">Why public escalation matters</div>
                  <div className="text-white/90 text-sm mt-1">
                    After 7 days without resolution, complaints become visible to all citizens to create accountability pressure.
                    Issues with 25+ upvotes are auto-escalated to high priority, and 50+ upvotes to critical priority.
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {/* Filters */}
        <Reveal>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {priorities.map((pri) => (
                    <option key={pri.value} value={pri.value}>{pri.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-2">
          {loading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-slate-700 font-semibold">Loading complaints…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-sm">
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          {!loading && !error && issues.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
              <p className="text-slate-900 font-extrabold text-2xl mb-2">No overdue complaints</p>
              <p className="text-slate-600">There are currently no pending complaints beyond 7 days.</p>
            </div>
          )}

          {!loading && !error && issues.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase">
                Showing {issues.length} of {pagination.totalCount} overdue complaint{pagination.totalCount === 1 ? '' : 's'}
              </div>

              {issues.map((g) => {
                const isCritical = g.priority === 'critical' || g.daysOpen >= 14;
                const borderClass = isCritical ? 'border-red-200' : 'border-orange-100';
                const priorityColors = {
                  low: 'bg-green-50 text-green-700 border-green-200',
                  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                  high: 'bg-orange-50 text-orange-700 border-orange-200',
                  critical: 'bg-red-50 text-red-700 border-red-200',
                };
                const hasUpvoted = user && g.upvotedBy?.some(id => id === user._id || id === user.id);

                return (
                  <Reveal key={g._id}>
                    <details
                      className={`bg-white border-2 ${borderClass} rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition`}
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
                          <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${isCritical ? 'from-red-500 to-red-600' : 'from-orange-400 to-orange-500'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h2 className="text-xl font-extrabold text-slate-900 truncate">{g.title}</h2>
                              <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                {g.daysOpen} DAYS OVERDUE
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${priorityColors[g.priority] || priorityColors.medium}`}>
                                {String(g.priority || 'medium').toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                              <span>📅 {formatDate(g.createdAt)}</span>
                              <span>🏷️ {String(g.category || 'other')}</span>
                              <span>💬 {g.commentsCount || 0} comments</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <motion.button
                              onClick={(e) => { e.preventDefault(); handleUpvote(g._id); }}
                              disabled={upvoting[g._id] || hasUpvoted}
                              title={hasUpvoted ? 'You already upvoted this issue' : 'Upvote this issue'}
                              whileHover={!hasUpvoted && !upvoting[g._id] ? { scale: 1.05 } : {}}
                              whileTap={!hasUpvoted && !upvoting[g._id] ? { scale: 0.95 } : {}}
                              animate={{
                                backgroundColor: hasUpvoted ? '#dcfce7' : '#fef2f2',
                                borderColor: hasUpvoted ? '#86efac' : '#fecaca',
                                color: hasUpvoted ? '#15803d' : '#b91c1c',
                              }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border-2 ${upvoting[g._id] ? 'cursor-not-allowed opacity-70' : hasUpvoted ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <motion.span
                                className="text-lg"
                                animate={{ rotate: hasUpvoted ? [0, -10, 10, 0] : 0, scale: hasUpvoted ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 0.4 }}
                              >
                                {upvoting[g._id] ? '⏳' : hasUpvoted ? '✓' : '👍'}
                              </motion.span>
                              <motion.span
                                key={g.upvotes}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {g.upvotes || 0}
                              </motion.span>
                            </motion.button>
                            <div className="text-slate-700 font-extrabold text-lg select-none">
                              <span className="group-open:hidden">▾</span>
                              <span className="hidden group-open:inline">▴</span>
                            </div>
                          </div>
                        </div>
                      </summary>

                      <div className="px-6 pb-6">
                        <div className="h-px bg-slate-100 mb-5" />

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Description</div>
                            <p className="text-slate-700 leading-relaxed">{g.description}</p>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Details</div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500 font-semibold">Status</span>
                                <span className="font-bold">{String(g.status || 'open').toUpperCase()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500 font-semibold">Assigned To</span>
                                <span className="font-bold">
                                  {g.assignedTo?.name ? g.assignedTo.name : 'Not assigned'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500 font-semibold">Submitted By</span>
                                <span className="font-bold">{g.user?.name || 'Anonymous'}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500 font-semibold">Upvotes</span>
                                <span className="font-bold text-red-600">{g.upvotes || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </Reveal>
                );
              })}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border transition ${
                      pagination.hasPrevPage
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-slate-600 font-semibold">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border transition ${
                      pagination.hasNextPage
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
