import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    // For development/mock data
    return {
      user: {
        id: 1,
        email,
        name: email.split('@')[0],
        role: role,
        tokenBalance: role === 'student' ? 0 : null
      },
      token: 'mock-jwt-token'
    };
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // For development/mock data
    return {
      user: {
        id: Math.floor(Math.random() * 1000),
        ...userData,
        tokenBalance: userData.role === 'student' ? 0 : null
      },
      token: 'mock-jwt-token'
    };
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Courses APIs
export const coursesAPI = {
  getCourses: async () => {
    const response = await api.get('/courses');
    // Extract data from response structure {success: true, data: [...]}
    return response.data.data || response.data;
  },
  
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    // Extract data from response structure {success: true, data: {...}}
    return response.data.data || response.data;
  },
  
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data.data || response.data;
  },
  
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data.data || response.data;
  },
  
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data.data || response.data;
  },
  
  getInstructorCourses: async () => {
    const response = await api.get('/courses/instructor/my-courses');
    return response.data.data || response.data;
  },
  
  searchCourses: async (searchParams) => {
    const response = await api.get('/courses/search', { params: searchParams });
    return response.data.data || response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/courses/categories');
    return response.data.data || response.data;
  },
  
  enrollCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data.data || response.data;
  },
  
  getEnrolledCourses: async () => {
    const response = await api.get('/courses/enrolled');
    return response.data.data || response.data;
  },
  
  markCourseCompleted: async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/complete`);
    return response.data;
  },
};

// Wallet APIs
export const walletAPI = {
  getBalance: async (userId) => {
    const response = await api.get(`/wallet/balance/${userId}`);
    return response.data.data || response.data;
  },
  
  connectWallet: async (walletAddress) => {
    const response = await api.post('/wallet/connect', { walletAddress });
    return response.data.data || response.data;
  },
  
  getTransactions: async () => {
    const response = await api.get('/wallet/transactions');
    // Extract data from response structure {success: true, data: [...]}
    return response.data.data || response.data;
  },
};

// Redeem APIs
export const redeemAPI = {
  getRedeemItems: async () => {
    const response = await api.get('/redeem/items');
    // Extract data from response structure {success: true, data: [...]}
    return response.data.data || response.data;
  },
  
  redeemItem: async (itemId) => {
    const response = await api.post(`/redeem/items/${itemId}/redeem`);
    return response.data.data || response.data;
  },
  
  getRedeemHistory: async () => {
    const response = await api.get('/redeem/history');
    return response.data.data || response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadFile: async (formData, type, config = {}) => {
    const response = await api.post(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config
    });
    return response.data;
  },

  uploadMultiple: async (formData, config = {}) => {
    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config
    });
    return response.data;
  },

  deleteFile: async (publicId) => {
    const response = await api.delete(`/upload/${publicId}`);
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  createQuiz: async (quizData) => {
    const response = await api.post('/quiz', quizData);
    return response.data;
  },

  getCourseQuizzes: async (courseId) => {
    const response = await api.get(`/quiz/course/${courseId}`);
    return response.data;
  },

  getQuiz: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}`);
    return response.data;
  },

  startAttempt: async (quizId) => {
    const response = await api.post(`/quiz/${quizId}/start`);
    return response.data;
  },

  submitAttempt: async (quizId, attemptId, answers) => {
    const response = await api.post(`/quiz/${quizId}/attempts/${attemptId}/submit`, answers);
    return response.data;
  },

  getMyAttempts: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/my-attempts`);
    return response.data;
  },

  getAllAttempts: async () => {
    const response = await api.get('/quiz/user/all-attempts');
    return response.data;
  },

  getInstructorQuizzes: async () => {
    const response = await api.get('/quiz/instructor');
    return response.data;
  },

  getQuizAnalytics: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/analytics`);
    return response.data;
  },

  getLeaderboard: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/leaderboard`);
    return response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quiz/${quizId}`, quizData);
    return response.data;
  },

  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/quiz/${quizId}`);
    return response.data;
  },
};

// Checkout API
export const checkoutAPI = {
  createCheckoutSession: async (courseId) => {
    const response = await api.post('/checkout/create-session', { courseId });
    return response.data;
  },
};

export default api;