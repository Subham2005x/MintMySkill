const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  
  // Token and Wallet Information
  tokenBalance: {
    total: {
      type: Number,
      default: 0,
      min: [0, 'Token balance cannot be negative']
    },
    earned: {
      type: Number,
      default: 0,
      min: [0, 'Total tokens earned cannot be negative']
    },
    redeemed: {
      type: Number,
      default: 0,
      min: [0, 'Total tokens redeemed cannot be negative']
    }
  },
  walletAddress: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  isWalletConnected: {
    type: Boolean,
    default: false
  },
  walletConnectedAt: {
    type: Date
  },
  
  // Learning Statistics
  coursesEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  coursesCompleted: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    tokensEarned: {
      type: Number,
      default: 0
    }
  }],
  
  // Profile Information
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [String],
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String
  },
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance (email already has unique index)
userSchema.index({ walletAddress: 1 });
userSchema.index({ tokenBalance: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to update token balance
userSchema.methods.addTokens = async function(amount, reason = 'Course completion') {
  this.tokenBalance += amount;
  this.totalTokensEarned += amount;
  
  // Create transaction record
  const Transaction = mongoose.model('Transaction');
  await Transaction.create({
    user: this._id,
    type: 'earned',
    amount: amount,
    description: reason,
    status: 'completed'
  });
  
  await this.save();
  return this.tokenBalance;
};

// Instance method to spend tokens
userSchema.methods.spendTokens = async function(amount, reason = 'Redemption') {
  if (this.tokenBalance < amount) {
    throw new Error('Insufficient token balance');
  }
  
  this.tokenBalance -= amount;
  
  // Create transaction record
  const Transaction = mongoose.model('Transaction');
  await Transaction.create({
    user: this._id,
    type: 'spent',
    amount: -amount,
    description: reason,
    status: 'completed'
  });
  
  await this.save();
  return this.tokenBalance;
};

// Virtual for user's completion rate
userSchema.virtual('completionRate').get(function() {
  const enrolled = this.coursesEnrolled || [];
  const completed = this.coursesCompleted || [];
  if (enrolled.length === 0) return 0;
  return Math.round((completed.length / enrolled.length) * 100);
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);