import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CourseCard from '../components/CourseCard';
import { coursesAPI } from '../services/api';
import { mockCourses } from '../data/mockData';

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Use React Query for data fetching
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesAPI.getCourses,
    // Use mock data when backend is not available
    initialData: mockCourses,
  });

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = !selectedLevel || course.level.toLowerCase().includes(selectedLevel.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
                           course.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const categories = [...new Set(courses.flatMap(course => course.tags))];
  const levels = [...new Set(courses.map(course => course.level))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Courses</h2>
          <p className="text-slate-300">Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-xl border-b border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Explore Our Courses
            </h1>
            <p className="text-xl text-slate-200 mb-8">
              Learn new skills and earn tokens while building your career
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Found
          </h2>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-300">Sort by:</span>
            <select className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Most Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
            </select>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No courses found</h3>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;