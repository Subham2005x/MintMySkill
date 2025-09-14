# MintMySkill Backend

A comprehensive Node.js/Express backend for the MintMySkill EdTech platform with blockchain token rewards.

## 🚀 Features

### Core Features
- **JWT Authentication** - Secure user authentication and authorization
- **Course Management** - CRUD operations for courses, enrollment, and progress tracking
- **Token System** - Blockchain-integrated token rewards and wallet management
- **Redemption Store** - Token-based reward redemption system
- **Payment Processing** - Stripe integration for course purchases
- **User Roles** - Student, Instructor, and Admin role management

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /updatepassword` - Change password
- `POST /logout` - User logout

#### Courses (`/api/courses`)
- `GET /` - Get all courses (with filters)
- `GET /:id` - Get single course
- `POST /` - Create course (Instructor/Admin)
- `PUT /:id` - Update course (Instructor/Admin)
- `DELETE /:id` - Delete course (Instructor/Admin)
- `GET /enrolled` - Get user's enrolled courses
- `POST /:id/enroll` - Enroll in course
- `POST /:id/lessons/:lessonId/complete` - Mark lesson complete
- `POST /:id/complete` - Complete entire course
- `POST /:id/reviews` - Add course review

#### Wallet (`/api/wallet`)
- `GET /balance/:userId?` - Get token balance
- `POST /connect` - Connect wallet address
- `POST /disconnect` - Disconnect wallet
- `GET /transactions` - Get transaction history
- `POST /transfer` - Transfer tokens to blockchain
- `GET /leaderboard` - Get token leaderboard

#### Redeem (`/api/redeem`)
- `GET /items` - Get all redeem items
- `GET /items/:id` - Get single redeem item
- `POST /items/:id/redeem` - Redeem item with tokens
- `GET /history` - Get redemption history
- `GET /history/:id` - Get single redemption
- `POST /history/:id/cancel` - Cancel redemption
- `POST /items` - Create redeem item (Admin)
- `PUT /items/:id` - Update redeem item (Admin)
- `DELETE /items/:id` - Delete redeem item (Admin)

#### Checkout (`/api/checkout`)
- `POST /create-session` - Create Stripe checkout session
- `POST /success` - Handle payment success
- `POST /webhook` - Stripe webhook handler
- `GET /history` - Get payment history
- `POST /refund/:enrollmentId` - Process refund

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Stripe account (for payments)
- Infura account (for blockchain integration)

### Setup

1. **Clone and install dependencies**
   \`\`\`bash
   cd MintMySkill-Backend
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update `.env` with your configuration:
   \`\`\`env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mintmyskill
   JWT_SECRET=your_super_secret_jwt_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   INFURA_PROJECT_ID=your_infura_project_id
   FRONTEND_URL=http://localhost:5173
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Seed database with sample data
   npm run seed
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 📊 Database Models

### User Model
- Authentication & profile information
- Token balance & wallet integration
- Course enrollment tracking
- Role-based permissions

### Course Model
- Course content & metadata
- Instructor information
- Pricing & token rewards
- Student enrollment & reviews

### Enrollment Model
- User-course relationship
- Progress tracking
- Lesson completion
- Certificate generation

### Transaction Model
- Token transaction history
- Blockchain integration
- Balance tracking
- Audit trail

### RedeemItem Model
- Reward items catalog
- Stock management
- Category organization
- Delivery information

### Redemption Model
- Token redemption records
- Order fulfillment
- Tracking information
- Status management

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Rate Limiting** - API request limiting
- **CORS Protection** - Cross-origin request security
- **Helmet** - Security headers
- **Input Validation** - express-validator
- **Role-based Access** - Multi-level permissions

## 🌐 Blockchain Integration

- **Wallet Connection** - MetaMask integration
- **Token Transfers** - Ethereum blockchain
- **Smart Contract** - ERC-20 token support
- **Transaction Tracking** - Blockchain confirmations

## 💳 Payment Processing

- **Stripe Integration** - Secure payment processing
- **Webhook Handling** - Real-time payment updates
- **Refund System** - Automated refund processing
- **Payment History** - Transaction tracking

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set:
- `MONGODB_URI` - Production MongoDB connection
- `JWT_SECRET` - Strong production secret
- `STRIPE_SECRET_KEY` - Production Stripe key
- `FRONTEND_URL_PROD` - Production frontend URL

### Production Setup
\`\`\`bash
# Build and start
npm start

# Or with PM2
pm2 start server.js --name "mintmyskill-api"
\`\`\`

## 📝 API Documentation

### Authentication
All protected routes require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### Response Format
All API responses follow this format:
\`\`\`json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "count": 10,
  "total": 100
}
\`\`\`

### Error Handling
Error responses include:
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
\`\`\`

## 🧪 Testing

### Sample Data
Run the seeder to create sample users:
- **Student**: `student@example.com` / `password123`
- **Instructor**: `instructor@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

### API Testing
Use tools like Postman or Thunder Client to test endpoints:
1. Register/Login to get JWT token
2. Use token in Authorization header
3. Test protected endpoints

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the sample data and examples