const express = require('express');
const {
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
} = require('../controllers/courseController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getCourses);

// Protected routes - specific endpoints first
router.get('/enrolled', protect, getEnrolledCourses);

// Public course detail (put after specific routes to avoid conflicts)
router.get('/:id', optionalAuth, getCourse);

// More protected routes
router.post('/:id/enroll', protect, enrollInCourse);
router.post('/:id/lessons/:lessonId/complete', protect, completeLesson);
router.post('/:id/complete', protect, completeCourse);
router.post('/:id/reviews', protect, reviewValidation, addReview);

// Instructor/Admin routes
router.post('/', authorize('instructor', 'admin'), createCourseValidation, createCourse);
router.put('/:id', authorize('instructor', 'admin'), createCourseValidation, updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), deleteCourse);

module.exports = router;