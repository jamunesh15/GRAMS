const ResourceRequest = require('../models/ResourceRequest');
const Grievance = require('../models/Grievance');
const SystemBudget = require('../models/SystemBudget');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const mailSender = require('../mail/Mailsender');
const { budgetRefetchEmail } = require('../mail/mailtemplates/budgetRefetch');

// @desc    Create resource request (Engineer)
// @route   POST /api/resource-request/create
// @access  Private/Engineer
exports.createResourceRequest = async (req, res) => {
  try {
    const {
      grievanceId,
      requestType,
      priority,
      materials,
      equipment,
      manpower,
      justification,
      urgencyReason,
      attachments,
    } = req.body;

    // Verify grievance exists
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    console.log('Grievance assignedTo:', grievance.assignedTo);
    console.log('User ID:', req.user.id);
    console.log('Comparison:', grievance.assignedTo?.toString(), '===', req.user.id);

    // Check if grievance is assigned to this engineer
    if (!grievance.assignedTo || grievance.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only request resources for grievances assigned to you',
      });
    }

    // Create resource request
    const resourceRequest = await ResourceRequest.create({
      grievanceId,
      requestedBy: req.user.id,
      requestType,
      priority: priority || 'medium',
      materials: materials || [],
      equipment: equipment || [],
      manpower: manpower || {},
      justification,
      urgencyReason,
      attachments: attachments || [],
    });

    res.status(201).json({
      success: true,
      message: 'Resource request created successfully',
      data: resourceRequest,
    });
  } catch (error) {
    console.error('Error creating resource request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resource request',
      error: error.message,
    });
  }
};

// @desc    Get all resource requests (Admin)
// @route   GET /api/resource-request/all
// @access  Private/Admin
exports.getAllResourceRequests = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const requests = await ResourceRequest.find(filter)
      .populate('grievanceId', 'trackingId title category status')
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching resource requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource requests',
      error: error.message,
    });
  }
};

// @desc    Get allocated resources with refetch info (Admin)
// @route   GET /api/resource-request/allocated
// @access  Private/Admin
exports.getAllocatedResources = async (req, res) => {
  try {
    // Get all approved/allocated requests (approved, partially-approved, delivered, refetched)
    const requests = await ResourceRequest.find({ 
      status: { $in: ['approved', 'partially-approved', 'delivered', 'refetched'] }
    })
      .populate('grievanceId', 'trackingId title category status')
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('refetchedBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate totals and add computed fields
    let totalAllocated = 0;
    let totalUsed = 0;
    let totalRemaining = 0;
    let totalRefetched = 0;

    const enrichedRequests = requests.map(request => {
      const allocatedAmount = request.totalApprovedCost || 0;
      const usedAmount = request.actualSpent || 0;
      const remainingAmount = allocatedAmount - usedAmount;
      const refetchedAmount = request.refetchedAmount || 0;
      const canRefetch = request.deliveryStatus === 'delivered' && remainingAmount > 0 && request.status !== 'refetched';

      totalAllocated += allocatedAmount;
      totalUsed += usedAmount;
      totalRemaining += remainingAmount;
      totalRefetched += refetchedAmount;

      // Build refetch history
      const refetchHistory = [];
      if (request.status === 'refetched' && request.refetchedAmount > 0) {
        refetchHistory.push({
          refetchedAmount: request.refetchedAmount,
          adminMessage: request.refetchMessage,
          refetchedAt: request.refetchedAt,
          refetchedBy: request.refetchedBy,
        });
      }

      return {
        ...request.toObject(),
        allocatedAmount,
        usedAmount,
        remainingAmount,
        totalRefetched: refetchedAmount,
        canRefetch,
        refetchHistory,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedRequests.length,
      data: enrichedRequests,
      totals: {
        totalAllocated,
        totalUsed,
        totalRemaining,
        totalRefetched,
      },
    });
  } catch (error) {
    console.error('Error fetching allocated resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocated resources',
      error: error.message,
    });
  }
};

// @desc    Get pending resource requests (Admin)
// @route   GET /api/resource-request/pending
// @access  Private/Admin
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ status: 'pending' })
      .populate('grievanceId', 'trackingId title category priority')
      .populate('requestedBy', 'name email')
      .sort({ priority: -1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests',
      error: error.message,
    });
  }
};

// @desc    Get engineer's resource requests
// @route   GET /api/resource-request/my-requests
// @access  Private/Engineer
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ requestedBy: req.user.id })
      .populate('grievanceId', 'trackingId title category status')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching my requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your requests',
      error: error.message,
    });
  }
};

// @desc    Get resource request by ID
// @route   GET /api/resource-request/:id
// @access  Private
exports.getResourceRequestById = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id)
      .populate('grievanceId', 'trackingId title description category priority status')
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Resource request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Error fetching resource request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource request',
      error: error.message,
    });
  }
};

// @desc    Approve resource request (Admin)
// @route   PUT /api/resource-request/:id/approve
// @access  Private/Admin
exports.approveResourceRequest = async (req, res) => {
  try {
    const { materials, equipment, manpower, reviewNotes } = req.body;

    const request = await ResourceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Resource request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed',
      });
    }

    // Update approved quantities and costs
    // If materials/equipment/manpower not provided, approve everything with estimated costs
    if (request.materials && request.materials.length > 0) {
      request.materials.forEach((item, index) => {
        if (materials && materials[index]) {
          item.approvedQuantity = materials[index].approvedQuantity || item.quantity;
          item.approvedCost = Math.round((materials[index].approvedCost || item.estimatedCost) * 100) / 100;
          item.approved = materials[index].approved !== false;
        } else {
          // Auto-approve with estimated values
          item.approvedQuantity = item.quantity;
          item.approvedCost = Math.round(item.estimatedCost * 100) / 100;
          item.approved = true;
        }
      });
    }

    if (request.equipment && request.equipment.length > 0) {
      request.equipment.forEach((item, index) => {
        if (equipment && equipment[index]) {
          item.approvedQuantity = equipment[index].approvedQuantity || item.quantity;
          item.approvedDays = equipment[index].approvedDays || item.rentalDays;
          item.approvedCost = Math.round((equipment[index].approvedCost || item.estimatedCost) * 100) / 100;
          item.approved = equipment[index].approved !== false;
        } else {
          // Auto-approve with estimated values
          item.approvedQuantity = item.quantity;
          item.approvedDays = item.rentalDays;
          item.approvedCost = Math.round(item.estimatedCost * 100) / 100;
          item.approved = true;
        }
      });
    }

    if (request.manpower && request.manpower.totalCost > 0) {
      if (manpower) {
        request.manpower.approvedWorkers = manpower.approvedWorkers || request.manpower.workers;
        request.manpower.approvedDays = manpower.approvedDays || request.manpower.days;
        request.manpower.approvedCost = Math.round((manpower.approvedCost || request.manpower.totalCost) * 100) / 100;
        request.manpower.approved = manpower.approved !== false;
      } else {
        // Auto-approve with estimated values
        request.manpower.approvedWorkers = request.manpower.workers;
        request.manpower.approvedDays = request.manpower.days;
        request.manpower.approvedCost = Math.round(request.manpower.totalCost * 100) / 100;
        request.manpower.approved = true;
      }
    }

    // Calculate total approved cost
    const totalApprovedCost = request.calculateApprovedCost();

    // Check budget availability
    const budget = await SystemBudget.getCurrentBudget();
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found',
      });
    }

    if (budget.operationalBudgetAvailable < totalApprovedCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient budget available',
        availableBudget: budget.operationalBudgetAvailable,
        requestedAmount: totalApprovedCost,
      });
    }

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewNotes;

    await request.save();

    // Reserve budget
    budget.operationalBudget.reserved += totalApprovedCost;
    budget.operationalBudget.pending += totalApprovedCost;
    await budget.save();

    // Update grievance budget - accumulate with existing allocated budget
    const grievance = await Grievance.findById(request.grievanceId);
    if (grievance) {
      if (!grievance.budget) {
        grievance.budget = {
          allocated: 0,
          spent: 0,
          remainingBudget: 0,
          expenseBreakdown: [],
          billImages: [],
        };
      }
      grievance.budget.allocated = Math.round(((grievance.budget.allocated || 0) + totalApprovedCost) * 100) / 100;
      grievance.budget.remainingBudget = Math.round((grievance.budget.allocated - (grievance.budget.spent || 0)) * 100) / 100;
      await grievance.save();
      console.log(`Budget allocated to grievance ${grievance.trackingId}: ₹${totalApprovedCost}, Total allocated: ₹${grievance.budget.allocated}`);
    }

    // Create notification for engineer
    await Notification.create({
      userId: request.requestedBy,
      type: 'admin',
      title: 'Resource Request Approved',
      message: `Your resource request for grievance ${request.grievanceId?.trackingId || 'N/A'} has been approved. Approved amount: ₹${totalApprovedCost.toLocaleString('en-IN')}`,
      relatedModel: 'ResourceRequest',
      relatedId: request._id,
    });

    // Create audit log
    await AuditLog.create({
      action: 'resource_request_approved',
      performedBy: req.user.id,
      targetModel: 'ResourceRequest',
      targetId: request._id,
      details: {
        requestType: request.requestType,
        priority: request.priority,
        totalApprovedCost,
        grievanceId: request.grievanceId,
      },
      metadata: {
        amount: totalApprovedCost,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resource request approved successfully',
      data: request,
    });
  } catch (error) {
    console.error('Error approving resource request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve resource request',
      error: error.message,
    });
  }
};

// @desc    Reject resource request (Admin)
// @route   PUT /api/resource-request/:id/reject
// @access  Private/Admin
exports.rejectResourceRequest = async (req, res) => {
  try {
    const { rejectionReason, reviewNotes } = req.body;

    const request = await ResourceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Resource request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed',
      });
    }

    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    request.reviewNotes = reviewNotes;

    await request.save();

    // Create notification for engineer
    await Notification.create({
      userId: request.requestedBy,
      type: 'admin',
      title: 'Resource Request Rejected',
      message: `Your resource request for grievance ${request.grievanceId?.trackingId || 'N/A'} has been rejected. Reason: ${rejectionReason || 'Not specified'}`,
      relatedModel: 'ResourceRequest',
      relatedId: request._id,
    });

    // Create audit log
    await AuditLog.create({
      action: 'resource_request_rejected',
      performedBy: req.user.id,
      targetModel: 'ResourceRequest',
      targetId: request._id,
      details: {
        requestType: request.requestType,
        priority: request.priority,
        rejectionReason,
        grievanceId: request.grievanceId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resource request rejected',
      data: request,
    });
  } catch (error) {
    console.error('Error rejecting resource request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject resource request',
      error: error.message,
    });
  }
};

// @desc    Mark resources as delivered
// @route   PUT /api/resource-request/:id/deliver
// @access  Private/Admin
exports.markAsDelivered = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Resource request not found',
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Request must be approved first',
      });
    }

    request.deliveryStatus = 'delivered';
    request.deliveredAt = new Date();

    await request.save();

    // Move from reserved to spent in budget
    const budget = await SystemBudget.getCurrentBudget();
    if (budget) {
      budget.operationalBudget.reserved -= request.totalApprovedCost;
      budget.operationalBudget.pending -= request.totalApprovedCost;
      budget.operationalBudget.spent += request.totalApprovedCost;
      await budget.save();
    }

    // NOTE: Do NOT update grievance.budget.spent here
    // The spent amount will be updated when the engineer completes the task with actual expense breakdown
    // Marking as delivered only means resources were delivered, not that they were spent
    console.log(`Resources delivered for request ${request._id}. Actual spending will be tracked when engineer completes the task.`);

    // Create notification for engineer
    await Notification.create({
      userId: request.requestedBy,
      type: 'admin',
      title: 'Resources Delivered',
      message: `Resources for grievance ${request.grievanceId?.trackingId || 'N/A'} have been delivered. Amount: ₹${request.totalApprovedCost.toLocaleString('en-IN')}`,
      relatedModel: 'ResourceRequest',
      relatedId: request._id,
    });

    // Create audit log
    await AuditLog.create({
      action: 'resource_delivered',
      performedBy: req.user.id,
      targetModel: 'ResourceRequest',
      targetId: request._id,
      details: {
        requestType: request.requestType,
        deliveryStatus: 'delivered',
        grievanceId: request.grievanceId,
      },
      metadata: {
        amount: request.totalApprovedCost,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resources marked as delivered',
      data: request,
    });
  } catch (error) {
    console.error('Error marking as delivered:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as delivered',
      error: error.message,
    });
  }
};

// @desc    Get request statistics (Admin)
// @route   GET /api/resource-request/stats
// @access  Private/Admin
exports.getRequestStats = async (req, res) => {
  try {
    const total = await ResourceRequest.countDocuments();
    const pending = await ResourceRequest.countDocuments({ status: 'pending' });
    const approved = await ResourceRequest.countDocuments({ status: 'approved' });
    const rejected = await ResourceRequest.countDocuments({ status: 'rejected' });

    const totalRequested = await ResourceRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEstimatedCost' } } },
    ]);

    const totalApproved = await ResourceRequest.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$totalApprovedCost' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        totalRequested: totalRequested[0]?.total || 0,
        totalApproved: totalApproved[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching request stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};

// @desc    Refetch remaining amount from resource request
// @route   POST /api/resource-request/:id/refetch
// @access  Private/Admin
exports.refetchRemainingAmount = async (req, res) => {
  try {
    const { refetchMessage, refetchAmount: requestedRefetchAmount } = req.body;
    const requestId = req.params.id;

    const resourceRequest = await ResourceRequest.findById(requestId)
      .populate('requestedBy', 'name email')
      .populate('grievanceId', 'trackingId budget');

    if (!resourceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Resource request not found',
      });
    }

    if (resourceRequest.deliveryStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only refetch amount from delivered requests',
      });
    }

    // Check if already refetched
    if (resourceRequest.status === 'refetched') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been refetched',
      });
    }

    // Calculate maximum refetchable amount
    const allocatedAmount = resourceRequest.totalApprovedCost || 0;
    const spentAmount = resourceRequest.actualSpent || 0;
    const maxRefetchable = allocatedAmount - spentAmount;

    if (maxRefetchable <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No remaining amount to refetch',
      });
    }

    // Use requested amount or max refetchable amount
    let remainingAmount = maxRefetchable;
    if (requestedRefetchAmount !== undefined && requestedRefetchAmount !== null) {
      const parsedAmount = parseFloat(requestedRefetchAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid refetch amount',
        });
      }
      if (parsedAmount > maxRefetchable) {
        return res.status(400).json({
          success: false,
          message: `Cannot refetch ₹${parsedAmount}. Only ₹${maxRefetchable} is available.`,
        });
      }
      remainingAmount = parsedAmount;
    }

    // Update resource request
    resourceRequest.status = 'refetched';
    resourceRequest.refetchedAmount = remainingAmount;
    resourceRequest.refetchMessage = refetchMessage;
    resourceRequest.refetchedAt = new Date();
    resourceRequest.refetchedBy = req.user.id;
    await resourceRequest.save();

    // Update grievance budget - return the remaining amount
    if (resourceRequest.grievanceId) {
      const grievance = await Grievance.findById(resourceRequest.grievanceId);
      if (grievance) {
        // Only reduce allocated amount by the remaining amount being refetched
        const currentAllocated = grievance.budget.allocated || 0;
        const newAllocated = Math.round((currentAllocated - remainingAmount) * 100) / 100;
        
        // Ensure we don't go below zero
        if (newAllocated < 0) {
          console.warn(`Warning: Refetch would make budget negative. Current: ${currentAllocated}, Refetch: ${remainingAmount}`);
          grievance.budget.allocated = 0; // Set to zero instead of negative
        } else {
          grievance.budget.allocated = newAllocated;
        }
        
        // Recalculate remaining budget with rounding
        grievance.budget.remainingBudget = Math.round((grievance.budget.allocated - (grievance.budget.spent || 0)) * 100) / 100;
        
        console.log(`Grievance ${grievance.trackingId} budget updated: Allocated ${currentAllocated} -> ${grievance.budget.allocated}, Remaining: ${grievance.budget.remainingBudget} (refetched: ${remainingAmount})`);
        await grievance.save();
      }
    }

    // Update system budget - return money to operational budget
    const systemBudget = await SystemBudget.getCurrentBudget();
    if (systemBudget) {
      // Return the refetched amount to available budget
      systemBudget.operationalBudget.spent -= remainingAmount;
      systemBudget.operationalBudget.available += remainingAmount;
      await systemBudget.save();
      console.log(`System budget updated: ₹${remainingAmount} returned to operational budget`);
    }

    // Send notification to engineer
    await Notification.create({
      userId: resourceRequest.requestedBy._id,
      title: 'Budget Refetched',
      message: `Remaining amount of ₹${remainingAmount.toLocaleString('en-IN')} has been refetched. ${refetchMessage ? 'Note: ' + refetchMessage : ''}`,
      type: 'admin',
    });

    // Send email to engineer
    try {
      await mailSender(
        resourceRequest.requestedBy.email,
        'Budget Amount Refetched - GRAMS',
        budgetRefetchEmail(
          resourceRequest.requestedBy.name,
          resourceRequest._id,
          allocatedAmount,
          spentAmount,
          remainingAmount,
          refetchMessage
        )
      );
    } catch (emailError) {
      console.error('Error sending refetch email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Amount refetched successfully',
      data: {
        refetchedAmount: remainingAmount,
        resourceRequest,
      },
    });
  } catch (error) {
    console.error('Error refetching amount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refetch amount',
      error: error.message,
    });
  }
};

module.exports = exports;
