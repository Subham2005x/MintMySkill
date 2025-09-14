const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const RedeemItem = require('../models/RedeemItem');
const Transaction = require('../models/Transaction');

// Sample data
const users = [
  {
    name: 'John Doe',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    tokenBalance: 250,
    totalTokensEarned: 350,
    walletAddress: '0x1234567890123456789012345678901234567890',
    walletConnected: true,
    bio: 'Passionate learner interested in blockchain and web development',
    skills: ['JavaScript', 'React', 'Node.js']
  },
  {
    name: 'Sarah Johnson',
    email: 'instructor@example.com',
    password: 'password123',
    role: 'instructor',
    tokenBalance: 500,
    totalTokensEarned: 1000,
    bio: 'Full-stack developer with 8+ years of experience',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS']
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    tokenBalance: 1000,
    totalTokensEarned: 1000
  }
];

const courses = [
  {
    title: 'Complete React Development Bootcamp',
    description: 'Master React from basics to advanced concepts including hooks, context, and state management. Build real-world projects and learn industry best practices.',
    shortDescription: 'Master React from basics to advanced concepts',
    price: 50,
    discountPrice: 39,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&crop=smart',
    category: 'Web Development',
    level: 'Beginner',
    language: 'English',
    tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
    tokenReward: 100,
    bonusTokens: {
      earlyCompletion: 25,
      perfectScore: 50
    },
    content: {
      lessons: [
        {
          title: 'Introduction to React',
          description: 'Learn the basics of React and component-based architecture',
          duration: 45,
          order: 1
        },
        {
          title: 'JSX and Components',
          description: 'Understanding JSX syntax and creating your first components',
          duration: 60,
          order: 2
        },
        {
          title: 'State and Props',
          description: 'Managing component state and passing data with props',
          duration: 75,
          order: 3
        }
      ]
    },
    status: 'published',
    isFeatured: true,
    requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
    learningOutcomes: [
      'Build modern React applications',
      'Understand component lifecycle',
      'Master React hooks',
      'Implement state management'
    ]
  },
  {
    title: 'Blockchain Fundamentals',
    description: 'Learn the core concepts of blockchain technology, cryptocurrency, and decentralized applications. Perfect for beginners.',
    shortDescription: 'Core concepts of blockchain and cryptocurrency',
    price: 75,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=smart',
    category: 'Blockchain',
    level: 'Beginner',
    tags: ['Blockchain', 'Cryptocurrency', 'Web3', 'DeFi'],
    tokenReward: 150,
    content: {
      lessons: [
        {
          title: 'What is Blockchain?',
          description: 'Introduction to blockchain technology and its applications',
          duration: 50,
          order: 1
        },
        {
          title: 'Cryptocurrency Basics',
          description: 'Understanding Bitcoin, Ethereum, and other cryptocurrencies',
          duration: 60,
          order: 2
        }
      ]
    },
    status: 'published',
    requirements: ['No prior experience needed'],
    learningOutcomes: [
      'Understand blockchain technology',
      'Learn about cryptocurrencies',
      'Explore DeFi applications'
    ]
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB. Learn API development, authentication, and deployment.',
    shortDescription: 'Build scalable backend applications with Node.js',
    price: 60,
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop&crop=smart',
    category: 'Programming',
    level: 'Intermediate',
    tags: ['Node.js', 'Express', 'MongoDB', 'Backend', 'API'],
    tokenReward: 120,
    content: {
      lessons: [
        {
          title: 'Node.js Fundamentals',
          description: 'Getting started with Node.js and npm',
          duration: 55,
          order: 1
        }
      ]
    },
    status: 'published'
  }
];

const redeemItems = [
  {
    name: 'Programming Keyboard',
    description: 'Mechanical keyboard perfect for coding with RGB backlighting',
    tokenCost: 500,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop&crop=center',
    category: 'Hardware',
    deliveryType: 'physical',
    estimatedDelivery: '3-5 business days',
    stock: {
      available: 25,
      total: 50
    },
    isActive: true,
    isFeatured: true,
    originalPrice: 150,
    tags: ['mechanical', 'RGB', 'programming']
  },
  {
    name: 'Tech Conference Ticket',
    description: 'Admission to annual tech conference with networking opportunities',
    tokenCost: 800,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop&crop=center',
    category: 'Events',
    deliveryType: 'digital',
    estimatedDelivery: 'Instant',
    isUnlimited: true,
    isActive: true,
    originalPrice: 200,
    availableFrom: new Date(),
    availableUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  },
  {
    name: 'Online Course Voucher',
    description: '$100 voucher for any premium course on the platform',
    tokenCost: 300,
    image: 'https://images.unsplash.com/photo-1607734834515-ca46c8cfa756?w=300&h=200&fit=crop&crop=center',
    category: 'Education',
    deliveryType: 'voucher',
    estimatedDelivery: 'Instant',
    stock: {
      available: 100,
      total: 100
    },
    isActive: true,
    originalPrice: 100
  },
  {
    name: 'Developer Laptop Bag',
    description: 'High-quality laptop bag with multiple compartments for developers',
    tokenCost: 200,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop&crop=center',
    category: 'Accessories',
    deliveryType: 'physical',
    estimatedDelivery: '2-3 weeks',
    stock: {
      available: 0,
      total: 15
    },
    isActive: true,
    originalPrice: 80
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await RedeemItem.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedUsers = async () => {
  try {
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedCourses = async (instructorId) => {
  try {
    const coursesWithInstructor = courses.map(course => ({
      ...course,
      instructor: instructorId,
      instructorName: 'Sarah Johnson'
    }));
    
    const createdCourses = await Course.create(coursesWithInstructor);
    console.log(`${createdCourses.length} courses created`);
    return createdCourses;
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
};

const seedRedeemItems = async (adminId) => {
  try {
    const itemsWithCreator = redeemItems.map(item => ({
      ...item,
      createdBy: adminId
    }));
    
    const createdItems = await RedeemItem.create(itemsWithCreator);
    console.log(`${createdItems.length} redeem items created`);
    return createdItems;
  } catch (error) {
    console.error('Error seeding redeem items:', error);
  }
};

const seedTransactions = async (users) => {
  try {
    const transactions = [];
    
    // Create some sample transactions for the student user
    const studentUser = users.find(u => u.role === 'student');
    
    if (studentUser) {
      transactions.push(
        {
          user: studentUser._id,
          type: 'bonus',
          amount: 100,
          description: 'Welcome bonus for new user',
          balanceBefore: 0,
          balanceAfter: 100,
          status: 'completed',
          metadata: { source: 'registration' }
        },
        {
          user: studentUser._id,
          type: 'earned',
          amount: 150,
          description: 'Completed React Development Bootcamp',
          balanceBefore: 100,
          balanceAfter: 250,
          status: 'completed',
          metadata: { source: 'course_completion' }
        },
        {
          user: studentUser._id,
          type: 'earned',
          amount: 50,
          description: 'Wallet connection bonus',
          balanceBefore: 250,
          balanceAfter: 300,
          status: 'completed',
          metadata: { source: 'wallet_connection' }
        },
        {
          user: studentUser._id,
          type: 'spent',
          amount: -50,
          description: 'Redeemed course voucher',
          balanceBefore: 300,
          balanceAfter: 250,
          status: 'completed',
          metadata: { source: 'redemption' }
        }
      );
    }
    
    if (transactions.length > 0) {
      const createdTransactions = await Transaction.create(transactions);
      console.log(`${createdTransactions.length} transactions created`);
    }
  } catch (error) {
    console.error('Error seeding transactions:', error);
  }
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    await connectDB();
    await clearDatabase();
    
    // Seed users first
    const createdUsers = await seedUsers();
    
    // Find specific users for foreign key relationships
    const instructor = createdUsers.find(user => user.role === 'instructor');
    const admin = createdUsers.find(user => user.role === 'admin');
    
    // Seed courses with instructor reference
    if (instructor) {
      await seedCourses(instructor._id);
    }
    
    // Seed redeem items with admin reference
    if (admin) {
      await seedRedeemItems(admin._id);
    }
    
    // Seed transactions
    await seedTransactions(createdUsers);
    
    console.log('Database seeding completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Student: student@example.com / password123');
    console.log('Instructor: instructor@example.com / password123');
    console.log('Admin: admin@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  clearDatabase
};