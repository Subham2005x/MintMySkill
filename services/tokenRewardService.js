const blockchainService = require('./avalancheBlockchainService');
const Course = require('../models/Course');
const User = require('../models/User');
const TokenTransaction = require('../models/TokenTransaction');

class TokenRewardService {
  constructor() {
    this.defaultReward = 100; // Default reward amount in EDU tokens
  }

  /**
   * Reward student for completing a course
   */
  async rewardCourseCompletion(userId, courseId) {
    try {
      console.log(`🎓 Processing course completion reward for user ${userId}, course ${courseId}`);

      // Get user and course details
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      if (!user || !course) {
        throw new Error('User or course not found');
      }

      // Check if user has already been rewarded for this course
      const existingReward = await TokenTransaction.findOne({
        user: userId,
        course: courseId,
        type: 'reward',
        reason: 'course_completion'
      });

      if (existingReward) {
        console.log('⚠️ User already rewarded for this course');
        return {
          success: false,
          message: 'User already rewarded for this course',
          existingTransaction: existingReward
        };
      }

      // Get reward amount (from course or default)
      const rewardAmount = course.tokenReward || this.defaultReward;

      // Record transaction in database first
      const tokenTransaction = new TokenTransaction({
        user: userId,
        course: courseId,
        type: 'reward',
        amount: rewardAmount,
        reason: 'course_completion',
        status: 'pending',
        metadata: {
          courseTitle: course.title,
          completedAt: new Date()
        }
      });

      await tokenTransaction.save();

      // Attempt blockchain transaction if wallet address is available
      let blockchainResult = null;
      if (user.walletAddress && blockchainService.isInitialized()) {
        blockchainResult = await blockchainService.rewardStudent(
          user.walletAddress,
          courseId,
          'Course completion reward'
        );

        if (blockchainResult.success) {
          // Update transaction with blockchain details
          tokenTransaction.status = 'completed';
          tokenTransaction.transactionHash = blockchainResult.transactionHash;
          tokenTransaction.blockNumber = blockchainResult.blockNumber;
        } else {
          tokenTransaction.status = 'failed';
          tokenTransaction.errorMessage = blockchainResult.error;
        }
      } else {
        // Mark as completed but note no blockchain transaction
        tokenTransaction.status = 'completed_offchain';
        tokenTransaction.errorMessage = user.walletAddress ? 
          'Blockchain service not available' : 
          'User wallet address not provided';
      }

      await tokenTransaction.save();

      // Update user's token balance (for off-chain tracking)
      await User.findByIdAndUpdate(userId, {
        $inc: { 
          'tokenBalance.earned': rewardAmount,
          'tokenBalance.total': rewardAmount 
        }
      });

      console.log(`✅ Course completion reward processed: ${rewardAmount} EDU tokens`);

      return {
        success: true,
        rewardAmount,
        transaction: tokenTransaction,
        blockchainResult
      };

    } catch (error) {
      console.error('❌ Course completion reward failed:', error.message);
      
      // Update transaction status if it exists
      const transaction = await TokenTransaction.findOne({
        user: userId,
        course: courseId,
        type: 'reward',
        status: 'pending'
      }).sort({ createdAt: -1 });

      if (transaction) {
        transaction.status = 'failed';
        transaction.errorMessage = error.message;
        await transaction.save();
      }

      throw error;
    }
  }

  /**
   * Process token redemption
   */
  async redeemTokens(userId, redemptionType, amount, details = {}) {
    try {
      console.log(`💰 Processing token redemption for user ${userId}: ${redemptionType}`);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has sufficient balance
      if (user.tokenBalance.total < amount) {
        throw new Error('Insufficient token balance');
      }

      // Record redemption transaction
      const tokenTransaction = new TokenTransaction({
        user: userId,
        type: 'redemption',
        amount: amount,
        reason: redemptionType,
        status: 'pending',
        metadata: {
          redemptionType,
          details,
          redeemedAt: new Date()
        }
      });

      await tokenTransaction.save();

      // Update user's token balance
      await User.findByIdAndUpdate(userId, {
        $inc: { 
          'tokenBalance.redeemed': amount,
          'tokenBalance.total': -amount 
        }
      });

      // Process specific redemption logic
      await this.processRedemption(userId, redemptionType, amount, details);

      // Mark transaction as completed
      tokenTransaction.status = 'completed';
      await tokenTransaction.save();

      console.log(`✅ Token redemption completed: ${amount} EDU tokens for ${redemptionType}`);

      return {
        success: true,
        transaction: tokenTransaction
      };

    } catch (error) {
      console.error('❌ Token redemption failed:', error.message);
      throw error;
    }
  }

  /**
   * Process specific redemption types
   */
  async processRedemption(userId, redemptionType, amount, details) {
    switch (redemptionType) {
      case 'course_discount_10':
        await this.applyCourseDiscount(userId, 10, details.courseId);
        break;
      case 'course_discount_25':
        await this.applyCourseDiscount(userId, 25, details.courseId);
        break;
      case 'course_discount_50':
        await this.applyCourseDiscount(userId, 50, details.courseId);
        break;
      case 'certificate_premium':
        await this.upgradeCertificate(userId, details.courseId);
        break;
      case 'one_on_one_session':
        await this.scheduleOneOnOneSession(userId, details);
        break;
      default:
        console.log(`⚠️ Unknown redemption type: ${redemptionType}`);
    }
  }

  /**
   * Apply course discount
   */
  async applyCourseDiscount(userId, discountPercent, courseId) {
    // Implementation would create a discount code or apply directly to user's account
    console.log(`📚 Applied ${discountPercent}% discount for course ${courseId} to user ${userId}`);
  }

  /**
   * Upgrade certificate to premium
   */
  async upgradeCertificate(userId, courseId) {
    // Implementation would mark certificate as premium
    console.log(`🏆 Upgraded certificate to premium for course ${courseId}, user ${userId}`);
  }

  /**
   * Schedule one-on-one session
   */
  async scheduleOneOnOneSession(userId, details) {
    // Implementation would create a booking or notification
    console.log(`📅 One-on-one session scheduled for user ${userId}:`, details);
  }

  /**
   * Get user's token statistics
   */
  async getUserTokenStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get transaction history
      const transactions = await TokenTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('course', 'title');

      // Get blockchain balance if wallet connected
      let blockchainBalance = { balance: '0', earned: '0', redeemed: '0' };
      if (user.walletAddress && blockchainService.isInitialized()) {
        blockchainBalance = await blockchainService.getUserTokenBalance(user.walletAddress);
      }

      return {
        offChainBalance: user.tokenBalance,
        blockchainBalance,
        transactions,
        walletConnected: !!user.walletAddress
      };

    } catch (error) {
      console.error('❌ Failed to get user token stats:', error.message);
      throw error;
    }
  }

  /**
   * Get available redemption options
   */
  getRedemptionOptions() {
    return [
      {
        type: 'course_discount_10',
        name: '10% Course Discount',
        cost: 50,
        description: 'Get 10% off any course purchase'
      },
      {
        type: 'course_discount_25',
        name: '25% Course Discount',
        cost: 150,
        description: 'Get 25% off any course purchase'
      },
      {
        type: 'course_discount_50',
        name: '50% Course Discount',
        cost: 300,
        description: 'Get 50% off any course purchase'
      },
      {
        type: 'certificate_premium',
        name: 'Premium Certificate',
        cost: 100,
        description: 'Upgrade your certificate to premium design'
      },
      {
        type: 'one_on_one_session',
        name: '1-on-1 Mentoring Session',
        cost: 500,
        description: 'Book a personal mentoring session with an instructor'
      }
    ];
  }

  /**
   * Set course-specific reward amount
   */
  async setCourseReward(courseId, rewardAmount) {
    try {
      // Update in database
      await Course.findByIdAndUpdate(courseId, {
        tokenReward: rewardAmount
      });

      // Update in smart contract if available
      if (blockchainService.isInitialized()) {
        const result = await blockchainService.setCourseReward(courseId, rewardAmount);
        console.log('📝 Course reward updated on blockchain:', result);
      }

      console.log(`✅ Course reward set: ${rewardAmount} EDU for course ${courseId}`);
      return { success: true, courseId, rewardAmount };

    } catch (error) {
      console.error('❌ Failed to set course reward:', error.message);
      throw error;
    }
  }
}

module.exports = new TokenRewardService();