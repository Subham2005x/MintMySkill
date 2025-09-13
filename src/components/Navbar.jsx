import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl border-b border-purple-600 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">MintMySkill</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/features"
                className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-slate-700"
              >
                Features
              </Link>
              <Link
                to="/courses"
                className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-slate-700"
              >
                Courses
              </Link>
              {isAuthenticated() && (
                <Link
                  to="/dashboard"
                  className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-slate-700"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-200">Welcome, <span className="text-purple-300 font-medium">{user?.name}</span></span>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-primary-400 focus:outline-none focus:text-primary-400 p-2 rounded-md hover:bg-dark-800 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-b from-dark-900 to-dark-950 border-t border-primary-800">
            <Link
              to="/features"
              className="text-gray-300 hover:text-primary-400 hover:bg-dark-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/courses"
              className="text-gray-300 hover:text-primary-400 hover:bg-dark-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            {isAuthenticated() && (
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-primary-400 hover:bg-dark-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {isAuthenticated() ? (
              <div className="border-t border-primary-800 pt-4 mt-4">
                <div className="px-3 py-2 text-gray-300">Welcome, <span className="text-primary-400 font-medium">{user?.name}</span></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-gray-300 hover:text-primary-400 hover:bg-dark-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-primary-800 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-primary-400 hover:bg-dark-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary block text-center mx-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;