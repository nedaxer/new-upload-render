import { MobileLayout } from '@/components/mobile-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpDown,
  Plus,
  Minus,
  Calendar,
  Clock,
  Star,
  Edit3,
  ChevronDown,
  Bell,
  MessageSquare,
  Settings,
  RefreshCw,
  X
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import MobileSpot from './spot';
import MobileFutures from './futures';
import CryptoPriceTicker from '@/components/crypto-price-ticker';
import CryptoPairSelector from '@/components/crypto-pair-selector';
import { useLanguage } from '@/contexts/language-context';

declare global {
  interface Window {
    TradingView: any;
    persistentTradingViewWidget: any;
  }
}



export default function MobileTrade() {
  const { t } = useLanguage();
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedTab, setSelectedTab] = useState('Charts');
  const [selectedTradingType, setSelectedTradingType] = useState('Spot');
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [tradingViewSymbol, setTradingViewSymbol] = useState('BINANCE:BTCUSDT');
  const [selectedPair, setSelectedPair] = useState({ symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0});
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [tradeMode, setTradeMode] = useState('Buy');
  const [quantity, setQuantity] = useState(0);
  const [amount, setAmount] = useState(0);
  const [location, navigate] = useLocation();
  
  // Chart state
  const [currentSymbol, setCurrentSymbol] = useState('BTCUSDT');
  const [widget, setWidget] = useState<any>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isChartReady = useRef(false);

  const handleTabChange = (tab: string) => {
    hapticLight();
    setSelectedTab(tab);
  };

  const handleTradingTypeChange = (tab: string) => {
    hapticLight();
    setSelectedTradingType(tab);
  };

  const handleBuyClick = () => {
    setTradeMode('Buy');
    setSelectedTab('Trade');
  };

  const handleSellClick = () => {
    setTradeMode('Sell');
    setSelectedTab('Trade');
  };

  // Auto-loading chart that always works
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current || !window.TradingView || isChartReady.current) return;
    
    console.log('Initializing auto-loading chart');
    
    try {
      const container = chartContainerRef.current;
      container.innerHTML = ''; // Clear any existing content
      
      const newWidget = new window.TradingView.widget({
        container: container,
        autosize: true,
        symbol: `BYBIT:${currentSymbol}`,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        backgroundColor: "rgba(14, 14, 14, 1)",
        toolbar_bg: "rgba(14, 14, 14, 1)",
        hide_top_toolbar: true,
        hide_side_toolbar: true,
        allow_symbol_change: false,
        enable_publishing: false,
        details: false,
        withdateranges: false,
        calendar: false,
        studies: [],
        drawings_access: { type: 'black', tools: [] },
        crosshair: { mode: 1 },
        overrides: {
          "paneProperties.background": "#0e0e0e",
          "paneProperties.backgroundType": "solid",
          "paneProperties.gridProperties.color": "rgba(42, 46, 57, 0.06)",
          "scalesProperties.textColor": "#787b86",
          "scalesProperties.lineColor": "rgba(42, 46, 57, 0.06)",
          "paneProperties.crossHairProperties.color": "#FFA500",
          "paneProperties.crossHairProperties.width": 1,
          "paneProperties.crossHairProperties.style": 2,
          "volumePaneSize": "medium"
        },
        disabled_features: [
          "header_symbol_search",
          "header_resolutions", 
          "header_chart_type",
          "header_compare",
          "header_screenshot",
          "header_fullscreen_button",
          "header_settings",
          "timeframes_toolbar",
          "control_bar",
          "left_toolbar"
        ],
        enabled_features: ["study_templates"],
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: "1.1",
        client_id: 'tradingview.com',
        user_id: 'public_user_id'
      });

      setWidget(newWidget);
      isChartReady.current = true;
      console.log('Chart initialized successfully');
      
    } catch (error) {
      console.error('Chart initialization failed:', error);
      // Retry after a short delay
      setTimeout(() => {
        isChartReady.current = false;
        initializeChart();
      }, 1000);
    }
  }, [currentSymbol]);

  // Update price data
  const updatePrice = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`);
      const data = await response.json();
      
      if (data.result && data.result.list && data.result.list[0]) {
        const ticker = data.result.list[0];
        const price = parseFloat(ticker.lastPrice).toFixed(2);
        const high = parseFloat(ticker.highPrice24h).toFixed(2);
        const low = parseFloat(ticker.lowPrice24h).toFixed(2);
        const turnover = (parseFloat(ticker.turnover24h) / 1e6).toFixed(2);

        const priceElement = document.getElementById("coin-price");
        const highElement = document.getElementById("high");
        const lowElement = document.getElementById("low");
        const turnoverElement = document.getElementById("turnover");

        if (priceElement) priceElement.textContent = price;
        if (highElement) highElement.textContent = high;
        if (lowElement) lowElement.textContent = low;
        if (turnoverElement) turnoverElement.textContent = turnover + "M";
      }
    } catch (error) {
      console.error("Price fetch error:", error);
    }
  }, []);

  // Auto-initialize chart on component mount (background loading)
  useEffect(() => {
    const loadTradingViewScript = () => {
      if (!window.TradingView) {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          console.log('TradingView loaded, initializing chart');
          setTimeout(initializeChart, 500);
        };
        script.onerror = () => {
          console.error('TradingView script failed to load');
          // Retry loading
          setTimeout(loadTradingViewScript, 2000);
        };
        document.head.appendChild(script);
      } else {
        initializeChart();
      }
    };

    // Always load chart in background when component mounts
    loadTradingViewScript();
  }, [initializeChart]);

  // Price updates
  useEffect(() => {
    updatePrice(currentSymbol);
    const interval = setInterval(() => {
      updatePrice(currentSymbol);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentSymbol, updatePrice]);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
  const tabs = ['Charts', 'Trade'];
  const tradingTabs = ['Spot', 'Futures'];

  return (
    <MobileLayout>
      {/* Trading Tabs */}
      <div className="bg-gray-900 px-3 py-1">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tradingTabs.map((tab) => (
            <button 
              key={tab}
              className={`whitespace-nowrap px-2 py-1 rounded text-xs ${
                selectedTradingType === tab 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400'
              }`}
              onClick={() => handleTradingTypeChange(tab)}
            >
              {t(tab.toLowerCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Chart/Trade Toggle */}
      <div className="bg-gray-800 mx-3 rounded-lg overflow-hidden">
        <div className="flex">
          <button 
            className={`flex-1 py-1 text-xs font-medium ${
              selectedTab === 'Charts' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('Charts')}
          >
            {t('charts')}
          </button>
          <button 
            className={`flex-1 py-1 text-xs font-medium ${
              selectedTab === 'Trade' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('Trade')}
          >
            {t('trade')}
          </button>
        </div>
      </div>

      {/* Charts Tab Content */}
      {selectedTab === 'Charts' && (
        <div className="flex-1 overflow-hidden bg-gray-900">
          {/* Price Header */}
          <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
            <div className="flex flex-col">
              <div className="text-white font-bold text-lg cursor-pointer" onClick={() => setShowPairSelector(!showPairSelector)}>
                BTC/USDT
              </div>
              <div className="text-gray-400 text-sm">
                Price: <span className="text-white" id="coin-price">--</span> USD
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>24h High: <span className="text-white" id="high">--</span></div>
              <div>24h Low: <span className="text-white" id="low">--</span></div>
              <div>Turnover: <span className="text-white" id="turnover">--</span></div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex-1 relative bg-gray-900">
            <div 
              ref={chartContainerRef}
              className="w-full h-full"
              style={{ height: 'calc(100vh - 200px)' }}
            />
            
            {/* Watermark */}
            <div 
              className="absolute top-1/2 left-1/2 w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-10"
              style={{
                backgroundImage: 'url(https://i.imgur.com/F9ljfzP.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            />

            {/* Brand Cover */}
            <div className="absolute bottom-7 left-3 w-12 h-12 bg-gray-900 rounded-lg shadow-lg z-50 pointer-events-auto">
              <img 
                src="https://i.imgur.com/1yZtbuJ.jpeg" 
                alt="Nedaxer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Fixed Buy/Sell Panel */}
      {selectedTab === 'Charts' && (
        <div className="fixed left-0 right-0 bg-gray-800 border-t border-gray-700 p-2" style={{ bottom: '64px', zIndex: 10000 }}>
          <div className="flex gap-2">
            <button 
              onClick={handleBuyClick}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
            >
              {selectedTradingType === 'Futures' ? 'Long' : 'Buy'}
            </button>
            <button 
              onClick={handleSellClick}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
            >
              {selectedTradingType === 'Futures' ? 'Short' : 'Sell'}
            </button>
          </div>
        </div>
      )}

      {/* Trade Tab Content */}
      {selectedTab === 'Trade' && (
        <div className="flex-1 overflow-hidden">
          {selectedTradingType === 'Spot' && <MobileSpot />}
          {selectedTradingType === 'Futures' && <MobileFutures />}
        </div>
      )}
    </MobileLayout>
  );
}