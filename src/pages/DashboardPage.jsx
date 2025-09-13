import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../services/api';
import { mockEnrolledCourses, mockUserData } from '../data/mockData';
import CourseCard from '../components/CourseCard';

const DashboardPage = () => {
  const { user } = useAuth();

  // Fetch enrolled courses
  const { data: enrolledCourses = [], isLoading } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: coursesAPI.getEnrolledCourses,
    initialData: mockEnrolledCourses,
  });

  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter(course => course.status === 'completed').length,
    inProgressCourses: enrolledCourses.filter(course => course.status === 'active').length,
    tokensEarned: mockUserData.totalTokensEarned,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'course_completed',
      title: 'Completed Blockchain Fundamentals',
      time: '2 days ago',
      tokens: 150,
    },
    {
      id: 2,
      type: 'milestone_reached',
      title: 'Reached 50% in React Development',
      time: '1 week ago',
      tokens: 25,
    },
    {
      id: 3,
      type: 'course_enrolled',
      title: 'Enrolled in Python Data Science',
      time: '2 weeks ago',
      tokens: 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Here's what's happening with your learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Courses</p>
              <p className="text-2xl font-semibold text-white">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Completed</p>
              <p className="text-2xl font-semibold text-white">{stats.completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">In Progress</p>
              <p className="text-2xl font-semibold text-white">{stats.inProgressCourses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Tokens Earned</p>
              <p className="text-2xl font-semibold text-white">{stats.tokensEarned}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
            <Link to="/dashboard/courses" className="text-sm text-purple-400 hover:text-purple-300">
              View all courses
            </Link>
          </div>
          
          {enrolledCourses.filter(course => course.status === 'active').length === 0 ? (
            <div className="card text-center py-8">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">No active courses</h3>
              <p className="mt-1 text-sm text-slate-400">Start learning by enrolling in a course.</p>
              <div className="mt-6">
                <Link to="/courses" className="btn-primary">
                  Browse Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses
                .filter(course => course.status === 'active')
                .slice(0, 2)
                .map(course => (
                  <div key={course.id} className="card">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-400">{course.author}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="btn-primary text-sm"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <div className="card">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-600"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-700 ${
                            activity.type === 'course_completed' 
                              ? 'bg-green-600' 
                              : activity.type === 'milestone_reached'
                              ? 'bg-blue-600'
                              : 'bg-slate-600'
                          }`}>
                            {activity.type === 'course_completed' ? (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : activity.type === 'milestone_reached' ? (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-white">{activity.title}</p>
                            {activity.tokens > 0 && (
                              <p className="text-sm text-green-400 font-medium">
                                +{activity.tokens} tokens earned
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-slate-400">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;