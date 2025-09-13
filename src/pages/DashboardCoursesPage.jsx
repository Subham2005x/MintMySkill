import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesAPI } from '../services/api';
import { mockEnrolledCourses } from '../data/mockData';
import CourseCard from '../components/CourseCard';

const DashboardCoursesPage = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Fetch enrolled courses
  const { data: enrolledCourses = [], isLoading } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: coursesAPI.getEnrolledCourses,
    initialData: mockEnrolledCourses,
  });

  const handleMarkCompleted = async (courseId) => {
    try {
      // For development: simulate marking course as completed
      alert('Course marked as completed! Tokens have been added to your wallet.');
      
      // Uncomment when backend is ready:
      // await coursesAPI.markCourseCompleted(courseId);
      // Refetch the courses to update the UI
    } catch (error) {
      console.error('Failed to mark course as completed:', error);
      alert('Failed to mark course as completed. Please try again.');
    }
  };

  // Filter courses based on selected filter
  const filteredCourses = enrolledCourses.filter(course => {
    if (filter === 'all') return true;
    if (filter === 'active') return course.status === 'active';
    if (filter === 'completed') return course.status === 'completed';
    return true;
  });

  const stats = {
    total: enrolledCourses.length,
    active: enrolledCourses.filter(c => c.status === 'active').length,
    completed: enrolledCourses.filter(c => c.status === 'completed').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track your progress and continue learning
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Enrolled</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Courses', count: stats.total },
            { key: 'active', label: 'In Progress', count: stats.active },
            { key: 'completed', label: 'Completed', count: stats.completed },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`${
                filter === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              {tab.label}
              <span className={`${
                filter === tab.key ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'
              } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No {filter === 'all' ? '' : filter} courses found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You haven't enrolled in any courses yet." 
              : `You don't have any ${filter} courses.`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="relative">
              <CourseCard 
                course={course} 
                showEnrollButton={false}
                showProgress={true}
              />
              
              {/* Mark as Complete Button for Active Courses */}
              {course.status === 'active' && course.progress >= 100 && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleMarkCompleted(course.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    Mark Complete
                  </button>
                </div>
              )}
              
              {/* Course Status Badge */}
              {course.status === 'completed' && (
                <div className="absolute top-4 left-4">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCoursesPage;