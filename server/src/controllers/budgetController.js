const Grievance = require('../models/Grievance');
const SystemBudget = require('../models/SystemBudget');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

/**
 * Get budget overview and utilization statistics
 */
exports.getBudgetOverview = async (req, res) => {
  try {
    // Get all resolved grievances with budget data
    const grievances = await Grievance.find({
      status: { $in: ['resolved', 'closed'] },
      'budget.allocated': { $gt: 0 },
    });

    // Calculate totals by category
    const budgetByCategory = {
      water: { allocated: 0, spent: 0, count: 0 },
      roads: { allocated: 0, spent: 0, count: 0 },
      electricity: { allocated: 0, spent: 0, count: 0 },
      waste: { allocated: 0, spent: 0, count: 0 },
      other: { allocated: 0, spent: 0, count: 0 },
    };

    let totalAllocated = 0;
    let totalSpent = 0;

    grievances.forEach(g => {
      const category = g.budget.category || 'other';
      budgetByCategory[category].allocated += g.budget.allocated || 0;
      budgetByCategory[category].spent += g.budget.spent || 0;
      budgetByCategory[category].count += 1;

      totalAllocated += g.budget.allocated || 0;
      totalSpent += g.budget.spent || 0;
    });

    // Calculate efficiency
    const efficiency = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        total: {
          allocated: totalAllocated,
          spent: totalSpent,
          efficiency: parseFloat(efficiency),
        },
        byCategory: budgetByCategory,
        grievancesWithBudget: grievances.length,
      },
    });
  } catch (error) {
    console.error('Error fetching budget overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget overview',
    });
  }
};

/**
 * Update budget for a specific grievance
 */
exports.updateGrievanceBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { allocated, spent, category, description, expenseDetails } = req.body;

    const grievance = await Grievance.findById(id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Update budget
    grievance.budget = {
      allocated: allocated || grievance.budget.allocated,
      spent: spent || grievance.budget.spent,
      category: category || grievance.budget.category,
      description: description || grievance.budget.description,
      expenseDetails: expenseDetails || grievance.budget.expenseDetails,
    };

    await grievance.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
    });
  }
};

/**
 * Add expense to grievance budget
 */
exports.addExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { item, cost } = req.body;

    const grievance = await Grievance.findById(id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Add expense
    if (!grievance.budget.expenseDetails) {
      grievance.budget.expenseDetails = [];
    }

    grievance.budget.expenseDetails.push({
      item,
      cost,
      date: new Date(),
    });

    // Update total spent
    grievance.budget.spent = (grievance.budget.spent || 0) + cost;

    await grievance.save();

    res.status(200).json({
      success: true,
      message: 'Expense added successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add expense',
    });
  }
};

/**
 * Get budget utilization trends (monthly)
 */
exports.getBudgetTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    const grievances = await Grievance.find({
      resolutionDate: { $gte: monthsAgo },
      'budget.allocated': { $gt: 0 },
    }).sort({ resolutionDate: 1 });

    // Group by month
    const trends = {};

    grievances.forEach(g => {
      const month = g.resolutionDate.toISOString().slice(0, 7); // YYYY-MM
      if (!trends[month]) {
        trends[month] = { allocated: 0, spent: 0, count: 0 };
      }
      trends[month].allocated += g.budget.allocated || 0;
      trends[month].spent += g.budget.spent || 0;
      trends[month].count += 1;
    });

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Error fetching budget trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget trends',
    });
  }
};

// ==================== NEW SYSTEM BUDGET MANAGEMENT ====================

// @desc    Get current system budget
// @route   GET /api/budget/system/current
// @access  Private/Admin
exports.getCurrentSystemBudget = async (req, res) => {
  try {
    const budget = await SystemBudget.getCurrentBudget();
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error('Error fetching current budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget',
      error: error.message,
    });
  }
};

// @desc    Get all system budgets
// @route   GET /api/budget/system/all
// @access  Private/Admin
exports.getAllSystemBudgets = async (req, res) => {
  try {
    const budgets = await SystemBudget.find()
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ fiscalYear: -1 });
    
    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error('Error fetching all budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
      error: error.message,
    });
  }
};

// @desc    Create new fiscal year budget
// @route   POST /api/budget/system/create
// @access  Private/Admin
exports.createSystemBudget = async (req, res) => {
  try {
    const {
      fiscalYear,
      startDate,
      endDate,
      totalAllocated,
      salaryBudget,
      operationalBudget,
      categoryBudgets,
    } = req.body;

    const existing = await SystemBudget.findOne({ fiscalYear });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this fiscal year',
      });
    }

    const budget = await SystemBudget.create({
      fiscalYear,
      startDate,
      endDate,
      totalAllocated,
      salaryBudget: {
        allocated: salaryBudget,
        spent: 0,
        engineers: [],
      },
      operationalBudget: {
        allocated: operationalBudget,
        spent: 0,
        pending: 0,
        reserved: 0,
      },
      categoryBudgets: categoryBudgets || [],
      createdBy: req.user.id,
      status: 'draft',
    });

    // Create audit log
    await AuditLog.create({
      action: 'budget_created',
      performedBy: req.user.id,
      targetModel: 'SystemBudget',
      targetId: budget._id,
      details: {
        fiscalYear,
        totalAllocated,
        salaryBudget,
        operationalBudget,
      },
      metadata: {
        fiscalYear,
        amount: totalAllocated,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create budget',
      error: error.message,
    });
  }
};

// @desc    Activate budget
// @route   PUT /api/budget/system/:id/activate
// @access  Private/Admin
exports.activateSystemBudget = async (req, res) => {
  try {
    await SystemBudget.updateMany({ status: 'active' }, { status: 'closed' });

    const budget = await SystemBudget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    budget.status = 'active';
    budget.lastModifiedBy = req.user.id;
    await budget.save();

    // Create audit log
    await AuditLog.create({
      action: 'budget_activated',
      performedBy: req.user.id,
      targetModel: 'SystemBudget',
      targetId: budget._id,
      details: {
        fiscalYear: budget.fiscalYear,
        totalAllocated: budget.totalAllocated,
      },
      metadata: {
        fiscalYear: budget.fiscalYear,
        amount: budget.totalAllocated,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Budget activated successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error activating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate budget',
      error: error.message,
    });
  }
};

// @desc    Add engineer salary
// @route   POST /api/budget/system/salary/add
// @access  Private/Admin
exports.addEngineerSalary = async (req, res) => {
  try {
    const { engineerId, monthlySalary, joinedDate } = req.body;

    const budget = await SystemBudget.getCurrentBudget();
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    const existing = budget.salaryBudget.engineers.find(
      (e) => e.engineerId.toString() === engineerId
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Engineer salary already added',
      });
    }

    budget.salaryBudget.engineers.push({
      engineerId,
      monthlySalary,
      joinedDate,
      active: true,
    });

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Engineer salary added successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error adding engineer salary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add engineer salary',
      error: error.message,
    });
  }
};

// @desc    Update engineer salary
// @route   PUT /api/budget/system/salary/:engineerId
// @access  Private/Admin
exports.updateEngineerSalary = async (req, res) => {
  try {
    const { engineerId } = req.params;
    const { monthlySalary, active } = req.body;

    const budget = await SystemBudget.getCurrentBudget();
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    const engineer = budget.salaryBudget.engineers.find(
      (e) => e.engineerId.toString() === engineerId
    );

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found in salary list',
      });
    }

    if (monthlySalary !== undefined) engineer.monthlySalary = monthlySalary;
    if (active !== undefined) engineer.active = active;

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Engineer salary updated successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error updating engineer salary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update engineer salary',
      error: error.message,
    });
  }
};
// @desc    Update category budget
// @route   PUT /api/budget/system/category/:category
// @access  Private/Admin
exports.updateCategoryBudget = async (req, res) => {
  try {
    const { category } = req.params;
    const { allocated } = req.body;

    const budget = await SystemBudget.getCurrentBudget();
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    let categoryBudget = budget.categoryBudgets.find(
      (cat) => cat.category === category
    );

    const oldAllocated = categoryBudget?.allocated || 0;

    if (!categoryBudget) {
      // Category doesn't exist, create it
      budget.categoryBudgets.push({
        category,
        allocated,
        spent: 0,
        pending: 0,
        grievanceCount: 0,
      });
    } else {
      // Category exists, update it
      categoryBudget.allocated = allocated;
    }

    budget.lastModifiedBy = req.user.id;
    await budget.save();

    // Create audit log
    await AuditLog.create({
      action: categoryBudget ? 'category_budget_updated' : 'category_budget_created',
      performedBy: req.user.id,
      targetModel: 'SystemBudget',
      targetId: budget._id,
      details: {
        category,
        oldAllocated,
        newAllocated: allocated,
      },
      changes: {
        before: { allocated: oldAllocated },
        after: { allocated },
      },
      metadata: {
        fiscalYear: budget.fiscalYear,
        category,
        amount: allocated,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Category budget updated successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Error updating category budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category budget',
      error: error.message,
    });
  }
};
// @desc    Get budget statistics
// @route   GET /api/budget/system/stats
// @access  Private/Admin
exports.getSystemBudgetStats = async (req, res) => {
  try {
    const budget = await SystemBudget.getCurrentBudget();
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    const stats = {
      totalAllocated: budget.totalAllocated,
      totalSpent: budget.totalSpent,
      remainingBudget: budget.remainingBudget,
      
      salary: {
        allocated: budget.salaryBudget.allocated,
        spent: budget.salaryBudget.spent,
        remaining: budget.salaryBudgetRemaining,
        engineerCount: budget.salaryBudget.engineers.filter(e => e.active).length,
      },
      
      operational: {
        allocated: budget.operationalBudget.allocated,
        spent: budget.operationalBudget.spent,
        pending: budget.operationalBudget.pending,
        reserved: budget.operationalBudget.reserved,
        remaining: budget.operationalBudgetRemaining,
        available: budget.operationalBudgetAvailable,
      },
      
      categoryWise: budget.categoryBudgets.map(cat => ({
        category: cat.category,
        allocated: cat.allocated,
        spent: cat.spent,
        pending: cat.pending,
        remaining: cat.allocated - cat.spent - cat.pending,
        grievanceCount: cat.grievanceCount,
      })),
      
      monthlySpending: budget.monthlySpending,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching budget stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget statistics',
      error: error.message,
    });
  }
};

// @desc    Get public budget info
// @route   GET /api/budget/system/public
// @access  Public
exports.getPublicSystemBudget = async (req, res) => {
  try {
    const budget = await SystemBudget.getCurrentBudget();
    
    if (!budget || !budget.transparency.publiclyVisible) {
      return res.status(404).json({
        success: false,
        message: 'Budget information not available',
      });
    }

    const publicData = {
      fiscalYear: budget.fiscalYear,
      totalAllocated: budget.totalAllocated,
      totalSpent: budget.totalSpent,
      remainingBudget: budget.remainingBudget,
      
      operational: {
        allocated: budget.operationalBudget.allocated,
        spent: budget.operationalBudget.spent,
        remaining: budget.operationalBudgetRemaining,
      },
      
      categoryWise: budget.categoryBudgets.map(cat => ({
        category: cat.category,
        allocated: cat.allocated,
        spent: cat.spent,
        remaining: cat.allocated - cat.spent,
        grievanceCount: cat.grievanceCount,
      })),
    };

    if (budget.transparency.showSalaries) {
      publicData.salary = {
        allocated: budget.salaryBudget.allocated,
        spent: budget.salaryBudget.spent,
      };
    }

    res.status(200).json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error('Error fetching public budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget information',
      error: error.message,
    });
  }
};

// @desc    Approve grievance budget
// @route   PUT /api/budget/grievance/:id/approve
// @access  Private/Admin
exports.approveGrievanceBudget = async (req, res) => {
  try {
    const { estimatedCost, materialsRequired, equipmentRequired, manpowerRequired } = req.body;

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    const budget = await SystemBudget.getCurrentBudget();
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    // Check available budget
    if (budget.operationalBudgetAvailable < estimatedCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient budget available',
      });
    }

    // Update grievance budget
    grievance.budget.estimatedCost = estimatedCost;
    grievance.budget.budgetApproved = true;
    grievance.budget.approvedBy = req.user.id;
    grievance.budget.approvedAt = new Date();
    grievance.budget.materialsRequired = materialsRequired || [];
    grievance.budget.equipmentRequired = equipmentRequired || [];
    grievance.budget.manpowerRequired = manpowerRequired || {};

    await grievance.save();

    // Reserve budget
    budget.operationalBudget.reserved += estimatedCost;
    await budget.save();

    // Create notification for assigned engineer
    if (grievance.assignedTo) {
      await Notification.create({
        userId: grievance.assignedTo,
        type: 'budget_approved',
        title: 'Grievance Budget Approved',
        message: `Budget of ₹${estimatedCost.toLocaleString('en-IN')} approved for grievance ${grievance.trackingId}`,
        relatedModel: 'Grievance',
        relatedId: grievance._id,
      });
    }

    // Create audit log
    await AuditLog.create({
      action: 'budget_approved',
      performedBy: req.user.id,
      targetModel: 'Grievance',
      targetId: grievance._id,
      details: {
        trackingId: grievance.trackingId,
        estimatedCost,
        category: grievance.category,
      },
      metadata: {
        amount: estimatedCost,
        category: grievance.category,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Grievance budget approved successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error approving grievance budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve budget',
      error: error.message,
    });
  }
};

// @desc    Get pending salary processing details
// @route   GET /api/budget/system/salary/pending
// @access  Private/Admin
exports.getPendingSalaryInfo = async (req, res) => {
  try {
    const budget = await SystemBudget.findOne({ status: 'active' })
      .populate('salaryBudget.engineers.engineerId', 'name email');
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    // Get current month and year
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    // Check if current month already processed
    const alreadyProcessed = budget.salaryBudget.processedMonths?.find(
      pm => pm.month === currentMonth && pm.year === currentYear
    );

    // Calculate total pending salary for active engineers
    const activeEngineers = budget.salaryBudget.engineers.filter(e => e.active && e.engineerId);
    const totalPendingSalary = activeEngineers.reduce((sum, eng) => sum + eng.monthlySalary, 0);

    // Get engineer details
    const engineerDetails = activeEngineers
      .filter(eng => eng.engineerId) // Filter out null/undefined engineers
      .map(eng => ({
        engineerId: eng.engineerId._id,
        name: eng.engineerId.name,
        email: eng.engineerId.email,
        monthlySalary: eng.monthlySalary,
        joinedDate: eng.joinedDate,
      }));

    // Get last 6 months processed history
    const processedHistory = budget.salaryBudget.processedMonths?.slice(-6) || [];

    res.status(200).json({
      success: true,
      data: {
        currentMonth,
        currentYear,
        totalPendingSalary,
        activeEngineersCount: activeEngineers.length,
        engineerDetails,
        alreadyProcessed: !!alreadyProcessed,
        processedAt: alreadyProcessed?.processedAt,
        salaryBudgetAllocated: budget.salaryBudget.allocated,
        salaryBudgetSpent: budget.salaryBudget.spent,
        salaryBudgetRemaining: budget.salaryBudget.allocated - budget.salaryBudget.spent,
        processedHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching pending salary info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending salary information',
      error: error.message,
    });
  }
};

// @desc    Process monthly salary for all active engineers
// @route   POST /api/budget/system/salary/process
// @access  Private/Admin
exports.processMonthlySalary = async (req, res) => {
  try {
    const { month, year } = req.body;
    const mailSender = require('../mail/Mailsender');
    const { salaryCreditedEmail } = require('../mail/mailtemplates/salaryCredited');

    const budget = await SystemBudget.findOne({ status: 'active' })
      .populate('salaryBudget.engineers.engineerId', 'name email');
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    // Check if month already processed
    const alreadyProcessed = budget.salaryBudget.processedMonths?.find(
      pm => pm.month === month && pm.year === year
    );

    if (alreadyProcessed) {
      return res.status(400).json({
        success: false,
        message: `Salary for ${month} ${year} has already been processed`,
      });
    }

    // Get active engineers
    const activeEngineers = budget.salaryBudget.engineers.filter(e => e.active);
    
    if (activeEngineers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active engineers found for salary processing',
      });
    }

    // Calculate total salary amount
    const totalSalaryAmount = activeEngineers.reduce((sum, eng) => sum + eng.monthlySalary, 0);

    // Check if sufficient budget available
    const remainingBudget = budget.salaryBudget.allocated - budget.salaryBudget.spent;
    if (totalSalaryAmount > remainingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient salary budget',
        required: totalSalaryAmount,
        available: remainingBudget,
      });
    }

    // Process salary for each engineer
    const engineerPayments = [];
    const emailPromises = [];

    for (const engineer of activeEngineers) {
      engineerPayments.push({
        engineerId: engineer.engineerId._id,
        amount: engineer.monthlySalary,
      });

      // Send email notification
      const emailPromise = mailSender(
        engineer.engineerId.email,
        `Salary Credited - ${month} ${year}`,
        salaryCreditedEmail(engineer.engineerId.name, month, year, engineer.monthlySalary)
      ).catch(err => console.error(`Failed to send email to ${engineer.engineerId.email}:`, err));
      
      emailPromises.push(emailPromise);
    }

    // Update budget - deduct from salary budget
    budget.salaryBudget.spent += totalSalaryAmount;

    // Add to processed months
    if (!budget.salaryBudget.processedMonths) {
      budget.salaryBudget.processedMonths = [];
    }
    
    budget.salaryBudget.processedMonths.push({
      month,
      year,
      totalAmount: totalSalaryAmount,
      processedBy: req.user.id,
      processedAt: new Date(),
      engineerPayments,
    });

    // Update monthly spending
    const existingMonthSpending = budget.monthlySpending.find(
      ms => ms.month === month && ms.year === year
    );

    if (existingMonthSpending) {
      existingMonthSpending.salaries += totalSalaryAmount;
      existingMonthSpending.total += totalSalaryAmount;
    } else {
      budget.monthlySpending.push({
        month,
        year,
        salaries: totalSalaryAmount,
        operations: 0,
        total: totalSalaryAmount,
      });
    }

    await budget.save();

    // Create audit log
    await AuditLog.create({
      action: 'salary_processed',
      performedBy: req.user.id,
      targetModel: 'SystemBudget',
      targetId: budget._id,
      details: {
        month,
        year,
        totalAmount: totalSalaryAmount,
        engineersCount: activeEngineers.length,
      },
      metadata: {
        amount: totalSalaryAmount,
        engineerPayments,
      },
    });

    // Wait for all emails to be sent
    await Promise.allSettled(emailPromises);

    res.status(200).json({
      success: true,
      message: `Salary processed successfully for ${month} ${year}`,
      data: {
        month,
        year,
        totalAmount: totalSalaryAmount,
        engineersCount: activeEngineers.length,
        engineerPayments,
        remainingBudget: budget.salaryBudget.allocated - budget.salaryBudget.spent,
      },
    });
  } catch (error) {
    console.error('Error processing monthly salary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process monthly salary',
      error: error.message,
    });
  }
};
