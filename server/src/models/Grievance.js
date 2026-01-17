const mongoose = require('mongoose');

// Function to generate unique tracking ID
const generateTrackingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRAMS-${timestamp}-${randomStr}`;
};

const grievanceSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      required: true,
      default: generateTrackingId,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['water', 'waste', 'roads', 'electric', 'administrative', 'healthcare', 'education', 'sanitation', 'other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed', 'rejected', 'blocked'],
      default: 'open',
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
      required: false,
    },
    daysOpen: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    firstAssignedAt: {
      type: Date,
      required: false,
    },
    assignedAt: {
      type: Date,
      required: false,
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    reopenedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolution: {
      type: String,
      required: false,
    },
    resolutionDate: {
      type: Date,
      required: false,
    },
    citizenRating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    budget: {
      allocated: {
        type: Number,
        default: 0,
        min: 0,
      },
      spent: {
        type: Number,
        default: 0,
        min: 0,
      },
      category: {
        type: String,
        enum: ['water', 'roads', 'electricity', 'waste', 'other'],
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      expenseDetails: [{
        item: String,
        cost: Number,
        date: {
          type: Date,
          default: Date.now,
        },
      }],
      // Budget transparency enhancements
      estimatedCost: {
        type: Number,
        default: 0,
        min: 0,
      },
      actualCost: {
        type: Number,
        default: 0,
        min: 0,
      },
      budgetApproved: {
        type: Boolean,
        default: false,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      approvedAt: {
        type: Date,
        required: false,
      },
      materialsRequired: [{
        name: String,
        quantity: Number,
        estimatedCost: Number,
        approved: {
          type: Boolean,
          default: false,
        },
      }],
      equipmentRequired: [{
        name: String,
        quantity: Number,
        estimatedCost: Number,
        approved: {
          type: Boolean,
          default: false,
        },
      }],
      manpowerRequired: {
        workers: {
          type: Number,
          default: 0,
        },
        days: {
          type: Number,
          default: 0,
        },
        costPerDay: {
          type: Number,
          default: 0,
        },
        totalCost: {
          type: Number,
          default: 0,
        },
      },
    },
    location: {
      type: String,
      required: false,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
    cancellationRequest: {
      requested: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        required: false,
      },
      requestedAt: {
        type: Date,
        required: false,
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        required: false,
      },
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
    },
    // Engineer work tracking
    workImages: [{
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
        required: false,
      },
    }],
    engineerNotes: [{
      engineerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      note: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    workStartedAt: {
      type: Date,
      required: false,
    },
    workCompletedAt: {
      type: Date,
      required: false,
    },
    resolvedAt: {
      type: Date,
      required: false,
    },
    daysToComplete: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Grievance', grievanceSchema);
