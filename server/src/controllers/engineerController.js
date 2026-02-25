const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const mailSender = require('../mail/Mailsender');
const { engineerWelcomeEmail } = require('../mail/mailtemplates/engineerWelcome');
const { profileUpdatedEmail } = require('../mail/mailtemplates/profileUpdated');
const { taskAssignmentEmail } = require('../mail/mailtemplates/taskAssignment');
const { taskAcceptedAdminEmail, taskAcceptedUserEmail } = require('../mail/mailtemplates/taskAccepted');
const { taskCompletedAdminEmail, taskCompletedUserEmail } = require('../mail/mailtemplates/taskCompleted');

// Generate unique engineer ID
const generateEngineerId = () => {
  const prefix = 'ENG';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

// Create new engineer (Admin only)
exports.createEngineer = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, department } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Engineer with this email already exists',
      });
    }

    // Generate unique engineer ID
    let engineerId = generateEngineerId();
    let idExists = await User.findOne({ engineerId });
    
    // Ensure unique ID
    while (idExists) {
      engineerId = generateEngineerId();
      idExists = await User.findOne({ engineerId });
    }

    // Create engineer
    const engineer = await User.create({
      name,
      email,
      password,
      phone,
      role: 'engineer',
      engineerId,
      specialization: specialization || 'General',
      department,
      isActive: true,
    });

    // Remove password from response
    const engineerData = engineer.toObject();
    delete engineerData.password;

    // Send notification to engineer
    await Notification.create({
      userId: engineer._id,
      title: 'Welcome to GRAMS',
      message: `You have been registered as an engineer. Your Engineer ID is ${engineerId}`,
      type: 'admin',
      priority: 'high',
    });

    // Send email with credentials
    try {
      await mailSender(
        email,
        'Welcome to GRAMS - Your Engineer Account Details',
        engineerWelcomeEmail(name, engineerId, email, password, specialization)
      );
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Engineer created successfully',
      data: engineerData,
    });
  } catch (error) {
    console.error('Error creating engineer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating engineer',
      error: error.message,
    });
  }
};

// Get all engineers (Admin only)
exports.getAllEngineers = async (req, res) => {
  try {
    const { status, specialization } = req.query;
    let query = { role: 'engineer' };

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (specialization) {
      query.specialization = specialization;
    }

    const engineers = await User.find(query)
      .select('-password')
      .populate('assignedGrievances', 'trackingId title status priority')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: engineers.length,
      data: engineers,
    });
  } catch (error) {
    console.error('Error fetching engineers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching engineers',
      error: error.message,
    });
  }
};

// Get engineer by ID (Admin only)
exports.getEngineerById = async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await User.findById(id)
      .select('-password')
      .populate('assignedGrievances', 'trackingId title status priority category createdAt');

    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: engineer,
    });
  } catch (error) {
    console.error('Error fetching engineer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching engineer',
      error: error.message,
    });
  }
};

// Update engineer (Admin only)
exports.updateEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, department, isActive } = req.body;

    const engineer = await User.findById(id);

    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found',
      });
    }

    // Check if email is being changed and if it's already taken by another user
    if (email && email !== engineer.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another user',
        });
      }
      engineer.email = email;
    }

    // Update other fields
    if (name) engineer.name = name;
    if (phone) engineer.phone = phone;
    if (specialization) engineer.specialization = specialization;
    if (department) engineer.department = department;
    if (typeof isActive === 'boolean') engineer.isActive = isActive;

    await engineer.save();

    const updatedEngineer = engineer.toObject();
    delete updatedEngineer.password;

    // Send email notification about profile update
    try {
      await mailSender(
        engineer.email, 
        'Profile Updated - GRAMS', 
        profileUpdatedEmail(engineer.name, { specialization, department, phone, email, isActive })
      );
    } catch (emailError) {
      console.error('Error sending update email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Engineer updated successfully',
      data: updatedEngineer,
    });
  } catch (error) {
    console.error('Error updating engineer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating engineer',
      error: error.message,
    });
  }
};

// Delete engineer (Admin only)
exports.deleteEngineer = async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await User.findById(id);

    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found',
      });
    }

    // Unassign all grievances
    if (engineer.assignedGrievances.length > 0) {
      await Grievance.updateMany(
        { _id: { $in: engineer.assignedGrievances } },
        { $unset: { assignedTo: 1 } }
      );
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Engineer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting engineer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting engineer',
      error: error.message,
    });
  }
};

// Assign grievance to engineer (Admin only)
exports.assignGrievance = async (req, res) => {
  try {
    const { engineerId, grievanceId, instructions } = req.body;

    if (!engineerId || !grievanceId) {
      return res.status(400).json({
        success: false,
        message: 'Engineer ID and Grievance ID are required',
      });
    }

    // Find engineer
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found',
      });
    }

    // Find grievance
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // If already assigned to someone, remove from their list
    if (grievance.assignedTo) {
      const previousEngineer = await User.findById(grievance.assignedTo);
      if (previousEngineer) {
        previousEngineer.assignedGrievances.pull(grievanceId);
        previousEngineer.activeTasks = Math.max(0, previousEngineer.activeTasks - 1);
        await previousEngineer.save();
      }
    }

    // Assign to new engineer
    grievance.assignedTo = engineerId;
    grievance.status = 'in-progress';
    
    // Add assignment comment
    const assignmentMessage = instructions 
      ? `Assigned to ${engineer.name}. Instructions: ${instructions}`
      : `Assigned to ${engineer.name}`;
    
    grievance.comments.push({
      userId: req.user.id,
      comment: `👷 ${assignmentMessage}`,
      createdAt: new Date(),
    });

    await grievance.save();

    // Update engineer's assigned grievances
    if (!engineer.assignedGrievances.includes(grievanceId)) {
      engineer.assignedGrievances.push(grievanceId);
      engineer.activeTasks += 1;
      await engineer.save();
    }

    // Notify engineer
    await Notification.create({
      userId: engineerId,
      title: 'New Task Assigned',
      message: `You have been assigned a new grievance: ${grievance.trackingId}${instructions ? '. ' + instructions : ''}`,
      type: 'admin',
      grievanceId: grievanceId,
      priority: 'high',
    });

    // Notify user
    if (grievance.userId) {
      await Notification.create({
        userId: grievance.userId,
        title: 'Engineer Assigned',
        message: `Engineer ${engineer.name} has been assigned to your grievance (${grievance.trackingId})`,
        type: 'status_change',
        grievanceId: grievanceId,
      });
    }

    // Send email to engineer about task assignment
    try {
      await mailSender(
        engineer.email, 
        `New Task Assignment - ${grievance.trackingId}`, 
        taskAssignmentEmail(engineer.name, grievance, instructions)
      );
    } catch (emailError) {
      console.error('Error sending assignment email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Grievance assigned successfully',
      data: {
        grievance,
        engineer: {
          id: engineer._id,
          name: engineer.name,
          engineerId: engineer.engineerId,
        },
      },
    });
  } catch (error) {
    console.error('Error assigning grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning grievance',
      error: error.message,
    });
  }
};

// Unassign grievance from engineer (Admin only)
exports.unassignGrievance = async (req, res) => {
  try {
    const { grievanceId } = req.body;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    if (!grievance.assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Grievance is not assigned to any engineer',
      });
    }

    // Remove from engineer's list
    const engineer = await User.findById(grievance.assignedTo);
    if (engineer) {
      engineer.assignedGrievances.pull(grievanceId);
      engineer.activeTasks = Math.max(0, engineer.activeTasks - 1);
      await engineer.save();

      // Notify engineer
      await Notification.create({
        userId: engineer._id,
        title: 'Task Unassigned',
        message: `Grievance ${grievance.trackingId} has been unassigned from you`,
        type: 'admin',
        grievanceId: grievanceId,
      });
    }

    grievance.assignedTo = null;
    grievance.status = 'open';
    grievance.comments.push({
      userId: req.user.id,
      comment: '🔄 Unassigned from engineer',
      createdAt: new Date(),
    });

    await grievance.save();

    res.status(200).json({
      success: true,
      message: 'Grievance unassigned successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error unassigning grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Error unassigning grievance',
      error: error.message,
    });
  }
};

// Send message to engineer (Admin only)
exports.sendMessageToEngineer = async (req, res) => {
  try {
    const { engineerId, message, priority } = req.body;

    if (!engineerId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Engineer ID and message are required',
      });
    }

    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found',
      });
    }

    // Create notification
    await Notification.create({
      userId: engineerId,
      title: 'Message from Admin',
      message: message,
      type: 'admin',
      priority: priority || 'medium',
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Get engineer statistics (Admin only)
exports.getEngineerStats = async (req, res) => {
  try {
    const totalEngineers = await User.countDocuments({ role: 'engineer' });
    const activeEngineers = await User.countDocuments({ role: 'engineer', isActive: true });
    const inactiveEngineers = totalEngineers - activeEngineers;

    // Get total tasks assigned - Calculate from actual grievances to ensure accuracy
    const totalTasksAssigned = await Grievance.countDocuments({ 
      assignedTo: { $exists: true, $ne: null },
      status: { $in: ['in-progress', 'pending'] }
    });
    
    const engineers = await User.find({ role: 'engineer' });
    const totalTasksCompleted = engineers.reduce((sum, eng) => sum + (eng.completedTasks || 0), 0);

    // Get specialization breakdown
    const specializationBreakdown = await User.aggregate([
      { $match: { role: 'engineer' } },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEngineers,
        activeEngineers,
        inactiveEngineers,
        totalTasksAssigned,
        totalTasksCompleted,
        specializationBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching engineer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching engineer statistics',
      error: error.message,
    });
  }
};

// Get assigned grievances for logged-in engineer
exports.getMyAssignedGrievances = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { status, priority } = req.query;

    let query = { assignedTo: engineerId };

    // Filter by status if provided
    if (status) {
      // If asking for 'resolved', include both 'resolved' and 'closed'
      if (status === 'resolved') {
        query.status = { $in: ['resolved', 'closed'] };
      } else if (status === 'all') {
        // Don't add status filter - get ALL tasks
        // query.status is not set, so all statuses will be included
      } else {
        query.status = status;
      }
    } else {
      // By default, don't show resolved/closed
      query.status = { $nin: ['resolved', 'closed'] };
    }

    // Filter by priority if provided
    if (priority) {
      query.priority = priority;
    }

    const grievances = await Grievance.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email engineerId')
      .sort({ priority: -1, createdAt: -1 });

    console.log('Fetched grievances with budgets:', grievances.map(g => ({ 
      id: g._id, 
      trackingId: g.trackingId, 
      budget: g.budget 
    })));

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances,
    });
  } catch (error) {
    console.error('Error fetching assigned grievances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned grievances',
      error: error.message,
    });
  }
};

// Get engineer dashboard stats
exports.getEngineerDashboardStats = async (req, res) => {
  try {
    const engineerId = req.user.id;

    // Get all grievances assigned to engineer
    const totalAssigned = await Grievance.countDocuments({ assignedTo: engineerId });
    const pending = await Grievance.countDocuments({ assignedTo: engineerId, status: 'pending' });
    const assigned = await Grievance.countDocuments({ assignedTo: engineerId, status: 'assigned' });
    const inProgress = await Grievance.countDocuments({ assignedTo: engineerId, status: 'in-progress' });
    const completed = await Grievance.countDocuments({ assignedTo: engineerId, status: { $in: ['resolved', 'closed'] } });
    const urgent = await Grievance.countDocuments({ assignedTo: engineerId, priority: 'urgent', status: { $nin: ['resolved', 'closed'] } });

    res.status(200).json({
      success: true,
      data: {
        totalAssigned,
        pending,
        assigned,
        inProgress,
        completed,
        urgent,
      },
    });
  } catch (error) {
    console.error('Error fetching engineer dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

// Get grievance details
exports.getGrievanceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const engineerId = req.user.id;

    const grievance = await Grievance.findOne({ _id: id, assignedTo: engineerId })
      .select('+budget')
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email engineerId');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found or not assigned to you',
      });
    }

    res.status(200).json({
      success: true,
      data: grievance,
    });
  } catch (error) {
    console.error('Error fetching grievance details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grievance details',
      error: error.message,
    });
  }
};

// Start work on grievance
exports.startWork = async (req, res) => {
  try {
    const { grievanceId } = req.body;
    const engineerId = req.user.id;

    const grievance = await Grievance.findOne({ _id: grievanceId, assignedTo: engineerId })
      .populate('userId', 'name email phone');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found or not assigned to you',
      });
    }

    // Get engineer details
    const engineer = await User.findById(engineerId);

    grievance.status = 'in-progress';
    grievance.startedAt = new Date();
    await grievance.save();

    // Send email notifications
    // Send email notifications
    try {
      // Engineer details object
      const engineerDetails = {
        name: engineer.name,
        email: engineer.email,
        engineerId: engineer.engineerId,
        phone: engineer.phone,
      };

      // 1. Email to Admin - task accepted with IN PROGRESS status
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await mailSender(
          admin.email,
          `Task In Progress - ${grievance.trackingId}`,
          taskAcceptedAdminEmail(admin.name, engineer.name, grievance, engineerDetails)
        );
      }

      // 2. Email to Citizen - engineer details with IN PROGRESS status
      if (grievance.userId && grievance.userId.email) {
        await mailSender(
          grievance.userId.email,
          `Engineer Assigned to Your Grievance - ${grievance.trackingId}`,
          taskAcceptedUserEmail(grievance.userId.name, engineerDetails, grievance)
        );
      }
    } catch (emailError) {
      console.error('Error sending task accepted emails:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Work started successfully',
      data: grievance,
    });
  } catch (error) {
    console.error('Error starting work:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting work',
      error: error.message,
    });
  }
};

// Upload to Cloudinary
exports.uploadToCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferExists: !!req.file.buffer
    });

    const cloudinary = require('cloudinary').v2;
    
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });
    
    // Upload from buffer using upload_stream
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'grams/task-completion',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', {
                message: error.message,
                name: error.name,
                http_code: error.http_code,
                error: error
              });
              reject(error);
            } else {
              console.log('Cloudinary upload success:', {
                public_id: result.public_id,
                secure_url: result.secure_url
              });
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const result = await uploadStream();

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
};

// Complete task
exports.completeTask = async (req, res) => {
  try {
    const { 
      grievanceId, 
      completionNotes, 
      beforeImages, 
      afterImages,
      completionImageUrl,
      billImageUrls,
      expenseBreakdown,
      totalSpent,
      daysToComplete
    } = req.body;
    const engineerId = req.user.id;

    const grievance = await Grievance.findOne({ _id: grievanceId, assignedTo: engineerId });

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found or not assigned to you',
      });
    }

    // Update grievance status and completion details
    const completionDate = new Date();
    grievance.status = 'resolved';
    grievance.completionNotes = completionNotes;
    grievance.beforeImages = beforeImages || [];
    grievance.afterImages = afterImages || [];
    grievance.completedAt = completionDate;
    grievance.workCompletedAt = completionDate;
    grievance.resolutionDate = completionDate;
    grievance.resolvedAt = completionDate; // For frontend compatibility
    
    // Set days to complete if provided
    if (daysToComplete) {
      grievance.daysToComplete = parseInt(daysToComplete);
    } else if (grievance.assignedAt) {
      // Calculate days taken if not provided
      const daysTaken = Math.ceil((completionDate - new Date(grievance.assignedAt)) / (1000 * 60 * 60 * 24));
      grievance.daysToComplete = daysTaken;
    }
    
    // Update budget with expense details if provided
    if (expenseBreakdown && expenseBreakdown.length > 0) {
      if (!grievance.budget) {
        grievance.budget = {
          allocated: 0,
          spent: 0,
          remainingBudget: 0,
          expenseBreakdown: [],
          billImages: [],
        };
      }
      
      const spentAmount = Math.round((parseFloat(totalSpent) || 0) * 100) / 100;
      const allocatedAmount = grievance.budget.allocated || 0;
      
      // Validate: Engineer cannot spend more than allocated budget
      if (spentAmount > allocatedAmount && allocatedAmount > 0) {
        return res.status(400).json({
          success: false,
          message: `Budget exceeded! You cannot spend more than allocated budget. Allocated: ₹${allocatedAmount.toLocaleString()}, Attempted: ₹${spentAmount.toLocaleString()}`,
          allocatedBudget: allocatedAmount,
          attemptedSpend: spentAmount,
          maxAllowed: allocatedAmount,
        });
      }
      
      grievance.budget.expenseBreakdown = expenseBreakdown;
      grievance.budget.totalSpent = spentAmount;
      grievance.budget.spent = spentAmount;
      
      if (billImageUrls && billImageUrls.length > 0) {
        grievance.budget.billImages = billImageUrls;
      }
      
      // Calculate remaining budget with rounding to prevent floating point errors
      grievance.budget.remainingBudget = Math.round((allocatedAmount - spentAmount) * 100) / 100;
      
      console.log(`Grievance ${grievance.trackingId} budget updated after task completion:`);
      console.log(`  Allocated: ₹${allocatedAmount}, Spent: ₹${spentAmount}, Remaining: ₹${grievance.budget.remainingBudget}`);
      console.log(`Task completed by engineer ${engineerId} on ${completionDate.toISOString()} | Days taken: ${grievance.daysToComplete || 'N/A'}`);
      
      // Update ALL related resource requests' actualSpent
      const ResourceRequest = require('../models/ResourceRequest');
      const resourceRequests = await ResourceRequest.find({
        grievanceId: grievance._id,
        status: { $in: ['approved', 'delivered'] }
      });
      
      console.log(`Found ${resourceRequests.length} resource requests for grievance ${grievance.trackingId}`);
      
      for (const resourceRequest of resourceRequests) {
        resourceRequest.actualSpent = grievance.budget.spent;
        await resourceRequest.save();
        console.log(`✓ Resource request ${resourceRequest._id} (${resourceRequest.status}) updated with actualSpent: ₹${resourceRequest.actualSpent}`);
      }
      
      if (resourceRequests.length === 0) {
        console.warn(`⚠️ WARNING: No resource requests found for grievance ${grievance.trackingId} (${grievance._id})`);
      }
    }
    
    await grievance.save();

    // Get engineer details for email
    const engineer = await User.findById(engineerId);

    // Update engineer's completed tasks count
    await User.findByIdAndUpdate(engineerId, { $inc: { completedTasks: 1, activeTasks: -1 } });

    // Populate user details for email
    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('userId', 'name email phone');

    // Create notification for user
    await Notification.create({
      userId: grievance.userId,
      title: 'Grievance Resolved',
      message: `Your grievance "${grievance.description.substring(0, 50)}..." has been resolved.`,
      type: 'status_change',
      grievanceId: grievance._id,
    });

    // Send email notifications for task completion
    try {
      const completionDetails = {
        completionNotes,
        daysToComplete: grievance.daysToComplete,
      };

      // 1. Email to Admin - task completed
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await mailSender(
          admin.email,
          `Task Completed - ${grievance.trackingId}`,
          taskCompletedAdminEmail(admin.name, engineer.name, grievance, completionDetails)
        );
      }

      // 2. Email to Citizen - grievance resolved
      if (populatedGrievance.userId && populatedGrievance.userId.email) {
        await mailSender(
          populatedGrievance.userId.email,
          `Your Grievance is Resolved - ${grievance.trackingId}`,
          taskCompletedUserEmail(populatedGrievance.userId.name, grievance, engineer.name, completionDetails)
        );
      }
    } catch (emailError) {
      console.error('Error sending task completion emails:', emailError);
      // Don't fail the request if email fails
    }

    // Prepare response with budget information
    const responseData = {
      success: true,
      message: 'Task completed successfully',
      data: grievance,
    };
    
    // Include remaining budget info if budget was allocated
    if (grievance.budget && grievance.budget.allocated > 0) {
      responseData.budgetInfo = {
        allocated: grievance.budget.allocated,
        spent: grievance.budget.spent,
        remaining: grievance.budget.remainingBudget,
        message: grievance.budget.remainingBudget > 0 
          ? `Great job! You saved ₹${grievance.budget.remainingBudget.toLocaleString()} from the allocated budget.`
          : 'Budget fully utilized.'
      };
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing task',
      error: error.message,
    });
  }
};

// Submit support request
exports.submitSupportRequest = async (req, res) => {
  try {
    const { grievanceId, requestType, message, subject, priorityLevel } = req.body;
    const engineerId = req.user.id;

    let grievance = null;
    let grievanceInfo = 'general support';

    // If grievanceId is provided, verify it exists
    if (grievanceId) {
      grievance = await Grievance.findOne({ _id: grievanceId, assignedTo: engineerId });
      
      if (!grievance) {
        return res.status(404).json({
          success: false,
          message: 'Grievance not found or not assigned to you',
        });
      }
      grievanceInfo = `grievance ${grievance.trackingId}`;
    }

    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: subject || 'Support Request',
        message: message || `Engineer needs ${requestType || 'assistance'} support for ${grievanceInfo}`,
        type: 'admin',
        grievanceId: grievance ? grievance._id : null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support request submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting support request:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting support request',
      error: error.message,
    });
  }
};
