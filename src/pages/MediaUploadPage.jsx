import React, { useState } from 'react';
import { uploadAPI } from '../services/api';

const MediaUploadPage = () => {
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
          console.log(`Upload Progress: ${percentCompleted}%`);
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
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className="text-sm text-gray-400">
          Max size: {maxSize}
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{description}</p>

      <div className="space-y-4">
        <div>
          <input
            id={`${type}-input`}
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(type, e)}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-600 file:text-white
              hover:file:bg-purple-700
              file:cursor-pointer cursor-pointer"
          />
        </div>

        {uploads[type] && (
          <div className="text-sm text-gray-300">
            Selected: {uploads[type].name} ({(uploads[type].size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        {errors[type] && (
          <div className="text-red-400 text-sm">{errors[type]}</div>
        )}

        <button
          onClick={() => handleUpload(type)}
          disabled={!uploads[type] || loading[type]}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading[type] ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </div>
          ) : (
            `Upload ${title}`
          )}
        </button>

        {results[type] && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-green-300 font-medium">Upload Successful!</h4>
              <button
                onClick={() => handleDelete(type, results[type].publicId)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>File:</strong> {results[type].originalName}</p>
              <p><strong>Size:</strong> {(results[type].size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>URL:</strong> 
                <a 
                  href={results[type].url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 ml-2 break-all"
                >
                  {results[type].url}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Media Upload Center</h1>
        <div className="text-sm text-gray-400">
          Upload videos, images, and documents for your courses
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <UploadSection
          type="video"
          title="Video Upload"
          accept="video/*"
          maxSize="100MB"
          description="Upload course videos, lectures, or tutorials. Supported formats: MP4, AVI, MOV, WMV, FLV"
        />

        <UploadSection
          type="image"
          title="Image Upload"
          accept="image/*"
          maxSize="5MB"
          description="Upload course thumbnails, diagrams, or other images. Supported formats: JPG, JPEG, PNG, GIF, WebP"
        />

        <UploadSection
          type="document"
          title="Document Upload"
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
          maxSize="10MB"
          description="Upload course materials, handouts, or presentations. Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX"
        />
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Upload Guidelines</h3>
        <div className="text-gray-300 space-y-2">
          <p>• <strong>Videos:</strong> Ensure good audio quality and clear visuals. MP4 format is recommended for best compatibility.</p>
          <p>• <strong>Images:</strong> Use high-resolution images (at least 1280x720) for course thumbnails. PNG format for graphics with transparency.</p>
          <p>• <strong>Documents:</strong> PDF format is preferred for course materials to ensure consistent formatting across devices.</p>
          <p>• <strong>File Names:</strong> Use descriptive names without special characters for better organization.</p>
          <p>• <strong>Copyright:</strong> Ensure you have the right to use and distribute all uploaded content.</p>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadPage;