const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'budget_created',
        'budget_activated',
        'budget_approved',
        'budget_returned',
        'category_budget_created',
        'category_budget_updated',
        'resource_request_created',
        'resource_request_approved',
        'resource_request_rejected',
        'resource_delivered',
        'engineer_salary_added',
        'engineer_salary_updated',
        'salary_processed',
        'budget_adjustment',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetModel: {
      type: String,
      enum: ['SystemBudget', 'ResourceRequest', 'Grievance', 'User'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetModel',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      fiscalYear: String,
      amount: Number,
      category: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ 'metadata.fiscalYear': 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
