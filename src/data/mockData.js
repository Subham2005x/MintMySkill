// Mock data for development when backend is not ready
export const mockCourses = [
  {
    id: 1,
    title: "Complete React Development Bootcamp",
    description: "Master React from basics to advanced concepts including hooks, context, and state management.",
    price: 50,
    author: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&crop=smart",
    duration: "8 weeks",
    level: "Beginner to Advanced",
    students: 1250,
    rating: 4.8,
    tags: ["React", "JavaScript", "Frontend"],
    lessons: [
      {
        id: 1,
        title: "Introduction to React",
        description: "Learn the fundamentals of React and how to set up your development environment.",
        content: "Welcome to React! In this lesson, we'll cover:\n\n• What is React?\n• Setting up development environment\n• Your first React component\n• JSX syntax basics\n\nReact is a JavaScript library for building user interfaces. It allows you to create reusable UI components and manage application state efficiently.",
        video: {
          url: null // Will be added when video content is available
        },
        materials: [
          {
            name: "React Official Documentation",
            url: "https://reactjs.org/docs/getting-started.html",
            type: "Documentation"
          },
          {
            name: "Lesson Notes",
            url: "#",
            type: "PDF"
          }
        ]
      },
      {
        id: 2,
        title: "JSX and Components",
        description: "Dive deeper into JSX syntax and learn how to create functional components.",
        content: "JSX is a syntax extension for JavaScript that lets you write HTML-like code in your React components.\n\nKey concepts:\n• JSX syntax rules\n• Functional vs Class components\n• Props and data flow\n• Event handling\n\nComponents are the building blocks of React applications. They encapsulate logic and UI into reusable pieces.",
        video: {
          url: null
        },
        materials: [
          {
            name: "JSX Cheatsheet",
            url: "#",
            type: "PDF"
          }
        ]
      },
      {
        id: 3,
        title: "State and Props",
        description: "Master state management and component communication through props.",
        content: "State and props are fundamental concepts in React:\n\n• State: Internal component data that can change\n• Props: Data passed from parent to child components\n• useState Hook for functional components\n• State updates and re-renders\n\nUnderstanding these concepts is crucial for building interactive React applications.",
        video: {
          url: null
        },
        materials: [
          {
            name: "State Management Guide",
            url: "#",
            type: "PDF"
          }
        ]
      }
    ],
    tokenReward: 100,
  },
  {
    id: 2,
    title: "Blockchain Fundamentals",
    description: "Learn the core concepts of blockchain technology and cryptocurrency.",
    price: 75,
    author: "Michael Chen",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=smart",
    duration: "6 weeks",
    level: "Beginner",
    students: 890,
    rating: 4.6,
    tags: ["Blockchain", "Cryptocurrency", "Web3"],
    lessons: [
      {
        id: 1,
        title: "What is Blockchain?",
        description: "Introduction to blockchain technology and its core principles.",
        content: "Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks.\n\nKey features:\n• Decentralization\n• Immutability\n• Transparency\n• Consensus mechanisms\n\nThis technology powers cryptocurrencies and many other applications.",
        video: {
          url: null
        },
        materials: [
          {
            name: "Blockchain Basics Whitepaper",
            url: "#",
            type: "PDF"
          }
        ]
      },
      {
        id: 2,
        title: "Cryptocurrencies and Bitcoin",
        description: "Understanding digital currencies and how Bitcoin works.",
        content: "Cryptocurrencies are digital or virtual currencies secured by cryptography.\n\nBitcoin overview:\n• First cryptocurrency\n• Proof of Work consensus\n• Mining process\n• Transaction verification\n\nLearn how Bitcoin revolutionized digital payments and finance.",
        video: {
          url: null
        },
        materials: [
          {
            name: "Bitcoin Whitepaper",
            url: "https://bitcoin.org/bitcoin.pdf",
            type: "PDF"
          }
        ]
      }
    ],
    tokenReward: 150,
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js, Express, and MongoDB.",
    price: 60,
    author: "David Rodriguez",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop&crop=smart",
    duration: "10 weeks",
    level: "Intermediate",
    students: 675,
    rating: 4.7,
    tags: ["Node.js", "Express", "MongoDB", "Backend"],
    lessons: [
      {
        id: 1,
        title: "Node.js Introduction",
        description: "Getting started with Node.js and understanding the runtime environment.",
        content: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.\n\nKey concepts:\n• Event-driven architecture\n• Non-blocking I/O\n• NPM package manager\n• Module system\n\nNode.js enables JavaScript to run on the server side, opening new possibilities for full-stack development.",
        video: {
          url: null
        },
        materials: [
          {
            name: "Node.js Official Docs",
            url: "https://nodejs.org/en/docs/",
            type: "Documentation"
          }
        ]
      }
    ],
    tokenReward: 120,
  },
  {
    id: 4,
    title: "Python Data Science Masterclass",
    description: "Complete guide to data science with Python, pandas, and machine learning.",
    price: 80,
    author: "Dr. Emily Watson",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=smart",
    duration: "12 weeks",
    level: "Intermediate to Advanced",
    students: 2100,
    rating: 4.9,
    tags: ["Python", "Data Science", "Machine Learning"],
    lessons: [
      {
        id: 1,
        title: "Python for Data Science Setup",
        description: "Setting up your Python environment for data science projects.",
        content: "Getting started with Python for data science:\n\n• Installing Python and Anaconda\n• Jupyter Notebooks introduction\n• Essential libraries: NumPy, Pandas, Matplotlib\n• Setting up virtual environments\n\nThis foundation will prepare you for all upcoming data science projects.",
        video: {
          url: null
        },
        materials: [
          {
            name: "Python Setup Guide",
            url: "#",
            type: "PDF"
          }
        ]
      },
      {
        id: 2,
        title: "Data Manipulation with Pandas",
        description: "Learn to work with data using the powerful Pandas library.",
        content: "Pandas is the cornerstone of data manipulation in Python:\n\n• DataFrames and Series\n• Reading and writing data\n• Data cleaning techniques\n• Filtering and grouping\n• Handling missing data\n\nMaster these skills to efficiently work with any dataset.",
        video: {
          url: null
        },
        materials: [
          {
            name: "Pandas Cheatsheet",
            url: "#",
            type: "PDF"
          }
        ]
      }
    ],
    tokenReward: 200,
  },
];

export const mockEnrolledCourses = [
  {
    ...mockCourses[0],
    enrolledAt: "2024-01-15",
    progress: 65,
    status: "active",
    completedLessons: 29,
    lastAccessed: "2024-02-10",
  },
  {
    ...mockCourses[1],
    enrolledAt: "2024-02-01",
    progress: 100,
    status: "completed",
    completedLessons: 32,
    lastAccessed: "2024-02-15",
    completedAt: "2024-02-15",
  },
];

export const mockRedeemItems = [
  {
    id: 1,
    name: "Programming Keyboard",
    description: "Mechanical keyboard perfect for coding",
    tokenCost: 500,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop&crop=center",
    category: "Hardware",
    inStock: true,
    estimatedDelivery: "3-5 business days",
  },
  {
    id: 2,
    name: "Tech Conference Ticket",
    description: "Admission to annual tech conference",
    tokenCost: 800,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop&crop=center",
    category: "Events",
    inStock: true,
    estimatedDelivery: "Digital delivery",
  },
  {
    id: 3,
    name: "Online Course Voucher",
    description: "$100 voucher for any premium course",
    tokenCost: 300,
    image: "https://images.unsplash.com/photo-1607734834515-ca46c8cfa756?w=300&h=200&fit=crop&crop=center",
    category: "Education",
    inStock: true,
    estimatedDelivery: "Instant",
  },
  {
    id: 4,
    name: "Developer Laptop Bag",
    description: "High-quality laptop bag with multiple compartments",
    tokenCost: 200,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop&crop=center",
    category: "Accessories",
    inStock: false,
    estimatedDelivery: "2-3 weeks",
  },
  {
    id: 5,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse for programmers",
    tokenCost: 150,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop&crop=center",
    category: "Hardware",
    inStock: true,
    estimatedDelivery: "2-3 business days",
  },
  {
    id: 6,
    name: "GitHub Pro Subscription",
    description: "1-year GitHub Pro subscription with advanced features",
    tokenCost: 250,
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=300&h=200&fit=crop&crop=center",
    category: "Software",
    inStock: true,
    estimatedDelivery: "Instant",
  },
  {
    id: 7,
    name: "Amazon Gift Card",
    description: "$50 Amazon gift card for tech purchases",
    tokenCost: 400,
    image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&h=200&fit=crop&crop=center",
    category: "Gift Cards",
    inStock: true,
    estimatedDelivery: "Instant",
  },
  {
    id: 8,
    name: "UX/UI Design Course",
    description: "Complete UX/UI design masterclass",
    tokenCost: 450,
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=300&h=200&fit=crop&crop=center",
    category: "Education",
    inStock: true,
    estimatedDelivery: "Instant access",
  },
  {
    id: 9,
    name: "Developer T-Shirt",
    description: "Premium coding-themed t-shirt",
    tokenCost: 100,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop&crop=center",
    category: "Merchandise",
    inStock: true,
    estimatedDelivery: "1-2 weeks",
  },
  {
    id: 10,
    name: "Standing Desk",
    description: "Adjustable standing desk for healthy coding",
    tokenCost: 1200,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&crop=center",
    category: "Hardware",
    inStock: true,
    estimatedDelivery: "1-2 weeks",
  },
  {
    id: 11,
    name: "Code Editor Theme Pack",
    description: "Premium VS Code themes and extensions",
    tokenCost: 75,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop&crop=center",
    category: "Digital Content",
    inStock: true,
    estimatedDelivery: "Instant",
  },
  {
    id: 12,
    name: "MacBook Stickers Pack",
    description: "Developer-themed laptop stickers",
    tokenCost: 50,
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=200&fit=crop&crop=center",
    category: "Accessories",
    inStock: true,
    estimatedDelivery: "3-5 business days",
  },
  {
    id: 13,
    name: "Online Hackathon Entry",
    description: "Entry fee for global coding competition",
    tokenCost: 350,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop&crop=center",
    category: "Events",
    inStock: true,
    estimatedDelivery: "Registration confirmation",
  },
  {
    id: 14,
    name: "Cloud Credits",
    description: "$100 AWS cloud computing credits",
    tokenCost: 600,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop&crop=center",
    category: "Software",
    inStock: true,
    estimatedDelivery: "Instant",
  },
  {
    id: 15,
    name: "Programming Books Bundle",
    description: "5 bestselling programming ebooks",
    tokenCost: 280,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center",
    category: "Education",
    inStock: true,
    estimatedDelivery: "Digital download",
  },
  {
    id: 16,
    name: "Blue Light Glasses",
    description: "Computer glasses to reduce eye strain",
    tokenCost: 120,
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=200&fit=crop&crop=center",
    category: "Accessories",
    inStock: true,
    estimatedDelivery: "1 week",
  },
  {
    id: 17,
    name: "Webcam HD",
    description: "High-definition webcam for video calls",
    tokenCost: 180,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300&h=200&fit=crop&crop=center",
    category: "Hardware",
    inStock: true,
    estimatedDelivery: "2-4 business days",
  },
  {
    id: 18,
    name: "Coffee Subscription",
    description: "3-month premium coffee subscription",
    tokenCost: 220,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop&crop=center",
    category: "Gift Cards",
    inStock: true,
    estimatedDelivery: "Subscription activation",
  },
  {
    id: 19,
    name: "AI/ML Course Bundle",
    description: "Machine learning and AI course collection",
    tokenCost: 650,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop&crop=center",
    category: "Education",
    inStock: true,
    estimatedDelivery: "Instant access",
  },
  {
    id: 20,
    name: "Gaming Headset",
    description: "Professional gaming headset with noise cancellation",
    tokenCost: 320,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=200&fit=crop&crop=center",
    category: "Hardware",
    inStock: true,
    estimatedDelivery: "3-7 business days",
  },
  {
    id: 21,
    name: "Mobile App Templates",
    description: "10 premium React Native app templates",
    tokenCost: 180,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop&crop=center",
    category: "Digital Content",
    inStock: true,
    estimatedDelivery: "Instant download",
  },
  {
    id: 22,
    name: "Portfolio Review Session",
    description: "1-on-1 portfolio review with senior developer",
    tokenCost: 400,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop&crop=center",
    category: "Events",
    inStock: true,
    estimatedDelivery: "Schedule within 1 week",
  },
  {
    id: 23,
    name: "Spotify Premium",
    description: "6-month Spotify Premium subscription",
    tokenCost: 160,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center",
    category: "Software",
    inStock: true,
    estimatedDelivery: "Instant",
  },
  {
    id: 24,
    name: "Monitor Stand",
    description: "Adjustable dual monitor stand",
    tokenCost: 250,
    image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=300&h=200&fit=crop&crop=center",
    category: "Accessories",
    inStock: true,
    estimatedDelivery: "1-2 weeks",
  },
  {
    id: 25,
    name: "Certificate Verification",
    description: "Blockchain-verified completion certificate",
    tokenCost: 50,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop&crop=center",
    category: "Education",
    inStock: true,
    estimatedDelivery: "Instant",
  },
];

export const mockUserData = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  walletAddress: "0x742d35Cc6642C06532b8c8E8C93fF",
  tokenBalance: 1250,
  joinedAt: "2024-01-01",
  completedCourses: 2,
  totalTokensEarned: 1500,
  coursesInProgress: 1,
};

export const mockTransactions = [
  {
    id: 1,
    type: "earned",
    amount: 100,
    description: "Completed React Development Bootcamp",
    date: "2024-02-15",
    status: "completed",
  },
  {
    id: 2,
    type: "earned",
    amount: 150,
    description: "Completed Blockchain Fundamentals",
    date: "2024-02-15",
    status: "completed",
  },
  {
    id: 3,
    type: "redeemed",
    amount: -300,
    description: "Redeemed Online Course Voucher",
    date: "2024-02-10",
    status: "completed",
  },
  {
    id: 4,
    type: "earned",
    amount: 50,
    description: "Course milestone bonus",
    date: "2024-02-05",
    status: "completed",
  },
];