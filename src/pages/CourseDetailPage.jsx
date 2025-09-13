import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesAPI, checkoutAPI } from '../services/api';
import { mockCourses } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  // Fetch course details
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesAPI.getCourse(id),
    // Use mock data when backend is not available
    initialData: mockCourses.find(c => c.id === parseInt(id)),
  });

  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    setEnrolling(true);
    try {
      // For development: simulate enrollment
      alert('Enrollment successful! Redirecting to dashboard...');
      navigate('/dashboard');
      
      // Uncomment when backend is ready:
      // const response = await checkoutAPI.createCheckoutSession(course.id);
      // window.location.href = response.url; // Redirect to payment
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="btn-primary"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {course.level}
                </span>
                <span>•</span>
                <span>{course.duration}</span>
                <span>•</span>
                <span>{course.lessons} lessons</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {course.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{course.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{course.students} students</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">By {course.author}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Pricing and Enroll */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                    <span className="text-gray-600 ml-2">one-time payment</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary-600">
                      +{course.tokenReward} tokens
                    </div>
                    <div className="text-sm text-gray-600">upon completion</div>
                  </div>
                </div>
                
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enrolling...
                    </div>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
                
                <p className="text-sm text-gray-500 text-center mt-2">
                  30-day money-back guarantee
                </p>
              </div>
            </div>

            {/* Course Image */}
            <div>
              <img
                src={course.image}
                alt={course.title}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Master React fundamentals and advanced concepts',
                  'Build real-world projects from scratch',
                  'Understand state management with hooks',
                  'Learn modern JavaScript ES6+ features',
                  'Implement responsive designs with CSS',
                  'Deploy applications to production',
                  'Best practices for code organization',
                  'Testing strategies and debugging techniques'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
              <div className="prose prose-gray max-w-none">
                <p>
                  This comprehensive React development course takes you from beginner to advanced level, 
                  covering everything you need to know to build modern web applications. You'll start with 
                  the fundamentals and progressively work through more complex concepts.
                </p>
                <p>
                  Through hands-on projects and real-world examples, you'll gain practical experience that 
                  you can immediately apply to your own projects. The course includes modern best practices, 
                  performance optimization techniques, and industry-standard workflows.
                </p>
                <p>
                  By the end of this course, you'll have built multiple projects and earned valuable tokens 
                  that you can redeem for exciting rewards in our marketplace.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{course.duration} of content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-gray-700">{course.lessons} lessons</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">Mobile & Desktop access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-gray-700">Certificate of completion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-gray-700">Earn {course.tokenReward} tokens</span>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {course.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{course.author}</div>
                  <div className="text-sm text-gray-600">Senior React Developer</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Experienced developer with 8+ years in web development and 5+ years teaching 
                React to thousands of students worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;