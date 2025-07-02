# Nedaxer Trading Platform

A comprehensive cryptocurrency trading platform built with modern web technologies providing spot trading, futures trading, staking capabilities, and administrative tools.

## Deployment on Render

### Prerequisites
1. A Render account
2. A MongoDB Atlas cluster (or compatible MongoDB database)
3. API keys for external services (optional)

### Environment Variables
Set these environment variables in your Render dashboard:

#### Required
- `MONGODB_URI` - Your MongoDB connection string
- `NODE_ENV=production`
- `SESSION_SECRET` - A random string for session encryption

#### Optional
- `GOOGLE_CLIENT_ID` - For Google OAuth login
- `GOOGLE_CLIENT_SECRET` - For Google OAuth login
- `COINGECKO_API_KEY` - For cryptocurrency prices
- `RECAPTCHA_SITE_KEY` - For form protection
- `RECAPTCHA_SECRET_KEY` - For form protection
- `BASE_URL` - Your Render app URL (e.g., https://your-app.onrender.com)

### Deployment Steps

1. **Connect your repository** to Render
2. **Set build command**: `npm run build`
3. **Set start command**: `npm start`
4. **Add environment variables** as listed above
5. **Deploy**

### Build Process
The build process includes:
- Frontend compilation with Vite
- Backend bundling with esbuild
- TypeScript compilation check
- Automatic deployment to production

### Database Setup
Ensure your MongoDB database includes:
- User authentication collections
- Trading data structures
- Balance management tables
- Admin controls

## Local Development

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env`
4. Start development server: `npm run dev`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript checks

## Key Features

### Trading System
- Spot and futures trading
- Real-time market data
- Order management
- Portfolio tracking

### User Management
- Secure authentication
- KYC verification
- Admin dashboard
- Role-based access

### Financial Operations
- Multi-currency wallets
- Cryptocurrency deposits/withdrawals
- Balance management
- Transaction history

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: TradingView widgets
- **Real-time**: WebSocket integration

## Support

For deployment issues or questions, check:
1. Render build logs
2. Application logs
3. Database connectivity
4. Environment variable configuration