import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Learn. <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Earn.</span> <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Redeem.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">
              Master new skills, earn blockchain tokens, and redeem rewards on the world's first 
              token-based learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="btn-primary text-lg px-8 py-4"
              >
                Explore Courses
              </Link>
              <Link
                to="/register"
                className="btn-outline text-lg px-8 py-4"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose MintMyskills?
            </h2>
            <p className="text-xl text-slate-300">
              Revolutionary learning experience with blockchain rewards
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-b from-dark-800 to-dark-900 rounded-xl border border-primary-800 hover:border-primary-600 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-800">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Expert-Led Courses</h3>
              <p className="text-gray-400">
                Learn from industry experts with hands-on projects and real-world applications.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-b from-dark-800 to-dark-900 rounded-xl border border-primary-800 hover:border-primary-600 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-800">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Earn Tokens</h3>
              <p className="text-gray-400">
                Get rewarded with blockchain tokens for completing courses and achieving milestones.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-b from-dark-800 to-dark-900 rounded-xl border border-primary-800 hover:border-primary-600 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-800">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Redeem Rewards</h3>
              <p className="text-gray-400">
                Use your earned tokens to get exclusive tech gear, conference tickets, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="stats-card">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-3">10K+</div>
              <div className="text-slate-300 font-medium">Active Students</div>
            </div>
            <div className="stats-card primary">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-3">500+</div>
              <div className="text-slate-300 font-medium">Courses Available</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-3">1M+</div>
              <div className="text-slate-300 font-medium">Tokens Distributed</div>
            </div>
            <div className="stats-card primary">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-3">98%</div>
              <div className="text-slate-300 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-purple-500/5 to-purple-600/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who are already earning while they learn.
          </p>
          <Link
            to="/register"
            className="cta-button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Sign Up Now - It's Free!
          </Link>
          <div className="mt-8 text-sm text-slate-400">
            No credit card required • Get started in under 2 minutes
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;