const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  completeLesson,
  getCourseProgress,
  getUserEnrollments,
  enrollInCourse,
  addLessonNote
} = require('../controllers/enrollmentController');

// @desc    Get all user enrollments
// @route   GET /api/enrollments
// @access  Private
router.get('/', protect, getUserEnrollments);

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private
router.post('/:courseId', protect, enrollInCourse);

// @desc    Get course progress
// @route   GET /api/enrollments/:courseId/progress
// @access  Private
router.get('/:courseId/progress', protect, getCourseProgress);

// @desc    Complete a lesson
// @route   POST /api/enrollments/:courseId/lessons/:lessonId/complete
// @access  Private
router.post('/:courseId/lessons/:lessonId/complete', protect, completeLesson);

// @desc    Add note to a lesson
// @route   POST /api/enrollments/:courseId/lessons/:lessonId/notes
// @access  Private
router.post('/:courseId/lessons/:lessonId/notes', protect, addLessonNote);

module.exports = router;