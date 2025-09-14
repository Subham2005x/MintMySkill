import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizAPI } from '../services/api';

const CreateQuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    settings: {
      timeLimit: 30,
      attemptsAllowed: 3,
      passingScore: 70,
      shuffleQuestions: true,
      shuffleOptions: true,
      showCorrectAnswers: true,
      showScoreImmediately: true,
      requirePassToProgress: false
    }
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple-choice',
    options: [{ text: '', isCorrect: false }],
    correctAnswer: '',
    explanation: '',
    points: 1,
    difficulty: 'medium',
    timeLimit: 60
  });

  const createQuizMutation = useMutation({
    mutationFn: (data) => quizAPI.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-quizzes', courseId]);
      navigate(`/instructor/courses/${courseId}/quizzes`);
    }
  });

  const handleQuizDataChange = (field, value) => {
    if (field.includes('settings.')) {
      const settingField = field.replace('settings.', '');
      setQuizData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value
        }
      }));
    } else {
      setQuizData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  };

  const updateOption = (index, field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 1) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert('Please enter a question text');
      return;
    }

    let processedQuestion = { ...currentQuestion };

    // Set correct answer based on question type
    if (currentQuestion.questionType === 'multiple-choice') {
      const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
      if (!correctOption) {
        alert('Please mark the correct option');
        return;
      }
      processedQuestion.correctAnswer = correctOption.text;
    }

    setQuestions(prev => [...prev, { ...processedQuestion, _id: Date.now().toString() }]);
    
    // Reset current question
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple-choice',
      options: [{ text: '', isCorrect: false }],
      correctAnswer: '',
      explanation: '',
      points: 1,
      difficulty: 'medium',
      timeLimit: 60
    });
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q._id !== questionId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    const finalQuizData = {
      ...quizData,
      course: courseId,
      questions: questions.map(q => {
        const { _id, ...questionWithoutId } = q;
        return questionWithoutId;
      })
    };

    createQuizMutation.mutate(finalQuizData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Quiz Basic Info */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizData.title}
                    onChange={(e) => handleQuizDataChange('title', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={quizData.settings.timeLimit}
                    onChange={(e) => handleQuizDataChange('settings.timeLimit', parseInt(e.target.value))}
                    min="1"
                    max="180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attempts Allowed
                  </label>
                  <input
                    type="number"
                    value={quizData.settings.attemptsAllowed}
                    onChange={(e) => handleQuizDataChange('settings.attemptsAllowed', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={quizData.settings.passingScore}
                    onChange={(e) => handleQuizDataChange('settings.passingScore', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => handleQuizDataChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter quiz description"
                />
              </div>

              {/* Quiz Settings */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Quiz Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quizData.settings.shuffleQuestions}
                      onChange={(e) => handleQuizDataChange('settings.shuffleQuestions', e.target.checked)}
                      className="mr-2"
                    />
                    Shuffle Questions
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quizData.settings.shuffleOptions}
                      onChange={(e) => handleQuizDataChange('settings.shuffleOptions', e.target.checked)}
                      className="mr-2"
                    />
                    Shuffle Options
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quizData.settings.showCorrectAnswers}
                      onChange={(e) => handleQuizDataChange('settings.showCorrectAnswers', e.target.checked)}
                      className="mr-2"
                    />
                    Show Correct Answers
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quizData.settings.showScoreImmediately}
                      onChange={(e) => handleQuizDataChange('settings.showScoreImmediately', e.target.checked)}
                      className="mr-2"
                    />
                    Show Score Immediately
                  </label>
                </div>
              </div>
            </div>

            {/* Add Question Section */}
            <div className="mb-8 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Question</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={currentQuestion.questionText}
                    onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your question"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={currentQuestion.questionType}
                      onChange={(e) => handleQuestionChange('questionType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="short-answer">Short Answer</option>
                      <option value="coding">Coding</option>
                      <option value="essay">Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={currentQuestion.difficulty}
                      onChange={(e) => handleQuestionChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (sec)
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.timeLimit}
                      onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value))}
                      min="10"
                      max="600"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Question Type Specific Fields */}
                {currentQuestion.questionType === 'multiple-choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="correct-option"
                            checked={option.isCorrect}
                            onChange={() => {
                              const updatedOptions = currentQuestion.options.map((opt, i) => ({
                                ...opt,
                                isCorrect: i === index
                              }));
                              handleQuestionChange('options', updatedOptions);
                            }}
                            className="form-radio text-primary-600"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(index, 'text', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder={`Option ${index + 1}`}
                          />
                          {currentQuestion.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}

                {currentQuestion.questionType === 'true-false' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="true-false-answer"
                          value="True"
                          checked={currentQuestion.correctAnswer === 'True'}
                          onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                          className="mr-2"
                        />
                        True
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="true-false-answer"
                          value="False"
                          checked={currentQuestion.correctAnswer === 'False'}
                          onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                          className="mr-2"
                        />
                        False
                      </label>
                    </div>
                  </div>
                )}

                {(currentQuestion.questionType === 'short-answer' || currentQuestion.questionType === 'essay') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer / Sample Answer
                    </label>
                    <textarea
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter the correct answer or a sample answer"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={currentQuestion.explanation}
                    onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Explain why this is the correct answer"
                  />
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-secondary"
                >
                  Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="mb-8 border-t border-gray-200 pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Questions ({questions.length})
                </h2>
                
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            Question {index + 1}: {question.questionText}
                          </h3>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>Type: {question.questionType}</span>
                            <span>Points: {question.points}</span>
                            <span>Difficulty: {question.difficulty}</span>
                          </div>
                          {question.questionType === 'multiple-choice' && (
                            <div className="mt-2 text-sm text-gray-600">
                              Options: {question.options.map(opt => opt.text).join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createQuizMutation.isLoading || questions.length === 0}
                className="btn-primary"
              >
                {createQuizMutation.isLoading ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;