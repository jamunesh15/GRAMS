const mongoose = require('mongoose');

const systemBudgetSchema = new mongoose.Schema(
  {
    fiscalYear: {
      type: String,
      required: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    
    // Total Budget Allocation
    totalAllocated: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Salary Budget
    salaryBudget: {
      allocated: {
        type: Number,
        required: true,
        min: 0,
      },
      spent: {
        type: Number,
        default: 0,
        min: 0,
      },
      engineers: [{
        engineerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        monthlySalary: {
          type: Number,
          required: true,
          min: 0,
        },
        joinedDate: {
          type: Date,
          required: true,
        },
        active: {
          type: Boolean,
          default: true,
        },
      }],
      processedMonths: [{
        month: {
          type: String,
          required: true,
        },
        year: {
          type: Number,
          required: true,
        },
        totalAmount: {
          type: Number,
          required: true,
        },
        processedAt: {
          type: Date,
          default: Date.now,
        },
        processedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        engineerPayments: [{
          engineerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          amount: {
            type: Number,
            required: true,
          },
        }],
      }],
    },
    
    // Operational Budget
    operationalBudget: {
      allocated: {
        type: Number,
        required: true,
        min: 0,
      },
      spent: {
        type: Number,
        default: 0,
        min: 0,
      },
      pending: {
        type: Number,
        default: 0,
        min: 0,
      },
      reserved: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    
    // Category-wise Budget Breakdown
    categoryBudgets: [{
      category: {
        type: String,
        enum: ['water', 'waste', 'roads', 'electric', 'administrative', 'healthcare', 'education', 'sanitation', 'other'],
        required: true,
      },
      allocated: {
        type: Number,
        required: true,
        min: 0,
      },
      spent: {
        type: Number,
        default: 0,
        min: 0,
      },
      pending: {
        type: Number,
        default: 0,
        min: 0,
      },
      grievanceCount: {
        type: Number,
        default: 0,
      },
    }],
    
    // Monthly Spending Tracking
    monthlySpending: [{
      month: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
      salaries: {
        type: Number,
        default: 0,
      },
      operations: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    }],
    
    // Budget Adjustments
    adjustments: [{
      amount: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ['increase', 'decrease', 'transfer'],
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      fromCategory: {
        type: String,
        required: false,
      },
      toCategory: {
        type: String,
        required: false,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      approvedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Transparency Settings
    transparency: {
      publiclyVisible: {
        type: Boolean,
        default: true,
      },
      showSalaries: {
        type: Boolean,
        default: false,
      },
      showIndividualCosts: {
        type: Boolean,
        default: true,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'draft',
    },
    
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate remaining budget
systemBudgetSchema.virtual('remainingBudget').get(function() {
  return this.totalAllocated - (this.salaryBudget.spent + this.operationalBudget.spent);
});

// Calculate total spent
systemBudgetSchema.virtual('totalSpent').get(function() {
  return this.salaryBudget.spent + this.operationalBudget.spent;
});

// Calculate salary budget remaining
systemBudgetSchema.virtual('salaryBudgetRemaining').get(function() {
  return this.salaryBudget.allocated - this.salaryBudget.spent;
});

// Calculate operational budget remaining
systemBudgetSchema.virtual('operationalBudgetRemaining').get(function() {
  return this.operationalBudget.allocated - this.operationalBudget.spent - this.operationalBudget.pending;
});

// Calculate available operational budget (excluding reserved and pending)
systemBudgetSchema.virtual('operationalBudgetAvailable').get(function() {
  return this.operationalBudget.allocated - this.operationalBudget.spent - this.operationalBudget.pending - this.operationalBudget.reserved;
});

// Ensure virtuals are included in JSON
systemBudgetSchema.set('toJSON', { virtuals: true });
systemBudgetSchema.set('toObject', { virtuals: true });

// Static method to get current active budget
systemBudgetSchema.statics.getCurrentBudget = async function() {
  return await this.findOne({ status: 'active' }).populate('salaryBudget.engineers.engineerId', 'name email');
};

// Method to update monthly spending
systemBudgetSchema.methods.updateMonthlySpending = function(month, year, salaries, operations) {
  const existing = this.monthlySpending.find(m => m.month === month && m.year === year);
  
  if (existing) {
    existing.salaries += salaries;
    existing.operations += operations;
    existing.total = existing.salaries + existing.operations;
  } else {
    this.monthlySpending.push({
      month,
      year,
      salaries,
      operations,
      total: salaries + operations,
    });
  }
};

// Method to reserve budget for pending requests
systemBudgetSchema.methods.reserveBudget = function(amount) {
  if (this.operationalBudgetAvailable < amount) {
    throw new Error('Insufficient budget available');
  }
  this.operationalBudget.reserved += amount;
};

// Method to release reserved budget
systemBudgetSchema.methods.releaseReservedBudget = function(amount) {
  this.operationalBudget.reserved = Math.max(0, this.operationalBudget.reserved - amount);
};

module.exports = mongoose.model('SystemBudget', systemBudgetSchema);
