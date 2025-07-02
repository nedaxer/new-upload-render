# Nedaxer Trading Platform

A cutting-edge mobile-first cryptocurrency trading platform built with modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (for production)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd nedaxer-trading-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Real-time**: WebSocket integration
- **Charts**: TradingView Lightweight Charts + Recharts
- **Authentication**: Session-based with bcrypt

### Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/               # Backend Express server
│   ├── api/              # API route handlers
│   ├── models/           # Database models
│   └── storage/          # Database storage layer
└── shared/               # Shared types and schemas
```

## 🚀 Deployment on Render

### Step 1: Create New Web Service
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Build Settings
```yaml
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 3: Environment Variables
Set these environment variables in Render dashboard:

**Required Variables:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-connection-string
SESSION_SECRET=your-super-secret-session-key
```

**Optional API Keys (for full functionality):**
```bash
COINGECKO_API_KEY=your-coingecko-api-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key
ZOHO_USER=your-zoho-email
ZOHO_PASS=your-zoho-app-password
```

### Step 4: Advanced Settings
```yaml
Node Version: 18
Auto-Deploy: No (recommended for production)
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for initial deployment (5-10 minutes)
3. Your app will be available at `https://your-app-name.onrender.com`

## 🔧 Build Process

The build process includes:
1. **TypeScript Compilation**: Type checking with relaxed settings for deployment
2. **Frontend Build**: Vite builds optimized production bundle
3. **Backend Build**: esbuild creates Node.js server bundle
4. **Asset Processing**: Image optimization and compression

### Manual Build
```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build

# Start production server
npm start
```

## 🛠️ Configuration

### Database Setup
The application uses MongoDB Atlas:
1. Create MongoDB Atlas cluster
2. Add connection string to `MONGODB_URI` environment variable
3. Database will auto-initialize on first run

### Google OAuth Setup
For Google OAuth login:
1. Create project in Google Cloud Console
2. Configure OAuth consent screen
3. Add authorized origins and redirect URIs
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Email Configuration
For email notifications:
1. Set up SendGrid account OR Zoho email
2. Configure respective API keys/credentials
3. Email templates are included in the system

## 📊 Features

### Trading Platform
- **Real-time Market Data**: Live cryptocurrency prices via CoinGecko API
- **Interactive Charts**: TradingView integration with technical indicators
- **Order Management**: Spot trading simulation with order history
- **Portfolio Tracking**: Real-time balance updates and P&L tracking

### User Management
- **Authentication**: Username/email registration with email verification
- **KYC System**: Document upload and verification workflow
- **Admin Dashboard**: Comprehensive user and platform management
- **Notifications**: Real-time WebSocket-based notification system

### Mobile Experience
- **PWA Support**: Installable progressive web app
- **Offline Functionality**: Service worker caching for core features
- **Pull-to-Refresh**: Native mobile-like interactions
- **Responsive Design**: Optimized for all screen sizes

## 🔐 Security

### Authentication & Authorization
- Session-based authentication with secure cookies
- bcrypt password hashing
- Role-based access control (user/admin)
- CSRF protection with session tokens

### Data Protection
- Input validation with Zod schemas
- MongoDB injection prevention
- Rate limiting on API endpoints
- Secure file upload handling

## 🚨 Troubleshooting

### Common Deployment Issues

**Build Failures:**
- Ensure Node.js version is 18+
- Check all environment variables are set
- Verify MongoDB connection string is valid

**Asset Loading Issues:**
- Placeholder assets are auto-generated for missing files
- Ensure asset paths are correct in imports
- Check Vite configuration for asset handling

**TypeScript Errors:**
- Build uses relaxed TypeScript settings for deployment
- Critical type errors are fixed while maintaining functionality
- Non-critical warnings are suppressed for production builds

### Performance Optimization
- Images are automatically optimized during build
- Service worker caches critical assets
- Database queries use efficient aggregation pipelines
- WebSocket connections handle real-time updates

## 📈 Monitoring

### Available Endpoints
- `GET /` - Landing page
- `GET /mobile` - Mobile trading app
- `GET /admin-portal` - Admin dashboard
- `GET /api/health` - Health check endpoint

### Logs
- All API requests are logged with timestamps
- Database operations include performance metrics
- WebSocket connections tracked for debugging

## 🤝 Support

For deployment issues or questions:
1. Check Render deployment logs
2. Verify all environment variables are configured
3. Test database connectivity
4. Review MongoDB Atlas network access settings

The application is designed to be resilient and will gracefully handle missing configuration while providing core functionality.