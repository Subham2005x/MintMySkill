const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RedeemItem',
    required: true
  },
  
  // Redemption Details
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  totalTokenCost: {
    type: Number,
    required: true,
    min: [1, 'Total token cost must be at least 1']
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled', 'failed'],
    default: 'pending'
  },
  
  // Delivery Information
  deliveryDetails: {
    type: {
      type: String,
      enum: ['physical', 'digital', 'voucher', 'access']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    email: String,
    phone: String,
    instructions: String
  },
  
  // Digital Delivery
  digitalContent: {
    downloadUrl: String,
    accessCode: String,
    validUntil: Date,
    instructions: String
  },
  
  // Tracking Information
  tracking: {
    provider: String, // 'FedEx', 'UPS', 'DHL', etc.
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  
  // Transaction Reference
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Status History
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Additional Information
  notes: String,
  adminNotes: String,
  
  // Partner Integration (for external fulfillment)
  partnerOrderId: String,
  partnerStatus: String,
  partnerResponse: mongoose.Schema.Types.Mixed,
  
  // Metadata
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
redemptionSchema.index({ user: 1, createdAt: -1 });
redemptionSchema.index({ item: 1 });
redemptionSchema.index({ status: 1 });
redemptionSchema.index({ 'tracking.trackingNumber': 1 });
redemptionSchema.index({ requestedAt: -1 });

// Pre-save middleware
redemptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update timestamp fields based on status
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'processing':
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'completed':
      case 'delivered':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
    
    // Add to status history
    this.statusHistory.push({
      status: this.status,
      timestamp: now,
      note: `Status changed to ${this.status}`
    });
  }
  
  next();
});

// Method to update status
redemptionSchema.methods.updateStatus = async function(newStatus, note = '', updatedBy = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status changed from ${oldStatus} to ${newStatus}`,
    updatedBy
  });
  
  await this.save();
  return this;
};

// Method to add tracking information
redemptionSchema.methods.addTracking = async function(trackingData) {
  this.tracking = {
    ...this.tracking,
    ...trackingData
  };
  
  if (trackingData.trackingNumber && this.status === 'processing') {
    await this.updateStatus('shipped', 'Item shipped with tracking number');
  }
  
  await this.save();
  return this;
};

// Method to mark as delivered
redemptionSchema.methods.markDelivered = async function(note = 'Item delivered successfully') {
  await this.updateStatus('delivered', note);
  
  if (this.tracking.estimatedDelivery) {
    this.tracking.actualDelivery = new Date();
  }
  
  await this.save();
  return this;
};

// Method to cancel redemption
redemptionSchema.methods.cancel = async function(reason = 'Cancelled by user') {
  if (['completed', 'delivered'].includes(this.status)) {
    throw new Error('Cannot cancel completed or delivered redemption');
  }
  
  this.cancellationReason = reason;
  await this.updateStatus('cancelled', reason);
  
  // Refund tokens to user
  const User = mongoose.model('User');
  const user = await User.findById(this.user);
  
  if (user) {
    await user.addTokens(this.totalTokenCost, `Refund for cancelled redemption: ${this.item.name}`);
  }
  
  // Release reserved stock
  const RedeemItem = mongoose.model('RedeemItem');
  const item = await RedeemItem.findById(this.item);
  
  if (item) {
    await item.releaseReservedStock(this.quantity);
  }
  
  await this.save();
  return this;
};

// Static method to create redemption
redemptionSchema.statics.createRedemption = async function(data) {
  const { userId, itemId, quantity = 1, deliveryDetails } = data;
  
  const User = mongoose.model('User');
  const RedeemItem = mongoose.model('RedeemItem');
  const Transaction = mongoose.model('Transaction');
  
  const user = await User.findById(userId);
  const item = await RedeemItem.findById(itemId);
  
  if (!user) throw new Error('User not found');
  if (!item) throw new Error('Item not found');
  
  // Check item availability
  if (!item.isAvailable(quantity)) {
    throw new Error('Item not available or insufficient stock');
  }
  
  // Calculate total cost
  const totalTokenCost = item.tokenCost * quantity;
  
  // Check user balance
  if (user.tokenBalance < totalTokenCost) {
    throw new Error('Insufficient token balance');
  }
  
  // Reserve stock
  await item.reserveStock(quantity);
  
  try {
    // Create transaction
    const transaction = await Transaction.createTransaction({
      userId,
      type: 'spent',
      amount: totalTokenCost,
      description: `Redeemed: ${item.name} (x${quantity})`,
      metadata: { source: 'redemption' }
    });
    
    // Create redemption
    const redemption = new this({
      user: userId,
      item: itemId,
      quantity,
      totalTokenCost,
      deliveryDetails: {
        type: item.deliveryType,
        ...deliveryDetails
      },
      transaction: transaction._id
    });
    
    await redemption.save();
    
    // Mark transaction as completed
    await transaction.markCompleted();
    
    // Confirm redemption on item
    await item.confirmRedemption(quantity);
    
    return redemption;
  } catch (error) {
    // Release reserved stock on error
    await item.releaseReservedStock(quantity);
    throw error;
  }
};

// Virtual for estimated delivery days
redemptionSchema.virtual('estimatedDeliveryDays').get(function() {
  if (!this.tracking.estimatedDelivery) return null;
  
  const now = new Date();
  const estimated = new Date(this.tracking.estimatedDelivery);
  return Math.ceil((estimated - now) / (1000 * 60 * 60 * 24));
});

// Virtual for days since redemption
redemptionSchema.virtual('daysSinceRedemption').get(function() {
  const now = new Date();
  return Math.floor((now - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
redemptionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Redemption', redemptionSchema);