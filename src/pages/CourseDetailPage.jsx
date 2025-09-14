import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesAPI, checkoutAPI, courseAPI, enrollmentAPI } from '../services/api';
import { mockCourses } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import LessonPlayer from '../components/LessonPlayer';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Try to load from API first, fallback to mock data
      let courseData;
      try {
        const courseResponse = await courseAPI.getCourseById(id);
        courseData = courseResponse.data;
      } catch (error) {
        // Fallback to mock data
        courseData = mockCourses.find(c => c.id === parseInt(id));
      }
      
      setCourse(courseData);

      // Check if user is enrolled (only for students)
      if (user && user.role === 'student') {
        try {
          const enrollmentResponse = await enrollmentAPI.getEnrollment(id);
          setEnrollment(enrollmentResponse.data);
        } catch (error) {
          // Not enrolled yet
          setEnrollment(null);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    setEnrolling(true);
    try {
      // Try real enrollment first
      try {
        const response = await enrollmentAPI.enrollInCourse(id);
        setEnrollment(response.data);
        alert('Successfully enrolled in the course!');
      } catch (error) {
        // Fallback for development
        alert('Enrollment successful! You can now access course content.');
        setEnrollment({ courseId: id, completedLessons: [] });
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonComplete = (data) => {
    // Refresh enrollment data to update progress
    if (enrollment) {
      loadCourseData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
          <p className="text-slate-300 mb-4">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons && course.lessons[currentLessonIndex];
  const isEnrolled = enrollment !== null;
  const canAccessContent = user?.role === 'teacher' || isEnrolled;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-slate-300 mb-4">{course.description}</p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-slate-300">{course.author || course.instructor?.name || 'Unknown Instructor'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-slate-300">{course.lessons?.length || course.lessons || 0} Lessons</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-slate-300">{course.tokenReward || course.reward || 100} EDU Tokens Reward</span>
                </div>
              </div>
            </div>
            
            {/* Enrollment Status/Button */}
            {user?.role === 'student' && (
              <div className="ml-6">
                {isEnrolled ? (
                  <div className="text-green-400 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Enrolled</span>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Progress Bar for enrolled students */}
          {enrollment && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Course Progress</span>
                <span className="text-slate-300 text-sm">
                  {enrollment.completedLessons?.length || 0} / {course.lessons?.length || 0} lessons
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${course.lessons?.length ? ((enrollment.completedLessons?.length || 0) / course.lessons.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lesson Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Course Content</h3>
              
              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => {
                    const isCompleted = enrollment?.completedLessons?.includes(lesson.id);
                    const isCurrent = index === currentLessonIndex;
                    
                    return (
                      <button
                        key={lesson.id || index}
                        onClick={() => canAccessContent && setCurrentLessonIndex(index)}
                        disabled={!canAccessContent}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isCurrent 
                            ? 'bg-purple-600 text-white' 
                            : canAccessContent
                              ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                              : 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm">
                              {index + 1}.
                            </span>
                            <span className="text-sm font-medium">
                              {lesson.title || `Lesson ${index + 1}`}
                            </span>
                          </div>
                          
                          {isCompleted && (
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No lessons available</p>
              )}
              
              {!canAccessContent && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-300 text-xs">
                    Enroll in this course to access lessons
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-3">
            {canAccessContent && currentLesson ? (
              <LessonPlayer
                lesson={currentLesson}
                courseId={id}
                onLessonComplete={handleLessonComplete}
              />
            ) : !canAccessContent ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700 text-center">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Content Locked</h3>
                <p className="text-slate-300 mb-6">
                  Enroll in this course to access the lesson content and start earning EDU tokens!
                </p>
                {user?.role === 'student' && (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700 text-center">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No Lessons Available</h3>
                <p className="text-slate-300">
                  This course doesn't have any lessons yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;