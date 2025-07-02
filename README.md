# Nedaxer Trading Platform

A comprehensive cryptocurrency trading platform built with modern web technologies, featuring real-time market data, mobile-optimized UI, and secure user management.

## Features

- **Real-time Market Data**: Live cryptocurrency prices for 106+ trading pairs using CoinGecko API
- **Mobile-First Design**: Responsive interface optimized for mobile trading
- **User Management**: Secure authentication with KYC verification system
- **Admin Dashboard**: Comprehensive admin tools for user and platform management
- **Trading Interface**: Advanced charts with TradingView integration
- **Wallet System**: Multi-currency balance management with USD focus
- **Transfer System**: Secure user-to-user fund transfers
- **Notification System**: Real-time WebSocket notifications

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Wouter for routing
- Recharts for data visualization

### Backend
- Node.js with Express.js
- MongoDB with native driver
- WebSocket server for real-time updates
- Session-based authentication
- Image optimization with Sharp

### External Services
- CoinGecko API for cryptocurrency prices
- MongoDB Atlas for database hosting
- Google OAuth for authentication
- Nodemailer for email services

## Deployment on Render

### Prerequisites
Set these environment variables in your Render dashboard:

```bash
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_random_session_secret
COINGECKO_API_KEY=your_coingecko_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
GITHUB_TOKEN=your_github_token
NODE_ENV=production
```

### Render Configuration
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node.js Version**: 18+
- **Environment**: Web Service

### Build Process
The build process includes:
1. Frontend compilation with Vite
2. Backend bundling with esbuild
3. TypeScript compilation
4. Asset optimization

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Start development server: `npm run dev`

## Project Structure

```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── scripts/         # Database scripts and utilities
├── shared/          # Shared types and utilities
├── public/          # Static assets
└── attached_assets/ # User uploaded assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth

### Market Data
- `GET /api/crypto/realtime-prices` - Live cryptocurrency prices
- `GET /api/crypto/pairs` - Available trading pairs

### User Management
- `GET /api/user/profile` - User profile data
- `PUT /api/user/profile` - Update profile
- `GET /api/balances` - User balances

### Admin
- `GET /api/admin/users` - User management
- `POST /api/admin/deposits` - Create deposits
- `GET /api/admin/analytics` - Platform statistics

## Security Features

- Session-based authentication with secure cookies
- Environment variable configuration for all secrets
- reCAPTCHA integration for form protection
- Input validation and sanitization
- MongoDB injection protection
- CORS configuration for production

## Performance Optimizations

- Image optimization with Sharp
- WebSocket connections for real-time data
- Query caching with TanStack Query
- Lazy loading for mobile components
- Service worker for offline capabilities

## License

MIT License