const express = require('express');
const {
  getRedeemItems,
  getRedeemItem,
  redeemItem,
  getRedemptionHistory,
  getRedemption,
  cancelRedemption,
  createRedeemItem,
  updateRedeemItem,
  deleteRedeemItem,
  redeemValidation,
  createItemValidation
} = require('../controllers/redeemController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/items', optionalAuth, getRedeemItems);
router.get('/items/:id', optionalAuth, getRedeemItem);

// Protected routes
router.use(protect); // All routes below require authentication

// User routes
router.post('/items/:id/redeem', redeemValidation, redeemItem);
router.get('/history', getRedemptionHistory);
router.get('/history/:id', getRedemption);
router.post('/history/:id/cancel', cancelRedemption);

// Admin routes
router.post('/items', authorize('admin'), createItemValidation, createRedeemItem);
router.put('/items/:id', authorize('admin'), createItemValidation, updateRedeemItem);
router.delete('/items/:id', authorize('admin'), deleteRedeemItem);

module.exports = router;