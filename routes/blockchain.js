const express = require('express');
const { body } = require('express-validator');
const {
  getTokenBalance,
  rewardTokens,
  issueCertificate,
  getUserCertificates,
  verifyCertificate,
  connectWallet,
  getNetworkInfo,
  autoRewardCompletion
} = require('../controllers/blockchainController');
const { protect } = require('../middleware/auth');
const { checkRole, isAdmin } = require('../middleware/roleCheck');

const router = express.Router();

// Validation rules
const connectWalletValidation = [
  body('walletAddress')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address'),
  body('signature')
    .notEmpty()
    .withMessage('Signature is required')
];

const rewardTokensValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('reason')
    .notEmpty()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Reason must be between 3 and 200 characters')
];

const issueCertificateValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('grade')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Grade must be between 1 and 10 characters')
];

// Public routes

// @route   GET /api/blockchain/network
// @desc    Get blockchain network information
// @access  Public
router.get('/network', getNetworkInfo);

// @route   GET /api/blockchain/certificate/verify/:tokenId
// @desc    Verify certificate authenticity
// @access  Public
router.get('/certificate/verify/:tokenId', verifyCertificate);

// Protected routes
router.use(protect);

// @route   GET /api/blockchain/balance
// @desc    Get user's token balance
// @access  Private
router.get('/balance', getTokenBalance);

// @route   GET /api/blockchain/certificates
// @desc    Get user's certificates
// @access  Private
router.get('/certificates', getUserCertificates);

// @route   POST /api/blockchain/connect-wallet
// @desc    Connect wallet to user account
// @access  Private
router.post('/connect-wallet', connectWalletValidation, connectWallet);

// Admin/System routes

// @route   POST /api/blockchain/reward
// @desc    Reward tokens to user (admin only)
// @access  Private (Admin)
router.post('/reward', 
  isAdmin,
  rewardTokensValidation,
  rewardTokens
);

// @route   POST /api/blockchain/certificate
// @desc    Issue course completion certificate (admin only)
// @access  Private (Admin)
router.post('/certificate',
  isAdmin,
  issueCertificateValidation,
  issueCertificate
);

// @route   POST /api/blockchain/auto-reward
// @desc    Automatic token reward and certificate on course completion
// @access  Private (System - called internally)
router.post('/auto-reward',
  isAdmin,
  autoRewardCompletion
);

module.exports = router;