import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
        </svg>
      ),
      title: "Expert-Led Courses",
      description: "Learn from industry professionals with hands-on projects and real-world applications."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6C14.6 7.9 13.5 9.5 12 10.4C10.5 9.5 9.4 7.9 9 6L3 7V9L9 10V16C9 17.1 9.9 18 11 18H13C14.1 18 15 17.1 15 16V10L21 9Z"/>
        </svg>
      ),
      title: "Earn While Learning",
      description: "Get rewarded with blockchain tokens for completing courses and achieving milestones."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.814 3.051 10.77 7.608 13.566a.75.75 0 00.784 0C15.199 20.52 18.25 15.564 18.25 9.75a12.74 12.74 0 00-.635-4.235.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08zm2.122 6.138a.75.75 0 00-1.276-.766L10.75 10.54l-1.112-1.397a.75.75 0 10-1.176.936l1.75 2.2a.75.75 0 001.226-.063l3.5-5.5z" clipRule="evenodd"/>
        </svg>
      ),
      title: "Blockchain Verified",
      description: "All certificates and achievements are permanently stored on the blockchain."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd"/>
          <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z"/>
        </svg>
      ),
      title: "Global Community",
      description: "Connect with learners worldwide and build your professional network."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd"/>
        </svg>
      ),
      title: "Premium Content",
      description: "Access exclusive courses, workshops, and masterclasses from top educators."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd"/>
          <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5V3z" clipRule="evenodd"/>
        </svg>
      ),
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and personalized insights."
    }
  ];

  const benefits = [
    "Learn at your own pace with flexible scheduling",
    "Access courses from anywhere, anytime",
    "Get personalized learning recommendations",
    "Join live sessions and interactive workshops",
    "Redeem tokens for real-world rewards",
    "Build a verifiable portfolio of skills",
    "Connect with mentors and industry experts",
    "Participate in exclusive community events"
  ];

  const stats = [
    { number: "50,000+", label: "Active Learners" },
    { number: "500+", label: "Expert Instructors" },
    { number: "1,000+", label: "Courses Available" },
    { number: "95%", label: "Completion Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent mb-6">
              Why Choose MintMySkill?
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience the future of education with blockchain-powered learning, 
              token rewards, and a global community of innovators.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group card hover:scale-105 transition-all duration-500"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-600/20 rounded-xl mr-4 group-hover:bg-purple-600/30 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Everything You Need to 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Join thousands of learners who are already transforming their careers 
              with our innovative blockchain-based education platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary btn-lg">
                Start Learning Today
              </Link>
              <Link to="/courses" className="btn-outline btn-lg">
                Browse Courses
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <svg className="w-6 h-6 text-green-400 mr-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd"/>
                </svg>
                <span className="text-slate-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center card max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Join the revolution in education. Start earning tokens while building the skills 
            that matter in today's digital economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary btn-xl">
              Get Started Free
            </Link>
            <Link to="/courses" className="btn-glass btn-xl">
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;