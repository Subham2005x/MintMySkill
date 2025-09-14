const { videoUpload, imageUpload, documentUpload, deleteFile } = require('../config/cloudinary');

// @desc    Upload video file
// @route   POST /api/upload/video
// @access  Private (Instructors only)
const uploadVideo = (req, res, next) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        format: req.file.format
      }
    });
  });
};

// @desc    Upload image file
// @route   POST /api/upload/image
// @access  Private
const uploadImage = (req, res, next) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        format: req.file.format
      }
    });
  });
};

// @desc    Upload document file
// @route   POST /api/upload/document
// @access  Private (Instructors only)
const uploadDocument = (req, res, next) => {
  documentUpload.single('document')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        format: req.file.format
      }
    });
  });
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private (Instructors only)
const uploadMultiple = (req, res, next) => {
  // Use multer to handle multiple file types
  const upload = imageUpload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]);

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    const files = {};
    
    if (req.files.images) {
      files.images = req.files.images.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
    }

    if (req.files.documents) {
      files.documents = req.files.documents.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: files
    });
  });
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:publicId
// @access  Private
const deleteUploadedFile = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFile(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadVideo,
  uploadImage,
  uploadDocument,
  uploadMultiple,
  deleteUploadedFile
};