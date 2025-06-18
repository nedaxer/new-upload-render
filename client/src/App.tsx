import { useState, useEffect } from 'react';
import { Route, Switch, Router, Redirect } from 'wouter';
import { useHashLocation } from './hooks/use-hash-location';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthRedirect } from '@/components/auth-redirect';
import { Toaster } from '@/components/ui/toaster';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { SplashScreen } from '@/components/splash-screen';
import { lazy } from 'react';

// Pages
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';

// Trading Pages
import SpotTrading from '@/pages/SpotTrading';
import Futures from '@/pages/Futures';
import Staking from '@/pages/Staking';
import Deposit from '@/pages/Deposit';
import Withdraw from '@/pages/Withdraw';
import AdminPanel from '@/pages/AdminPanel';

// Company Pages
import About from '@/pages/company/about';
import Careers from '@/pages/company/careers';
import Contact from '@/pages/company/contact';
import News from '@/pages/company/news';
import Regulations from '@/pages/company/regulations';

// Products Pages
import BinaryOptions from '@/pages/products/binary-options';
import CallSpreads from '@/pages/products/call-spreads';
import KnockOuts from '@/pages/products/knock-outs';
import Pricing from '@/pages/products/pricing';
import TouchBrackets from '@/pages/products/touch-brackets';

// Markets Pages
import AltcoinMarkets from '@/pages/markets/altcoins';
import BitcoinMarkets from '@/pages/markets/bitcoin';
import Commodities from '@/pages/markets/commodities';
import CryptoEvents from '@/pages/markets/crypto-events';
import EthereumMarkets from '@/pages/markets/ethereum';
import Events from '@/pages/markets/events';
import MarketData from '@/pages/markets/market-data';
import LiveMarkets from '@/pages/markets/live-markets';

// Platform Pages
import Funding from '@/pages/platform/funding';
import MobileApp from '@/pages/platform/mobile-app';
import Security from '@/pages/platform/security';
import WebPlatform from '@/pages/platform/web-platform';

// Learn Pages
import BinaryOptionsLearn from '@/pages/learn/binary-options';
import CallSpreadsLearn from '@/pages/learn/call-spreads';
import GettingStarted from '@/pages/learn/getting-started';
import KnockOutsLearn from '@/pages/learn/knock-outs';
import TradingGuides from '@/pages/learn/trading-guides';
import TradingStrategies from '@/pages/learn/trading-strategies';
import Webinars from '@/pages/learn/webinars';

// Legal Pages
import CFTC from '@/pages/legal/cftc';
import Privacy from '@/pages/legal/privacy';
import Risk from '@/pages/legal/risk';
import Terms from '@/pages/legal/terms';

// Account Pages
import Login from '@/pages/account/login';
import Register from '@/pages/account/register';
import ForgotPassword from '@/pages/account/forgot-password';
import VerifyAccount from '@/pages/account/verify';

// Legacy Dashboard Pages (keeping for compatibility)
import LegacyDashboard from '@/pages/dashboard';
import Trade from '@/pages/dashboard/trade';
import LegacyStaking from '@/pages/dashboard/staking';
import LegacyDeposit from '@/pages/dashboard/deposit';

// Admin Pages
import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminUsers from '@/pages/admin/users';
import AdminStaking from '@/pages/admin/staking';

// Mobile Pages
import MobileHome from '@/pages/mobile/home';
import MobileAssets from '@/pages/mobile/assets';
import MobileTrade from '@/pages/mobile/trade';
import MobileMarkets from '@/pages/mobile/markets';
import MobileEarn from '@/pages/mobile/earn';
import MobileProfile from '@/pages/mobile/profile';
import MobileConvert from '@/pages/mobile/convert';
import MobileFutures from '@/pages/mobile/futures';
import MobileSpot from '@/pages/mobile/spot';
import MobileInviteFriends from '@/pages/mobile/invite-friends';
import MobileNotifications from '@/pages/mobile/notifications';
import NotificationSettings from '@/pages/mobile/notification-settings';
import Chatbot from '@/pages/mobile/chatbot';
import MobileKYC from '@/pages/mobile/kyc';
import MobileNews from '@/pages/mobile/news';
import MobileSettings from '@/pages/mobile/settings';
import MobileSecurity from '@/pages/mobile/security';
import LanguageSelection from '@/pages/mobile/language-selection';

// Other Pages
import SiteMap from '@/pages/site-map';
import PortfolioDemo from '@/pages/portfolio-demo';



// Provide a loading state
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#0033a0]"></div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always show splash screen for testing the optimizations
    // Comment out the cache check temporarily to test the improvements
    // const lastSplashTime = localStorage.getItem('lastSplashTime');
    // const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    // 
    // if (lastSplashTime && parseInt(lastSplashTime) > fiveMinutesAgo) {
    //   setShowSplash(false);
    // }
    
    // Just a small delay to ensure all routes are registered
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    localStorage.setItem('lastSplashTime', Date.now().toString());
    setShowSplash(false);
  };

  // Show splash screen on first visit
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show loading indicator while routes are being set up
  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router hook={useHashLocation}>
              <Switch>
            {/* Home route with auth redirect */}
            <Route path="/">
              {(params) => (
                <AuthRedirect>
                  <Home {...params} />
                </AuthRedirect>
              )}
            </Route>

            {/* Company Routes */}
            <Route path="/company/about" component={About} />
            <Route path="/company/careers" component={Careers} />
            <Route path="/company/contact" component={Contact} />
            <Route path="/company/news" component={News} />
            <Route path="/company/regulations" component={Regulations} />

            {/* Products Routes */}
            <Route path="/products/binary-options" component={BinaryOptions} />
            <Route path="/products/call-spreads" component={CallSpreads} />
            <Route path="/products/knock-outs" component={KnockOuts} />
            <Route path="/products/pricing" component={Pricing} />
            <Route path="/products/touch-brackets" component={TouchBrackets} />

            {/* Markets Routes */}
            <Route path="/markets/altcoins" component={AltcoinMarkets} />
            <Route path="/markets/bitcoin" component={BitcoinMarkets} />
            <Route path="/markets/commodities" component={Commodities} />
            <Route path="/markets/crypto-events" component={CryptoEvents} />
            <Route path="/markets/ethereum" component={EthereumMarkets} />
            <Route path="/markets/events" component={Events} />
            <Route path="/markets/market-data" component={MarketData} />
            <Route path="/markets/live-markets" component={LiveMarkets} />

            {/* Platform Routes */}
            <Route path="/platform/funding" component={Funding} />
            <Route path="/platform/mobile-app" component={MobileApp} />
            <Route path="/platform/security" component={Security} />
            <Route path="/platform/web-platform" component={WebPlatform} />

            {/* Learn Routes */}
            <Route path="/learn/binary-options" component={BinaryOptionsLearn} />
            <Route path="/learn/call-spreads" component={CallSpreadsLearn} />
            <Route path="/learn/getting-started" component={GettingStarted} />
            <Route path="/learn/knock-outs" component={KnockOutsLearn} />
            <Route path="/learn/trading-guides" component={TradingGuides} />
            <Route path="/learn/trading-strategies" component={TradingStrategies} />
            <Route path="/learn/webinars" component={Webinars} />

            {/* Legal Routes */}
            <Route path="/legal/cftc" component={CFTC} />
            <Route path="/legal/privacy" component={Privacy} />
            <Route path="/legal/risk" component={Risk} />
            <Route path="/legal/terms" component={Terms} />

            {/* Account Routes - with redirection for authenticated users */}
            <Route path="/account/login">
              {(params) => (
                <AuthRedirect>
                  <Login {...params} />
                </AuthRedirect>
              )}
            </Route>
            <Route path="/account/register">
              {(params) => (
                <AuthRedirect>
                  <Register {...params} />
                </AuthRedirect>
              )}
            </Route>
            <Route path="/account/forgot-password" component={ForgotPassword} />
            {/* Redirect verify to mobile since we no longer need verification */}
            <Route path="/account/verify">
              {() => <Redirect to="/mobile" />}
            </Route>

            {/* Trading Platform Routes - Protected */}
            <ProtectedRoute path="/spot-trading" component={SpotTrading} />
            <ProtectedRoute path="/futures" component={Futures} />
            <ProtectedRoute path="/staking" component={Staking} />
            <ProtectedRoute path="/deposit" component={Deposit} />
            <ProtectedRoute path="/withdraw" component={Withdraw} />

            {/* Mobile App Routes - Protected */}
            <ProtectedRoute path="/mobile" component={MobileHome} />
            <ProtectedRoute path="/mobile/assets" component={MobileAssets} />
            <ProtectedRoute path="/mobile/trade" component={MobileTrade} />
            <ProtectedRoute path="/mobile/markets" component={MobileMarkets} />
            <ProtectedRoute path="/mobile/earn" component={MobileEarn} />
            <ProtectedRoute path="/mobile/profile" component={MobileProfile} />
            <ProtectedRoute path="/mobile/convert" component={MobileConvert} />
            <ProtectedRoute path="/mobile/futures" component={MobileFutures} />
            <ProtectedRoute path="/mobile/spot" component={MobileSpot} />
            <ProtectedRoute path="/mobile/invite-friends" component={MobileInviteFriends} />
            <ProtectedRoute path="/mobile/notifications" component={MobileNotifications} />
            <ProtectedRoute path="/mobile/notification-settings" component={NotificationSettings} />
            <ProtectedRoute path="/mobile/chatbot" component={Chatbot} />
            <ProtectedRoute path="/mobile/kyc" component={MobileKYC} />
            <ProtectedRoute path="/mobile/news" component={MobileNews} />
            <ProtectedRoute path="/mobile/settings" component={MobileSettings} />
            <ProtectedRoute path="/mobile/security" component={MobileSecurity} />
            <ProtectedRoute path="/mobile/language-selection" component={LanguageSelection} />
            <Route path="/mobile/currency-selection" component={() => <div>Currency Selection</div>} />

            {/* Secret Admin Routes - Protected with admin flag */}
            <Route path="/secret-admin-nexus-2024" component={AdminLogin} />
            <ProtectedRoute path="/admin-panel" component={AdminPanel} adminOnly={true} />

            {/* Other Routes */}
            <Route path="/site-map" component={SiteMap} />
            <Route path="/portfolio-demo" component={PortfolioDemo} />

            {/* 404 Route */}
            <Route component={NotFound} />
            </Switch>
          </Router>
            <Toaster />
            <PWAInstallPrompt />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}