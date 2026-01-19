import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getCurrentSystemBudget,
  getAllSystemBudgets,
  getSystemBudgetStats,
  createSystemBudget,
  activateSystemBudget,
  addEngineerSalary,
  updateEngineerSalary,
  updateCategoryBudget,
  getPendingSalaryInfo,
  processMonthlySalary,
} from '../../Services/operations/budgetAPI';
import { getEngineers } from '../../Services/operations/adminAPI';

export default function BudgetManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(null);
  const [allBudgets, setAllBudgets] = useState([]);
  const [stats, setStats] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEngineerModal, setShowAddEngineerModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [addingEngineer, setAddingEngineer] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [pendingSalaryInfo, setPendingSalaryInfo] = useState(null);
  const [processingSalary, setProcessingSalary] = useState(false);
  const [engineerFormData, setEngineerFormData] = useState({
    engineerId: '',
    monthlySalary: '',
    joinedDate: '',
  });
  const [formData, setFormData] = useState({
    fiscalYear: '',
    startDate: '',
    endDate: '',
    totalAllocated: '',
    salaryBudget: '',
    operationalBudget: '',
    categoryBudgets: [
      { category: 'water', allocated: '' },
      { category: 'roads', allocated: '' },
      { category: 'electric', allocated: '' },
      { category: 'waste', allocated: '' },
      { category: 'healthcare', allocated: '' },
      { category: 'education', allocated: '' },
      { category: 'sanitation', allocated: '' },
      { category: 'administrative', allocated: '' },
    ],
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBudgetData();
  }, []);

  useEffect(() => {
    if (activeTab === 'salary') {
      fetchPendingSalaryInfo();
    }
  }, [activeTab]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const [budgetRes, allBudgetsRes, statsRes, engineersData] = await Promise.all([
        getCurrentSystemBudget(token).catch(() => ({ data: { success: false } })),
        getAllSystemBudgets(token),
        getSystemBudgetStats(token).catch(() => ({ data: { success: false } })),
        getEngineers(token).catch(() => []),
      ]);

      if (budgetRes.data.success) {
        setBudget(budgetRes.data.data);
      }
      if (allBudgetsRes.data.success) {
        setAllBudgets(allBudgetsRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (engineersData) {
        setEngineers(Array.isArray(engineersData) ? engineersData : []);
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSalaryInfo = async () => {
    try {
      const response = await getPendingSalaryInfo(token);
      if (response.data.success) {
        setPendingSalaryInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pending salary info:', error);
    }
  };

  const handleProcessSalary = async () => {
    if (!pendingSalaryInfo) return;

    if (window.confirm(`Process salary for ${pendingSalaryInfo.currentMonth} ${pendingSalaryInfo.currentYear}?\n\nTotal Amount: ₹${pendingSalaryInfo.totalPendingSalary.toLocaleString('en-IN')}\nEngineers: ${pendingSalaryInfo.activeEngineersCount}\n\nEmails will be sent to all engineers.`)) {
      try {
        setProcessingSalary(true);
        await processMonthlySalary(token, {
          month: pendingSalaryInfo.currentMonth,
          year: pendingSalaryInfo.currentYear,
        });
        await fetchBudgetData();
        await fetchPendingSalaryInfo();
      } catch (error) {
        console.error('Error processing salary:', error);
      } finally {
        setProcessingSalary(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (absAmount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (absAmount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPercentage = (spent, allocated) => {
    return allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : 0;
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    
    const total = parseFloat(formData.totalAllocated);
    const salary = parseFloat(formData.salaryBudget);
    const operational = parseFloat(formData.operationalBudget);
    
    if (salary + operational > total) {
      toast.error('Salary + Operational budget cannot exceed total allocated budget');
      return;
    }

    try {
      setCreating(true);
      const budgetData = {
        fiscalYear: formData.fiscalYear,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalAllocated: total,
        salaryBudget: salary,
        operationalBudget: operational,
        categoryBudgets: formData.categoryBudgets
          .filter((cat) => cat.allocated)
          .map((cat) => ({
            category: cat.category,
            allocated: parseFloat(cat.allocated),
            spent: 0,
            pending: 0,
            grievanceCount: 0,
          })),
      };

      await createSystemBudget(token, budgetData);
      toast.success('Budget created successfully!');
      setShowCreateModal(false);
      fetchBudgetData();
      
      // Reset form
      setFormData({
        fiscalYear: '',
        startDate: '',
        endDate: '',
        totalAllocated: '',
        salaryBudget: '',
        operationalBudget: '',
        categoryBudgets: [
          { category: 'water', allocated: '' },
          { category: 'roads', allocated: '' },
          { category: 'electric', allocated: '' },
          { category: 'waste', allocated: '' },
          { category: 'healthcare', allocated: '' },
          { category: 'education', allocated: '' },
          { category: 'sanitation', allocated: '' },
          { category: 'administrative', allocated: '' },
        ],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create budget');
    } finally {
      setCreating(false);
    }
  };

  const updateFormCategoryBudget = (index, value) => {
    const updated = [...formData.categoryBudgets];
    updated[index].allocated = value;
    setFormData({ ...formData, categoryBudgets: updated });
  };

  const handleActivateBudget = async (budgetId) => {
    try {
      setActivating(true);
      const response = await activateSystemBudget(token, budgetId);
      if (response.data.success) {
        toast.success('Budget activated successfully!');
        await fetchBudgetData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate budget');
    } finally {
      setActivating(false);
    }
  };

  const handleAddEngineer = async (e) => {
    e.preventDefault();
    try {
      setAddingEngineer(true);
      const response = await addEngineerSalary(token, engineerFormData);
      if (response.data.success) {
        toast.success('Engineer salary added successfully!');
        setShowAddEngineerModal(false);
        setEngineerFormData({ engineerId: '', monthlySalary: '', joinedDate: '' });
        await fetchBudgetData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add engineer salary');
    } finally {
      setAddingEngineer(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({
      category: category.category,
      allocated: category.allocated || 0,
    });
    setShowEditCategoryModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (updatingCategory) return; // Prevent duplicate calls
    
    try {
      setUpdatingCategory(true);
      await updateCategoryBudget(token, editingCategory.category, parseFloat(editingCategory.allocated));
      setShowEditCategoryModal(false);
      setEditingCategory(null);
      await fetchBudgetData();
    } catch (error) {
      // Error already handled in API function
      console.error('Update category error:', error);
    } finally {
      setUpdatingCategory(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin text-6xl">💰</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <span>💰</span>
            <span className="break-words">Budget Management</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {budget ? `Fiscal Year: ${budget.fiscalYear}` : 'System Budget Overview'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm sm:text-base rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-md"
        >
          + Create New Budget
        </button>
      </div>

      {!budget ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <span className="text-8xl">📊</span>    
            <h2 className="text-2xl font-bold text-gray-800 mt-6">No Active Budget</h2>
            <p className="text-gray-600 mt-2">
              {allBudgets.length > 0 
                ? 'Activate a draft budget or create a new one'
                : 'Create a new fiscal year budget to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition"
            >
              Create Budget
            </button>
          </div>

          {/* Draft Budgets */}
          {allBudgets.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Draft Budgets</h3>
              <div className="space-y-4">
                {allBudgets.map((draftBudget) => (
                  <motion.div
                    key={draftBudget._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          FY {draftBudget.fiscalYear}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(draftBudget.startDate).toLocaleDateString()} - {new Date(draftBudget.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-700">
                            <strong>Total:</strong> {formatCurrency(draftBudget.totalAllocated)}
                          </span>
                          <span className="text-gray-700">
                            <strong>Salary:</strong> {formatCurrency(draftBudget.salaryBudget.allocated)}
                          </span>
                          <span className="text-gray-700">
                            <strong>Operational:</strong> {formatCurrency(draftBudget.operationalBudget.allocated)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          draftBudget.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          draftBudget.status === 'active' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {draftBudget.status.charAt(0).toUpperCase() + draftBudget.status.slice(1)}
                        </span>
                        {draftBudget.status === 'draft' && (
                          <button
                            onClick={() => handleActivateBudget(draftBudget._id)}
                            disabled={activating}
                            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {activating ? 'Activating...' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {/* Total Allocated */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl">💼</span>
                <div className="text-right">
                  <p className="text-blue-100 text-[10px] sm:text-xs lg:text-sm">Total Allocated</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1 break-words">{formatCurrency(stats?.totalAllocated || 0)}</p>
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl">💸</span>
                <div className="text-right">
                  <p className="text-red-100 text-[10px] sm:text-xs lg:text-sm">Total Spent</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1 break-words">{formatCurrency(stats?.totalSpent || 0)}</p>
                </div>
              </div>
              <div className="mt-1.5 sm:mt-2">
                <div className="bg-white/20 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-white rounded-full h-1.5 sm:h-2 transition-all"
                    style={{ width: `${getPercentage(stats?.totalSpent, stats?.totalAllocated)}%` }}
                  />
                </div>
                <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-red-100">
                  {getPercentage(stats?.totalSpent, stats?.totalAllocated)}% utilized
                </p>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl">💚</span>
                <div className="text-right">
                  <p className="text-green-100 text-[10px] sm:text-xs lg:text-sm">Remaining</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1 break-words">{formatCurrency(stats?.remainingBudget || 0)}</p>
                </div>
              </div>
            </div>

            {/* Available (Operational) */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl">✨</span>
                <div className="text-right">
                  <p className="text-purple-100 text-[10px] sm:text-xs lg:text-sm">Available Now</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1 break-words">{formatCurrency(stats?.operational?.available || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="border-b border-gray-200">
              <div className="flex gap-1 px-3 sm:px-6 overflow-x-auto scrollbar-hide">
                {['overview', 'operational', 'salary', 'categories'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm capitalize transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-600 hover:text-gray  -800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Salary Budget */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span>👥</span>
                          Salary Budget
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Allocated:</span>
                            <span className="font-semibold">{formatCurrency(stats?.salary?.allocated || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Spent:</span>
                            <span className="font-semibold text-red-600">{formatCurrency(stats?.salary?.spent || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Remaining:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(stats?.salary?.remaining || 0)}</span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-3 mt-4">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-3 transition-all"
                              style={{ width: `${getPercentage(stats?.salary?.spent, stats?.salary?.allocated)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {stats?.salary?.engineerCount || 0} active engineers
                          </p>
                        </div>
                      </div>

                      {/* Operational Budget */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span>🔧</span>
                          Operational Budget
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Allocated:</span>
                            <span className="font-semibold">{formatCurrency(stats?.operational?.allocated || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Spent:</span>
                            <span className="font-semibold text-red-600">{formatCurrency(stats?.operational?.spent || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-semibold text-orange-600">{formatCurrency(stats?.operational?.pending || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reserved:</span>
                            <span className="font-semibold text-yellow-600">{formatCurrency(stats?.operational?.reserved || 0)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-3">
                            <span className="text-gray-700 font-medium">Available:</span>
                            <span className="font-bold text-green-600">{formatCurrency(stats?.operational?.available || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operational Tab */}
                {activeTab === 'operational' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Operational Budget Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Allocated</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(stats?.operational?.allocated || 0)}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Spent</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(stats?.operational?.spent || 0)}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-orange-600 font-medium">Pending Approval</p>
                        <p className="text-2xl font-bold text-orange-700 mt-1">{formatCurrency(stats?.operational?.pending || 0)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Available</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(stats?.operational?.available || 0)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="bg-gray-100 rounded-full h-6">
                        <div className="flex h-6 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500"
                            style={{ width: `${getPercentage(stats?.operational?.spent, stats?.operational?.allocated)}%` }}
                            title="Spent"
                          />
                          <div
                            className="bg-orange-400"
                            style={{ width: `${getPercentage(stats?.operational?.pending, stats?.operational?.allocated)}%` }}
                            title="Pending"
                          />
                          <div
                            className="bg-yellow-400"
                            style={{ width: `${getPercentage(stats?.operational?.reserved, stats?.operational?.allocated)}%` }}
                            title="Reserved"
                          />
                        </div>
                      </div>
                      <div className="flex gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>Spent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-orange-400 rounded"></div>
                          <span>Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                          <span>Reserved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-400 rounded"></div>
                          <span>Available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Salary Tab */}
                {activeTab === 'salary' && (
                  <div className="space-y-6">
                    {/* Salary Processing Section */}
                    {pendingSalaryInfo && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              💰 Salary Processing - {pendingSalaryInfo.currentMonth} {pendingSalaryInfo.currentYear}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {pendingSalaryInfo.alreadyProcessed ? (
                                <span className="text-green-600 font-medium">
                                  ✅ Already processed on {new Date(pendingSalaryInfo.processedAt).toLocaleDateString()}
                                </span>
                              ) : (
                                'Click the button below to process monthly salaries'
                              )}
                            </p>
                          </div>
                          {!pendingSalaryInfo.alreadyProcessed && (
                            <button
                              onClick={handleProcessSalary}
                              disabled={processingSalary}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {processingSalary ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <span>💳</span>
                                  <span>Process Salary</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600">Total Amount</div>
                            <div className="text-2xl font-bold text-green-600">
                              ₹{pendingSalaryInfo.totalPendingSalary.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600">Active Engineers</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {pendingSalaryInfo.activeEngineersCount}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600">Budget Allocated</div>
                            <div className="text-xl font-bold text-gray-700">
                              {formatCurrency(pendingSalaryInfo.salaryBudgetAllocated)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600">Remaining</div>
                            <div className="text-xl font-bold text-orange-600">
                              {formatCurrency(pendingSalaryInfo.salaryBudgetRemaining)}
                            </div>
                          </div>
                        </div>

                        {/* Processed History */}
                        {pendingSalaryInfo.processedHistory?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Salary Payments</h4>
                            <div className="flex gap-2 flex-wrap">
                              {pendingSalaryInfo.processedHistory.slice(-6).reverse().map((history, idx) => (
                                <div key={idx} className="bg-white px-3 py-2 rounded-lg text-xs">
                                  <span className="font-medium text-gray-700">{history.month} {history.year}</span>
                                  <span className="text-gray-500 ml-2">₹{history.totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">Engineer Salaries</h3>
                      <button 
                        onClick={() => setShowAddEngineerModal(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
                      >
                        + Add Engineer
                      </button>
                    </div>
                    
                    {budget?.salaryBudget?.engineers?.length > 0 ? (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Engineer</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monthly Salary</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined Date</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {budget.salaryBudget.engineers.map((eng, index) => (
                              <tr key={index} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">{eng.engineerId?.name || 'N/A'}</td>
                                <td className="px-4 py-3 font-semibold">{formatCurrency(eng.monthlySalary)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {new Date(eng.joinedDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    eng.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {eng.active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="lg:hidden space-y-4">
                        {budget.salaryBudget.engineers.map((eng, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                          >
                            {/* Engineer Name */}
                            <h4 className="text-base font-bold text-gray-800 mb-3 break-words">
                              {eng.engineerId?.name || 'N/A'}
                            </h4>

                            {/* Salary & Status Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">Monthly Salary</p>
                                <p className="text-base font-bold text-gray-800 break-words">{formatCurrency(eng.monthlySalary)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block ${
                                  eng.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {eng.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>

                            {/* Joined Date */}
                            <div className="bg-gray-50 rounded-lg p-2 mb-3">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Joined Date</p>
                              <p className="text-sm text-gray-700">
                                {new Date(eng.joinedDate).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Edit Button */}
                            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium">
                              Edit
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <span className="text-6xl">👨‍💼</span>
                        <p className="text-gray-500 mt-4">No engineer salaries added yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">Category-wise Budget</h3>
                      <p className="text-sm text-gray-600">
                        Manage budget allocation across categories
                      </p>
                    </div>
                    
                    {budget ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { category: 'water', emoji: '💧' },
                          { category: 'roads', emoji: '🛣️' },
                          { category: 'electric', emoji: '⚡', displayName: 'Electricity' },
                          { category: 'waste', emoji: '🗑️' },
                          { category: 'healthcare', emoji: '🏥' },
                          { category: 'education', emoji: '🎓' },
                          { category: 'sanitation', emoji: '🚿' },
                          { category: 'administrative', emoji: '📋' },
                        ].map((categoryDef, index) => {
                          const cat = budget.categoryBudgets?.find(c => c.category === categoryDef.category) || {
                            category: categoryDef.category,
                            allocated: 0,
                            spent: 0,
                            pending: 0,
                            grievanceCount: 0,
                          };
                          
                          const remaining = (cat.allocated || 0) - (cat.spent || 0) - (cat.pending || 0);
                          const utilizationPercent = cat.allocated > 0 
                            ? ((cat.spent / cat.allocated) * 100).toFixed(1) 
                            : 0;
                          
                          return (
                            <motion.div
                              key={categoryDef.category}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-400 transition-all bg-white"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-gray-800 capitalize">
                                  {categoryDef.displayName || categoryDef.category}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{categoryDef.emoji}</span>
                                  <button
                                    onClick={() => handleEditCategory(cat)}
                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition border border-blue-200"
                                    title="Edit Budget"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Allocated:</span>
                                  <span className={`font-bold ${cat.allocated > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {cat.allocated > 0 ? formatCurrency(cat.allocated) : 'Not Set'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Spent:</span>
                                  <span className="font-bold text-red-600">{formatCurrency(cat.spent || 0)}</span>
                                </div>
                                {cat.pending > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Pending:</span>
                                    <span className="font-bold text-orange-600">{formatCurrency(cat.pending)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t">
                                  <span className="text-sm text-gray-700 font-medium">Available:</span>
                                  <span className={`font-bold ${remaining > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {cat.allocated > 0 ? formatCurrency(remaining) : '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>Grievances:</span>
                                  <span className="font-semibold">{cat.grievanceCount || 0}</span>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              {cat.allocated > 0 ? (
                                <div className="mt-4">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Utilization</span>
                                    <span className="font-semibold">{utilizationPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div className="flex h-3">
                                      <div
                                        className="bg-gradient-to-r from-red-500 to-red-600 transition-all"
                                        style={{ width: `${utilizationPercent}%` }}
                                        title={`Spent: ${formatCurrency(cat.spent || 0)}`}
                                      />
                                      {cat.pending > 0 && (
                                        <div
                                          className="bg-orange-400 transition-all"
                                          style={{ width: `${((cat.pending / cat.allocated) * 100).toFixed(1)}%` }}
                                          title={`Pending: ${formatCurrency(cat.pending)}`}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                  <p className="text-xs text-gray-500">Click edit to set budget</p>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <span className="text-6xl mb-4 block">📊</span>
                        <p className="text-gray-600 font-medium">No active budget found</p>
                        <p className="text-sm text-gray-500 mt-2">Create and activate a budget first</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* All Budgets Section */}
          {allBudgets.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span>
                All Budgets
              </h3>
              <div className="space-y-4">
                {allBudgets.map((draftBudget) => (
                  <motion.div
                    key={draftBudget._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          FY {draftBudget.fiscalYear}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(draftBudget.startDate).toLocaleDateString()} - {new Date(draftBudget.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-700">
                            <strong>Total:</strong> {formatCurrency(draftBudget.totalAllocated)}
                          </span>
                          <span className="text-gray-700">
                            <strong>Salary:</strong> {formatCurrency(draftBudget.salaryBudget.allocated)}
                          </span>
                          <span className="text-gray-700">
                            <strong>Operational:</strong> {formatCurrency(draftBudget.operationalBudget.allocated)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          draftBudget.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          draftBudget.status === 'active' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {draftBudget.status.charAt(0).toUpperCase() + draftBudget.status.slice(1)}
                        </span>
                        {draftBudget.status === 'draft' && (
                          <button
                            onClick={() => handleActivateBudget(draftBudget._id)}
                            disabled={activating}
                            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {activating ? 'Activating...' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Create New Budget</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiscal Year *
                  </label>
                  <input
                    type="text"
                    value={formData.fiscalYear}
                    onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                    placeholder="e.g., 2025-2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Budget Allocation */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Allocated (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.totalAllocated}
                      onChange={(e) => setFormData({ ...formData, totalAllocated: e.target.value })}
                      placeholder="10000000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Budget (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.salaryBudget}
                      onChange={(e) => setFormData({ ...formData, salaryBudget: e.target.value })}
                      placeholder="4000000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operational Budget (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.operationalBudget}
                      onChange={(e) => setFormData({ ...formData, operationalBudget: e.target.value })}
                      placeholder="6000000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Category Budgets */}  
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Budgets (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {formData.categoryBudgets.map((cat, index) => (
                    <div key={cat.category}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {cat.category === 'electric' ? 'Electricity' : cat.category} (₹)
                      </label>
                      <input
                        type="number"
                        value={cat.allocated}
                        onChange={(e) => updateFormCategoryBudget(index, e.target.value)}
                        placeholder="1000000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        min="0"
                        step="1000"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {formData.totalAllocated && formData.salaryBudget && formData.operationalBudget && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Budget Summary</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Total Allocated:</span>
                      <span className="font-bold">
                        ₹{parseFloat(formData.totalAllocated || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salary Budget:</span>
                      <span>₹{parseFloat(formData.salaryBudget || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operational Budget:</span>
                      <span>₹{parseFloat(formData.operationalBudget || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span>Remaining:</span>
                      <span className="font-bold">
                        ₹
                        {(
                          parseFloat(formData.totalAllocated || 0) -
                          parseFloat(formData.salaryBudget || 0) -
                          parseFloat(formData.operationalBudget || 0)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Budget'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Engineer Salary Modal */}
      {showAddEngineerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Add Engineer Salary</h2>
              <button
                onClick={() => setShowAddEngineerModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddEngineer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Engineer *
                </label>
                <select
                  value={engineerFormData.engineerId}
                  onChange={(e) => setEngineerFormData({ ...engineerFormData, engineerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Choose an engineer...</option>
                  {engineers.map((eng) => (
                    <option key={eng._id} value={eng._id}>
                      {eng.name} ({eng.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Salary (₹) *
                </label>
                <input
                  type="number"
                  value={engineerFormData.monthlySalary}
                  onChange={(e) => setEngineerFormData({ ...engineerFormData, monthlySalary: e.target.value })}
                  placeholder="50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {engineerFormData.monthlySalary && `≈ ${formatCurrency(parseFloat(engineerFormData.monthlySalary))}/month`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joined Date *
                </label>
                <input
                  type="date"
                  value={engineerFormData.joinedDate}
                  onChange={(e) => setEngineerFormData({ ...engineerFormData, joinedDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={addingEngineer}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50"
                >
                  {addingEngineer ? 'Adding...' : 'Add Engineer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEngineerModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Category Budget Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                Edit {editingCategory.category === 'electric' ? 'Electricity' : editingCategory.category} Budget
              </h2>
              <button
                onClick={() => {
                  setShowEditCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Current Status</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Current Allocation:</span>
                    <span className="font-bold">{formatCurrency(budget?.categoryBudgets?.find(c => c.category === editingCategory.category)?.allocated || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spent:</span>
                    <span className="text-red-600 font-medium">{formatCurrency(budget?.categoryBudgets?.find(c => c.category === editingCategory.category)?.spent || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-orange-600 font-medium">{formatCurrency(budget?.categoryBudgets?.find(c => c.category === editingCategory.category)?.pending || 0)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Allocated Amount (₹) *
                </label>
                <input
                  type="number"
                  value={editingCategory?.allocated || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, allocated: e.target.value })}
                  placeholder="1000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingCategory?.allocated && `≈ ${formatCurrency(parseFloat(editingCategory.allocated))}`}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Changing the allocation will affect the available budget for this category. Ensure the new amount is sufficient for pending and future grievances.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={updatingCategory}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingCategory ? 'Updating...' : 'Update Budget'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
