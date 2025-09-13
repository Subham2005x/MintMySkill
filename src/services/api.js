import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:3000/api';

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
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Courses APIs
export const coursesAPI = {
  getCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  enrollCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
  
  getEnrolledCourses: async () => {
    const response = await api.get('/courses/enrolled');
    return response.data;
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
    return response.data;
  },
  
  connectWallet: async (walletAddress) => {
    const response = await api.post('/wallet/connect', { walletAddress });
    return response.data;
  },
  
  getTransactions: async () => {
    const response = await api.get('/wallet/transactions');
    return response.data;
  },
};

// Redeem APIs
export const redeemAPI = {
  getRedeemItems: async () => {
    const response = await api.get('/redeem/items');
    return response.data;
  },
  
  redeemItem: async (itemId) => {
    const response = await api.post(`/redeem/items/${itemId}/redeem`);
    return response.data;
  },
  
  getRedeemHistory: async () => {
    const response = await api.get('/redeem/history');
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