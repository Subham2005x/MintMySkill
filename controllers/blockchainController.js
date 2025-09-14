const blockchainService = require('../services/blockchainService');
const User = require('../models/User');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// @desc    Get user's token balance
// @route   GET /api/blockchain/balance
// @access  Private
const getTokenBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'User has not connected a wallet'
      });
    }

    const result = await blockchainService.getTokenBalance(user.walletAddress);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch token balance',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        balance: result.balance,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Get token balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reward tokens to user (admin only)
// @route   POST /api/blockchain/reward
// @access  Private (Admin/System)
const rewardTokens = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, amount, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'User has not connected a wallet'
      });
    }

    const result = await blockchainService.rewardTokens(
      user.walletAddress,
      amount,
      reason
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reward tokens',
        error: result.error
      });
    }

    // Update user's token balance in database
    user.tokenBalance = (parseFloat(user.tokenBalance || 0) + parseFloat(amount)).toString();
    await user.save();

    res.json({
      success: true,
      message: 'Tokens rewarded successfully',
      data: {
        transactionHash: result.transactionHash,
        amount,
        recipient: user.walletAddress,
        reason
      }
    });
  } catch (error) {
    console.error('Reward tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Issue course completion certificate
// @route   POST /api/blockchain/certificate
// @access  Private (System)
const issueCertificate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, courseId, score, grade } = req.body;
    
    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate('instructor', 'name');

    if (!user || !course) {
      return res.status(404).json({
        success: false,
        message: 'User or course not found'
      });
    }

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'User has not connected a wallet'
      });
    }

    // Generate metadata URI (you can use IPFS or your own storage)
    const metadataURI = `https://api.mintmyskill.com/metadata/certificate/${courseId}/${userId}`;

    const certificateData = {
      studentAddress: user.walletAddress,
      courseId: courseId,
      courseName: course.title,
      score: score,
      grade: grade,
      instructorName: course.instructor.name,
      metadataURI: metadataURI
    };

    const result = await blockchainService.issueCertificate(certificateData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to issue certificate',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        tokenId: result.tokenId,
        transactionHash: result.transactionHash,
        certificateData
      }
    });
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's certificates
// @route   GET /api/blockchain/certificates
// @access  Private
const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'User has not connected a wallet'
      });
    }

    const result = await blockchainService.getUserCertificates(user.walletAddress);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch certificates',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        certificates: result.certificates,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify certificate
// @route   GET /api/blockchain/certificate/verify/:tokenId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const result = await blockchainService.verifyCertificate(tokenId);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify certificate',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Connect wallet to user account
// @route   POST /api/blockchain/connect-wallet
// @access  Private
const connectWallet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { walletAddress, signature } = req.body;

    // Verify signature (implement signature verification logic)
    // This ensures the user actually owns the wallet

    const user = await User.findById(userId);
    user.walletAddress = walletAddress;
    await user.save();

    res.json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        walletAddress
      }
    });
  } catch (error) {
    console.error('Connect wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get blockchain network info
// @route   GET /api/blockchain/network
// @access  Public
const getNetworkInfo = async (req, res) => {
  try {
    const result = await blockchainService.getNetworkInfo();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch network info',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get network info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Automatic token reward on course completion
// @route   POST /api/blockchain/auto-reward
// @access  Private (System)
const autoRewardCompletion = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({
        success: false,
        message: 'User or course not found'
      });
    }

    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'User has not connected a wallet'
      });
    }

    // Calculate reward amount based on course
    const baseReward = course.tokenReward || 50;
    const bonusReward = course.bonusTokens?.completion || 0;
    const totalReward = baseReward + bonusReward;

    // Reward tokens
    const tokenResult = await blockchainService.rewardTokens(
      user.walletAddress,
      totalReward,
      `Course completion: ${course.title}`
    );

    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reward tokens',
        error: tokenResult.error
      });
    }

    // Issue certificate
    const certificateData = {
      studentAddress: user.walletAddress,
      courseId: courseId,
      courseName: course.title,
      score: 100, // Assuming completion = 100%
      grade: 'Completed',
      instructorName: 'MintMySkill',
      metadataURI: `https://api.mintmyskill.com/metadata/certificate/${courseId}/${userId}`
    };

    const certResult = await blockchainService.issueCertificate(certificateData);

    // Update user balance
    user.tokenBalance = (parseFloat(user.tokenBalance || 0) + totalReward).toString();
    await user.save();

    res.json({
      success: true,
      message: 'Course completion rewards issued',
      data: {
        tokenReward: {
          amount: totalReward,
          transactionHash: tokenResult.transactionHash
        },
        certificate: certResult.success ? {
          tokenId: certResult.tokenId,
          transactionHash: certResult.transactionHash
        } : null
      }
    });
  } catch (error) {
    console.error('Auto reward completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getTokenBalance,
  rewardTokens,
  issueCertificate,
  getUserCertificates,
  verifyCertificate,
  connectWallet,
  getNetworkInfo,
  autoRewardCompletion
};