import { useState } from 'react';
import { uploadAPI } from '../services/api';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file, type = 'image') => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await uploadAPI.uploadFile(formData, type, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      setUploading(false);
      setUploadProgress(100);
      return response.data;
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || 'Upload failed');
      throw err;
    }
  };

  const uploadMultipleFiles = async (files) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          formData.append('images', file);
        } else {
          formData.append('documents', file);
        }
      });

      const response = await uploadAPI.uploadMultiple(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      setUploading(false);
      setUploadProgress(100);
      return response.data;
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || 'Upload failed');
      throw err;
    }
  };

  const deleteFile = async (publicId) => {
    try {
      await uploadAPI.deleteFile(publicId);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      throw err;
    }
  };

  return {
    uploading,
    uploadProgress,
    error,
    uploadFile,
    uploadMultipleFiles,
    deleteFile
  };
};