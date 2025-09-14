const express = require('express');
const {
  uploadVideo,
  uploadImage,
  uploadDocument,
  uploadMultiple,
  deleteUploadedFile
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   POST /api/upload/video
// @desc    Upload video file
// @access  Private (Instructors only)
router.post('/video', authorize('instructor', 'admin'), uploadVideo);

// @route   POST /api/upload/image
// @desc    Upload image file (avatars, course thumbnails)
// @access  Private
router.post('/image', uploadImage);

// @route   POST /api/upload/document
// @desc    Upload document file
// @access  Private (Instructors only)
router.post('/document', authorize('instructor', 'admin'), uploadDocument);

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private (Instructors only)
router.post('/multiple', authorize('instructor', 'admin'), uploadMultiple);

// @route   DELETE /api/upload/:publicId
// @desc    Delete uploaded file
// @access  Private
router.delete('/:publicId', deleteUploadedFile);

module.exports = router;