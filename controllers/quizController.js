const { Quiz, QuizAttempt } = require('../models/Quiz');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, course, lesson, questions, settings } = req.body;

    // Verify course exists and user is the instructor
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseDoc.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only create quizzes for your own courses'
      });
    }

    const quiz = new Quiz({
      title,
      description,
      course,
      lesson,
      instructor: req.user.id,
      questions: questions || [],
      settings: { ...settings }
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// Get all quizzes for a course
const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { includeInactive = false } = req.query;

    const filter = { course: courseId };
    if (!includeInactive) {
      filter.isActive = true;
    }

    const quizzes = await Quiz.find(filter)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get course quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Get quiz by ID with student-safe data
const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id)
      .populate('course', 'title instructor')
      .populate('instructor', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user has access to this quiz
    const isInstructor = quiz.instructor._id.toString() === userId;
    const isEnrolled = quiz.course.students && quiz.course.students.includes(userId);

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this quiz'
      });
    }

    // Get user's previous attempts
    const attempts = await QuizAttempt.find({
      quiz: id,
      student: userId
    }).sort({ attemptNumber: -1 });

    let quizData = quiz.toObject();

    // If not instructor, remove correct answers and explanations
    if (!isInstructor) {
      quizData.questions = quizData.questions.map(question => {
        const safeQuestion = { ...question };
        delete safeQuestion.correctAnswer;
        delete safeQuestion.explanation;
        
        // For multiple choice, don't show which option is correct
        if (safeQuestion.options) {
          safeQuestion.options = safeQuestion.options.map(opt => ({
            text: opt.text,
            _id: opt._id
          }));
        }
        
        return safeQuestion;
      });
    }

    res.json({
      success: true,
      data: {
        quiz: quizData,
        attempts,
        canAttempt: attempts.length < quiz.settings.attemptsAllowed,
        isInstructor
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// Start a quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id).populate('course');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is enrolled in the course
    const isEnrolled = quiz.course.students && quiz.course.students.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to take this quiz'
      });
    }

    // Check previous attempts
    const previousAttempts = await QuizAttempt.find({
      quiz: id,
      student: userId
    });

    if (previousAttempts.length >= quiz.settings.attemptsAllowed) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached for this quiz'
      });
    }

    // Check if there's an active attempt
    const activeAttempt = previousAttempts.find(attempt => attempt.status === 'in-progress');
    if (activeAttempt) {
      return res.json({
        success: true,
        message: 'Continuing existing attempt',
        data: activeAttempt
      });
    }

    // Create new attempt
    const attempt = new QuizAttempt({
      quiz: id,
      student: userId,
      attemptNumber: previousAttempts.length + 1,
      maxPoints: quiz.totalPoints,
      timeStarted: new Date()
    });

    await attempt.save();

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      data: attempt
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz attempt',
      error: error.message
    });
  }
};

// Submit quiz answers
const submitQuizAttempt = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: id,
      student: userId,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found or already completed'
      });
    }

    const quiz = await Quiz.findById(id);
    
    // Grade the answers
    const gradedAnswers = [];
    let totalPointsEarned = 0;

    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      // Grade based on question type
      switch (question.questionType) {
        case 'multiple-choice':
          isCorrect = answer.userAnswer === question.correctAnswer;
          break;
        case 'true-false':
          isCorrect = answer.userAnswer === question.correctAnswer;
          break;
        case 'short-answer':
          // Simple string comparison (case-insensitive)
          isCorrect = answer.userAnswer.toLowerCase().trim() === 
                     question.correctAnswer.toLowerCase().trim();
          break;
        case 'coding':
          // For now, mark as correct if any answer is provided
          // In a real implementation, you'd run the code against test cases
          isCorrect = answer.userAnswer && answer.userAnswer.trim().length > 0;
          break;
        default:
          isCorrect = false;
      }

      if (isCorrect) {
        pointsEarned = question.points;
      }

      totalPointsEarned += pointsEarned;

      gradedAnswers.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: answer.timeSpent || 0
      });
    }

    // Calculate final score
    const percentage = quiz.totalPoints > 0 ? 
      Math.round((totalPointsEarned / quiz.totalPoints) * 100) : 0;
    const isPassed = percentage >= quiz.settings.passingScore;

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.totalPoints = totalPointsEarned;
    attempt.percentage = percentage;
    attempt.score = percentage;
    attempt.isPassed = isPassed;
    attempt.status = 'completed';
    attempt.timeCompleted = new Date();
    attempt.timeSpent = Math.floor((attempt.timeCompleted - attempt.timeStarted) / 1000);

    await attempt.save();

    // Prepare response with correct answers if settings allow
    let responseData = { attempt };

    if (quiz.settings.showCorrectAnswers) {
      const questionsWithAnswers = quiz.questions.map(question => ({
        _id: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        userAnswer: gradedAnswers.find(a => 
          a.questionId.toString() === question._id.toString()
        )?.userAnswer
      }));
      
      responseData.questionsWithAnswers = questionsWithAnswers;
    }

    res.json({
      success: true,
      message: `Quiz completed! Score: ${percentage}% ${isPassed ? '(Passed)' : '(Failed)'}`,
      data: responseData
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

// Get quiz analytics for instructors
const getQuizAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get all attempts for this quiz
    const attempts = await QuizAttempt.find({ quiz: id, status: 'completed' })
      .populate('student', 'name email')
      .sort({ timeCompleted: -1 });

    // Calculate analytics
    const totalAttempts = attempts.length;
    const uniqueStudents = [...new Set(attempts.map(a => a.student._id.toString()))].length;
    const averageScore = totalAttempts > 0 ? 
      attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts : 0;
    const passRate = totalAttempts > 0 ? 
      (attempts.filter(a => a.isPassed).length / totalAttempts) * 100 : 0;

    // Question-level analytics
    const questionAnalytics = quiz.questions.map(question => {
      const questionAttempts = attempts.filter(attempt => 
        attempt.answers.some(answer => 
          answer.questionId.toString() === question._id.toString()
        )
      );

      const correctAnswers = questionAttempts.filter(attempt =>
        attempt.answers.find(answer => 
          answer.questionId.toString() === question._id.toString() && answer.isCorrect
        )
      ).length;

      return {
        questionId: question._id,
        questionText: question.questionText,
        totalAttempts: questionAttempts.length,
        correctAnswers,
        successRate: questionAttempts.length > 0 ? 
          (correctAnswers / questionAttempts.length) * 100 : 0
      };
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalAttempts,
          uniqueStudents,
          averageScore: Math.round(averageScore * 100) / 100,
          passRate: Math.round(passRate * 100) / 100
        },
        attempts,
        questionAnalytics
      }
    });
  } catch (error) {
    console.error('Get quiz analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz analytics',
      error: error.message
    });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own quizzes'
      });
    }

    Object.assign(quiz, updates);
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// Get all quizzes for an instructor
const getInstructorQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;

    const quizzes = await Quiz.find({ instructor: userId })
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .select('-questions.correctAnswers -questions.testCases');

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get instructor quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own quizzes'
      });
    }

    // Delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quiz: id });
    
    // Delete the quiz
    await Quiz.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

module.exports = {
  createQuiz,
  getCourseQuizzes,
  getQuiz,
  getInstructorQuizzes,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAnalytics,
  updateQuiz,
  deleteQuiz
};