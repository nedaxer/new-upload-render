# Nedaxer Trading Platform

## Overview

Nedaxer is a comprehensive cryptocurrency trading platform built with modern web technologies. The application provides a full-featured trading experience with spot trading, futures trading, staking capabilities, and administrative tools. The platform is designed as a regulated exchange offering limited-risk trading options with multiple cryptocurrency markets.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing with hash-based navigation
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Charts**: Recharts for trading charts and data visualization

### Backend Architecture
- **Runtime**: Node.js with TypeScript (ES modules)
- **Framework**: Express.js for REST API
- **Database**: MySQL with Drizzle ORM (connected to external MySQL database)
- **Session Management**: Express-session with configurable stores
- **Authentication**: Session-based authentication with bcrypt password hashing
- **Email**: Nodemailer with multiple provider support (Zoho Mail configured)

### Database Strategy
The application now uses MySQL as the primary database:
- **Database**: MySQL hosted on sql7.freesqldatabase.com
- **ORM**: Drizzle ORM with MySQL adapter (schema defined in `shared/schema.ts`)
- **Connection**: Connection pool with mysql2 driver for optimal performance
- **Schema**: Complete trading platform schema with users, currencies, transactions, staking, and futures trading support

## Key Components

### Trading System
- **Spot Trading**: Market and limit orders for cryptocurrency pairs
- **Futures Trading**: Leveraged trading with position management
- **Staking**: Crypto staking with APY rewards system
- **Order Management**: Order book, trade history, and position tracking

### User Management
- **Authentication**: Username/email-based registration with email verification
- **Authorization**: Role-based access control (user/admin)
- **KYC System**: Know Your Customer verification workflow
- **Profile Management**: User preferences and account settings

### Administrative Features
- **Admin Panel**: Comprehensive dashboard for platform management
- **User Management**: User verification, balance management, and support tools
- **Market Control**: Staking rate management and market configuration
- **Analytics**: Platform statistics and reporting

### Financial Operations
- **Wallet System**: Multi-currency wallet generation and management
- **Deposits**: Cryptocurrency deposit addresses with QR codes
- **Withdrawals**: Secure withdrawal processing with verification
- **Balance Management**: Real-time balance tracking across currencies

## Data Flow

### User Registration Flow
1. User registers with email/username/password
2. System generates verification code and sends email
3. User verifies email to activate account
4. Welcome email sent upon successful verification
5. User gains access to trading features

### Trading Flow
1. User deposits cryptocurrency to generated wallet addresses
2. Balances updated in real-time via blockchain monitoring
3. User places trades through spot/futures interfaces
4. Orders matched and executed through trading engine
5. Balances and positions updated accordingly

### Administrative Flow
1. Admin authenticates with elevated privileges
2. Platform statistics aggregated from multiple data sources
3. User management operations performed with audit trails
4. Market parameters configured through admin interface

## External Dependencies

### Cryptocurrency APIs
- **CoinGecko API**: Real-time market data and price feeds
- **Custom Price Service**: Aggregated pricing from multiple sources
- **Blockchain APIs**: Transaction monitoring and wallet services

### Email Services
- **Primary**: Zoho Mail SMTP for transactional emails
- **Templates**: HTML email templates for verification, welcome, and reset
- **Fallback**: Configurable for multiple email providers

### Development Tools
- **Sharp**: Image processing for icon generation
- **QRCode**: QR code generation for wallet addresses
- **Axios**: HTTP client for external API communication

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with in-memory MongoDB
- **Production**: Scalable deployment with PostgreSQL backend
- **Configuration**: Environment-based configuration with `.env` files

### Build Process
1. Frontend built with Vite to static assets
2. Backend compiled with esbuild for Node.js deployment
3. Database schema pushed via Drizzle migrations
4. Assets optimized and compressed for production

### Scaling Considerations
- **Database**: Ready for PostgreSQL scaling with connection pooling
- **Caching**: Market data caching to reduce API calls
- **Session Storage**: Configurable session stores for horizontal scaling
- **WebSocket Support**: Real-time updates prepared for WebSocket integration

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 17, 2025. Implemented custom app logo for mobile installation: generated all required icon sizes from user's Nedaxer logo, created PWA manifest with installation shortcuts, configured Apple Touch icons, and set up service worker for native app-like experience
- June 17, 2025. Enhanced mobile assets page with professional portfolio visualization: integrated advanced charts video as seamless backgrounds, replaced crypto coin cards with animated donut chart showing distribution percentages, implemented professional glass-morphism labeling system with color-coded indicators matching trading apps like Blossom
- June 16, 2025. Updated mobile markets page with live cryptocurrency data from CoinGecko API, implemented 10-second auto-refresh, added Bullish/Bearish sentiment labels, click-to-trade functionality, and removed error states for better user experience when offline
- June 16, 2025. Created comprehensive mobile settings page with profile photo upload, username editing, theme switching, language/currency selection, and account management options. Fixed profile image synchronization issues between settings and profile pages. Separated username (editable) from email (read-only) functionality.
- June 16, 2025. Successfully migrated database from PostgreSQL to MySQL, connected to external MySQL database (sql7.freesqldatabase.com), updated complete schema and connection configuration
- June 15, 2025. Connected About Us navigation from profile to company page, implemented personalized landing page for logged-in users
- June 15, 2025. Fixed chatbot functionality by switching from OpenAI to GitHub AI inference API 
- June 13, 2025. Initial setup