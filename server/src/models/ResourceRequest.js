const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grievance',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: ['materials', 'equipment', 'manpower', 'combined'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'partially-approved', 'delivered', 'refetched'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    
    // Materials Request
    materials: [{
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      unit: {
        type: String,
        required: true,
      },
      estimatedCost: {
        type: Number,
        required: true,
        min: 0,
      },
      approvedQuantity: {
        type: Number,
        default: 0,
      },
      approvedCost: {
        type: Number,
        default: 0,
      },
      approved: {
        type: Boolean,
        default: false,
      },
    }],
    
    // Equipment Request
    equipment: [{
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      rentalDays: {
        type: Number,
        default: 1,
      },
      estimatedCost: {
        type: Number,
        required: true,
        min: 0,
      },
      approvedQuantity: {
        type: Number,
        default: 0,
      },
      approvedDays: {
        type: Number,
        default: 0,
      },
      approvedCost: {
        type: Number,
        default: 0,
      },
      approved: {
        type: Boolean,
        default: false,
      },
    }],
    
    // Manpower Request
    manpower: {
      workers: {
        type: Number,
        default: 0,
        min: 0,
      },
      skillLevel: {
        type: String,
        enum: ['unskilled', 'semi-skilled', 'skilled', 'expert'],
        default: 'unskilled',
      },
      days: {
        type: Number,
        default: 1,
        min: 1,
      },
      costPerDay: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalCost: {
        type: Number,
        default: 0,
        min: 0,
      },
      approvedWorkers: {
        type: Number,
        default: 0,
      },
      approvedDays: {
        type: Number,
        default: 0,
      },
      approvedCost: {
        type: Number,
        default: 0,
      },
      approved: {
        type: Boolean,
        default: false,
      },
    },
    
    // Total Estimates
    totalEstimatedCost: {
      type: Number,
      required: true,
      default: 0,
    },
    totalApprovedCost: {
      type: Number,
      default: 0,
    },
    
    // Request Details
    justification: {
      type: String,
      required: true,
    },
    urgencyReason: {
      type: String,
      required: false,
    },
    
    // Review Information
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reviewedAt: {
      type: Date,
      required: false,
    },
    reviewNotes: {
      type: String,
      required: false,
    },
    rejectionReason: {
      type: String,
      required: false,
    },
    
    // Attachments (estimates, quotes, photos)
    attachments: [{
      url: String,
      publicId: String,
      type: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Delivery/Completion
    deliveryStatus: {
      type: String,
      enum: ['not-started', 'in-transit', 'delivered', 'completed'],
      default: 'not-started',
    },
    deliveredAt: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    actualSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Refetch Information
    refetchedAmount: {
      type: Number,
      default: 0,
    },
    refetchMessage: {
      type: String,
    },
    refetchedAt: {
      type: Date,
    },
    refetchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total estimated cost before saving
resourceRequestSchema.pre('save', function(next) {
  let total = 0;
  
  // Add materials cost
  if (this.materials && this.materials.length > 0) {
    total += this.materials.reduce((sum, item) => sum + item.estimatedCost, 0);
  }
  
  // Add equipment cost
  if (this.equipment && this.equipment.length > 0) {
    total += this.equipment.reduce((sum, item) => sum + item.estimatedCost, 0);
  }
  
  // Add manpower cost
  if (this.manpower && this.manpower.totalCost) {
    total += this.manpower.totalCost;
  }
  
  this.totalEstimatedCost = total;
  next();
});

// Calculate total approved cost
resourceRequestSchema.methods.calculateApprovedCost = function() {
  let total = 0;
  
  // Add approved materials cost
  if (this.materials && this.materials.length > 0) {
    total += this.materials.reduce((sum, item) => sum + (item.approvedCost || 0), 0);
  }
  
  // Add approved equipment cost
  if (this.equipment && this.equipment.length > 0) {
    total += this.equipment.reduce((sum, item) => sum + (item.approvedCost || 0), 0);
  }
  
  // Add approved manpower cost
  if (this.manpower && this.manpower.approvedCost) {
    total += this.manpower.approvedCost;
  }
  
  // Round to 2 decimal places to avoid floating-point precision issues
  total = Math.round(total * 100) / 100;
  
  this.totalApprovedCost = total;
  return total;
};

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
