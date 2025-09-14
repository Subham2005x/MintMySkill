const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'published', isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.level) {
      filter.level = req.query.level;
    }

    if (req.query.instructor) {
      filter.instructor = req.query.instructor;
    }

    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'price_low':
        sort = { price: 1 };
        break;
      case 'price_high':
        sort = { price: -1 };
        break;
      case 'students':
        sort = { totalStudents: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip(startIndex)
      .select('-reviews'); // Exclude reviews for list view

    const total = await Course.countDocuments(filter);

    // Pagination info
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pagination,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio socialLinks')
      .populate('reviews.user', 'name avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    let enrollmentData = null;

    if (req.user) {
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: course._id
      });

      if (enrollment) {
        isEnrolled = true;
        enrollmentData = {
          progress: enrollment.progress.progressPercentage,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          lastAccessed: enrollment.lastAccessed
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...course.toJSON(),
        isEnrolled,
        enrollmentData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Add instructor to req.body
    req.body.instructor = req.user.id;
    req.body.instructorName = req.user.name;

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
    
    if (enrollmentCount > 0) {
      // Don't delete, just deactivate
      course.isActive = false;
      course.status = 'archived';
      await course.save();
    } else {
      await course.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published' || !course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: course._id,
      paymentStatus: 'completed' // For free enrollment, set to completed
    });

    // Update course stats
    course.enrolledStudents.push(req.user.id);
    course.totalStudents += 1;
    await course.save();

    // Update user enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { coursesEnrolled: course._id }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
const getEnrolledCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const filter = { user: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate('course', 'title description image price instructor category level tokenReward')
      .populate('course.instructor', 'name')
      .sort({ enrolledAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Enrollment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      total,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/courses/:id/lessons/:lessonId/complete
// @access  Private
const completeLesson = async (req, res, next) => {
  try {
    const { timeSpent } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const progressPercentage = await enrollment.completeLesson(
      req.params.lessonId,
      timeSpent || 0
    );

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      data: {
        progress: progressPercentage,
        completedLessons: enrollment.progress.totalLessonsCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete course
// @route   POST /api/courses/:id/complete
// @access  Private
const completeCourse = async (req, res, next) => {
  try {
    const { finalScore } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Course already completed'
      });
    }

    // Set final score if provided
    if (finalScore !== undefined) {
      enrollment.finalScore = finalScore;
    }

    const result = await enrollment.completeCourse();

    res.status(200).json({
      success: true,
      message: 'Course completed successfully',
      data: {
        tokensEarned: result.tokensEarned,
        certificateId: result.certificateId,
        enrollment
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You must be enrolled in this course to leave a review'
      });
    }

    await course.addReview(req.user.id, rating, comment);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const createCourseValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Programming', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Blockchain', 'DevOps', 'Design', 'Digital Marketing', 'Business', 'Other'])
    .withMessage('Please select a valid category'),
  body('level')
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
    .withMessage('Please select a valid level'),
  body('tokenReward')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Token reward must be a positive number')
];

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrolledCourses,
  completeLesson,
  completeCourse,
  addReview,
  createCourseValidation,
  reviewValidation
};