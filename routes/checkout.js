const express = require('express');
const {
  createCheckoutSession,
  handlePaymentSuccess,
  stripeWebhook,
  getPaymentHistory,
  refundPurchase
} = require('../controllers/checkoutController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Stripe webhook (needs raw body, so it's before other middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/create-session', createCheckoutSession);
router.post('/success', handlePaymentSuccess);
router.get('/history', getPaymentHistory);
router.post('/refund/:enrollmentId', refundPurchase);

module.exports = router;