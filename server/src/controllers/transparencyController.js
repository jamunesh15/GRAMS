const Grievance = require('../models/Grievance');
const User = require('../models/User');

/**
 * Helper Functions
 */
function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toDays(ms) {
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function toHours(ms) {
  return Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
}

/**
 * @desc    Get comprehensive transparency report for public dashboard
 * @route   GET /api/transparency/report
 * @access  Public
 */
exports.getTransparencyReport = async (req, res) => {
  try {
    const grievances = await Grievance.find()
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const totalGrievances = grievances.length;
    // Calculate resolved count (both 'resolved' and 'closed' are considered resolved)
    const resolvedGrievances = grievances.filter((g) => g.status === 'resolved' || g.status === 'closed');
    const resolvedCount = resolvedGrievances.length;
    const pendingCount = grievances.filter((g) => ['open', 'in-progress'].includes(g.status)).length;
    const inProgressCount = grievances.filter((g) => g.status === 'in-progress').length;
    const closedCount = grievances.filter((g) => g.status === 'closed').length;
    const rejectedCount = grievances.filter((g) => g.status === 'rejected').length;
    const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0;

    // Calculate average resolution time
    const resolutionDays = resolvedGrievances
      .map((g) => {
        const created = new Date(g.createdAt);
        const resolvedAt = new Date(g.resolutionDate || g.updatedAt);
        return toDays(resolvedAt - created);
      })
      .filter((d) => Number.isFinite(d) && d >= 0);

    const avgResolutionDays = resolutionDays.length
      ? resolutionDays.reduce((sum, d) => sum + d, 0) / resolutionDays.length
      : 0;

    // SLA Compliance (resolved within 7 days)
    const slaCompliant = resolutionDays.filter((d) => d <= 7).length;
    const slaComplianceRate = resolutionDays.length ? Math.round((slaCompliant / resolutionDays.length) * 100) : 0;

    // Active officers count
    const activeOfficersCount = new Set(
      grievances.filter((g) => g.assignedTo).map((g) => String(g.assignedTo._id || g.assignedTo))
    ).size;

    // Citizen satisfaction ratings
    const ratingValues = grievances
      .map((g) => safeNumber(g.citizenRating, null))
      .filter((r) => r !== null && r >= 1 && r <= 5);
    const satisfactionAvg = ratingValues.length
      ? Math.round((ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length) * 10) / 10
      : 0;

    // Overdue issues (beyond 7 days and not resolved)
    const now = Date.now();
    const overdueIssues = grievances
      .filter((g) => !['resolved', 'closed', 'rejected'].includes(g.status))
      .map((g) => {
        const daysOpen = toDays(now - new Date(g.createdAt).getTime());
        const upvotes = Number.isFinite(g.upvotes) ? g.upvotes : 0;
        return {
          _id: g._id,
          title: g.title,
          description: g.description,
          category: g.category,
          priority: g.priority,
          status: g.status,
          createdAt: g.createdAt,
          user: g.userId ? { name: g.userId.name, email: g.userId.email } : null,
          assignedTo: g.assignedTo ? { name: g.assignedTo.name, email: g.assignedTo.email } : null,
          upvotes,
          upvotedBy: g.upvotedBy || [],
          daysOpen,
        };
      })
      .filter((g) => g.daysOpen > 7)
      .sort((a, b) => b.upvotes - a.upvotes || b.daysOpen - a.daysOpen)
      .slice(0, 6);

    // Category breakdown
    const categoryKeys = ['infrastructure', 'health', 'academic', 'administrative', 'other'];
    const categoryCounts = categoryKeys.reduce((acc, key) => {
      acc[key] = grievances.filter((g) => g.category === key).length;
      return acc;
    }, {});

    const categoryBreakdown = categoryKeys.map((key) => {
      const count = categoryCounts[key] || 0;
      const percentage = totalGrievances > 0 ? Math.round((count / totalGrievances) * 100) : 0;
      const resolved = grievances.filter((g) => g.category === key && (g.status === 'resolved' || g.status === 'closed')).length;
      const categoryResolutionRate = count > 0 ? Math.round((resolved / count) * 100) : 0;
      return { key, count, percentage, resolved, resolutionRate: categoryResolutionRate };
    });

    // Budget breakdown
    const budgetKeys = ['water', 'roads', 'electricity', 'other'];
    const budgetTotals = budgetKeys.reduce((acc, key) => {
      acc[key] = { amount: 0, items: 0 };
      return acc;
    }, {});

    for (const g of grievances) {
      const category = g.budget?.category;
      const amount = safeNumber(g.budget?.amount, 0);
      if (!category || !budgetTotals[category] || amount <= 0) continue;
      budgetTotals[category].amount += amount;
      budgetTotals[category].items += 1;
    }

    const totalBudgetUsed = Object.values(budgetTotals).reduce((sum, v) => sum + safeNumber(v.amount, 0), 0);
    const budgetBreakdown = budgetKeys.map((key) => {
      const amount = safeNumber(budgetTotals[key].amount, 0);
      const percentage = totalBudgetUsed > 0 ? Math.round((amount / totalBudgetUsed) * 100) : 0;
      return { key, amount, percentage, items: budgetTotals[key].items };
    });

    // First response time calculation
    const assignmentDiffHours = grievances
      .filter((g) => g.firstAssignedAt)
      .map((g) => (new Date(g.firstAssignedAt) - new Date(g.createdAt)) / (1000 * 60 * 60))
      .filter((h) => Number.isFinite(h) && h >= 0);

    const firstResponseHoursAvg = assignmentDiffHours.length
      ? Math.round((assignmentDiffHours.reduce((sum, h) => sum + h, 0) / assignmentDiffHours.length) * 10) / 10
      : 0;

    // Repeat issues count
    const repeatIssuesCount = grievances.reduce((sum, g) => sum + safeNumber(g.reopenedCount, 0), 0);

    // Priority breakdown
    const priorityKeys = ['low', 'medium', 'high', 'critical'];
    const priorityBreakdown = priorityKeys.map((key) => {
      const count = grievances.filter((g) => g.priority === key).length;
      const percentage = totalGrievances > 0 ? Math.round((count / totalGrievances) * 100) : 0;
      return { key, count, percentage };
    });

    // Status breakdown
    const statusKeys = ['open', 'in-progress', 'resolved', 'closed', 'rejected'];
    const statusBreakdown = statusKeys.map((key) => {
      const count = grievances.filter((g) => g.status === key).length;
      const percentage = totalGrievances > 0 ? Math.round((count / totalGrievances) * 100) : 0;
      return { key, count, percentage };
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthGrievances = grievances.filter((g) => {
        const created = new Date(g.createdAt);
        return created >= monthStart && created < monthEnd;
      });

      const monthResolved = monthGrievances.filter((g) => g.status === 'resolved' || g.status === 'closed').length;

      monthlyTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        total: monthGrievances.length,
        resolved: monthResolved,
        resolutionRate: monthGrievances.length > 0 ? Math.round((monthResolved / monthGrievances.length) * 100) : 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalGrievances,
          resolvedCount,
          pendingCount,
          inProgressCount,
          closedCount,
          rejectedCount,
          resolutionRate,
          avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
          activeOfficersCount,
          totalBudgetUsed,
        },
        satisfaction: {
          avg: satisfactionAvg,
          count: ratingValues.length,
        },
        charts: {
          categoryBreakdown,
          priorityBreakdown,
          statusBreakdown,
          monthlyTrend,
        },
        overdueIssues,
        budget: {
          totalBudgetUsed,
          breakdown: budgetBreakdown,
        },
        performance: {
          slaComplianceRate,
          firstResponseHoursAvg,
          repeatIssuesCount,
        },
      },
    });
  } catch (error) {
    console.error('Transparency Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate transparency report',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all overdue issues with pagination
 * @route   GET /api/transparency/overdue
 * @access  Public
 */
exports.getOverdueIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'daysOpen'; // 'daysOpen', 'upvotes', 'priority'
    const category = req.query.category;
    const priority = req.query.priority;

    let query = {
      status: { $nin: ['resolved', 'closed', 'rejected'] },
    };

    if (category) query.category = category;
    if (priority) query.priority = priority;

    const grievances = await Grievance.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: 1 }); // Oldest first

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // Filter overdue and map to response format
    let overdueIssues = grievances
      .map((g) => {
        const createdAt = new Date(g.createdAt).getTime();
        const daysOpen = toDays(now - createdAt);
        const isOverdue = now - createdAt > sevenDaysMs;

        if (!isOverdue) return null;

        return {
          _id: g._id,
          title: g.title,
          description: g.description,
          category: g.category,
          priority: g.priority,
          status: g.status,
          createdAt: g.createdAt,
          user: g.userId ? { name: g.userId.name, email: g.userId.email } : null,
          assignedTo: g.assignedTo ? { name: g.assignedTo.name, email: g.assignedTo.email } : null,
          upvotes: safeNumber(g.upvotes, 0),
          upvotedBy: g.upvotedBy || [],
          daysOpen,
          commentsCount: g.comments?.length || 0,
        };
      })
      .filter(Boolean);

    // Sort based on sortBy parameter
    if (sortBy === 'upvotes') {
      overdueIssues.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      overdueIssues.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else {
      overdueIssues.sort((a, b) => b.daysOpen - a.daysOpen);
    }

    // Pagination
    const totalCount = overdueIssues.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedIssues = overdueIssues.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      data: paginatedIssues,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get Overdue Issues Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue issues',
      error: error.message,
    });
  }
};

/**
 * @desc    Upvote an overdue issue (public can upvote)
 * @route   POST /api/transparency/upvote/:id
 * @access  Public (but tracks user if logged in)
 */
exports.upvoteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body?.userId; // Get user ID from auth or body

    const grievance = await Grievance.findById(id);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Check if the issue is overdue (beyond 7 days and not resolved)
    const now = Date.now();
    const createdAt = new Date(grievance.createdAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const isOverdue = now - createdAt > sevenDaysMs;

    if (!isOverdue) {
      return res.status(400).json({
        success: false,
        message: 'Only overdue issues (beyond 7 days) can be upvoted',
      });
    }

    if (['resolved', 'closed', 'rejected'].includes(grievance.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upvote resolved, closed, or rejected issues',
      });
    }

    // Check if user has already upvoted (if userId is provided)
    if (userId) {
      if (!grievance.upvotedBy) {
        grievance.upvotedBy = [];
      }
      
      const hasAlreadyUpvoted = grievance.upvotedBy.some(
        (voterId) => voterId.toString() === userId.toString()
      );

      if (hasAlreadyUpvoted) {
        return res.status(400).json({
          success: false,
          message: 'You have already upvoted this issue',
          alreadyUpvoted: true,
        });
      }

      // Add user to upvotedBy array
      grievance.upvotedBy.push(userId);
    }

    // Increment upvote count
    grievance.upvotes = safeNumber(grievance.upvotes, 0) + 1;
    await grievance.save();

    // Check for auto-escalation threshold (e.g., 50+ upvotes → critical priority)
    if (grievance.upvotes >= 50 && grievance.priority !== 'critical') {
      grievance.priority = 'critical';
      await grievance.save();
    } else if (grievance.upvotes >= 25 && !['high', 'critical'].includes(grievance.priority)) {
      grievance.priority = 'high';
      await grievance.save();
    }

    res.status(200).json({
      success: true,
      data: {
        _id: grievance._id,
        upvotes: grievance.upvotes,
        priority: grievance.priority,
      },
      message: 'Upvote recorded successfully',
    });
  } catch (error) {
    console.error('Upvote Issue Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upvote issue',
      error: error.message,
    });
  }
};

/**
 * @desc    Get category-wise statistics
 * @route   GET /api/transparency/categories
 * @access  Public
 */
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Grievance.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
          pending: {
            $sum: {
              $cond: [{ $in: ['$status', ['open', 'in-progress']] }, 1, 0],
            },
          },
          totalBudget: {
            $sum: { $ifNull: ['$budget.amount', 0] },
          },
          avgRating: {
            $avg: { $ifNull: ['$citizenRating', null] },
          },
        },
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          resolved: 1,
          pending: 1,
          totalBudget: 1,
          avgRating: { $round: ['$avgRating', 1] },
          resolutionRate: {
            $round: [
              { $multiply: [{ $divide: ['$resolved', { $max: ['$total', 1] }] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get Category Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get monthly trends for transparency charts
 * @route   GET /api/transparency/trends
 * @access  Public
 */
exports.getMonthlyTrends = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const trends = await Grievance.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
          totalBudget: {
            $sum: { $ifNull: ['$budget.amount', 0] },
          },
          avgRating: {
            $avg: { $ifNull: ['$citizenRating', null] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          total: 1,
          resolved: 1,
          totalBudget: 1,
          avgRating: { $round: ['$avgRating', 1] },
          resolutionRate: {
            $round: [
              { $multiply: [{ $divide: ['$resolved', { $max: ['$total', 1] }] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Format month names
    const formattedTrends = trends.map((t) => {
      const date = new Date(t.year, t.month - 1);
      return {
        ...t,
        label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      };
    });

    res.status(200).json({
      success: true,
      data: formattedTrends,
    });
  } catch (error) {
    console.error('Get Monthly Trends Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly trends',
      error: error.message,
    });
  }
};

/**
 * @desc    Get officer performance statistics
 * @route   GET /api/transparency/officers
 * @access  Public
 */
exports.getOfficerStats = async (req, res) => {
  try {
    const stats = await Grievance.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          avgRating: {
            $avg: { $ifNull: ['$citizenRating', null] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'officer',
        },
      },
      { $unwind: '$officer' },
      {
        $project: {
          _id: 1,
          name: '$officer.name',
          email: '$officer.email',
          totalAssigned: 1,
          resolved: 1,
          inProgress: 1,
          avgRating: { $round: ['$avgRating', 1] },
          resolutionRate: {
            $round: [
              { $multiply: [{ $divide: ['$resolved', { $max: ['$totalAssigned', 1] }] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { resolutionRate: -1, totalAssigned: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get Officer Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officer statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get budget utilization details
 * @route   GET /api/transparency/budget
 * @access  Public
 */
exports.getBudgetDetails = async (req, res) => {
  try {
    const budgetStats = await Grievance.aggregate([
      {
        $match: {
          'budget.category': { $exists: true },
          'budget.amount': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$budget.category',
          totalAmount: { $sum: '$budget.amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$budget.amount' },
          minAmount: { $min: '$budget.amount' },
          maxAmount: { $max: '$budget.amount' },
        },
      },
      {
        $project: {
          category: '$_id',
          totalAmount: 1,
          count: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
          minAmount: 1,
          maxAmount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Monthly budget trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBudget = await Grievance.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          'budget.amount': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalAmount: { $sum: '$budget.amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formattedMonthlyBudget = monthlyBudget.map((m) => {
      const date = new Date(m._id.year, m._id.month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        totalAmount: m.totalAmount,
        count: m.count,
      };
    });

    const totalBudget = budgetStats.reduce((sum, b) => sum + b.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalBudgetUsed: totalBudget,
        categoryBreakdown: budgetStats,
        monthlyTrend: formattedMonthlyBudget,
      },
    });
  } catch (error) {
    console.error('Get Budget Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget details',
      error: error.message,
    });
  }
};

/**
 * @desc    Export transparency data as JSON (for CSV conversion on frontend)
 * @route   GET /api/transparency/export
 * @access  Public
 */
exports.exportData = async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const type = req.query.type || 'summary'; // 'summary', 'grievances', 'budget'

    let data;

    if (type === 'grievances') {
      const grievances = await Grievance.find()
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .select('-comments -attachments')
        .sort({ createdAt: -1 });

      data = grievances.map((g) => ({
        id: g._id,
        title: g.title,
        category: g.category,
        priority: g.priority,
        status: g.status,
        createdAt: g.createdAt,
        resolutionDate: g.resolutionDate,
        citizenRating: g.citizenRating,
        upvotes: g.upvotes,
        budgetCategory: g.budget?.category,
        budgetAmount: g.budget?.amount,
        submittedBy: g.userId?.name || 'Anonymous',
        assignedTo: g.assignedTo?.name || 'Unassigned',
      }));
    } else if (type === 'budget') {
      const budgetData = await Grievance.find({
        'budget.amount': { $gt: 0 },
      })
        .select('title category budget createdAt status')
        .sort({ createdAt: -1 });

      data = budgetData.map((g) => ({
        title: g.title,
        category: g.category,
        budgetCategory: g.budget?.category,
        amount: g.budget?.amount,
        status: g.status,
        date: g.createdAt,
      }));
    } else {
      // Summary export
      const totalGrievances = await Grievance.countDocuments();
      // Count both 'resolved' and 'closed' as resolved
      const resolved = await Grievance.countDocuments({ status: { $in: ['resolved', 'closed'] } });
      const pending = await Grievance.countDocuments({ status: { $in: ['open', 'in-progress'] } });

      const budgetResult = await Grievance.aggregate([
        { $match: { 'budget.amount': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$budget.amount' } } },
      ]);

      data = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalGrievances,
          resolved,
          pending,
          resolutionRate: totalGrievances > 0 ? Math.round((resolved / totalGrievances) * 100) : 0,
          totalBudgetUsed: budgetResult[0]?.total || 0,
        },
      };
    }

    if (format === 'csv' && Array.isArray(data)) {
      // Convert to CSV format
      if (data.length === 0) {
        return res.status(200).send('No data available');
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row) =>
        Object.values(row)
          .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transparency-${type}-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Export Data Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single grievance details (public view for overdue issues)
 * @route   GET /api/transparency/issue/:id
 * @access  Public
 */
exports.getIssueDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const grievance = await Grievance.findById(id)
      .populate('userId', 'name')
      .populate('assignedTo', 'name');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Only show public details for overdue issues
    const now = Date.now();
    const createdAt = new Date(grievance.createdAt).getTime();
    const daysOpen = toDays(now - createdAt);

    const publicData = {
      _id: grievance._id,
      title: grievance.title,
      description: grievance.description,
      category: grievance.category,
      priority: grievance.priority,
      status: grievance.status,
      createdAt: grievance.createdAt,
      daysOpen,
      upvotes: safeNumber(grievance.upvotes, 0),
      commentsCount: grievance.comments?.length || 0,
      user: grievance.userId ? { name: grievance.userId.name } : null,
      assignedTo: grievance.assignedTo ? { name: grievance.assignedTo.name } : null,
      isOverdue: daysOpen > 7 && !['resolved', 'closed', 'rejected'].includes(grievance.status),
    };

    res.status(200).json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error('Get Issue Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue details',
      error: error.message,
    });
  }
};
