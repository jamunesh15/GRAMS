import React, { useEffect, useState } from 'react';
import { getBudgetOverview, getBudgetTrends } from '../Services/operations/budgetAPI';
import Reveal from '../components/Reveal';

export default function BudgetTransparencyPage() {
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState(null);
  const [trends, setTrends] = useState({});

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const [overview, trendsData] = await Promise.all([
        getBudgetOverview(),
        getBudgetTrends(6),
      ]);
      setBudgetData(overview);
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      water: '💧',
      roads: '🛣️',
      electricity: '💡',
      waste: '🗑️',
      other: '📋',
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category) => {
    const colors = {
      water: 'blue',
      roads: 'slate',
      electricity: 'yellow',
      waste: 'green',
      other: 'gray',
    };
    return colors[category] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide">
              Financial Transparency
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 mt-4">Budget Utilization</h1>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              Complete transparency on how public funds are allocated and spent on resolving civic grievances. Track every rupee to ensure accountability.
            </p>
          </div>
        </Reveal>

        {/* Total Budget Overview */}
        <Reveal delay={0.1}>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200 shadow-lg">
              <div className="text-center">
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2">Total Allocated</p>
                <p className="text-4xl font-extrabold text-green-600">
                  {formatCurrency(budgetData?.total?.allocated || 0)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
              <div className="text-center">
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2">Total Spent</p>
                <p className="text-4xl font-extrabold text-blue-600">
                  {formatCurrency(budgetData?.total?.spent || 0)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200 shadow-lg">
              <div className="text-center">
                <p className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-2">Efficiency</p>
                <p className="text-4xl font-extrabold text-purple-600">
                  {budgetData?.total?.efficiency || 0}%
                </p>
                <p className="text-xs text-purple-600 mt-2">Spent / Allocated</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Category Breakdown */}
        <Reveal delay={0.2}>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Budget by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(budgetData?.byCategory || {}).map(([category, data]) => {
                if (data.count === 0) return null;
                const color = getCategoryColor(category);
                
                return (
                  <div
                    key={category}
                    className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl border-2 border-${color}-200`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-800 capitalize">{category}</h3>
                      <span className="text-3xl">{getCategoryIcon(category)}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Allocated:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(data.allocated)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Spent:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(data.spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Grievances:</span>
                        <span className="font-bold text-slate-900">{data.count}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`bg-${color}-600 h-2 rounded-full`}
                        style={{ width: `${data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {data.allocated > 0 ? ((data.spent / data.allocated) * 100).toFixed(1) : 0}% utilized
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Key Metrics */}
        <Reveal delay={0.3}>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Transparency Metrics</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{budgetData?.grievancesWithBudget || 0}</p>
                <p className="text-sm font-semibold text-slate-600 mt-1">Grievances Funded</p>
              </div>

              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">💰</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency((budgetData?.total?.spent || 0) / (budgetData?.grievancesWithBudget || 1))}
                </p>
                <p className="text-sm font-semibold text-slate-600 mt-1">Avg Cost per Issue</p>
              </div>

              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">100%</p>
                <p className="text-sm font-semibold text-slate-600 mt-1">Public Visibility</p>
              </div>

              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🔒</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-sm font-semibold text-slate-600 mt-1">Corruption Cases</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Anti-Corruption Message */}
        <Reveal delay={0.4}>
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mt-12 text-center">
            <h3 className="text-3xl font-extrabold text-white mb-3">Zero Tolerance for Corruption</h3>
            <p className="text-green-50 max-w-3xl mx-auto">
              Every rupee is tracked and made public. This transparency ensures that allocated funds are used efficiently for resolving civic issues, not misappropriated. Citizens can verify expenses and hold authorities accountable.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
