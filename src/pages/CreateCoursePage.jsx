import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI } from '../services/api';
import FileUpload from '../components/FileUpload';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    level: '',
    tags: '',
    tokenReward: '',
    image: null
  });

  const [lessons, setLessons] = useState([
    { title: '', description: '', video: null, materials: [], order: 1, isPreview: false }
  ]);

  const createCourseMutation = useMutation({
    mutationFn: coursesAPI.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      navigate('/instructor/courses');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (result) => {
    setCourseData(prev => ({
      ...prev,
      image: {
        url: result.url,
        publicId: result.publicId
      }
    }));
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setLessons(updatedLessons);
  };

  const handleVideoUpload = (index, result) => {
    handleLessonChange(index, 'video', {
      url: result.url,
      publicId: result.publicId,
      duration: 0, // You can extract this from video metadata
      format: result.format
    });
  };

  const handleMaterialUpload = (index, result) => {
    const newMaterial = {
      name: result.originalName,
      url: result.url,
      publicId: result.publicId,
      type: result.format === 'pdf' ? 'pdf' : 'other',
      size: result.size
    };
    
    const updatedLessons = [...lessons];
    updatedLessons[index].materials = [
      ...updatedLessons[index].materials,
      newMaterial
    ];
    setLessons(updatedLessons);
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        description: '',
        video: null,
        materials: [],
        order: lessons.length + 1,
        isPreview: false
      }
    ]);
  };

  const removeLesson = (index) => {
    if (lessons.length > 1) {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      // Re-order lessons
      updatedLessons.forEach((lesson, i) => {
        lesson.order = i + 1;
      });
      setLessons(updatedLessons);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const coursePayload = {
        ...courseData,
        tags: courseData.tags.split(',').map(tag => tag.trim()),
        price: parseFloat(courseData.price),
        tokenReward: parseInt(courseData.tokenReward),
        content: {
          lessons,
          totalLessons: lessons.length,
          totalDuration: lessons.reduce((acc, lesson) => acc + (lesson.video?.duration || 0), 0)
        }
      };

      await createCourseMutation.mutateAsync(coursePayload);
    } catch (error) {
      console.error('Course creation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600">Fill in the details below to create your course</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    <option value="Programming">Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Design">Design</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token Reward
                  </label>
                  <input
                    type="number"
                    name="tokenReward"
                    value={courseData.tokenReward}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={courseData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="React, JavaScript, Frontend"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Detailed course description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={courseData.shortDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief summary for course cards"
                />
              </div>
            </div>

            {/* Course Image */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Course Image</h2>
              <FileUpload
                type="image"
                onUploadSuccess={handleImageUpload}
                onUploadError={(error) => console.error('Image upload failed:', error)}
              />
              {courseData.image && (
                <div className="mt-4">
                  <img
                    src={courseData.image.url}
                    alt="Course thumbnail"
                    className="w-64 h-36 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Lessons */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Course Lessons</h2>
                <button
                  type="button"
                  onClick={addLesson}
                  className="btn-secondary"
                >
                  Add Lesson
                </button>
              </div>

              {lessons.map((lesson, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-900">
                      Lesson {index + 1}
                    </h3>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter lesson title"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`preview-${index}`}
                        checked={lesson.isPreview}
                        onChange={(e) => handleLessonChange(index, 'isPreview', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`preview-${index}`} className="text-sm text-gray-700">
                        Free preview lesson
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Description
                    </label>
                    <textarea
                      value={lesson.description}
                      onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe what students will learn"
                    />
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Video
                    </label>
                    <FileUpload
                      type="video"
                      onUploadSuccess={(result) => handleVideoUpload(index, result)}
                      onUploadError={(error) => console.error('Video upload failed:', error)}
                    />
                    {lesson.video && (
                      <div className="mt-2 text-sm text-green-600">
                        ✅ Video uploaded successfully
                      </div>
                    )}
                  </div>

                  {/* Materials Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Materials (PDFs, Documents)
                    </label>
                    <FileUpload
                      type="document"
                      multiple
                      onUploadSuccess={(result) => handleMaterialUpload(index, result)}
                      onUploadError={(error) => console.error('Material upload failed:', error)}
                    />
                    {lesson.materials.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {lesson.materials.map((material, materialIndex) => (
                          <div key={materialIndex} className="text-sm text-gray-600">
                            📄 {material.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/instructor')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCourseMutation.isLoading}
                className="btn-primary"
              >
                {createCourseMutation.isLoading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;