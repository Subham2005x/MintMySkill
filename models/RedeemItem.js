const mongoose = require('mongoose');

const redeemItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Pricing
  tokenCost: {
    type: Number,
    required: [true, 'Token cost is required'],
    min: [1, 'Token cost must be at least 1']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  
  // Item Details
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Hardware',
      'Software',
      'Education',
      'Events',
      'Accessories',
      'Gift Cards',
      'Digital Content',
      'Merchandise',
      'Other'
    ]
  },
  image: {
    type: String,
    required: [true, 'Item image is required']
  },
  images: [String], // Additional images
  
  // Inventory Management
  stock: {
    available: {
      type: Number,
      default: 0,
      min: [0, 'Available stock cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative']
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total stock cannot be negative']
    }
  },
  isUnlimited: {
    type: Boolean,
    default: false
  },
  
  // Delivery Information
  deliveryType: {
    type: String,
    enum: ['physical', 'digital', 'voucher', 'access'],
    required: true
  },
  estimatedDelivery: {
    type: String,
    required: true
  },
  shippingRequired: {
    type: Boolean,
    default: false
  },
  
  // Item Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isLimitedTime: {
    type: Boolean,
    default: false
  },
  availableFrom: Date,
  availableUntil: Date,
  
  // Statistics
  totalRedemptions: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },
  
  // Partner Information (for external items)
  partner: {
    name: String,
    logo: String,
    website: String,
    apiEndpoint: String
  },
  
  // Requirements
  requirements: {
    minTokens: Number,
    userLevel: {
      type: String,
      enum: ['any', 'beginner', 'intermediate', 'advanced']
    },
    completedCourses: Number,
    specialAccess: Boolean
  },
  
  // Redemption Details
  redemptionInstructions: String,
  terms: String,
  
  // Metadata
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
redeemItemSchema.index({ category: 1 });
redeemItemSchema.index({ tokenCost: 1 });
redeemItemSchema.index({ isActive: 1 });
redeemItemSchema.index({ totalRedemptions: -1 });
redeemItemSchema.index({ popularity: -1 });
redeemItemSchema.index({ createdAt: -1 });

// Pre-save middleware
redeemItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update total stock
  if (!this.isUnlimited) {
    this.stock.total = this.stock.available + this.stock.reserved;
  }
  
  next();
});

// Method to check availability
redeemItemSchema.methods.isAvailable = function(quantity = 1) {
  if (!this.isActive) return false;
  
  // Check time availability
  const now = new Date();
  if (this.availableFrom && now < this.availableFrom) return false;
  if (this.availableUntil && now > this.availableUntil) return false;
  
  // Check stock availability
  if (this.isUnlimited) return true;
  
  return this.stock.available >= quantity;
};

// Method to reserve stock
redeemItemSchema.methods.reserveStock = async function(quantity = 1) {
  if (!this.isAvailable(quantity)) {
    throw new Error('Item not available or insufficient stock');
  }
  
  if (!this.isUnlimited) {
    this.stock.available -= quantity;
    this.stock.reserved += quantity;
    await this.save();
  }
  
  return true;
};

// Method to confirm redemption
redeemItemSchema.methods.confirmRedemption = async function(quantity = 1) {
  if (!this.isUnlimited) {
    this.stock.reserved -= quantity;
  }
  
  this.totalRedemptions += quantity;
  this.popularity += 1;
  
  await this.save();
  return true;
};

// Method to release reserved stock
redeemItemSchema.methods.releaseReservedStock = async function(quantity = 1) {
  if (!this.isUnlimited) {
    this.stock.reserved -= quantity;
    this.stock.available += quantity;
    await this.save();
  }
  
  return true;
};

// Virtual for in stock status
redeemItemSchema.virtual('inStock').get(function() {
  return this.isUnlimited || this.stock.available > 0;
});

// Virtual for stock percentage
redeemItemSchema.virtual('stockPercentage').get(function() {
  if (this.isUnlimited) return 100;
  if (this.stock.total === 0) return 0;
  return Math.round((this.stock.available / this.stock.total) * 100);
});

// Ensure virtual fields are serialized
redeemItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('RedeemItem', redeemItemSchema);