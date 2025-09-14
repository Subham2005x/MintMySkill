import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    level: '',
    tags: '',
    tokenReward: '100',
    image: null,
    requirements: [''],
    learningOutcomes: ['']
  });

  const [lessons, setLessons] = useState([
    { title: '', description: '', content: '', video: null, materials: [], order: 1, isPreview: false, duration: 0 }
  ]);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Check if user is instructor
  React.useEffect(() => {
    if (!user || user.role !== 'instructor') {
      navigate('/login');
    }
  }, [user, navigate]);

  const createCourseMutation = useMutation({
    mutationFn: coursesAPI.createCourse,
    onSuccess: (data) => {
      // Invalidate courses query to refresh the courses page
      queryClient.invalidateQueries(['courses']);
      queryClient.invalidateQueries(['instructor-courses']);
      
      alert('Course created and published successfully! It will now appear in the courses page.');
      navigate('/courses'); // Navigate to courses page to see the newly created course
    },
    onError: (error) => {
      console.error('Course creation failed:', error);
      alert('Failed to create course. Please try again.');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadProgress({ image: 0 });
      const formData = new FormData();
      formData.append('image', file);

      const result = await uploadAPI.uploadFile(formData, 'image', {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ image: percentCompleted });
        }
      });

      setCourseData(prev => ({
        ...prev,
        image: {
          url: result.data.url,
          publicId: result.data.publicId
        }
      }));
      setUploadProgress({});
    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadProgress({});
    }
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setLessons(updatedLessons);
  };

  const handleVideoUpload = async (index, file) => {
    try {
      setUploadProgress({ [`lesson-${index}`]: 0 });
      const formData = new FormData();
      formData.append('video', file);

      const result = await uploadAPI.uploadFile(formData, 'video', {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ [`lesson-${index}`]: percentCompleted });
        }
      });

      handleLessonChange(index, 'video', {
        url: result.data.url,
        publicId: result.data.publicId,
        duration: result.data.duration || 0,
        format: result.data.format
      });
      setUploadProgress({});
    } catch (error) {
      console.error('Video upload failed:', error);
      setUploadProgress({});
    }
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        description: '',
        content: '',
        video: null,
        materials: [],
        order: lessons.length + 1,
        isPreview: false,
        duration: 0
      }
    ]);
  };

  const removeLesson = (index) => {
    if (lessons.length > 1) {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      updatedLessons.forEach((lesson, i) => {
        lesson.order = i + 1;
      });
      setLessons(updatedLessons);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const coursePayload = {
        ...courseData,
        status: 'published', // Set course status to published so it appears in courses listing
        tags: courseData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: parseFloat(courseData.price) || 0,
        tokenReward: parseInt(courseData.tokenReward) || 100,
        requirements: courseData.requirements.filter(req => req.trim()),
        learningOutcomes: courseData.learningOutcomes.filter(outcome => outcome.trim()),
        content: {
          lessons: lessons.filter(lesson => lesson.title.trim()),
          totalLessons: lessons.filter(lesson => lesson.title.trim()).length,
          totalDuration: lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)
        }
      };

      await createCourseMutation.mutateAsync(coursePayload);
    } catch (error) {
      console.error('Course creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Course details and settings' },
    { number: 2, title: 'Content', description: 'Lessons and curriculum' },
    { number: 3, title: 'Review', description: 'Preview and publish' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-purple-600 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                to="/teacher-dashboard"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-white">Create New Course</h1>
            </div>
            <div className="text-slate-300">
              Step {currentStep} of 3
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.number 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'border-slate-600 text-slate-400'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-4">
                  <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-white' : 'text-slate-400'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-8 ${currentStep > step.number ? 'bg-purple-600' : 'bg-slate-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-slate-800/50 rounded-lg border border-purple-600 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Course Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={courseData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                        placeholder="Enter an engaging course title"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Short Description *
                      </label>
                      <input
                        type="text"
                        name="shortDescription"
                        value={courseData.shortDescription}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                        placeholder="Brief description (will appear in course cards)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Detailed Description *
                      </label>
                      <textarea
                        name="description"
                        value={courseData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                        placeholder="Provide a detailed description of what students will learn..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={courseData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
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
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Difficulty Level *
                      </label>
                      <select
                        name="level"
                        value={courseData.level}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      >
                        <option value="">Select level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
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
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Token Reward
                      </label>
                      <input
                        type="number"
                        name="tokenReward"
                        value={courseData.tokenReward}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                        placeholder="100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={courseData.tags}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                        placeholder="react, javascript, frontend, web development"
                      />
                    </div>

                    {/* Course Image */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Course Image
                      </label>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                        {courseData.image ? (
                          <div className="space-y-4">
                            <img
                              src={courseData.image.url}
                              alt="Course preview"
                              className="mx-auto h-32 w-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setCourseData(prev => ({ ...prev, image: null }))}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div>
                            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="mt-4">
                              <label htmlFor="course-image" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-slate-300">
                                  Upload course image
                                </span>
                                <input
                                  id="course-image"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                        {uploadProgress.image !== undefined && (
                          <div className="mt-4">
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.image}%` }}
                              />
                            </div>
                            <p className="text-sm text-slate-300 mt-2">{uploadProgress.image}% uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Course Requirements</h3>
                  <div className="space-y-3">
                    {courseData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                          className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                          placeholder="What do students need to know before taking this course?"
                        />
                        {courseData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('requirements', index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('requirements')}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      + Add Requirement
                    </button>
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Learning Outcomes</h3>
                  <div className="space-y-3">
                    {courseData.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={outcome}
                          onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                          className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                          placeholder="What will students be able to do after completing this course?"
                        />
                        {courseData.learningOutcomes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('learningOutcomes', index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('learningOutcomes')}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      + Add Learning Outcome
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Course Content & Curriculum</h2>
                  
                  <div className="space-y-6">
                    {lessons.map((lesson, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-white">Lesson {index + 1}</h3>
                          {lessons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLesson(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                              Lesson Title *
                            </label>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                              placeholder="Enter lesson title"
                            />
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center space-x-2 text-slate-200">
                              <input
                                type="checkbox"
                                checked={lesson.isPreview}
                                onChange={(e) => handleLessonChange(index, 'isPreview', e.target.checked)}
                                className="rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">Free Preview</span>
                            </label>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Lesson Description
                          </label>
                          <textarea
                            value={lesson.description}
                            onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                            placeholder="Describe what this lesson covers"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Lesson Content
                          </label>
                          <textarea
                            value={lesson.content}
                            onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                            placeholder="Detailed lesson content, notes, or text"
                          />
                        </div>

                        {/* Video Upload */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Lesson Video
                          </label>
                          <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                            {lesson.video ? (
                              <div className="space-y-2">
                                <div className="text-green-400 text-sm">
                                  ✓ Video uploaded successfully
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleLessonChange(index, 'video', null)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove Video
                                </button>
                              </div>
                            ) : (
                              <div>
                                <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <div className="mt-2">
                                  <label htmlFor={`lesson-video-${index}`} className="cursor-pointer">
                                    <span className="text-sm font-medium text-slate-300">
                                      Upload lesson video
                                    </span>
                                    <input
                                      id={`lesson-video-${index}`}
                                      type="file"
                                      className="sr-only"
                                      accept="video/*"
                                      onChange={(e) => e.target.files[0] && handleVideoUpload(index, e.target.files[0])}
                                    />
                                  </label>
                                </div>
                              </div>
                            )}
                            {uploadProgress[`lesson-${index}`] !== undefined && (
                              <div className="mt-4">
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress[`lesson-${index}`]}%` }}
                                  />
                                </div>
                                <p className="text-sm text-slate-300 mt-2">{uploadProgress[`lesson-${index}`]}% uploaded</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addLesson}
                      className="w-full py-3 border-2 border-dashed border-purple-600 rounded-lg text-purple-400 hover:text-purple-300 hover:border-purple-500 transition-colors"
                    >
                      + Add New Lesson
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Review Your Course</h2>
                  
                  <div className="space-y-6">
                    {/* Course Summary */}
                    <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                      <h3 className="text-lg font-medium text-white mb-4">Course Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Title:</span>
                          <span className="text-white ml-2">{courseData.title || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Category:</span>
                          <span className="text-white ml-2">{courseData.category || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Level:</span>
                          <span className="text-white ml-2">{courseData.level || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Price:</span>
                          <span className="text-white ml-2">${courseData.price || '0'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Token Reward:</span>
                          <span className="text-white ml-2">{courseData.tokenReward || '100'} EDU</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Lessons:</span>
                          <span className="text-white ml-2">{lessons.filter(l => l.title.trim()).length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lesson List */}
                    <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                      <h3 className="text-lg font-medium text-white mb-4">Course Content</h3>
                      <div className="space-y-2">
                        {lessons.filter(l => l.title.trim()).map((lesson, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0">
                            <div>
                              <span className="text-white font-medium">{lesson.title}</span>
                              {lesson.isPreview && (
                                <span className="ml-2 px-2 py-1 bg-green-600 text-green-100 text-xs rounded">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {lesson.video ? '✓ Video' : '⚠ No Video'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Checks */}
                    <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-medium mb-2">Before Publishing</h4>
                      <ul className="text-yellow-300 text-sm space-y-1">
                        <li>• Ensure all required fields are completed</li>
                        <li>• Review your course content for accuracy</li>
                        <li>• Check that videos are properly uploaded</li>
                        <li>• Verify pricing and token rewards</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-slate-600">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Course...' : 'Publish Course'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;