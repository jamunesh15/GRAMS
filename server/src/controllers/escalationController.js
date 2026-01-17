const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');

/**
 * Get all escalated grievances (Admin only)
 */
exports.getEscalatedGrievances = async (req, res) => {
  try {
    const { status, priority, sortBy = 'daysOpen' } = req.query;

    let query = { isEscalated: true };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'daysOpen') {
      sortOptions = { daysOpen: -1 };
    } else if (sortBy === 'recent') {
      sortOptions = { escalatedAt: -1 };
    } else if (sortBy === 'priority') {
      sortOptions = { priority: -1 };
    }

    const escalatedGrievances = await Grievance.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sortOptions);

    // Calculate stats
    const stats = {
      total: escalatedGrievances.length,
      critical: escalatedGrievances.filter(g => g.priority === 'critical').length,
      high: escalatedGrievances.filter(g => g.priority === 'high').length,
      blocked: escalatedGrievances.filter(g => g.status === 'blocked').length,
      avgDaysOpen: escalatedGrievances.length > 0 
        ? Math.round(escalatedGrievances.reduce((sum, g) => sum + (g.daysOpen || 0), 0) / escalatedGrievances.length)
        : 0,
    };

    res.status(200).json({
      success: true,
      data: escalatedGrievances,
      stats,
    });
  } catch (error) {
    console.error('Error fetching escalated grievances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching escalated grievances',
      error: error.message,
    });
  }
};

/**
 * Manually escalate a grievance
 */
exports.escalateGrievance = async (req, res) => {
  try {
    const { grievanceId, reason, priority } = req.body;

    if (!grievanceId) {
      return res.status(400).json({
        success: false,
        message: 'Grievance ID is required',
      });
    }

    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    if (grievance.isEscalated) {
      return res.status(400).json({
        success: false,
        message: 'Grievance is already escalated',
      });
    }

    // Update grievance
    grievance.isEscalated = true;
    grievance.escalatedAt = new Date();
    grievance.status = 'blocked';
    
    if (priority) {
      grievance.priority = priority;
    }

    // Add escalation comment
    const escalationReason = reason || 'Manually escalated by admin';
    grievance.comments.push({
      userId: req.user.id,
      comment: `🚨 ESCALATED: ${escalationReason}`,
      createdAt: new Date(),
    });

    await grievance.save();

    // Create notification for user
    if (grievance.userId) {
      await Notification.create({
        userId: grievance.userId,
        title: 'Grievance Escalated',
        message: `Your grievance "${grievance.title || grievance.trackingId}" has been escalated for priority handling.`,
        type: 'admin',
        relatedId: grievance._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Grievance escalated successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error escalating grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Error escalating grievance',
      error: error.message,
    });
  }
};

/**
 * De-escalate a grievance
 */
exports.deEscalateGrievance = async (req, res) => {
  try {
    const { grievanceId, reason } = req.body;

    if (!grievanceId) {
      return res.status(400).json({
        success: false,
        message: 'Grievance ID is required',
      });
    }

    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    if (!grievance.isEscalated) {
      return res.status(400).json({
        success: false,
        message: 'Grievance is not escalated',
      });
    }

    // Update grievance
    grievance.isEscalated = false;
    grievance.status = 'in-progress';
    grievance.deEscalatedAt = new Date();

    // Add de-escalation comment
    const deEscalationReason = reason || 'De-escalated by admin';
    grievance.comments.push({
      userId: req.user.id,
      comment: `✅ DE-ESCALATED: ${deEscalationReason}`,
      createdAt: new Date(),
    });

    await grievance.save();

    // Create notification for user
    if (grievance.userId) {
      await Notification.create({
        userId: grievance.userId,
        title: 'Grievance De-escalated',
        message: `Your grievance "${grievance.title || grievance.trackingId}" has been de-escalated and is now in progress.`,
        type: 'status_change',
        relatedId: grievance._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Grievance de-escalated successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error de-escalating grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Error de-escalating grievance',
      error: error.message,
    });
  }
};

/**
 * Get escalation statistics
 */
exports.getEscalationStats = async (req, res) => {
  try {
    const escalatedGrievances = await Grievance.find({ isEscalated: true });

    const stats = {
      total: escalatedGrievances.length,
      critical: escalatedGrievances.filter(g => g.priority === 'critical').length,
      high: escalatedGrievances.filter(g => g.priority === 'high').length,
      medium: escalatedGrievances.filter(g => g.priority === 'medium').length,
      low: escalatedGrievances.filter(g => g.priority === 'low').length,
      blocked: escalatedGrievances.filter(g => g.status === 'blocked').length,
      avgDaysOpen: escalatedGrievances.length > 0 
        ? Math.round(escalatedGrievances.reduce((sum, g) => sum + (g.daysOpen || 0), 0) / escalatedGrievances.length)
        : 0,
      maxDaysOpen: escalatedGrievances.length > 0
        ? Math.max(...escalatedGrievances.map(g => g.daysOpen || 0))
        : 0,
      byCategory: {},
    };

    // Group by category
    escalatedGrievances.forEach(g => {
      const cat = g.category || 'other';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching escalation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching escalation stats',
      error: error.message,
    });
  }
};

/**
 * Bulk escalate grievances
 */
exports.bulkEscalate = async (req, res) => {
  try {
    const { grievanceIds, reason, priority } = req.body;

    if (!grievanceIds || !Array.isArray(grievanceIds) || grievanceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid grievance IDs array is required',
      });
    }

    console.log('Bulk escalate request:', { grievanceIds, reason, priority });

    // First, find all requested grievances
    const allRequestedGrievances = await Grievance.find({
      _id: { $in: grievanceIds },
    });

    console.log('Total grievances found:', allRequestedGrievances.length);

    // Filter only non-escalated ones
    const grievances = allRequestedGrievances.filter(g => !g.isEscalated);

    console.log('Non-escalated grievances:', grievances.length);
    console.log('Already escalated:', allRequestedGrievances.length - grievances.length);

    if (grievances.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid grievances found for escalation. All selected grievances are already escalated.',
      });
    }

    const updatePromises = grievances.map(async (grievance) => {
      grievance.isEscalated = true;
      grievance.escalatedAt = new Date();
      grievance.status = 'blocked';
      
      if (priority) {
        grievance.priority = priority;
      }

      grievance.comments.push({
        userId: req.user.id,
        comment: `🚨 BULK ESCALATED: ${reason || 'Escalated by admin'}`,
        createdAt: new Date(),
      });

      await grievance.save();

      // Create notification
      if (grievance.userId) {
        await Notification.create({
          userId: grievance.userId,
          title: 'Grievance Escalated',
          message: `Your grievance "${grievance.title || grievance.trackingId}" has been escalated for priority handling.`,
          type: 'admin',
          relatedId: grievance._id,
        });
      }
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Successfully escalated ${grievances.length} grievances`,
      count: grievances.length,
    });
  } catch (error) {
    console.error('Error bulk escalating grievances:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk escalating grievances',
      error: error.message,
    });
  }
};
