const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { ethers } = require('ethers');
const { body, validationResult } = require('express-validator');

// @desc    Get user wallet balance
// @route   GET /api/wallet/balance/:userId
// @access  Private
const getBalance = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Ensure user can only access their own balance (unless admin)
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this wallet'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        balance: user.tokenBalance,
        totalEarned: user.totalTokensEarned,
        walletAddress: user.walletAddress,
        walletConnected: user.walletConnected
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connect wallet address
// @route   POST /api/wallet/connect
// @access  Private
const connectWallet = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { walletAddress, signature } = req.body;

    // Validate Ethereum address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum wallet address'
      });
    }

    // Optional: Verify signature to ensure user owns the wallet
    if (signature) {
      try {
        const message = `Connecting wallet to MintMySkill account: ${req.user.email}`;
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(400).json({
            success: false,
            message: 'Wallet signature verification failed'
          });
        }
      } catch (sigError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid signature format'
        });
      }
    }

    // Check if wallet is already connected to another account
    const existingUser = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase(),
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This wallet is already connected to another account'
      });
    }

    // Update user's wallet information
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        walletAddress: walletAddress.toLowerCase(),
        walletConnected: true
      },
      { new: true }
    );

    // Create transaction record for wallet connection
    await Transaction.createTransaction({
      userId: req.user.id,
      type: 'bonus',
      amount: 50, // Bonus for connecting wallet
      description: 'Wallet connection bonus',
      metadata: { 
        source: 'wallet_connection',
        walletAddress: walletAddress.toLowerCase()
      }
    });

    // Update user token balance
    await user.addTokens(50, 'Wallet connection bonus');

    res.status(200).json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        walletAddress: user.walletAddress,
        walletConnected: user.walletConnected,
        bonusEarned: 50
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect wallet
// @route   POST /api/wallet/disconnect
// @access  Private
const disconnectWallet = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        walletAddress: '',
        walletConnected: false
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Wallet disconnected successfully',
      data: {
        walletConnected: user.walletConnected
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const filter = { user: req.user.id };

    // Filter by transaction type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const transactions = await Transaction.find(filter)
      .populate('relatedCourse', 'title image')
      .populate('relatedRedemption', 'item')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Transaction.countDocuments(filter);

    // Calculate summary statistics
    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      totalEarned: stats.find(s => ['earned', 'bonus'].includes(s._id))?.totalAmount || 0,
      totalSpent: Math.abs(stats.find(s => ['spent', 'penalty'].includes(s._id))?.totalAmount || 0),
      totalTransactions: total
    };

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      summary,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer tokens to blockchain
// @route   POST /api/wallet/transfer
// @access  Private
const transferToBlockchain = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { amount, toAddress } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.walletConnected || !user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first'
      });
    }

    if (user.tokenBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient token balance'
      });
    }

    // Validate destination address
    if (!ethers.isAddress(toAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination wallet address'
      });
    }

    try {
      // Initialize blockchain provider
      const provider = new ethers.JsonRpcProvider(
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      );

      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

      // Token contract ABI (simplified)
      const tokenABI = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)"
      ];

      const tokenContract = new ethers.Contract(
        process.env.TOKEN_CONTRACT_ADDRESS,
        tokenABI,
        wallet
      );

      // Convert tokens to wei (assuming 18 decimals)
      const amountInWei = ethers.parseUnits(amount.toString(), 18);

      // Execute blockchain transfer
      const tx = await tokenContract.transfer(toAddress, amountInWei);
      
      // Create pending transaction record
      const transaction = await Transaction.createTransaction({
        userId: req.user.id,
        type: 'spent',
        amount: amount,
        description: `Blockchain transfer to ${toAddress}`,
        metadata: { 
          source: 'blockchain_transfer',
          destinationAddress: toAddress,
          transactionHash: tx.hash
        }
      });

      // Update transaction with blockchain hash
      transaction.blockchainHash = tx.hash;
      transaction.blockchainStatus = 'pending';
      await transaction.save();

      // Deduct tokens from user balance
      await user.spendTokens(amount, `Blockchain transfer to ${toAddress}`);

      // Wait for transaction confirmation (optional)
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        transaction.blockchainStatus = 'confirmed';
        transaction.confirmations = receipt.confirmations || 1;
        await transaction.markCompleted(tx.hash);
      }

      res.status(200).json({
        success: true,
        message: 'Tokens transferred to blockchain successfully',
        data: {
          transactionHash: tx.hash,
          amount: amount,
          toAddress: toAddress,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        }
      });

    } catch (blockchainError) {
      console.error('Blockchain transfer error:', blockchainError);
      
      return res.status(500).json({
        success: false,
        message: 'Blockchain transfer failed',
        error: blockchainError.message
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Get wallet leaderboard
// @route   GET /api/wallet/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const timeframe = req.query.timeframe || 'all'; // 'all', 'month', 'week'

    let dateFilter = {};
    if (timeframe === 'month') {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      };
    } else if (timeframe === 'week') {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      };
    }

    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          totalEarned: { 
            $sum: {
              $cond: [
                { $in: ['$type', ['earned', 'bonus']] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      { $sort: { totalEarned: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          avatar: '$user.avatar',
          totalEarned: 1,
          tokenBalance: '$user.tokenBalance'
        }
      }
    ];

    const leaderboard = await Transaction.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const connectWalletValidation = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .custom((value) => {
      if (!ethers.isAddress(value)) {
        throw new Error('Invalid Ethereum wallet address');
      }
      return true;
    }),
  body('signature')
    .optional()
    .isString()
    .withMessage('Signature must be a string')
];

const transferValidation = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 token'),
  body('toAddress')
    .notEmpty()
    .withMessage('Destination address is required')
    .custom((value) => {
      if (!ethers.isAddress(value)) {
        throw new Error('Invalid destination wallet address');
      }
      return true;
    })
];

module.exports = {
  getBalance,
  connectWallet,
  disconnectWallet,
  getTransactions,
  transferToBlockchain,
  getLeaderboard,
  connectWalletValidation,
  transferValidation
};