import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MediaUploadPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('video');
  const [uploads, setUploads] = useState({
    video: null,
    image: null,
    document: null
  });
  const [loading, setLoading] = useState({
    video: false,
    image: false,
    document: false
  });
  const [results, setResults] = useState({
    video: null,
    image: null,
    document: null
  });
  const [errors, setErrors] = useState({
    video: '',
    image: '',
    document: ''
  });
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    image: 0,
    document: 0
  });
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleFileChange = (type, event) => {
    const file = event.target.files[0];
    setUploads(prev => ({
      ...prev,
      [type]: file
    }));
    // Clear previous results and errors
    setResults(prev => ({
      ...prev,
      [type]: null
    }));
    setErrors(prev => ({
      ...prev,
      [type]: ''
    }));
  };

  const handleUpload = async (type) => {
    const file = uploads[type];
    if (!file) {
      setErrors(prev => ({
        ...prev,
        [type]: 'Please select a file first'
      }));
      return;
    }

    setLoading(prev => ({
      ...prev,
      [type]: true
    }));

    try {
      const formData = new FormData();
      formData.append(type, file);

      const result = await uploadAPI.uploadFile(formData, type, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({
            ...prev,
            [type]: percentCompleted
          }));
        }
      });

      setResults(prev => ({
        ...prev,
        [type]: result.data
      }));
      setUploads(prev => ({
        ...prev,
        [type]: null
      }));
      // Reset file input
      document.getElementById(`${type}-input`).value = '';

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [type]: error.response?.data?.message || `Failed to upload ${type}`
      }));
    } finally {
      setLoading(prev => ({
        ...prev,
        [type]: false
      }));
    }
  };

  const handleDelete = async (type, publicId) => {
    try {
      await uploadAPI.deleteFile(publicId);
      setResults(prev => ({
        ...prev,
        [type]: null
      }));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const UploadSection = ({ type, title, accept, maxSize, description }) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className="text-sm text-slate-400">
          Max size: {maxSize}
        </div>
      </div>
      
      <p className="text-slate-300 mb-6">{description}</p>

      <div className="space-y-4">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
          <input
            id={`${type}-input`}
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(type, e)}
            className="hidden"
          />
          <label htmlFor={`${type}-input`} className="cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <p className="text-lg text-white font-medium">
                  {uploads[type] ? 'Change File' : 'Choose File'}
                </p>
                <p className="text-sm text-slate-400">
                  Drag and drop or click to browse
                </p>
              </div>
            </div>
          </label>
        </div>

        {uploads[type] && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{uploads[type].name}</p>
                <p className="text-slate-400 text-sm">
                  {(uploads[type].size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {loading[type] && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <svg className="animate-spin w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Uploading...</p>
                <div className="w-full bg-slate-600 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress[type]}%` }}
                  ></div>
                </div>
                <p className="text-slate-400 text-sm mt-1">{uploadProgress[type]}% complete</p>
              </div>
            </div>
          </div>
        )}

        {errors[type] && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-300">{errors[type]}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => handleUpload(type)}
          disabled={!uploads[type] || loading[type]}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {loading[type] ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </div>
          ) : (
            `Upload ${title.split(' ')[1] || 'File'}`
          )}
        </button>

        {results[type] && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-green-300 font-medium">Upload Successful!</h4>
              </div>
              <button
                onClick={() => handleDelete(type, results[type].publicId)}
                className="text-red-400 hover:text-red-300 text-sm bg-red-900/30 px-3 py-1 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
            <div className="text-sm text-slate-300 space-y-2 bg-slate-800/50 rounded-lg p-3">
              <div className="flex justify-between">
                <span>File:</span>
                <span className="font-medium">{results[type].originalName}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{(results[type].size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span>URL:</span>
                <a 
                  href={results[type].url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors text-xs break-all bg-slate-700 p-2 rounded"
                >
                  {results[type].url}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-purple-600 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/teacher-dashboard"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-white">Media Upload Center</h1>
            </div>
            <div className="text-sm text-slate-300">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Information */}
        <div className="bg-slate-800/50 rounded-lg border border-purple-600 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Course Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Course Title
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Enter course title..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Upload Tabs */}
        <div className="bg-slate-800/50 rounded-lg border border-purple-600 overflow-hidden">
          <div className="border-b border-purple-600">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'video', name: 'Videos', icon: '🎥' },
                { id: 'image', name: 'Images', icon: '🖼️' },
                { id: 'document', name: 'Documents', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <UploadSection
              type={activeTab}
              title={
                activeTab === 'video' ? 'Upload Course Videos' :
                activeTab === 'image' ? 'Upload Course Images' :
                'Upload Course Documents'
              }
              accept={
                activeTab === 'video' ? 'video/*' :
                activeTab === 'image' ? 'image/*' :
                '.pdf,.doc,.docx,.txt,.ppt,.pptx'
              }
              maxSize={
                activeTab === 'video' ? '100MB' :
                activeTab === 'image' ? '5MB' :
                '10MB'
              }
              description={
                activeTab === 'video' ? 'Upload lecture videos, tutorials, or course content. Supported: MP4, AVI, MOV, WMV' :
                activeTab === 'image' ? 'Upload thumbnails, diagrams, or visual aids. Supported: JPG, PNG, GIF, WebP' :
                'Upload handouts, presentations, or reading materials. Supported: PDF, DOC, PPT, TXT'
              }
            />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-slate-800/50 rounded-lg border border-purple-600 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">📝 Upload Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">🎥 Videos</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Use 1080p resolution for best quality</li>
                <li>• Keep lectures under 20 minutes</li>
                <li>• Add clear audio narration</li>
              </ul>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">🖼️ Images</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Use high-resolution images</li>
                <li>• Create engaging thumbnails</li>
                <li>• Include descriptive diagrams</li>
              </ul>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">📄 Documents</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Create comprehensive handouts</li>
                <li>• Include practice exercises</li>
                <li>• Provide reference materials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadPage;