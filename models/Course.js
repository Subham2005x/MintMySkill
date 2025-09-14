const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  // Course Content
  content: {
    lessons: [{
      title: {
        type: String,
        required: true
      },
      description: String,
      video: {
        url: String,
        publicId: String, // Cloudinary public ID for deletion
        duration: Number, // in seconds
        format: String    // video format
      },
      materials: [{
        name: String,
        url: String,
        publicId: String, // Cloudinary public ID
        type: {
          type: String,
          enum: ['pdf', 'doc', 'video', 'image', 'other']
        },
        size: Number // file size in bytes
      }],
      order: {
        type: Number,
        required: true
      },
      isPreview: {
        type: Boolean,
        default: false // True if this lesson can be viewed without purchase
      }
    }],
    totalLessons: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0 // in minutes
    }
  },
  
  // Instructor Information
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  instructorName: {
    type: String,
    required: true
  },
  
  // Course Details
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  image: {
    url: {
      type: String,
      required: [true, 'Course image URL is required']
    },
    publicId: String // Cloudinary public ID for deletion
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'Programming',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'Blockchain',
      'DevOps',
      'Design',
      'Digital Marketing',
      'Business',
      'Other'
    ]
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  },
  language: {
    type: String,
    default: 'English'
  },
  tags: [String],
  
  // Token Rewards
  tokenReward: {
    type: Number,
    required: [true, 'Token reward is required'],
    min: [0, 'Token reward cannot be negative'],
    default: 100
  },
  bonusTokens: {
    earlyCompletion: {
      type: Number,
      default: 0
    },
    perfectScore: {
      type: Number,
      default: 0
    }
  },
  
  // Course Statistics
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalStudents: {
    type: Number,
    default: 0
  },
  completedStudents: {
    type: Number,
    default: 0
  },
  
  // Ratings and Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Course Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Requirements and Learning Outcomes
  requirements: [String],
  learningOutcomes: [String],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });

// Pre-save middleware
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update total lessons and duration
  if (this.content && this.content.lessons) {
    this.content.totalLessons = this.content.lessons.length;
    this.content.totalDuration = this.content.lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
  }
  
  next();
});

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Method to add a review
courseSchema.methods.addReview = async function(userId, rating, comment) {
  // Check if user already reviewed this course
  const existingReview = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating,
      comment
    });
  }
  
  this.calculateAverageRating();
  await this.save();
};

// Virtual for course duration in hours
courseSchema.virtual('durationInHours').get(function() {
  return Math.round((this.content.totalDuration / 60) * 10) / 10;
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function() {
  if (this.totalStudents === 0) return 0;
  return Math.round((this.completedStudents / this.totalStudents) * 100);
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);