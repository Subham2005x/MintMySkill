const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Transaction Type
  type: {
    type: String,
    required: true,
    enum: ['earned', 'spent', 'bonus', 'refund', 'penalty']
  },
  
  // Transaction Details
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  
  // Related Entities
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedRedemption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Redemption'
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Blockchain Integration
  blockchainHash: String,
  blockchainStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  confirmations: {
    type: Number,
    default: 0
  },
  
  // Balance Tracking
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  
  // Metadata
  metadata: {
    source: String, // 'course_completion', 'redemption', 'admin_action', etc.
    ipAddress: String,
    userAgent: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  failedAt: Date,
  failureReason: String
});

// Indexes for better performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ blockchainHash: 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  if (this.status === 'failed' && !this.failedAt) {
    this.failedAt = new Date();
  }
  
  next();
});

// Static method to create transaction
transactionSchema.statics.createTransaction = async function(data) {
  const { userId, type, amount, description, relatedCourse, relatedRedemption, metadata } = data;
  
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const balanceBefore = user.tokenBalance;
  let balanceAfter = balanceBefore;
  
  // Calculate balance after transaction
  if (type === 'earned' || type === 'bonus' || type === 'refund') {
    balanceAfter = balanceBefore + Math.abs(amount);
  } else if (type === 'spent' || type === 'penalty') {
    balanceAfter = balanceBefore - Math.abs(amount);
    
    if (balanceAfter < 0) {
      throw new Error('Insufficient token balance');
    }
  }
  
  const transaction = new this({
    user: userId,
    type,
    amount: type === 'spent' || type === 'penalty' ? -Math.abs(amount) : Math.abs(amount),
    description,
    relatedCourse,
    relatedRedemption,
    balanceBefore,
    balanceAfter,
    metadata: {
      source: metadata?.source || 'manual',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent
    }
  });
  
  await transaction.save();
  return transaction;
};

// Instance method to mark as completed
transactionSchema.methods.markCompleted = async function(blockchainHash) {
  this.status = 'completed';
  this.processedAt = new Date();
  
  if (blockchainHash) {
    this.blockchainHash = blockchainHash;
    this.blockchainStatus = 'confirmed';
  }
  
  // Update user balance
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    tokenBalance: this.balanceAfter
  });
  
  await this.save();
  return this;
};

// Instance method to mark as failed
transactionSchema.methods.markFailed = async function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  
  await this.save();
  return this;
};

// Virtual for transaction age
transactionSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  const absAmount = Math.abs(this.amount);
  return this.amount >= 0 ? `+${absAmount}` : `-${absAmount}`;
});

// Ensure virtual fields are serialized
transactionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);