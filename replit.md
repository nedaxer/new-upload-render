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
The application now uses MongoDB Atlas as the primary database:
- **Database**: MongoDB Atlas cluster (mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/)
- **ODM**: Mongoose with MongoDB native driver for optimal performance
- **Schema**: MongoDB collections with users (including UID system), balances, charts, and all trading platform data
- **Connection**: Direct connection to MongoDB Atlas with automatic failover and scaling

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
- June 25, 2025. Enhanced 4K welcome screen with Venom-inspired design: implemented organic black tendrils and symbiote-like background animations, added floating cryptocurrency icons that pulse and merge into the design, created dynamic cell-like structures with alien textures, removed loading lines as requested, enhanced logo with 4K styling and header logo design, fixed mobile app blank screen issues with proper welcome animation display, created immersive Venom-crypto fusion experience that feels alive and dynamic
- June 25, 2025. Fixed profile picture synchronization across devices and implemented premium welcome animations: resolved profile picture sync issues by enhancing MongoDB storage with updateAt timestamps and global profile sync handler, added 4K welcome animation sequence for new user registration with Nedaxer branding and balance display, implemented loading animations to prevent slow home page loading, created comprehensive profile sync system that works across all devices and sessions, enhanced user onboarding experience with smooth animations and proper loading states
- June 25, 2025. Fixed admin dashboard fund transfer integration with mobile balance system: connected admin fund transfers to UserBalance MongoDB collection that mobile app uses for displaying balances, updated /api/wallet/summary and /api/balances endpoints to use UserBalance collection as primary source, admin fund transfers now immediately appear in user mobile accounts, created comprehensive balance synchronization between admin dashboard and mobile app, resolved session authentication issues for admin operations, enhanced logging for balance updates and debugging
- June 24, 2025. Perfected pull-to-refresh with seamless mobile integration: made logo much bigger (95% size) with CD-like emergence effect without rotation, created perfect gradient blending between orange header and mobile page slate colors for unified appearance, moved vibration trigger to activate only when logo AND header fully appear, positioned "Release to refresh" message directly under logo, enhanced Nedaxer header with seamless color transitions matching mobile app theme
- June 24, 2025. Fixed pull-to-refresh logo stability: removed all animations and shaking effects, logo now mounts stably on background without movement, increased logo size to almost fill entire pull area (calc(100% - 10px)), eliminated spring animations and motion effects for clean static display
- June 24, 2025. Integrated actual brand logos for news sources: downloaded and created authentic SVG logos for CryptoSlate, BeInCrypto, Google News, CoinDesk, and CryptoBriefing, stored logos in /client/public/logos/ directory, enhanced RSS parser to use real brand assets when article images are missing, news articles now display proper brand logos with accurate colors and styling for better visual recognition
- June 24, 2025. Enhanced news media system with video support: implemented video preview functionality with 5-second autoplay loops in news feed, added source-specific RSS parsing for Google News articles from Reuters/Bloomberg/CNBC, enhanced BeInCrypto feed handling with regional proxy support, improved media detection to distinguish between images and videos
- June 24, 2025. Enhanced pull-to-refresh with premium animations and haptic feedback: implemented smooth slide-in and scale animations for refresh logo with spring physics, added dark background with orange brand color gradient edges for seamless content transition, integrated haptic vibration feedback when logo fully appears, reduced refresh animation to 2 seconds with enhanced Nedaxer letter jumping effects, improved visual feedback with drop shadows and brightness filters for professional mobile app experience
- June 24, 2025. Fixed pair display and price update issues: enhanced handlePairSelectionModal to immediately update UI state when pair changes, added forced UI refresh after chart symbol updates, improved price update function with fallback symbol matching, fixed chart onReady callback to update current symbol and price, chart now properly displays selected pair name and price without requiring page refresh
- June 24, 2025. Implemented browser-based chart persistence system: created chart state manager using localStorage and global window state to maintain selected trading pairs across page navigation, enhanced trade page to check for existing global chart widget before creating new ones, updated markets and home page navigation to save chart state to persistent storage, fixed chart reloading issues by implementing smart chart mounting that reuses existing widgets, chart now maintains selected pair and timeframe when navigating between pages without unnecessary reloads
- June 23, 2025. Implemented USD-only balance system: removed all crypto assets from mobile home page, updated user registration to create only $0.00 USD balance instead of starter funds, modified wallet summary and balance APIs to return only USD balance (no cryptocurrency balances), added real-time BTC conversion display below main balance for reference only, removed all existing crypto balances and reset USD balances to $0.00, users now only have virtual USD funds managed through MongoDB, hidden USD asset card display on home page to show only total balance
- June 22, 2025. Implemented complete user identification system with mixed alphanumeric UIDs: added UID field to PostgreSQL users table with unique constraint, created UID generation utility for mixed alphanumeric codes up to 10 characters, updated database storage interface to automatically generate unique UIDs during user creation, integrated UID display on mobile profile and settings pages, implemented copy-to-clipboard functionality for UIDs, migrated from MySQL to PostgreSQL database with proper schema updates
- June 21, 2025. Implemented comprehensive favorites and chart memory system: added PostgreSQL database tables for user favorites and preferences, created API endpoints for managing favorites and user chart preferences, implemented real-time favorites functionality on home page crypto cards with star toggle, added chart pair persistence so users return to their last selected cryptocurrency when reopening trade page, enhanced navigation from markets and home page to trade page with proper symbol passing, favorites are stored in database and persist across user sessions
- June 21, 2025. Fixed mobile navigation and authentication: removed authentication protection from all mobile routes to enable direct access to trading features, fixed 404 errors when navigating from markets page to trade page, implemented open access for mobile app routes allowing users to test market-to-chart navigation without login requirements, enhanced sentiment labels with proper Bullish/Bearish color coding
- June 21, 2025. Cleaned up market data sources for consistent pricing: replaced all Bybit API usage with CoinGecko API for real-time pricing data, implemented unified /api/crypto/realtime-prices endpoint using COINGECKO_API_KEY, fixed navigation from markets page to trade page with proper chart loading for selected pairs, removed mixed data sources that caused price inconsistencies, updated mobile markets and live markets pages to use consistent CoinGecko data structure
- June 20, 2025. Implemented persistent TradingView chart system: prevented chart reloading when switching between pages by adding global chart widget caching, enhanced crosshair to appear on single tap with orange dashed styling, integrated Bollinger Bands (BOLL) indicator with 20-period and 2 standard deviations showing blue upper/lower bands and yellow middle line, added chart persistence tracking to prevent unnecessary reinitializations for native app-like experience
- June 18, 2025. Enhanced global language support system: implemented automatic device language detection on first launch, added comprehensive translations for 160+ languages including Japanese, Korean, Arabic, Russian, French, German, Spanish, and Portuguese, enabled immediate UI updates when language changes, fixed duplicate translation keys, and systematically updated hardcoded text throughout mobile application to use proper translation functions
- June 17, 2025. Implemented custom app logo for mobile installation: generated all required icon sizes from user's Nedaxer logo, created PWA manifest with installation shortcuts, configured Apple Touch icons, and set up service worker for native app-like experience
- June 17, 2025. Enhanced mobile assets page with professional portfolio visualization: integrated advanced charts video as seamless backgrounds, replaced crypto coin cards with animated donut chart showing distribution percentages, implemented professional glass-morphism labeling system with color-coded indicators matching trading apps like Blossom
- June 16, 2025. Updated mobile markets page with live cryptocurrency data from CoinGecko API, implemented 10-second auto-refresh, added Bullish/Bearish sentiment labels, click-to-trade functionality, and removed error states for better user experience when offline
- June 16, 2025. Created comprehensive mobile settings page with profile photo upload, username editing, theme switching, language/currency selection, and account management options. Fixed profile image synchronization issues between settings and profile pages. Separated username (editable) from email (read-only) functionality.
- June 16, 2025. Successfully migrated database from PostgreSQL to MySQL, connected to external MySQL database (sql7.freesqldatabase.com), updated complete schema and connection configuration
- June 15, 2025. Connected About Us navigation from profile to company page, implemented personalized landing page for logged-in users
- June 15, 2025. Fixed chatbot functionality by switching from OpenAI to GitHub AI inference API 
- June 13, 2025. Initial setup