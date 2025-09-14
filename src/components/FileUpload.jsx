import React, { useRef, useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

const FileUpload = ({ 
  type = 'image', 
  accept, 
  maxSize = 5, 
  onUploadSuccess, 
  onUploadError,
  multiple = false,
  className = '',
  children 
}) => {
  const fileInputRef = useRef(null);
  const { uploading, uploadProgress, error, uploadFile, uploadMultipleFiles } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    try {
      let result;
      if (multiple) {
        result = await uploadMultipleFiles(Array.from(files));
      } else {
        result = await uploadFile(files[0], type);
      }
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      if (onUploadError) {
        onUploadError(err);
      }
    }
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getAcceptTypes = () => {
    switch (type) {
      case 'video':
        return 'video/*';
      case 'image':
        return 'image/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.ppt,.pptx';
      default:
        return accept || '*/*';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMaxSizeText = () => {
    return formatFileSize(maxSize * 1024 * 1024);
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileInputChange}
        multiple={multiple}
        className="hidden"
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto">
              <svg className="animate-spin h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {children || (
              <>
                <div className="w-12 h-12 mx-auto">
                  {type === 'video' ? (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : type === 'document' ? (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    {type === 'video' && 'MP4, AVI, MOV up to 100MB'}
                    {type === 'image' && 'PNG, JPG, GIF up to 5MB'}
                    {type === 'document' && 'PDF, DOC, PPT up to 10MB'}
                    {!['video', 'image', 'document'].includes(type) && `Max size: ${getMaxSizeText()}`}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;