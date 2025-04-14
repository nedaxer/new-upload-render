import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// Use a hash-based location strategy for better compatibility with server
const useHashLocation = (): [string, (to: string) => void] => {
  const [loc, setLoc] = React.useState(window.location.hash.slice(1) || "/");

  React.useEffect(() => {
    const handler = () => {
      setLoc(window.location.hash.slice(1) || "/");
    };

    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = React.useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return [loc, navigate];
};

// Markets Pages
import Commodities from "@/pages/markets/commodities";
import Events from "@/pages/markets/events";
import MarketData from "@/pages/markets/market-data";
import Bitcoin from "@/pages/markets/bitcoin";
import Ethereum from "@/pages/markets/ethereum";
import Altcoins from "@/pages/markets/altcoins";
import CryptoEvents from "@/pages/markets/crypto-events";

// Products Pages
import BinaryOptions from "@/pages/products/binary-options";
import CallSpreads from "@/pages/products/call-spreads";
import TouchBrackets from "@/pages/products/touch-brackets";
import KnockOuts from "@/pages/products/knock-outs";
import Pricing from "@/pages/products/pricing";

// Platform Pages
import WebPlatform from "@/pages/platform/web-platform";
import MobileApp from "@/pages/platform/mobile-app";
import Funding from "@/pages/platform/funding";
import Security from "@/pages/platform/security";

// Company Pages
import About from "@/pages/company/about";
import Regulations from "@/pages/company/regulations";
import News from "@/pages/company/news";
import Careers from "@/pages/company/careers";
import Contact from "@/pages/company/contact";

// Learn Pages
import GettingStarted from "@/pages/learn/getting-started";
import TradingStrategies from "@/pages/learn/trading-strategies";
import Webinars from "@/pages/learn/webinars";
import TradingGuides from "@/pages/learn/trading-guides";

// Legal Pages
import Terms from "@/pages/legal/terms";
import Privacy from "@/pages/legal/privacy";
import Risk from "@/pages/legal/risk";
import CFTC from "@/pages/legal/cftc";
import SiteMap from "@/pages/site-map";

// Account Pages
import Login from "@/pages/account/login";
import Register from "@/pages/account/register";
import ForgotPassword from "@/pages/account/forgot-password";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Markets Routes */}
      <Route path="/markets/commodities" component={Commodities} />
      <Route path="/markets/events" component={Events} />
      <Route path="/markets/market-data" component={MarketData} />
      <Route path="/markets/bitcoin" component={Bitcoin} />
      <Route path="/markets/ethereum" component={Ethereum} />
      <Route path="/markets/altcoins" component={Altcoins} />
      <Route path="/markets/crypto-events" component={CryptoEvents} />
      
      {/* Products Routes */}
      <Route path="/products/binary-options" component={BinaryOptions} />
      <Route path="/products/call-spreads" component={CallSpreads} />
      <Route path="/products/touch-brackets" component={TouchBrackets} />
      <Route path="/products/knock-outs" component={KnockOuts} />
      <Route path="/products/pricing" component={Pricing} />
      
      {/* Platform Routes */}
      <Route path="/platform/web-platform" component={WebPlatform} />
      <Route path="/platform/mobile-app" component={MobileApp} />
      <Route path="/platform/funding" component={Funding} />
      <Route path="/platform/security" component={Security} />
      
      {/* Company Routes */}
      <Route path="/company/about" component={About} />
      <Route path="/company/regulations" component={Regulations} />
      <Route path="/company/news" component={News} />
      <Route path="/company/careers" component={Careers} />
      <Route path="/company/contact" component={Contact} />
      
      {/* Learn Routes */}
      <Route path="/learn/getting-started" component={GettingStarted} />
      <Route path="/learn/trading-strategies" component={TradingStrategies} />
      <Route path="/learn/webinars" component={Webinars} />
      <Route path="/learn/trading-guides" component={TradingGuides} />
      
      {/* Legal Routes */}
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/privacy" component={Privacy} />
      <Route path="/legal/risk" component={Risk} />
      <Route path="/legal/cftc" component={CFTC} />
      <Route path="/site-map" component={SiteMap} />
      
      {/* Account Routes */}
      <Route path="/account/login" component={Login} />
      <Route path="/account/register" component={Register} />
      <Route path="/account/forgot-password" component={ForgotPassword} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter hook={useHashLocation}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
