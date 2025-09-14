import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';

const QuizManagementPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getInstructorQuizzes();
      setQuizzes(data);
    } catch (error) {
      setError('Failed to fetch quizzes');
      console.error('Fetch quizzes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await quizAPI.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
    } catch (error) {
      console.error('Delete quiz error:', error);
      alert('Failed to delete quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === 'all') return true;
    return quiz.isPublished === (filter === 'published');
  });

  const getQuizStatusBadge = (quiz) => {
    if (quiz.isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
        Draft
      </span>
    );
  };

  const getQuizDifficulty = (difficulty) => {
    const colors = {
      easy: 'bg-green-900 text-green-300',
      medium: 'bg-yellow-900 text-yellow-300',
      hard: 'bg-red-900 text-red-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[difficulty] || colors.medium}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Quiz Management</h1>
        <Link
          to="/instructor/create-quiz"
          className="btn-primary"
        >
          Create New Quiz
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All Quizzes' },
          { key: 'published', label: 'Published' },
          { key: 'draft', label: 'Draft' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Quizzes</dt>
                <dd className="text-lg font-medium text-white">{quizzes.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Published</dt>
                <dd className="text-lg font-medium text-white">
                  {quizzes.filter(q => q.isPublished).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Draft</dt>
                <dd className="text-lg font-medium text-white">
                  {quizzes.filter(q => !q.isPublished).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No quizzes found</h3>
          <p className="text-gray-400 mb-4">
            {filter === 'all' 
              ? "You haven't created any quizzes yet." 
              : `No ${filter} quizzes found.`}
          </p>
          <Link to="/instructor/create-quiz" className="btn-primary">
            Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                    {getQuizStatusBadge(quiz)}
                    {getQuizDifficulty(quiz.difficulty)}
                  </div>
                  
                  <p className="text-gray-300 mb-4">{quiz.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Questions:</span>
                      <p className="text-white font-medium">{quiz.questions?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Time Limit:</span>
                      <p className="text-white font-medium">
                        {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Pass Mark:</span>
                      <p className="text-white font-medium">{quiz.passingScore}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Attempts:</span>
                      <p className="text-white font-medium">
                        {quiz.maxAttempts || 'Unlimited'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/quiz/${quiz._id}`}
                    className="btn-outline text-sm"
                  >
                    Preview
                  </Link>
                  <Link
                    to={`/instructor/edit-quiz/${quiz._id}`}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizManagementPage;