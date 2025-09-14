import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';

const LessonPlayer = ({ lesson, courseId, onLessonComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    setStartTime(Date.now());
    
    // Track time spent on lesson
    const interval = setInterval(() => {
      if (startTime) {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // in minutes
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  const handleCompleteLesson = async () => {
    try {
      const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000 / 60);
      
      const result = await enrollmentAPI.completeLesson(courseId, lesson.id, finalTimeSpent);
      
      setIsCompleted(true);
      
      if (result.data.courseCompleted) {
        // Show congratulations modal for course completion
        alert(`🎉 Congratulations! You've completed the course and earned ${result.data.tokensEarned} EDU tokens!`);
      } else {
        alert('✅ Lesson completed!');
      }
      
      onLessonComplete && onLessonComplete(result.data);
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Failed to complete lesson. Please try again.');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      {/* Lesson Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
          <p className="text-slate-300">{lesson.description}</p>
        </div>
        
        {/* Time Tracker */}
        <div className="text-right">
          <p className="text-slate-400 text-sm">Time Spent</p>
          <p className="text-white font-medium">{timeSpent} min</p>
        </div>
      </div>

      {/* Video Player (if video exists) */}
      {lesson.video && (
        <div className="mb-6">
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
            {lesson.video.url ? (
              <video
                className="w-full h-full rounded-lg"
                controls
                src={lesson.video.url}
                onEnded={() => {
                  // Auto-mark as eligible for completion when video ends
                  console.log('Video ended, lesson can be marked as complete');
                }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Video content will be available here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lesson Content */}
      {lesson.content && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Lesson Content</h3>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-300 whitespace-pre-wrap">{lesson.content}</p>
          </div>
        </div>
      )}

      {/* Learning Materials */}
      {lesson.materials && lesson.materials.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Learning Materials</h3>
          <div className="space-y-2">
            {lesson.materials.map((material, index) => (
              <a
                key={index}
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-slate-900/50 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-slate-300">{material.name}</span>
                <span className="ml-auto text-slate-500 text-sm">{material.type}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Completion Section */}
      <div className="border-t border-slate-600 pt-6">
        {isCompleted ? (
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Lesson Completed!</span>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-slate-400 mb-4">
              Ready to complete this lesson? You'll earn EDU tokens for course completion!
            </p>
            <button
              onClick={handleCompleteLesson}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Mark as Complete
            </button>
          </div>
        )}
      </div>

      {/* Token Reward Info */}
      <div className="mt-4 p-4 bg-purple-900/20 border border-purple-600 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-purple-300 text-sm">
            💡 Complete all lessons to earn EDU tokens and unlock rewards!
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;