import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, showEnrollButton = true, showProgress = false }) => {
  const {
    id,
    title,
    description,
    price,
    author,
    image,
    duration,
    level,
    students,
    rating,
    tags,
    lessons,
    tokenReward,
    progress,
    status,
  } = course;

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      {/* Course Image */}
      <div className="relative mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-2 py-1 rounded-full text-sm font-medium shadow-lg">
          +{tokenReward} tokens
        </div>
        {status && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-sm font-medium ${
            status === 'completed' 
              ? 'bg-green-800/80 text-green-300 backdrop-blur-sm' 
              : 'bg-blue-800/80 text-blue-300 backdrop-blur-sm'
          }`}>
            {status === 'completed' ? 'Completed' : 'In Progress'}
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{level}</span>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-gray-400">{rating}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {title}
        </h3>

        <p className="text-slate-300 text-sm mb-3 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center text-sm text-slate-400 mb-3">
          <span className="mr-4">{author}</span>
          <span className="mr-4">{duration}</span>
          <span>{lessons} lessons</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-purple-800/50 text-purple-200 px-2 py-1 rounded-full text-xs border border-purple-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Progress bar for enrolled courses */}
        {showProgress && progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Price and Enroll Button */}
        <div className="flex items-center justify-between">
          <div>
            {showEnrollButton ? (
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">${price}</span>
            ) : (
              <span className="text-sm text-slate-400">{students} students</span>
            )}
          </div>
          
          {showEnrollButton ? (
            <Link
              to={`/courses/${id}`}
              className="btn-primary text-sm"
            >
              View Course
            </Link>
          ) : (
            <Link
              to={`/courses/${id}`}
              className="btn-outline text-sm"
            >
              Continue
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;