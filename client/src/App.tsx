import { useState, useEffect } from 'react';
import { Route, Switch, Router, Redirect } from 'wouter';
import { useHashLocation } from './hooks/use-hash-location';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthRedirect } from '@/components/auth-redirect';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';

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

// Dashboard Pages
import Dashboard from '@/pages/dashboard';
import Trade from '@/pages/dashboard/trade';
import Staking from '@/pages/dashboard/staking';
import Deposit from '@/pages/dashboard/deposit';

// Trading Platform Pages
import TradingDashboard from '@/pages/platform/dashboard';
import SpotTrading from '@/pages/platform/trading';
import FuturesTrading from '@/pages/platform/futures';
import StakingDashboard from '@/pages/platform/staking';
import WalletDashboard from '@/pages/platform/wallet';
import ConvertAssets from '@/pages/platform/convert';
import NewsAndEvents from '@/pages/platform/news';

// Admin Pages
import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminUsers from '@/pages/admin/users';
import AdminStaking from '@/pages/admin/staking';

// Other Pages
import SiteMap from '@/pages/site-map';



// Provide a loading state
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#0033a0]"></div>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Just a small delay to ensure all routes are registered
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading indicator while routes are being set up
  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
            {/* Redirect verify to dashboard since we no longer need verification */}
            <Route path="/account/verify">
              {() => <Redirect to="/dashboard" />}
            </Route>
            
            {/* Dashboard Routes - Protected */}
            <ProtectedRoute path="/dashboard" component={TradingDashboard} />
            <ProtectedRoute path="/dashboard/trade" component={Trade} />
            <ProtectedRoute path="/dashboard/staking" component={Staking} />
            <ProtectedRoute path="/dashboard/deposit" component={Deposit} />
            
            {/* Trading Platform Routes - Protected */}
            <ProtectedRoute path="/platform/dashboard" component={TradingDashboard} />
            <ProtectedRoute path="/platform/spot" component={SpotTrading} />
            <ProtectedRoute path="/platform/futures" component={FuturesTrading} />
            <ProtectedRoute path="/platform/staking" component={StakingDashboard} />
            <ProtectedRoute path="/platform/wallet" component={WalletDashboard} />
            <ProtectedRoute path="/platform/convert" component={ConvertAssets} />
            <ProtectedRoute path="/platform/news" component={NewsAndEvents} />
            
            {/* Admin Routes - Protected with admin flag */}
            <Route path="/admin/login" component={AdminLogin} />
            <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly={true} />
            <ProtectedRoute path="/admin/users" component={AdminUsers} adminOnly={true} />
            <ProtectedRoute path="/admin/staking" component={AdminStaking} adminOnly={true} />
            
            {/* Other Routes */}
            <Route path="/site-map" component={SiteMap} />
            
            {/* 404 Route */}
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
