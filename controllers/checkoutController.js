const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Create Stripe checkout session
// @route   POST /api/checkout/create-session
// @access  Private
const createCheckoutSession = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published' || !course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Calculate price (handle discount if applicable)
    const price = course.discountPrice || course.price;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.shortDescription || course.description,
              images: course.image ? [course.image] : [],
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/courses/${courseId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}`,
      customer_email: req.user.email,
      metadata: {
        courseId: courseId.toString(),
        userId: req.user.id.toString(),
        courseName: course.title,
        tokenReward: course.tokenReward.toString()
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle successful payment
// @route   POST /api/checkout/success
// @access  Private
const handlePaymentSuccess = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    const { courseId, userId } = session.metadata;

    // Verify user matches session
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this payment session'
      });
    }

    // Check if enrollment already exists (prevent duplicate enrollments)
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        message: 'Already enrolled in this course',
        data: existingEnrollment
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentStatus: 'completed',
      paymentId: session.payment_intent
    });

    // Update course statistics
    course.enrolledStudents.push(userId);
    course.totalStudents += 1;
    await course.save();

    // Update user enrolled courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { coursesEnrolled: courseId }
    });

    res.status(200).json({
      success: true,
      message: 'Payment successful and enrollment completed',
      data: {
        enrollment,
        course: {
          id: course._id,
          title: course.title,
          tokenReward: course.tokenReward
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/checkout/webhook
// @access  Public (Stripe webhook)
const stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        if (session.payment_status === 'paid') {
          await handleEnrollmentFromWebhook(session);
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful!', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper function to handle enrollment from webhook
const handleEnrollmentFromWebhook = async (session) => {
  try {
    const { courseId, userId } = session.metadata;

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      console.log('Enrollment already exists for webhook:', session.id);
      return;
    }

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      console.error('Course or user not found for webhook:', session.id);
      return;
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentStatus: 'completed',
      paymentId: session.payment_intent
    });

    // Update course statistics
    course.enrolledStudents.push(userId);
    course.totalStudents += 1;
    await course.save();

    // Update user enrolled courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { coursesEnrolled: courseId }
    });

    console.log('Enrollment completed via webhook:', enrollment._id);
  } catch (error) {
    console.error('Error handling enrollment from webhook:', error);
  }
};

// @desc    Get payment history
// @route   GET /api/checkout/history
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const enrollments = await Enrollment.find({
      user: req.user.id,
      paymentStatus: 'completed'
    })
      .populate('course', 'title image price discountPrice')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Enrollment.countDocuments({
      user: req.user.id,
      paymentStatus: 'completed'
    });

    // Calculate total spent
    const totalSpent = enrollments.reduce((sum, enrollment) => {
      const course = enrollment.course;
      const price = course.discountPrice || course.price;
      return sum + price;
    }, 0);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      total,
      totalSpent,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund course purchase
// @route   POST /api/checkout/refund/:enrollmentId
// @access  Private
const refundPurchase = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate('course');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Verify user owns this enrollment
    if (enrollment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this purchase'
      });
    }

    // Check refund eligibility (within 30 days and less than 20% progress)
    const enrollmentAge = Date.now() - enrollment.enrolledAt.getTime();
    const daysSinceEnrollment = enrollmentAge / (1000 * 60 * 60 * 24);

    if (daysSinceEnrollment > 30) {
      return res.status(400).json({
        success: false,
        message: 'Refund period has expired (30 days)'
      });
    }

    if (enrollment.progress.progressPercentage > 20) {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund after completing more than 20% of the course'
      });
    }

    if (enrollment.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'This purchase has already been refunded'
      });
    }

    // Process refund through Stripe
    if (enrollment.paymentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: enrollment.paymentId,
          reason: 'requested_by_customer',
          metadata: {
            enrollmentId: enrollment._id.toString(),
            reason: reason || 'User requested refund'
          }
        });

        // Update enrollment status
        enrollment.paymentStatus = 'refunded';
        enrollment.status = 'dropped';
        await enrollment.save();

        // Update course statistics
        const course = enrollment.course;
        course.enrolledStudents.pull(req.user.id);
        course.totalStudents -= 1;
        await course.save();

        // Remove from user's enrolled courses
        await User.findByIdAndUpdate(req.user.id, {
          $pull: { coursesEnrolled: course._id }
        });

        res.status(200).json({
          success: true,
          message: 'Refund processed successfully',
          data: {
            refundId: refund.id,
            amount: refund.amount / 100, // Convert from cents
            status: refund.status
          }
        });
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return res.status(500).json({
          success: false,
          message: 'Failed to process refund through payment processor'
        });
      }
    } else {
      // Handle refund for enrollments without payment ID (free courses, etc.)
      enrollment.paymentStatus = 'refunded';
      enrollment.status = 'dropped';
      await enrollment.save();

      res.status(200).json({
        success: true,
        message: 'Enrollment cancelled successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  handlePaymentSuccess,
  stripeWebhook,
  getPaymentHistory,
  refundPurchase
};