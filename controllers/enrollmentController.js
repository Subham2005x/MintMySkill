const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const tokenRewardService = require('../services/tokenRewardService');

/**
 * Mark lesson as completed and check for course completion
 */
const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { timeSpent = 0 } = req.body;
    const userId = req.user.id;

    // Find enrollment
    let enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if lesson already completed
    const lessonAlreadyCompleted = enrollment.progress.completedLessons.some(
      lesson => lesson.lessonId === lessonId
    );

    if (lessonAlreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Lesson already completed'
      });
    }

    // Add lesson to completed lessons
    enrollment.progress.completedLessons.push({
      lessonId,
      completedAt: new Date(),
      timeSpent
    });

    enrollment.progress.totalLessonsCompleted += 1;
    enrollment.progress.totalTimeSpent += timeSpent;
    enrollment.lastAccessed = new Date();

    // Get course details to calculate progress
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Calculate progress percentage
    const totalLessons = course.content.totalLessons || course.content.lessons.length;
    enrollment.progress.progressPercentage = Math.round(
      (enrollment.progress.totalLessonsCompleted / totalLessons) * 100
    );

    // Check if course is completed (100% progress)
    const courseCompleted = enrollment.progress.progressPercentage >= 100;

    if (courseCompleted && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      // Trigger token reward for course completion
      try {
        const rewardResult = await tokenRewardService.rewardCourseCompletion(userId, courseId);
        enrollment.tokensEarned = rewardResult.rewardAmount;
        
        console.log(`🎉 Course completed! Rewarded ${rewardResult.rewardAmount} tokens to user ${userId}`);
      } catch (error) {
        console.error('❌ Failed to reward tokens for course completion:', error.message);
        // Don't fail the completion, just log the error
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: lessonAlreadyCompleted ? 'Lesson already completed' : 'Lesson completed successfully',
      data: {
        enrollment,
        courseCompleted,
        progressPercentage: enrollment.progress.progressPercentage,
        tokensEarned: courseCompleted ? enrollment.tokensEarned : 0
      }
    });

  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson',
      error: error.message
    });
  }
};

/**
 * Get user's course progress
 */
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    }).populate('course', 'title content');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });

  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course progress',
      error: error.message
    });
  }
};

/**
 * Get all user enrollments with progress
 */
const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate('course', 'title description image price tokenReward')
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      data: enrollments
    });

  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
};

/**
 * Enroll user in a course
 */
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
      paymentStatus: 'completed' // Assuming payment is handled elsewhere
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
      $inc: { totalStudents: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
};

/**
 * Add note to a lesson
 */
const addLessonNote = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { content, timestamp = 0 } = req.body;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    enrollment.notes.push({
      lessonId,
      content,
      timestamp,
      createdAt: new Date()
    });

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: enrollment.notes[enrollment.notes.length - 1]
    });

  } catch (error) {
    console.error('Error adding lesson note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

module.exports = {
  completeLesson,
  getCourseProgress,
  getUserEnrollments,
  enrollInCourse,
  addLessonNote
};