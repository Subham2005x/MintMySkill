const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for different file types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `mintmyskill/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    },
  });
};

// Video storage configuration
const videoStorage = createStorage('videos', ['mp4', 'avi', 'mov', 'wmv', 'flv']);

// Image storage configuration  
const imageStorage = createStorage('images', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Document storage configuration
const documentStorage = createStorage('documents', ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx']);

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  video: 100 * 1024 * 1024, // 100MB
  image: 5 * 1024 * 1024,   // 5MB
  document: 10 * 1024 * 1024 // 10MB
};

// Create multer instances for different file types
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.video },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.image },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.document },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (PDF, DOC, DOCX, TXT, PPT, PPTX) are allowed!'), false);
    }
  }
});

// Utility function to delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error('Failed to delete file from Cloudinary');
  }
};

module.exports = {
  cloudinary,
  videoUpload,
  imageUpload,
  documentUpload,
  deleteFile,
  FILE_SIZE_LIMITS
};