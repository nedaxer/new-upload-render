import { useState, useEffect } from 'react';
import { Route, Switch, Router } from 'wouter';
import { useHashLocation } from './hooks/use-hash-location';

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
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        
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
        
        {/* Account Routes */}
        <Route path="/account/login" component={Login} />
        <Route path="/account/register" component={Register} />
        <Route path="/account/forgot-password" component={ForgotPassword} />
        
        {/* Other Routes */}
        <Route path="/site-map" component={SiteMap} />
        
        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}
