const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'coding', 'short-answer', 'essay'],
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }], // For multiple-choice questions
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed // Can be string, boolean, or object
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String],
  codeTemplate: {
    language: String,
    starterCode: String,
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: Boolean
    }]
  }, // For coding questions
  timeLimit: {
    type: Number, // in seconds
    default: 60
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  settings: {
    timeLimit: {
      type: Number, // Total quiz time in minutes
      default: 30
    },
    attemptsAllowed: {
      type: Number,
      default: 3
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    shuffleOptions: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    showScoreImmediately: {
      type: Boolean,
      default: true
    },
    requirePassToProgress: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: {
      type: Number,
      default: 0
    },
    timeSpent: Number // in seconds
  }],
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  maxPoints: {
    type: Number,
    default: 0
  },
  timeStarted: {
    type: Date,
    default: Date.now
  },
  timeCompleted: Date,
  timeSpent: Number, // Total time in seconds
  isPassed: {
    type: Boolean,
    default: false
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  }
});

// Middleware to calculate total points
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  this.updatedAt = new Date();
  next();
});

// Middleware to calculate score and percentage
quizAttemptSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.totalPoints = this.answers.reduce((total, answer) => total + answer.pointsEarned, 0);
    this.percentage = this.maxPoints > 0 ? Math.round((this.totalPoints / this.maxPoints) * 100) : 0;
    this.score = this.percentage;
  }
  next();
});

// Indexes for better performance
quizSchema.index({ course: 1, isActive: 1 });
quizSchema.index({ instructor: 1 });
quizAttemptSchema.index({ quiz: 1, student: 1 });
quizAttemptSchema.index({ student: 1, timeCompleted: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = {
  Quiz,
  QuizAttempt
};