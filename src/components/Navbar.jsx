import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl border-b border-purple-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                MintMySkill
              </span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/features" className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </Link>
              <Link to="/courses" className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                Courses
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/tokens" className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                    Tokens
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-200">
                  Welcome, <span className="text-purple-300 font-medium">{user.name}</span>
                </span>
                {user.role === 'instructor' && (
                  <Link to="/instructor/create-course" className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm">
                    Create Course
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-outline text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-200 hover:text-purple-300 px-3 py-2 rounded-md text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;