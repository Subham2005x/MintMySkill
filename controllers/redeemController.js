const RedeemItem = require('../models/RedeemItem');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// @desc    Get all redeem items
// @route   GET /api/redeem/items
// @access  Public
const getRedeemItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    if (req.query.available === 'true') {
      filter.$or = [
        { isUnlimited: true },
        { 'stock.available': { $gt: 0 } }
      ];
    }

    // Price range filter
    if (req.query.minTokens || req.query.maxTokens) {
      filter.tokenCost = {};
      if (req.query.minTokens) {
        filter.tokenCost.$gte = parseInt(req.query.minTokens, 10);
      }
      if (req.query.maxTokens) {
        filter.tokenCost.$lte = parseInt(req.query.maxTokens, 10);
      }
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'price_low':
        sort = { tokenCost: 1 };
        break;
      case 'price_high':
        sort = { tokenCost: -1 };
        break;
      case 'popular':
        sort = { popularity: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const items = await RedeemItem.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip(startIndex)
      .select('-createdBy');

    const total = await RedeemItem.countDocuments(filter);

    // Get categories for filtering
    const categories = await RedeemItem.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      categories,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single redeem item
// @route   GET /api/redeem/items/:id
// @access  Public
const getRedeemItem = async (req, res, next) => {
  try {
    const item = await RedeemItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Redeem item not found'
      });
    }

    if (!item.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Item is no longer available'
      });
    }

    // Check if user can afford this item (if authenticated)
    let canAfford = false;
    if (req.user) {
      canAfford = req.user.tokenBalance >= item.tokenCost;
    }

    res.status(200).json({
      success: true,
      data: {
        ...item.toJSON(),
        canAfford,
        userBalance: req.user?.tokenBalance || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem an item
// @route   POST /api/redeem/items/:id/redeem
// @access  Private
const redeemItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { quantity = 1, deliveryDetails } = req.body;

    const item = await RedeemItem.findById(req.params.id);

    if (!item || !item.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or no longer available'
      });
    }

    // Check if item is available
    if (!item.isAvailable(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Item not available in requested quantity'
      });
    }

    // Validate delivery details based on item type
    if (item.deliveryType === 'physical' && (!deliveryDetails?.address || !deliveryDetails.address.street)) {
      return res.status(400).json({
        success: false,
        message: 'Physical address is required for physical items'
      });
    }

    if (item.deliveryType === 'digital' && !deliveryDetails?.email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required for digital items'
      });
    }

    try {
      const redemption = await Redemption.createRedemption({
        userId: req.user.id,
        itemId: item._id,
        quantity,
        deliveryDetails
      });

      res.status(201).json({
        success: true,
        message: 'Item redeemed successfully',
        data: redemption
      });
    } catch (redemptionError) {
      if (redemptionError.message.includes('Insufficient token balance')) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient token balance'
        });
      }
      throw redemptionError;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's redemption history
// @route   GET /api/redeem/history
// @access  Private
const getRedemptionHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const filter = { user: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const redemptions = await Redemption.find(filter)
      .populate('item', 'name image category tokenCost deliveryType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Redemption.countDocuments(filter);

    // Calculate summary statistics
    const stats = await Redemption.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalTokens: { $sum: '$totalTokenCost' }
        }
      }
    ]);

    const summary = {
      totalRedemptions: total,
      totalTokensSpent: stats.reduce((sum, stat) => sum + stat.totalTokens, 0),
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      count: redemptions.length,
      total,
      summary,
      data: redemptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single redemption details
// @route   GET /api/redeem/history/:id
// @access  Private
const getRedemption = async (req, res, next) => {
  try {
    const redemption = await Redemption.findById(req.params.id)
      .populate('item', 'name description image category tokenCost deliveryType')
      .populate('user', 'name email')
      .populate('transaction');

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption not found'
      });
    }

    // Ensure user can only access their own redemptions (unless admin)
    if (redemption.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this redemption'
      });
    }

    res.status(200).json({
      success: true,
      data: redemption
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel redemption
// @route   POST /api/redeem/history/:id/cancel
// @access  Private
const cancelRedemption = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const redemption = await Redemption.findById(req.params.id);

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption not found'
      });
    }

    // Ensure user can only cancel their own redemptions
    if (redemption.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this redemption'
      });
    }

    // Check if redemption can be cancelled
    if (['completed', 'shipped', 'delivered'].includes(redemption.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel redemption in current status'
      });
    }

    await redemption.cancel(reason || 'Cancelled by user');

    res.status(200).json({
      success: true,
      message: 'Redemption cancelled successfully',
      data: redemption
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new redeem item (Admin only)
// @route   POST /api/redeem/items
// @access  Private (Admin)
const createRedeemItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    req.body.createdBy = req.user.id;

    const item = await RedeemItem.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Redeem item created successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update redeem item (Admin only)
// @route   PUT /api/redeem/items/:id
// @access  Private (Admin)
const updateRedeemItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const item = await RedeemItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Redeem item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Redeem item updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete redeem item (Admin only)
// @route   DELETE /api/redeem/items/:id
// @access  Private (Admin)
const deleteRedeemItem = async (req, res, next) => {
  try {
    const item = await RedeemItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Redeem item not found'
      });
    }

    // Check if item has active redemptions
    const activeRedemptions = await Redemption.countDocuments({
      item: item._id,
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    if (activeRedemptions > 0) {
      // Don't delete, just deactivate
      item.isActive = false;
      await item.save();
    } else {
      await item.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: 'Redeem item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const redeemValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('deliveryDetails.address.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address is required for physical items'),
  body('deliveryDetails.address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required for physical items'),
  body('deliveryDetails.email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required for digital items')
];

const createItemValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('tokenCost')
    .isInt({ min: 1 })
    .withMessage('Token cost must be at least 1'),
  body('category')
    .isIn(['Hardware', 'Software', 'Education', 'Events', 'Accessories', 'Gift Cards', 'Digital Content', 'Merchandise', 'Other'])
    .withMessage('Please select a valid category'),
  body('deliveryType')
    .isIn(['physical', 'digital', 'voucher', 'access'])
    .withMessage('Please select a valid delivery type'),
  body('image')
    .notEmpty()
    .withMessage('Item image is required')
];

module.exports = {
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
};