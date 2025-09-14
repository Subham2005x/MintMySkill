const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const tokenRewardService = require('../services/tokenRewardService');
const blockchainService = require('../services/avalancheBlockchainService');

// @desc    Get user's token balance and stats
// @route   GET /api/tokens/balance
// @access  Private
router.get('/balance', protect, async (req, res) => {
  try {
    const stats = await tokenRewardService.getUserTokenStats(req.user.id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch token balance',
      error: error.message
    });
  }
});

// @desc    Get redemption options
// @route   GET /api/tokens/redemption-options
// @access  Private
router.get('/redemption-options', protect, (req, res) => {
  try {
    const options = tokenRewardService.getRedemptionOptions();
    
    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching redemption options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch redemption options',
      error: error.message
    });
  }
});

// @desc    Redeem tokens
// @route   POST /api/tokens/redeem
// @access  Private
router.post('/redeem', protect, async (req, res) => {
  try {
    const { redemptionType, amount, details } = req.body;
    
    if (!redemptionType || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Redemption type and amount are required'
      });
    }

    const result = await tokenRewardService.redeemTokens(
      req.user.id,
      redemptionType,
      amount,
      details
    );
    
    res.status(200).json({
      success: true,
      message: 'Tokens redeemed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error redeeming tokens:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Manually reward student (Admin/Instructor only)
// @route   POST /api/tokens/reward
// @access  Private (Admin/Instructor)
router.post('/reward', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Course ID are required'
      });
    }

    const result = await tokenRewardService.rewardCourseCompletion(userId, courseId);
    
    res.status(200).json({
      success: true,
      message: 'Student rewarded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error rewarding student:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Set course reward amount (Admin only)
// @route   PUT /api/tokens/course-reward/:courseId
// @access  Private (Admin)
router.put('/course-reward/:courseId', protect, authorize('admin'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rewardAmount } = req.body;
    
    if (!rewardAmount || rewardAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid reward amount is required'
      });
    }

    const result = await tokenRewardService.setCourseReward(courseId, rewardAmount);
    
    res.status(200).json({
      success: true,
      message: 'Course reward amount updated',
      data: result
    });
  } catch (error) {
    console.error('Error setting course reward:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get blockchain network info
// @route   GET /api/tokens/network-info
// @access  Public
router.get('/network-info', (req, res) => {
  try {
    const networkInfo = {
      network: process.env.BLOCKCHAIN_NETWORK || 'fuji',
      chainId: process.env.CHAIN_ID || '43113',
      rpcUrl: process.env.AVALANCHE_RPC_URL,
      tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS,
      isInitialized: blockchainService.isInitialized()
    };
    
    res.status(200).json({
      success: true,
      data: networkInfo
    });
  } catch (error) {
    console.error('Error fetching network info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch network info',
      error: error.message
    });
  }
});

// @desc    Update user wallet address
// @route   PUT /api/tokens/wallet
// @access  Private
router.put('/wallet', protect, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      walletAddress,
      isWalletConnected: true,
      walletConnectedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Wallet address updated successfully'
    });
  } catch (error) {
    console.error('Error updating wallet address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wallet address',
      error: error.message
    });
  }
});

// @desc    Get transaction history
// @route   GET /api/tokens/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const TokenTransaction = require('../models/TokenTransaction');
    
    const filter = { user: req.user.id };
    if (type) {
      filter.type = type;
    }

    const transactions = await TokenTransaction.find(filter)
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TokenTransaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

module.exports = router;