# MintMyskills - EdTech Platform with Blockchain Token Rewards

A modern EdTech platform built with React that allows students to learn new skills and earn blockchain tokens as rewards, which can be redeemed for various items.

## 🚀 Features

### Core Features
- **User Authentication** - Login/Register with JWT token management
- **Course Management** - Browse, view details, and enroll in courses
- **Progress Tracking** - Track learning progress with visual indicators
- **Token Rewards** - Earn blockchain tokens for completing courses and milestones
- **Wallet Integration** - Connect MetaMask wallet for token management
- **Redemption System** - Use earned tokens to redeem rewards and merchandise

### Pages & Components
- **Landing Page** - Hero section with course exploration CTA
- **Authentication** - Login and Register pages with form validation
- **Courses** - Course listing with search, filters, and detailed course views
- **Dashboard** - Student dashboard with progress overview and statistics
- **Wallet** - Token balance display and MetaMask integration
- **Redeem** - Browse and redeem rewards using earned tokens

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern functional components with hooks
- **React Router** - Client-side routing and navigation
- **TailwindCSS** - Utility-first CSS framework for styling
- **React Query** - Data fetching, caching, and state management
- **Axios** - HTTP client for API requests
- **ethers.js** - Ethereum wallet integration

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization


## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension (for wallet features)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

### Development Setup

The application uses mock data for development when the backend is not available. All API calls will fall back to mock responses.

## 🔧 Configuration

### Backend Integration
To connect with a real backend:

1. Update the `API_BASE_URL` in `src/services/api.js`
2. Remove or comment out the `initialData` properties in React Query hooks
3. Implement proper error handling for API responses

### Demo Features
- **Mock Authentication** - Any email/password combination works for demo
- **Sample Data** - Pre-populated courses, progress, and transactions
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 📱 Usage

### For Students
1. **Register/Login** - Create an account or sign in
2. **Browse Courses** - Explore available courses with filters and search
3. **Enroll & Learn** - Enroll in courses and track your progress
4. **Earn Tokens** - Complete courses to earn blockchain tokens
5. **Connect Wallet** - Link your MetaMask wallet for token management
6. **Redeem Rewards** - Use earned tokens to get exclusive items

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions and branding
- **Secondary**: Green shades for success states and tokens
- **Gray**: Various shades for text and backgrounds

### Component Classes
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons  
- `.btn-outline` - Outlined buttons
- `.card` - Card container with shadow and padding
- `.input` - Form input styling

---

**Happy Learning! 🎓**
