import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking  for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link to="/" className="btn-primary block">
            Go Home
          </Link>
          <Link to="/courses" className="btn-outline block">
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;