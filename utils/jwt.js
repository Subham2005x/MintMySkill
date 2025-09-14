const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Verify JWT Token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Extract user data for token
const getTokenPayload = (user) => {
  return {
    id: user._id,
    email: user.email,
    role: user.role
  };
};

// Send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Create token
  const token = generateToken(getTokenPayload(user));

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict'
  };

  // Remove password from output
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    tokenBalance: user.tokenBalance,
    totalTokensEarned: user.totalTokensEarned,
    walletAddress: user.walletAddress,
    walletConnected: user.walletConnected,
    isEmailVerified: user.isEmailVerified,
    coursesEnrolled: user.coursesEnrolled?.length || 0,
    coursesCompleted: user.coursesCompleted?.length || 0,
    createdAt: user.createdAt
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: userResponse
    });
};

module.exports = {
  generateToken,
  verifyToken,
  getTokenPayload,
  sendTokenResponse
};