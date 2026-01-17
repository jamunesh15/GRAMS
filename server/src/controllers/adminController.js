const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const SystemBudget = require('../models/SystemBudget');
const AuditLog = require('../models/AuditLog');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGrievances = await Grievance.countDocuments();
    // Count both 'resolved' (pending admin review) and 'closed' (confirmed) as resolved
    const resolvedGrievances = await Grievance.countDocuments({ 
      status: { $in: ['resolved', 'closed'] } 
    });
    const openGrievances = await Grievance.countDocuments({ status: 'open' });

    const grievancesByCategory = await Grievance.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const grievancesByStatus = await Grievance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalGrievances,
        resolvedGrievances,
        openGrievances,
        grievancesByCategory,
        grievancesByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all grievances (admin)
exports.getAllGrievancesAdmin = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const grievances = await Grievance.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign grievance
exports.assignGrievance = async (req, res) => {
  try {
    const { grievanceId, userId, budget } = req.body;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // If budget is being allocated, check and deduct from system budget
    if (budget && parseFloat(budget) > 0) {
      const budgetAmount = parseFloat(budget);
      
      // Get current system budget
      const systemBudget = await SystemBudget.getCurrentBudget();
      if (!systemBudget) {
        return res.status(400).json({
          success: false,
          message: 'No active system budget found. Please create and activate a budget first.',
        });
      }

      // Check if sufficient budget is available
      const availableBudget = systemBudget.operationalBudgetAvailable;
      if (availableBudget < budgetAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient budget available. Available: ₹${availableBudget.toLocaleString()}, Requested: ₹${budgetAmount.toLocaleString()}`,
          availableBudget,
          requestedBudget: budgetAmount,
        });
      }

      // Deduct from available budget by adding to pending
      systemBudget.operationalBudget.pending += budgetAmount;
      
      // Update category-wise budget if category exists
      if (grievance.category) {
        const categoryBudget = systemBudget.categoryBudgets.find(
          cb => cb.category === grievance.category
        );
        if (categoryBudget) {
          categoryBudget.pending += budgetAmount;
          categoryBudget.grievanceCount += 1;
        }
      }
      
      await systemBudget.save();
      
      console.log(`✓ Deducted ₹${budgetAmount} from available budget. Remaining available: ₹${systemBudget.operationalBudgetAvailable}`);
    }

    const now = new Date();
    grievance.assignedTo = userId;
    grievance.status = 'in-progress';
    grievance.assignedAt = now;
    if (!grievance.firstAssignedAt) {
      grievance.firstAssignedAt = now;
    }

    // Allocate budget if provided
    if (budget && parseFloat(budget) > 0) {
      const budgetAmount = parseFloat(budget);
      
      // Initialize budget if it doesn't exist
      if (!grievance.budget) {
        grievance.budget = {};
      }
      
      // Update budget fields
      grievance.budget.allocated = budgetAmount;
      grievance.budget.remainingBudget = budgetAmount;
      grievance.budget.spent = grievance.budget.spent || 0;
      grievance.budget.totalSpent = grievance.budget.totalSpent || 0;
      grievance.budget.estimatedCost = grievance.budget.estimatedCost || 0;
      grievance.budget.actualCost = grievance.budget.actualCost || 0;
      grievance.budget.budgetApproved = grievance.budget.budgetApproved || false;
      grievance.budget.expenseBreakdown = grievance.budget.expenseBreakdown || [];
      grievance.budget.billImages = grievance.budget.billImages || [];
      grievance.budget.materialsRequired = grievance.budget.materialsRequired || [];
      grievance.budget.equipmentRequired = grievance.budget.equipmentRequired || [];
      
      // Ensure manpowerRequired is an object, not undefined
      if (!grievance.budget.manpowerRequired) {
        grievance.budget.manpowerRequired = {
          workers: 0,
          days: 0,
          costPerDay: 0,
          totalCost: 0,
        };
      }
      
      grievance.markModified('budget');
      console.log('Budget set:', grievance.budget);
    }

    await grievance.save();
    
    // Create a resource request for budget allocation AFTER saving grievance
    // This allows the admin to refetch unused budget later
    if (budget && parseFloat(budget) > 0) {
      const budgetAmount = parseFloat(budget);
      const ResourceRequest = require('../models/ResourceRequest');
      try {
        const resourceRequest = await ResourceRequest.create({
          grievanceId: grievanceId,
          requestedBy: userId,
          requestType: 'combined',
          status: 'approved',
          deliveryStatus: 'delivered',
          priority: 'medium',
          justification: 'Budget allocated during task assignment by admin',
          totalEstimatedCost: budgetAmount,
          totalApprovedCost: budgetAmount,
          actualSpent: 0,
          reviewedBy: req.user.id,
          reviewedAt: now,
          deliveredAt: now,
          approvedAt: now,
          materials: [],
          equipment: [],
          manpower: {
            workers: 1,
            days: 1,
            costPerDay: budgetAmount,
            totalCost: budgetAmount,
          },
        });
        console.log(`✓✓✓ CREATED RESOURCE REQUEST ${resourceRequest._id} for budget ₹${budgetAmount} - Tracking: ${grievance.trackingId}`);
      } catch (error) {
        console.error('❌ ERROR creating resource request:', error.message);
        console.error('Full error:', error);
      }
    }
    console.log('Saved grievance budget:', grievance.budget);

    // Notify the assigned engineer
    const notificationMessage = budget && parseFloat(budget) > 0
      ? `You have been assigned a new grievance: ${grievance.title} (${grievance.trackingId}) with budget ₹${parseFloat(budget).toLocaleString()}`
      : `You have been assigned a new grievance: ${grievance.title} (${grievance.trackingId})`;

    await Notification.create({
      userId: userId,
      title: 'New Task Assigned',
      message: notificationMessage,
      type: 'admin',
      grievanceId: grievanceId,
      priority: grievance.priority === 'high' ? 'high' : 'medium',
    });

    res.status(200).json({
      success: true,
      data: grievance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update grievance status
exports.updateGrievanceStatus = async (req, res) => {
  try {
    const { grievanceId, status, priority } = req.body;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    if (status) grievance.status = status;
    if (priority) grievance.priority = priority;

    await grievance.save();

    res.status(200).json({
      success: true,
      data: grievance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all engineers
exports.getEngineers = async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer' }).select('-password').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: engineers.length,
      data: engineers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get completed tasks for admin review
exports.getCompletedTasks = async (req, res) => {
  try {
    const completedTasks = await Grievance.find({ status: 'resolved' })
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email engineerId')
      .sort({ workCompletedAt: -1 });

    res.status(200).json({
      success: true,
      count: completedTasks.length,
      data: completedTasks,
    });
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching completed tasks',
      error: error.message 
    });
  }
};

// Confirm completed task
exports.confirmCompletedTask = async (req, res) => {
  try {
    const { grievanceId, status, adminNotes } = req.body;

    const grievance = await Grievance.findById(grievanceId).populate('assignedTo', 'name email');
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Check if there's remaining budget to return to system budget
    if (grievance.budget && grievance.budget.allocated > 0) {
      const allocatedAmount = grievance.budget.allocated || 0;
      const spentAmount = grievance.budget.spent || 0;
      const remainingBudget = allocatedAmount - spentAmount;
      
      // Get system budget to return unused funds
      const systemBudget = await SystemBudget.getCurrentBudget();
      if (systemBudget && remainingBudget > 0) {
        // Return remaining budget: reduce pending, which increases available
        systemBudget.operationalBudget.pending = Math.max(0, systemBudget.operationalBudget.pending - remainingBudget);
        
        // Add spent amount to actual spent
        systemBudget.operationalBudget.spent += spentAmount;
        
        // Also reduce pending from allocated (move from pending to spent)
        systemBudget.operationalBudget.pending = Math.max(0, systemBudget.operationalBudget.pending - spentAmount);
        
        // Update category-wise budget
        if (grievance.category) {
          const categoryBudget = systemBudget.categoryBudgets.find(
            cb => cb.category === grievance.category
          );
          if (categoryBudget) {
            // Reduce pending and add to spent
            categoryBudget.pending = Math.max(0, categoryBudget.pending - allocatedAmount);
            categoryBudget.spent += spentAmount;
          }
        }
        
        await systemBudget.save();
        
        console.log(`✓ Budget reconciliation for ${grievance.trackingId}:`);
        console.log(`  Allocated: ₹${allocatedAmount}, Spent: ₹${spentAmount}, Returned: ₹${remainingBudget}`);
        console.log(`  System budget updated. New available: ₹${systemBudget.operationalBudgetAvailable}`);
        
        // Create audit log for budget return
        if (remainingBudget > 0) {
          await AuditLog.create({
            action: 'budget_returned',
            performedBy: req.user.id,
            targetModel: 'Grievance',
            targetId: grievance._id,
            details: {
              trackingId: grievance.trackingId,
              allocatedAmount,
              spentAmount,
              returnedAmount: remainingBudget,
            },
            metadata: {
              amount: remainingBudget,
              category: grievance.category,
            },
          });
        }
      }
    }

    // Update grievance status
    grievance.status = status || 'closed';
    grievance.adminNotes = adminNotes;
    await grievance.save();

    // Send confirmation email to engineer
    if (grievance.assignedTo && grievance.assignedTo.email) {
      try {
        const taskConfirmationTemplate = require('../mail/mailtemplates/taskConfirmation');
        const mailSender = require('../mail/Mailsender');
        const emailBody = taskConfirmationTemplate(
          grievance.assignedTo.name,
          grievance.trackingId,
          grievance.title,
          status || 'closed',
          adminNotes
        );
        await mailSender(
          grievance.assignedTo.email,
          'Task Confirmed - GRAMS',
          emailBody
        );
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task confirmed successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error confirming task:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming task',
      error: error.message,
    });
  }
};

// Confirm all completed tasks
exports.confirmAllCompletedTasks = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    // Find all tasks with status 'resolved' (completed by engineer, pending admin review)
    const pendingTasks = await Grievance.find({ status: 'resolved' }).populate('assignedTo', 'name email');

    if (pendingTasks.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending tasks to confirm',
        data: {
          confirmed: 0,
          totalBudgetReturned: 0,
          totalBudgetSpent: 0,
        },
      });
    }

    const systemBudget = await SystemBudget.getCurrentBudget();
    let totalBudgetReturned = 0;
    let totalBudgetSpent = 0;
    const confirmedTasks = [];
    const errors = [];

    // Process each task
    for (const grievance of pendingTasks) {
      try {
        // Handle budget reconciliation
        if (grievance.budget && grievance.budget.allocated > 0 && systemBudget) {
          const allocatedAmount = grievance.budget.allocated || 0;
          const spentAmount = grievance.budget.spent || 0;
          const remainingBudget = allocatedAmount - spentAmount;

          if (remainingBudget > 0) {
            systemBudget.operationalBudget.pending = Math.max(0, systemBudget.operationalBudget.pending - remainingBudget);
            totalBudgetReturned += remainingBudget;
          }
          
          systemBudget.operationalBudget.spent += spentAmount;
          systemBudget.operationalBudget.pending = Math.max(0, systemBudget.operationalBudget.pending - spentAmount);
          totalBudgetSpent += spentAmount;

          // Update category budget
          if (grievance.category) {
            const categoryBudget = systemBudget.categoryBudgets.find(
              cb => cb.category === grievance.category
            );
            if (categoryBudget) {
              categoryBudget.pending = Math.max(0, categoryBudget.pending - allocatedAmount);
              categoryBudget.spent += spentAmount;
            }
          }

          // Create audit log
          if (remainingBudget > 0) {
            await AuditLog.create({
              action: 'budget_returned',
              performedBy: req.user.id,
              targetModel: 'Grievance',
              targetId: grievance._id,
              details: {
                trackingId: grievance.trackingId,
                allocatedAmount,
                spentAmount,
                returnedAmount: remainingBudget,
                bulkConfirm: true,
              },
              metadata: {
                amount: remainingBudget,
                category: grievance.category,
              },
            });
          }
        }

        // Update task status
        grievance.status = 'closed';
        grievance.adminNotes = adminNotes || 'Bulk confirmed by admin';
        await grievance.save();

        confirmedTasks.push(grievance._id);

        // Send confirmation email to engineer
        if (grievance.assignedTo && grievance.assignedTo.email) {
          try {
            const taskConfirmationTemplate = require('../mail/mailtemplates/taskConfirmation');
            const mailSender = require('../mail/Mailsender');
            const emailBody = taskConfirmationTemplate(
              grievance.assignedTo.name,
              grievance.trackingId,
              grievance.title,
              'closed',
              adminNotes || 'Your task has been reviewed and confirmed. Thank you for your excellent work!'
            );
            await mailSender(
              grievance.assignedTo.email,
              'Task Confirmed - GRAMS',
              emailBody
            );
          } catch (emailError) {
            console.error(`Error sending email for ${grievance.trackingId}:`, emailError.message);
          }
        }
      } catch (taskError) {
        console.error(`Error processing task ${grievance.trackingId}:`, taskError);
        errors.push({
          trackingId: grievance.trackingId,
          error: taskError.message,
        });
      }
    }

    // Save system budget once after all updates
    if (systemBudget) {
      await systemBudget.save();
    }

    console.log(`✓✓✓ Bulk Confirmation Complete:`);
    console.log(`  Tasks Confirmed: ${confirmedTasks.length}/${pendingTasks.length}`);
    console.log(`  Total Budget Spent: ₹${totalBudgetSpent.toLocaleString()}`);
    console.log(`  Total Budget Returned: ₹${totalBudgetReturned.toLocaleString()}`);
    if (systemBudget) {
      console.log(`  New Available Budget: ₹${systemBudget.operationalBudgetAvailable.toLocaleString()}`);
    }

    res.status(200).json({
      success: true,
      message: `Successfully confirmed ${confirmedTasks.length} tasks`,
      data: {
        confirmed: confirmedTasks.length,
        total: pendingTasks.length,
        totalBudgetReturned,
        totalBudgetSpent,
        availableBudget: systemBudget ? systemBudget.operationalBudgetAvailable : 0,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Error confirming all tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming all tasks',
      error: error.message,
    });
  }
};
