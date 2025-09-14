const express = require('express');
const {
  getBalance,
  connectWallet,
  disconnectWallet,
  getTransactions,
  transferToBlockchain,
  getLeaderboard,
  connectWalletValidation,
  transferValidation
} = require('../controllers/walletController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/balance/:userId?', getBalance);
router.get('/transactions', getTransactions);
router.post('/connect', connectWalletValidation, connectWallet);
router.post('/disconnect', disconnectWallet);
router.post('/transfer', transferValidation, transferToBlockchain);

module.exports = router;