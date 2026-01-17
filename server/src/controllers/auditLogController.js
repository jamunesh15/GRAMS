const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs with filters
// @route   GET /api/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      action,
      performedBy,
      targetModel,
      fiscalYear,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (performedBy) query.performedBy = performedBy;
    if (targetModel) query.targetModel = targetModel;
    if (fiscalYear) query['metadata.fiscalYear'] = fiscalYear;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalLogs: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/audit-logs/stats
// @access  Private/Admin
exports.getAuditStats = async (req, res) => {
  try {
    const { fiscalYear, days = 30 } = req.query;

    const query = {};
    if (fiscalYear) {
      query['metadata.fiscalYear'] = fiscalYear;
    } else {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      query.createdAt = { $gte: daysAgo };
    }

    const actionCounts = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          totalAmount: { $sum: '$metadata.amount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const userActivity = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$performedBy',
          count: { $sum: 1 },
          actions: { $push: '$action' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Populate user details
    await AuditLog.populate(userActivity, {
      path: '_id',
      select: 'name email role',
    });

    const totalLogs = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        actionCounts,
        userActivity,
        totalLogs,
        period: fiscalYear || `Last ${days} days`,
      },
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error.message,
    });
  }
};

// @desc    Get recent budget activities
// @route   GET /api/audit-logs/recent-budget
// @access  Private/Admin
exports.getRecentBudgetActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const budgetActions = [
      'budget_created',
      'budget_activated',
      'budget_approved',
      'resource_request_approved',
      'resource_delivered',
    ];

    const activities = await AuditLog.find({
      action: { $in: budgetActions },
    })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message,
    });
  }
};
