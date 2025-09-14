import React, { useState } from 'react';
import FileUpload from './FileUpload';

const AvatarUpload = ({ currentAvatar, onAvatarChange, size = 'large' }) => {
  const [avatarPreview, setAvatarPreview] = useState(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSuccess = (result) => {
    setAvatarPreview(result.url);
    setIsUploading(false);
    if (onAvatarChange) {
      onAvatarChange(result);
    }
  };

  const handleUploadError = (error) => {
    setIsUploading(false);
    console.error('Avatar upload failed:', error);
  };

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Preview */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg`}>
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <svg className="w-1/2 h-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* Upload Component */}
      <div className="w-64">
        <FileUpload
          type="image"
          accept="image/*"
          maxSize={5}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          className="border-dashed border-gray-300"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Update Avatar
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>
        </FileUpload>
      </div>
    </div>
  );
};

export default AvatarUpload;