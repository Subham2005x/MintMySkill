const mongoose = require('mongoose');

const tokenTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  type: {
    type: String,
    enum: ['reward', 'redemption', 'transfer', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'completed_offchain'],
    default: 'pending'
  },
  
  // Blockchain transaction details
  transactionHash: {
    type: String,
    default: null
  },
  blockNumber: {
    type: Number,
    default: null
  },
  gasUsed: {
    type: String,
    default: null
  },
  
  // Error handling
  errorMessage: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  
  // Additional data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tokenTransactionSchema.index({ user: 1, createdAt: -1 });
tokenTransactionSchema.index({ course: 1 });
tokenTransactionSchema.index({ type: 1, status: 1 });
tokenTransactionSchema.index({ transactionHash: 1 });

// Virtual for formatted amount
tokenTransactionSchema.virtual('formattedAmount').get(function() {
  return `${this.amount} EDU`;
});

// Method to check if transaction can be retried
tokenTransactionSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryCount < 3;
};

// Static method to get user's transaction summary
tokenTransactionSchema.statics.getUserSummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        lastTransaction: { $max: '$createdAt' }
      }
    }
  ]);
  
  return summary;
};

module.exports = mongoose.model('TokenTransaction', tokenTransactionSchema);