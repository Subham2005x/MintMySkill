const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const walletRoutes = require('./routes/wallet');
const redeemRoutes = require('./routes/redeem');
const checkoutRoutes = require('./routes/checkout');
const uploadRoutes = require('./routes/upload');
const quizRoutes = require('./routes/quiz');
const blockchainRoutes = require('./routes/blockchain');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import blockchain service
const blockchainService = require('./services/blockchainService');

const app = express();

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL_PROD]
    : [process.env.FRONTEND_URL || 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MintMySkill Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/blockchain', blockchainRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'MintMySkill API v1.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      wallet: '/api/wallet',
      redeem: '/api/redeem',
      checkout: '/api/checkout',
      upload: '/api/upload',
      quiz: '/api/quiz'
    }
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize blockchain service
    console.log('🔗 Initializing blockchain service...');
    const blockchainInitialized = await blockchainService.initialize();
    if (blockchainInitialized) {
      console.log('✅ Blockchain service initialized');
    } else {
      console.log('⚠️ Blockchain service failed to initialize');
    }
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start Server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`
🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
🔗 API Base URL: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health
    `);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

startServer();

module.exports = app;