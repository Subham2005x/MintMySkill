import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizAPI } from '../services/api';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  // Fetch quiz data
  const { data: quizData, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizAPI.getQuiz(quizId),
    enabled: !!quizId
  });

  // Start quiz attempt mutation
  const startAttemptMutation = useMutation({
    mutationFn: () => quizAPI.startAttempt(quizId),
    onSuccess: (data) => {
      setAttemptId(data.data._id);
      setQuizStarted(true);
      setTimeRemaining(quizData.quiz.settings.timeLimit * 60); // Convert to seconds
    }
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: (answersData) => quizAPI.submitAttempt(quizId, attemptId, { answers: answersData }),
    onSuccess: (data) => {
      setResults(data.data);
      setShowResults(true);
      queryClient.invalidateQueries(['quiz', quizId]);
    }
  });

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining]);

  const handleStartQuiz = () => {
    startAttemptMutation.mutate();
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    const answersArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer
    }));

    submitQuizMutation.mutate(answersArray);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Quiz not found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const quiz = quizData.quiz;
  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Results view
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h1>
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-semibold ${
                results.attempt.isPassed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                Score: {results.attempt.percentage}% 
                {results.attempt.isPassed ? ' (Passed)' : ' (Failed)'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{results.attempt.totalPoints}</div>
                <div className="text-gray-600">Points Earned</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{results.attempt.maxPoints}</div>
                <div className="text-gray-600">Total Points</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{formatTime(results.attempt.timeSpent)}</div>
                <div className="text-gray-600">Time Taken</div>
              </div>
            </div>

            {results.questionsWithAnswers && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Review Your Answers</h2>
                {results.questionsWithAnswers.map((question, index) => (
                  <div key={question._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Question {index + 1}: {question.questionText}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        question.userAnswer === question.correctAnswer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.userAnswer === question.correctAnswer ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Your Answer: </span>
                        <span className="text-gray-900">{question.userAnswer}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Correct Answer: </span>
                        <span className="text-green-600">{question.correctAnswer}</span>
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <span className="font-medium text-blue-800">Explanation: </span>
                          <span className="text-blue-700">{question.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate(`/courses/${quiz.course}`)}
                className="btn-primary"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-quiz start view
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{quiz.title}</h1>
            
            {quiz.description && (
              <p className="text-gray-700 mb-6">{quiz.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Questions:</span>
                  <span className="text-gray-900">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Time Limit:</span>
                  <span className="text-gray-900">{quiz.settings.timeLimit} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Passing Score:</span>
                  <span className="text-gray-900">{quiz.settings.passingScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Attempts Allowed:</span>
                  <span className="text-gray-900">{quiz.settings.attemptsAllowed}</span>
                </div>
              </div>

              {quizData.attempts && quizData.attempts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Previous Attempts</h3>
                  <div className="space-y-2">
                    {quizData.attempts.map((attempt, index) => (
                      <div key={attempt._id} className="flex justify-between text-sm">
                        <span>Attempt {attempt.attemptNumber}</span>
                        <span className={attempt.isPassed ? 'text-green-600' : 'text-red-600'}>
                          {attempt.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {quizData.canAttempt ? (
              <div className="text-center">
                <button
                  onClick={handleStartQuiz}
                  disabled={startAttemptMutation.isLoading}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  {startAttemptMutation.isLoading ? 'Starting...' : 'Start Quiz'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-red-600 mb-4">You have used all your attempts for this quiz.</p>
                <button
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with timer and progress */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Time: {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {currentQuestion.questionText}
          </h2>

          <QuestionInput
            question={currentQuestion}
            value={answers[currentQuestion._id] || ''}
            onChange={(value) => handleAnswerChange(currentQuestion._id, value)}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-4">
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitQuizMutation.isLoading}
                className="btn-primary px-8"
              >
                {submitQuizMutation.isLoading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Question input component based on question type
const QuestionInput = ({ question, value, onChange }) => {
  switch (question.questionType) {
    case 'multiple-choice':
      return (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label key={option._id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={question._id}
                value={option.text}
                checked={value === option.text}
                onChange={(e) => onChange(e.target.value)}
                className="form-radio text-primary-600"
              />
              <span className="text-gray-900">{option.text}</span>
            </label>
          ))}
        </div>
      );

    case 'true-false':
      return (
        <div className="space-y-3">
          {['True', 'False'].map((option) => (
            <label key={option} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={question._id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="form-radio text-primary-600"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'short-answer':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter your answer..."
        />
      );

    case 'coding':
      return (
        <div>
          {question.codeTemplate && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Starter Code ({question.codeTemplate.language}):</h4>
              <pre className="text-sm text-gray-700">{question.codeTemplate.starterCode}</pre>
            </div>
          )}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            rows={10}
            placeholder="Write your code here..."
          />
        </div>
      );

    case 'essay':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={6}
          placeholder="Write your essay here..."
        />
      );

    default:
      return null;
  }
};

export default QuizTakePage;