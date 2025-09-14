const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  logout,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  updatePasswordValidation
} = require('../controllers/authController');

const { protect, updateLastLogin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.use(protect); // All routes below this are protected

// User profile routes
router.get('/me', updateLastLogin, getMe);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/updatepassword', updatePasswordValidation, updatePassword);
router.post('/logout', logout);

module.exports = router;