const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Enrollment Status
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'paused'],
    default: 'active'
  },
  
  // Progress Tracking
  progress: {
    completedLessons: [{
      lessonId: String,
      completedAt: {
        type: Date,
        default: Date.now
      },
      timeSpent: Number // in minutes
    }],
    totalLessonsCompleted: {
      type: Number,
      default: 0
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    }
  },
  
  // Completion Details
  completedAt: Date,
  tokensEarned: {
    type: Number,
    default: 0
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: String,
  
  // Enrollment Metadata
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  
  // Notes and Bookmarks
  notes: [{
    lessonId: String,
    content: String,
    timestamp: Number, // video timestamp in seconds
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [String], // lesson IDs
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique enrollment per user-course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Indexes for better performance
enrollmentSchema.index({ user: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to mark lesson as completed
enrollmentSchema.methods.completeLesson = async function(lessonId, timeSpent = 0) {
  // Check if lesson is already completed
  const existingCompletion = this.progress.completedLessons.find(
    lesson => lesson.lessonId === lessonId
  );
  
  if (!existingCompletion) {
    this.progress.completedLessons.push({
      lessonId,
      timeSpent
    });
    this.progress.totalLessonsCompleted += 1;
    this.progress.totalTimeSpent += timeSpent;
  }
  
  // Update progress percentage
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  
  if (course && course.content.totalLessons > 0) {
    this.progress.progressPercentage = Math.round(
      (this.progress.totalLessonsCompleted / course.content.totalLessons) * 100
    );
  }
  
  this.lastAccessed = new Date();
  await this.save();
  
  return this.progress.progressPercentage;
};

// Method to complete the entire course
enrollmentSchema.methods.completeCourse = async function() {
  const Course = mongoose.model('Course');
  const User = mongoose.model('User');
  
  const course = await Course.findById(this.course);
  const user = await User.findById(this.user);
  
  if (!course || !user) {
    throw new Error('Course or User not found');
  }
  
  // Update enrollment status
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress.progressPercentage = 100;
  
  // Calculate tokens earned (base + bonus)
  let tokensEarned = course.tokenReward;
  
  // Early completion bonus (completed within expected time)
  if (course.bonusTokens.earlyCompletion > 0) {
    const expectedDuration = course.content.totalDuration; // in minutes
    const actualDuration = this.progress.totalTimeSpent;
    
    if (actualDuration <= expectedDuration * 0.8) { // 20% faster
      tokensEarned += course.bonusTokens.earlyCompletion;
    }
  }
  
  // Perfect score bonus
  if (this.finalScore >= 95 && course.bonusTokens.perfectScore > 0) {
    tokensEarned += course.bonusTokens.perfectScore;
  }
  
  this.tokensEarned = tokensEarned;
  
  // Update user token balance
  await user.addTokens(tokensEarned, `Completed course: ${course.title}`);
  
  // Update course statistics
  course.completedStudents += 1;
  await course.save();
  
  // Generate certificate ID
  this.certificateId = `CERT-${course._id}-${user._id}-${Date.now()}`;
  this.certificateIssued = true;
  
  await this.save();
  
  return {
    tokensEarned,
    certificateId: this.certificateId
  };
};

// Method to add a note
enrollmentSchema.methods.addNote = function(lessonId, content, timestamp = 0) {
  this.notes.push({
    lessonId,
    content,
    timestamp
  });
  return this.save();
};

// Method to add bookmark
enrollmentSchema.methods.addBookmark = function(lessonId) {
  if (!this.bookmarks.includes(lessonId)) {
    this.bookmarks.push(lessonId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Virtual for enrollment duration
enrollmentSchema.virtual('enrollmentDuration').get(function() {
  const start = this.enrolledAt;
  const end = this.completedAt || new Date();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // days
});

// Ensure virtual fields are serialized
enrollmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);