import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Reveal from '../components/Reveal';
import { getTransparencyReport, upvoteIssue } from '../Services/operations/transparencyAPI';
import { getPublicSystemBudget } from '../Services/operations/budgetAPI';
import useAuthStore from '../store/authStore';

export default function TransparencyPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState(null);
  const [systemBudget, setSystemBudget] = React.useState(null);
  const [budgetLoading, setBudgetLoading] = React.useState(true);
  const [upvoting, setUpvoting] = React.useState({});

  React.useEffect(() => {
    fetchData();
    fetchSystemBudget();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTransparencyReport();
      setReport(data || null);
    } catch (err) {
      console.error('Failed to fetch transparency data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemBudget = async () => {
    try {
      setBudgetLoading(true);
      const response = await getPublicSystemBudget();
      if (response.data.success) {
        setSystemBudget(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch system budget:', err);
    } finally {
      setBudgetLoading(false);
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
    const issue = report?.overdueIssues?.find(i => i._id === issueId);
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
        setReport((prev) => ({
          ...prev,
          overdueIssues: prev.overdueIssues.map((issue) =>
            issue._id === issueId
              ? { ...issue, upvotes: data.upvotes, priority: data.priority, upvotedBy: [...(issue.upvotedBy || []), user._id || user.id] }
              : issue
          ),
        }));
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

  const totals = report?.totals || {};
  const satisfaction = report?.satisfaction || { avg: 0, count: 0 };
  const performance = report?.performance || {};
  const overdueIssues = report?.overdueIssues || [];
  const budget = report?.budget || { totalBudgetUsed: 0, breakdown: [] };

  const resolutionRate = Number.isFinite(totals.resolutionRate) ? totals.resolutionRate : 0;
  const resolvedCount = Number.isFinite(totals.resolvedCount) ? totals.resolvedCount : 0;
  const pendingCount = Number.isFinite(totals.pendingCount) ? totals.pendingCount : 0;

  const circleRadius = 84;
  const circumference = 2 * Math.PI * circleRadius;
  const clampedRate = Math.max(0, Math.min(100, resolutionRate));
  const dashOffset = circumference * (1 - clampedRate / 100);

  const categoryStats = React.useMemo(() => {
    const ui = {
      infrastructure: {
        name: 'Infrastructure',
        emoji: '🏗️',
        iconBgClass: 'bg-orange-100',
        barFromClass: 'from-orange-400',
        barToClass: 'to-orange-600',
      },
      health: {
        name: 'Health',
        emoji: '🏥',
        iconBgClass: 'bg-red-100',
        barFromClass: 'from-red-400',
        barToClass: 'to-red-600',
      },
      academic: {
        name: 'Academic',
        emoji: '📚',
        iconBgClass: 'bg-blue-100',
        barFromClass: 'from-blue-400',
        barToClass: 'to-blue-600',
      },
      administrative: {
        name: 'Administrative',
        emoji: '📋',
        iconBgClass: 'bg-purple-100',
        barFromClass: 'from-purple-400',
        barToClass: 'to-purple-600',
      },
      other: {
        name: 'Other',
        emoji: '🔧',
        iconBgClass: 'bg-slate-200',
        barFromClass: 'from-slate-400',
        barToClass: 'to-slate-600',
      },
    };

    const items = report?.charts?.categoryBreakdown || [];
    return items
      .map((c) => {
        const meta = ui[c.key] || ui.other;
        return {
          key: c.key,
          name: meta.name,
          count: c.count || 0,
          percentage: c.percentage || 0,
          emoji: meta.emoji,
          iconBgClass: meta.iconBgClass,
          barFromClass: meta.barFromClass,
          barToClass: meta.barToClass,
        };
      })
      .slice(0, 5);
  }, [report]);

  const budgetCards = React.useMemo(() => {
    const ui = {
      water: {
        title: 'Water Infrastructure',
        emoji: '💧',
        cardClass: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
        amountClass: 'text-blue-600',
        borderClass: 'border-blue-200',
      },
      roads: {
        title: 'Road Maintenance',
        emoji: '🛣️',
        cardClass: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300',
        amountClass: 'text-slate-700',
        borderClass: 'border-slate-300',
      },
      electricity: {
        title: 'Electricity & Others',
        emoji: '⚡',
        cardClass: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
        amountClass: 'text-yellow-600',
        borderClass: 'border-yellow-200',
      },
      other: {
        title: 'Other',
        emoji: '🧾',
        cardClass: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
        amountClass: 'text-green-700',
        borderClass: 'border-green-200',
      },
    };

    const breakdown = budget?.breakdown || [];
    return breakdown
      .map((b) => {
        const meta = ui[b.key] || ui.other;
        return {
          key: b.key,
          title: meta.title,
          emoji: meta.emoji,
          amount: b.amount || 0,
          percentage: b.percentage || 0,
          items: b.items || 0,
          cardClass: meta.cardClass,
          amountClass: meta.amountClass,
          borderClass: meta.borderClass,
        };
      })
      .slice(0, 3);
  }, [budget]);

  return (
    <section id="impact" className="page-enter bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 pt-16 pb-10 relative overflow-hidden mt-10">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-lime-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <Reveal className="max-w-7xl mx-auto px-6 md:px-12 relative z-10" delay={0.05}>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border border-white/40 shadow-lg animate-bounce">
              ● Public Dashboard
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
            Public Transparency Report
          </h1>
          <p className="text-base text-green-50 max-w-3xl leading-relaxed">
            Real-time data on grievance resolution, budget utilization, and government accountability.
            Every citizen has the right to know how their complaints are being handled.
          </p>
        </Reveal>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Total Budget Used */}
          <Reveal delay={0.02}>
          <div className="bg-gradient-to-br from-white to-green-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border-2 border-green-200 hover:shadow-green-400 hover:border-green-400 hover:scale-105 sm:hover:scale-110 hover:-rotate-1 transition-all duration-300 transform group">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Total Budget Used</p>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-transform shadow-lg sm:shadow-xl">
                <span className="text-sm sm:text-xl">💰</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">₹{(Number(totals.totalBudgetUsed || 0) / 100000).toFixed(1)}L</p>
            <div className="flex items-center gap-1">
              <span className="text-green-600 animate-bounce text-xs sm:text-base">📈</span>
              <p className="text-[10px] sm:text-xs text-green-600 font-semibold">↑ 12% from last month</p>
            </div>
          </div>
          </Reveal>

          {/* Avg Resolution */}
          <Reveal delay={0.06}>
          <div className="bg-gradient-to-br from-white to-blue-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border-2 border-blue-200 hover:shadow-blue-400 hover:border-blue-400 hover:scale-105 sm:hover:scale-110 hover:rotate-1 transition-all duration-300 transform group">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Avg Resolution</p>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-transform shadow-lg sm:shadow-xl">
                <span className="text-sm sm:text-xl">⏱️</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">{Number(totals.avgResolutionDays || 0).toFixed(1)} Days</p>
            <div className="flex items-center gap-1">
              <span className="text-green-600 animate-bounce text-xs sm:text-base">✅</span>
              <p className="text-[10px] sm:text-xs text-green-600 font-semibold">↓ 0.8 days faster</p>
            </div>
          </div>
          </Reveal>

          {/* Active Officers */}
          <Reveal delay={0.1}>
          <div className="bg-gradient-to-br from-white to-orange-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border-2 border-orange-200 hover:shadow-orange-400 hover:border-orange-400 hover:scale-105 sm:hover:scale-110 hover:-rotate-1 transition-all duration-300 transform group">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Active Officers</p>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-transform shadow-lg sm:shadow-xl">
                <span className="text-sm sm:text-xl">👨‍💼</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">{totals.activeOfficersCount || 0}</p>
            <div className="flex items-center gap-1">
              <span className="text-slate-600 text-xs sm:text-base">📍</span>
              <p className="text-[10px] sm:text-xs text-slate-600 font-semibold">Across 12 wards</p>
            </div>
          </div>
          </Reveal>

          {/* Satisfaction */}
          <Reveal delay={0.14}>
          <div className="bg-gradient-to-br from-white to-purple-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border-2 border-purple-200 hover:shadow-purple-400 hover:border-purple-400 hover:scale-105 sm:hover:scale-110 hover:rotate-1 transition-all duration-300 transform group">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Satisfaction</p>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-transform shadow-lg sm:shadow-xl">
                <span className="text-sm sm:text-xl">⭐</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">{(satisfaction.avg || 0) > 0 ? `${satisfaction.avg}/5` : '0/5'}</p>
            <div className="flex items-center gap-1">
              <span className="text-purple-600 animate-pulse text-xs sm:text-base">📊</span>
              <p className="text-[10px] sm:text-xs text-purple-600 font-semibold">+0.3 from last quarter</p>
            </div>
          </div>
          </Reveal>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Complaints by Category */}
          <Reveal delay={0.05}>
          <div className="bg-white p-6 rounded-3xl shadow-2xl border-2 border-slate-200 hover:shadow-green-200 hover:border-green-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-2xl text-slate-900 drop-shadow-sm">📋 Complaints by Category</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Last 30 days breakdown</p>
              </div>
              <span className="text-3xl animate-pulse">📊</span>
            </div>

            <div className="space-y-5">
              {categoryStats.map((cat, idx) => (
                <div key={cat.key}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${cat.iconBgClass} rounded-xl flex items-center justify-center shadow-md hover:scale-125 hover:rotate-12 transition-transform duration-300`}>
                        <span className="text-lg">{cat.emoji}</span>
                      </div>
                      <span className="text-slate-700 font-bold">{cat.name}</span>
                    </div>
                    <span className="text-slate-900 font-extrabold text-lg">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`bg-gradient-to-r ${cat.barFromClass} ${cat.barToClass} h-4 rounded-full shadow-xl transition-all duration-1000 ease-out hover:brightness-110`}
                      style={{ 
                        width: `${cat.percentage}%`,
                        animation: `slideIn 1s ease-out ${idx * 0.15}s both`
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-semibold">{cat.count} complaints</p>
                </div>
              ))}
            </div>
          </div>
          </Reveal>

          {/* Resolution Rate */}
          <Reveal delay={0.09}>
          <div className="bg-white p-6 rounded-3xl shadow-2xl border-2 border-slate-200 hover:shadow-green-200 hover:border-green-200 flex flex-col justify-center items-center text-center transition-all duration-300">
            <div className="mb-4">
              <span className="text-5xl animate-pulse">🎯</span>
            </div>
            <div className="relative w-48 h-48 mb-6">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="#22c55e"
                  strokeWidth="14"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">{clampedRate}%</span>
              </div>
            </div>
            <h4 className="font-bold text-2xl text-slate-900 mb-2 drop-shadow-sm">Resolution Rate</h4>
            <p className="text-sm text-slate-600 mb-6 font-semibold">Highest in District ✨</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl border-2 border-green-300 shadow-lg hover:scale-110 hover:shadow-green-400 hover:-rotate-2 transition-all duration-300 transform">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent drop-shadow-md">{resolvedCount}</p>
                <p className="text-xs text-slate-700 font-bold mt-1">✅ Resolved</p>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-2xl border-2 border-orange-300 shadow-lg hover:scale-110 hover:shadow-orange-400 hover:rotate-2 transition-all duration-300 transform">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent drop-shadow-md">{pendingCount}</p>
                <p className="text-xs text-slate-700 font-bold mt-1">⏳ Pending</p>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </div>

      {/* Public Escalations Section */}
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-96 h-96 bg-red-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <Reveal delay={0.05}>
            <div className="flex items-start justify-between mb-10 flex-col lg:flex-row lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl animate-bounce">⚠️</span>
                  <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-xs font-bold uppercase border-2 border-red-300 shadow-lg">
                    Public Pressure
                  </span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 drop-shadow-md">
                  Issues Beyond 7 Days
                </h2>
                <p className="text-slate-700 max-w-2xl font-medium leading-relaxed">
                  Complaints that breached the deadline are now public. Citizens can upvote to
                  prioritize urgent issues.
                </p>
              </div>
              <Link to="/transparency/issues" className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-7 py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl whitespace-nowrap">
                <span className="text-lg">📢</span>
                View All
              </Link>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6">
            {overdueIssues.map((issue, idx) => {
              const isCritical = issue.priority === 'critical' || issue.daysOpen >= 14;
              const badgeClass = isCritical
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-orange-100 text-orange-700 border-orange-300';
              const borderClass = isCritical
                ? 'border-red-200 hover:border-red-400 hover:shadow-red-300'
                : 'border-orange-200 hover:border-orange-400 hover:shadow-orange-300';
              const iconBg = isCritical ? 'bg-red-100' : 'bg-orange-100';
              const icon = isCritical ? '🚨' : '⏳';
              const badgeText = isCritical ? '🔴 OVERDUE' : '🟠 DELAYED';

              return (
                <Reveal key={issue._id} delay={0.02 + idx * 0.04}>
                  <div className={`bg-white p-6 rounded-2xl shadow-2xl border-2 ${borderClass} hover:shadow-2xl hover:scale-105 hover:-rotate-1 transition-all duration-300 transform`}>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                          {icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 drop-shadow-sm">{issue.title}</h4>
                          <p className="text-sm text-slate-500 mt-2 font-medium">📍 {issue.daysOpen} days ago</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 ${badgeClass} shadow-md`}>{badgeText}</span>
                    </div>
                    <p className="text-slate-700 mb-5 leading-relaxed font-medium">{issue.description}</p>
                    <div className="flex items-center justify-between border-t pt-6">
                      {(() => {
                        const hasUpvoted = user && issue.upvotedBy?.some(id => id === user._id || id === user.id);
                        return (
                          <motion.button 
                            onClick={() => handleUpvote(issue._id)}
                            disabled={upvoting[issue._id] || hasUpvoted}
                            title={hasUpvoted ? 'You already upvoted this issue' : 'Upvote this issue'}
                            whileHover={!hasUpvoted && !upvoting[issue._id] ? { scale: 1.05 } : {}}
                            whileTap={!hasUpvoted && !upvoting[issue._id] ? { scale: 0.95 } : {}}
                            animate={{
                              backgroundColor: hasUpvoted ? '#dcfce7' : '#fef2f2',
                              borderColor: hasUpvoted ? '#86efac' : '#fecaca',
                              color: hasUpvoted ? '#15803d' : '#b91c1c',
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border-2 ${upvoting[issue._id] ? 'cursor-not-allowed opacity-70' : hasUpvoted ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <motion.span
                              className="text-lg"
                              animate={{ rotate: hasUpvoted ? [0, -10, 10, 0] : 0, scale: hasUpvoted ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 0.4 }}
                            >
                              {upvoting[issue._id] ? '⏳' : hasUpvoted ? '✓' : '👍'}
                            </motion.span>
                            <motion.span
                              key={issue.upvotes}
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {issue.upvotes || 0} Upvotes
                            </motion.span>
                          </motion.button>
                        );
                      })()}
                      <p className="text-xs text-slate-500 font-semibold">👤 {issue.user?.name || 'Anonymous'}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
            {!loading && overdueIssues.length === 0 && (
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-10 rounded-2xl border-2 border-slate-200 text-center text-slate-700 shadow-lg">
                <span className="text-5xl mb-3 block">✅</span>
                <p className="font-bold text-lg">No issues are currently beyond 7 days.</p>
              </div>
            )}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-8 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-2xl flex items-start gap-4 shadow-2xl hover:shadow-red-400 hover:scale-105 transition-all duration-300 border-2 border-white/20">
              <span className="text-3xl">ℹ️</span>
              <p className="text-base font-bold leading-relaxed">
                <strong className="text-yellow-200">Why Public Escalation Matters:</strong> After 7 days without resolution,
                complaints become visible to all citizens. This transparency creates accountability
                pressure on authorities to take immediate action.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* System Budget Transparency */}
      {systemBudget && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <Reveal delay={0.05}>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl animate-bounce">💰</span>
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase border-2 border-white shadow-lg">
                  Annual Budget {systemBudget.fiscalYear}
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 drop-shadow-md">
                Financial Accountability
              </h2>
              <p className="text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
                Complete transparency in how public funds are allocated and spent on civic services
              </p>
            </div>
          </Reveal>

          {/* Budget Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <Reveal delay={0.02}>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <p className="text-[10px] sm:text-sm font-bold uppercase tracking-wide opacity-90">Total Allocated</p>
                  <span className="text-xl sm:text-4xl">💼</span>
                </div>
                <p className="text-xl sm:text-4xl font-extrabold mb-1 sm:mb-2">
                  ₹{((systemBudget.totalAllocated || 0) / 10000000).toFixed(2)}Cr
                </p>
                <p className="text-[10px] sm:text-sm opacity-90">Fiscal Year {systemBudget.fiscalYear}</p>
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <p className="text-[10px] sm:text-sm font-bold uppercase tracking-wide opacity-90">Total Spent</p>
                  <span className="text-xl sm:text-4xl">💸</span>
                </div>
                <p className="text-xl sm:text-4xl font-extrabold mb-1 sm:mb-2">
                  ₹{((systemBudget.totalSpent || 0) / 10000000).toFixed(2)}Cr
                </p>
                <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
                  <div
                    className="bg-white rounded-full h-1.5 sm:h-2 transition-all"
                    style={{ width: `${systemBudget.totalAllocated > 0 ? ((systemBudget.totalSpent / systemBudget.totalAllocated) * 100).toFixed(1) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[10px] sm:text-sm opacity-90 mt-1">
                  {systemBudget.totalAllocated > 0 ? ((systemBudget.totalSpent / systemBudget.totalAllocated) * 100).toFixed(1) : 0}% utilized
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <p className="text-[10px] sm:text-sm font-bold uppercase tracking-wide opacity-90">Remaining</p>
                  <span className="text-xl sm:text-4xl">💵</span>
                </div>
                <p className="text-xl sm:text-4xl font-extrabold mb-1 sm:mb-2">
                  ₹{((systemBudget.remainingBudget || 0) / 10000000).toFixed(2)}Cr
                </p>
                <p className="text-[10px] sm:text-sm opacity-90">Available for allocation</p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <p className="text-[10px] sm:text-sm font-bold uppercase tracking-wide opacity-90">Available</p>
                  <span className="text-xl sm:text-4xl">✅</span>
                </div>
                <p className="text-xl sm:text-4xl font-extrabold mb-1 sm:mb-2">
                  ₹{((systemBudget.operational?.remaining || 0) / 10000000).toFixed(2)}Cr
                </p>
                <p className="text-[10px] sm:text-sm opacity-90">Operational funds ready</p>
              </div>
            </Reveal>
          </div>

          {/* Budget Breakdown */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Salary Budget - Only show if available */}
            {systemBudget.salary && (
              <Reveal delay={0.1}>
                <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">👨‍💼</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Salary Budget</h3>
                      <p className="text-sm text-slate-600">Engineer compensation</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Allocated</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{((systemBudget.salary.allocated || 0) / 10000000).toFixed(2)}Cr
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Spent</span>
                      <span className="text-2xl font-bold text-red-600">
                        ₹{((systemBudget.salary.spent || 0) / 10000000).toFixed(2)}Cr
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Remaining</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{(((systemBudget.salary.allocated || 0) - (systemBudget.salary.spent || 0)) / 10000000).toFixed(2)}Cr
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-4 transition-all"
                        style={{ width: `${systemBudget.salary.allocated > 0 ? ((systemBudget.salary.spent / systemBudget.salary.allocated) * 100).toFixed(1) : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-slate-600 font-semibold">
                      {systemBudget.salary.allocated > 0 ? ((systemBudget.salary.spent / systemBudget.salary.allocated) * 100).toFixed(1) : 0}% utilized
                    </p>
                  </div>
                </div>
              </Reveal>
            )}

            {/* Operational Budget */}
            <Reveal delay={0.12}>
              <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🔧</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Operational Budget</h3>
                    <p className="text-sm text-slate-600">Grievance resolution funds</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium">Allocated</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{((systemBudget.operational?.allocated || 0) / 10000000).toFixed(2)}Cr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium">Spent</span>
                    <span className="text-2xl font-bold text-red-600">
                      ₹{((systemBudget.operational?.spent || 0) / 10000000).toFixed(2)}Cr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium">Remaining</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{((systemBudget.operational?.remaining || 0) / 10000000).toFixed(2)}Cr
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-4 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 absolute left-0 h-4 transition-all"
                      style={{ width: `${systemBudget.operational?.allocated > 0 ? ((systemBudget.operational.spent / systemBudget.operational.allocated) * 100).toFixed(1) : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>🔴 Spent: {systemBudget.operational?.allocated > 0 ? ((systemBudget.operational.spent / systemBudget.operational.allocated) * 100).toFixed(1) : 0}%</span>
                    <span>🟢 Available: {systemBudget.operational?.allocated > 0 ? ((systemBudget.operational.remaining / systemBudget.operational.allocated) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Category-wise Budget */}
          {systemBudget.categoryWise && systemBudget.categoryWise.length > 0 && (
            <Reveal delay={0.14}>
              <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">📊</span>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Category-wise Allocation</h3>
                    <p className="text-sm text-slate-600">Budget distribution across service categories</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {systemBudget.categoryWise.map((cat, idx) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-green-400 transition-all"
                    >
                      <h4 className="text-lg font-bold text-slate-900 capitalize mb-3">{cat.category}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Allocated:</span>
                          <span className="font-bold text-blue-600">₹{(cat.allocated / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Spent:</span>
                          <span className="font-bold text-red-600">₹{(cat.spent / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Grievances:</span>
                          <span className="font-bold text-green-600">{cat.grievanceCount}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all"
                          style={{ width: `${cat.allocated > 0 ? ((cat.spent / cat.allocated) * 100).toFixed(1) : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-center text-slate-600 mt-1 font-semibold">
                        {cat.allocated > 0 ? ((cat.spent / cat.allocated) * 100).toFixed(1) : 0}% utilized
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      )}

      {/* Old Budget Breakdown (kept for grievance-level data) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <Reveal delay={0.05}>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl animate-bounce">💳</span>
              <span className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold uppercase border-2 border-slate-300 shadow-lg">
                Grievance-Level Spending
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 drop-shadow-md">Recent Budget Utilization</h2>
            <p className="text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
              Detailed breakdown of how funds were spent on individual grievance resolution.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {budgetCards.map((b, idx) => (
            <Reveal key={b.key} delay={0.02 + idx * 0.04}>
              <div className={`p-6 rounded-2xl border-2 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-300 transform ${b.cardClass}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg text-slate-900 drop-shadow-sm">{b.title}</h4>
                  <span className="text-3xl">{b.emoji}</span>
                </div>
                <p className={`text-4xl font-extrabold mb-2 ${b.amountClass} drop-shadow-md`}>₹{(Number(b.amount) / 100000).toFixed(1)}L</p>
                <p className="text-sm text-slate-700 font-bold">{b.percentage}% of total budget</p>
                <div className={`mt-5 pt-5 border-t-2 ${b.borderClass}`}>
                  <p className="text-sm text-slate-700 font-semibold">
                    <strong className={b.amountClass}>{b.items}</strong> tracked expenses
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          {!loading && budgetCards.length === 0 && (
            <div className="md:col-span-3 bg-white p-10 rounded-2xl border-2 border-slate-200 text-center text-slate-700 shadow-lg">
              <span className="text-5xl mb-3 block">📊</span>
              <p className="font-bold text-lg">No budget entries have been recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-white via-green-50 to-blue-50 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-emerald-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <Reveal delay={0.05}>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl animate-bounce">📈</span>
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase border-2 border-green-300 shadow-lg">
                  Performance
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 drop-shadow-md">
                Key Metrics & Accountability
              </h2>
              <p className="text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
                Real-time performance indicators showing our commitment to service excellence.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* SLA Compliance */}
            <Reveal delay={0.02}>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-green-300 text-center hover:shadow-2xl hover:shadow-green-400 hover:scale-105 sm:hover:scale-110 hover:-rotate-2 transition-all duration-300 transform">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-base sm:text-2xl shadow-lg sm:shadow-xl hover:scale-110 transition-transform">
                📋
              </div>
              <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">{performance.slaComplianceRate ?? 0}%</p>
              <p className="font-bold text-slate-900 mb-0.5 sm:mb-1 text-xs sm:text-base">SLA Compliance</p>
              <p className="text-[10px] sm:text-sm text-slate-700 font-semibold">Resolved within 7 days</p>
            </div>
            </Reveal>

            {/* First Response */}
            <Reveal delay={0.06}>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-blue-300 text-center hover:shadow-2xl hover:shadow-blue-400 hover:scale-105 sm:hover:scale-110 hover:rotate-2 transition-all duration-300 transform">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-base sm:text-2xl shadow-lg sm:shadow-xl hover:scale-110 transition-transform">
                ⏱️
              </div>
              <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">{performance.firstResponseHoursAvg ?? 0}h</p>
              <p className="font-bold text-slate-900 mb-0.5 sm:mb-1 text-xs sm:text-base">First Response</p>
              <p className="text-[10px] sm:text-sm text-slate-700 font-semibold">Avg time to assignment</p>
            </div>
            </Reveal>

            {/* Repeat Issues */}
            <Reveal delay={0.1}>
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-orange-300 text-center hover:shadow-2xl hover:shadow-orange-400 hover:scale-105 sm:hover:scale-110 hover:-rotate-2 transition-all duration-300 transform">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-base sm:text-2xl shadow-lg sm:shadow-xl hover:scale-110 transition-transform">
                🔄
              </div>
              <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">{performance.repeatIssuesCount ?? 0}</p>
              <p className="font-bold text-slate-900 mb-0.5 sm:mb-1 text-xs sm:text-base">Repeat Issues</p>
              <p className="text-[10px] sm:text-sm text-slate-700 font-semibold">Re-opened complaints</p>
            </div>
            </Reveal>

            {/* Citizen Rating */}
            <Reveal delay={0.14}>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-purple-300 text-center hover:shadow-2xl hover:shadow-purple-400 hover:scale-105 sm:hover:scale-110 hover:rotate-2 transition-all duration-300 transform">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-base sm:text-2xl shadow-lg sm:shadow-xl hover:scale-110 transition-transform">
                ⭐
              </div>
              <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">
                {(satisfaction.avg || 0) > 0 ? `${satisfaction.avg}/5` : '0/5'}
              </p>
              <p className="font-bold text-slate-900 mb-0.5 sm:mb-1 text-xs sm:text-base">Citizen Rating</p>
              <p className="text-[10px] sm:text-sm text-slate-700 font-semibold">Based on {satisfaction.count || 0} feedbacks</p>
            </div>
            </Reveal>
          </div>
        </div>
      </div>

    </section>
  );
}
