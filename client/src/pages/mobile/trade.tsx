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
import TradingViewWidget from '@/components/tradingview-widget';
import CryptoPriceTicker from '@/components/crypto-price-ticker';
import CryptoPairSelector from '@/components/crypto-pair-selector';
import { useLanguage } from '@/contexts/language-context';

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
  const [tradeMode, setTradeMode] = useState('Buy'); // 'Buy' or 'Sell'
  const [quantity, setQuantity] = useState(0);
  const [amount, setAmount] = useState(0);
  const [location, navigate] = useLocation();
  
  // Chart state
  const [currentSymbol, setCurrentSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [currentTicker, setCurrentTicker] = useState<any>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isTradingViewReady, setIsTradingViewReady] = useState(false);
  const [chartError, setChartError] = useState(false);
  const chartWidget = useRef<any>(null);
  const priceUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const tradingViewScript = useRef<HTMLScriptElement | null>(null);
  const chartCache = useRef<Map<string, any>>(new Map());

  // Global chart widget cache to persist across page navigation
  const getGlobalChartWidget = useCallback(() => {
    if (!(window as any).nedaxerChartWidget) {
      (window as any).nedaxerChartWidget = null;
    }
    return (window as any).nedaxerChartWidget;
  }, []);

  const setGlobalChartWidget = useCallback((widget: any) => {
    (window as any).nedaxerChartWidget = widget;
    chartWidget.current = widget;
  }, []);

  // Enhanced chart loading with persistent widget caching
  const loadChart = useCallback((symbol: string) => {
    if (typeof window === 'undefined' || !(window as any).TradingView) return;

    // Check if we have a cached widget for this symbol
    const existingWidget = getGlobalChartWidget();
    
    if (existingWidget && existingWidget.iframe && existingWidget.iframe.contentWindow) {
      try {
        // Try to change symbol on existing widget instead of recreating
        existingWidget.setSymbol(symbol, "15", () => {
          // Symbol changed successfully, no reload needed - don't trigger loading state
        });
        chartWidget.current = existingWidget;
        return;
      } catch (error) {
        // If changing symbol fails, remove the old widget
        try {
          existingWidget.remove();
        } catch (removeError) {
          // Ignore removal errors
        }
      }
    }

    // Create new widget only if necessary - don't set loading state
    const widget = new (window as any).TradingView.widget({
      container_id: "chart",
      autosize: true,
      symbol: symbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#111827",
      toolbar_bg: "#111827",
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
      save_image: false,
      loading_screen: { backgroundColor: "#111827", foregroundColor: "#111827" },
      overrides: {
        "paneProperties.background": "#111827",
        "paneProperties.backgroundType": "solid",
        "paneProperties.backgroundGradientStartColor": "#111827", 
        "paneProperties.backgroundGradientEndColor": "#111827",
        "paneProperties.vertGridProperties.color": "#374151",
        "paneProperties.horzGridProperties.color": "#374151",
        "paneProperties.crossHairProperties.color": "#6B7280",
        "paneProperties.crossHairProperties.width": 1,
        "paneProperties.crossHairProperties.style": 2,
        "paneProperties.crossHairProperties.transparency": 0,
        
        "scalesProperties.backgroundColor": "#111827",
        "scalesProperties.lineColor": "#374151", 
        "scalesProperties.textColor": "#9CA3AF",
        "paneProperties.leftAxisProperties.showSeriesLastValue": false,
        "paneProperties.rightAxisProperties.showSeriesLastValue": false,
        "scalesProperties.showLeftScale": false,
        "scalesProperties.showRightScale": true,
        
        "mainSeriesProperties.style": 1,
        "mainSeriesProperties.candleStyle.upColor": "#10B981",
        "mainSeriesProperties.candleStyle.downColor": "#EF4444",
        "mainSeriesProperties.candleStyle.drawWick": true,
        "mainSeriesProperties.candleStyle.drawBorder": false,
        "mainSeriesProperties.candleStyle.wickUpColor": "#10B981",
        "mainSeriesProperties.candleStyle.wickDownColor": "#EF4444",
        
        "volumePaneSize": "small",
        "volume.volume.color.0": "#EF4444",
        "volume.volume.color.1": "#10B981",
        "volume.volume.transparency": 0,
        
        "paneProperties.legendProperties.showLegend": false,
        "paneProperties.legendProperties.showStudyArguments": false,
        "paneProperties.legendProperties.showStudyTitles": false,
        "paneProperties.legendProperties.showStudyValues": false,
        "paneProperties.legendProperties.showSeriesTitle": false,
        
        "paneProperties.topMargin": 5,
        "paneProperties.bottomMargin": 15,
        "paneProperties.leftMargin": 5,
        "paneProperties.rightMargin": 5,
      },
      disabled_features: [
        "header_symbol_search", "timeframes_toolbar", "use_localstorage_for_settings",
        "volume_force_overlay", "left_toolbar", "legend_context_menu", "display_market_status",
        "go_to_date", "header_compare", "header_chart_type", "header_resolutions",
        "header_screenshot", "header_fullscreen_button", "header_settings", "header_indicators",
        "context_menus", "control_bar", "edit_buttons_in_legend", "main_series_scale_menu",
        "chart_property_page_legend", "chart_property_page_trading", "border_around_the_chart",
        "chart_crosshair_menu", "snapshot_trading_drawings", "show_logo_on_all_charts",
        "remove_library_container_border", "chart_hide_close_button", "header_saveload",
        "header_undo_redo", "show_chart_property_page", "popup_hints"
      ],
      onChartReady: () => {
        // Chart ready - no loading state changes needed
      }
    });
    
    setGlobalChartWidget(widget);
  }, [getGlobalChartWidget, setGlobalChartWidget]);

  const updatePrice = async (symbol: string) => {
    try {
      const response = await fetch('/api/bybit/tickers');
      const data = await response.json();
      
      if (data.success && data.data) {
        const ticker = data.data.find((t: any) => t.symbol === symbol);
        if (ticker) {
          setCurrentTicker(ticker);
          setCurrentPrice(parseFloat(ticker.lastPrice).toFixed(2));
        }
      }
    } catch (error) {
      console.error('Price update error:', error);
    }
  };

  const initializeCoinMenu = useCallback(() => {
    const coinList = ["BTCUSDT", "ETHUSDT", "XRPUSDT", "TRXUSDT", "SOLUSDT"];
    const menu = document.getElementById("coin-menu");
    
    if (menu) {
      menu.innerHTML = '';
      coinList.forEach(symbol => {
        const div = document.createElement("div");
        div.className = "p-2 cursor-pointer text-white hover:bg-gray-700 transition-colors";
        div.textContent = symbol.replace("USDT", "/USDT");
        div.onclick = () => {
          // Instant UI feedback
          setCurrentSymbol(symbol);
          menu.style.display = "none";
          
          // Load chart and update price without delay
          if (isTradingViewReady) {
            loadChart(`BYBIT:${symbol}`);
          }
          updatePrice(symbol);
        };
        menu.appendChild(div);
      });
    }
  }, [isTradingViewReady, loadChart]);

  // Add preload hints and load TradingView script with maximum optimization
  useEffect(() => {
    // Add DNS prefetch and preconnect for faster loading
    const addPreloadHints = () => {
      const hints = [
        { rel: 'dns-prefetch', href: 'https://s3.tradingview.com' },
        { rel: 'preconnect', href: 'https://s3.tradingview.com' },
        { rel: 'preload', href: 'https://s3.tradingview.com/tv.js', as: 'script' }
      ];
      
      hints.forEach(hint => {
        const existingHint = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
        if (!existingHint) {
          const link = document.createElement('link');
          Object.assign(link, hint);
          document.head.appendChild(link);
        }
      });
    };
    
    addPreloadHints();

    // Check if script is already loaded and widget exists
    if ((window as any).TradingView) {
      setIsTradingViewReady(true);
      
      // Check for existing widget first
      const existingWidget = getGlobalChartWidget();
      if (existingWidget && existingWidget.iframe && existingWidget.iframe.contentWindow) {
        // Widget exists and is functional, just update state
        chartWidget.current = existingWidget;
        setIsChartLoading(false);
        initializeCoinMenu();
      } else {
        // No existing widget, create new one
        loadChart('BYBIT:BTCUSDT');
        initializeCoinMenu();
      }
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setIsTradingViewReady(true);
        loadChart('BYBIT:BTCUSDT');
        initializeCoinMenu();
      });
      return;
    }

    // Create and load script with maximum optimization
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      setIsTradingViewReady(true);
      loadChart('BYBIT:BTCUSDT');
      initializeCoinMenu();
    };
    
    script.onerror = () => {
      console.error('Failed to load TradingView script');
      setIsChartLoading(false);
      setChartError(true);
    };

    document.head.appendChild(script);
    tradingViewScript.current = script;

    return () => {
      // Don't remove the script or widget when component unmounts
      // Keep them cached for instant access when returning
    };
  }, [loadChart, getGlobalChartWidget]);

  // Price update interval
  useEffect(() => {
    updatePrice(currentSymbol);
    priceUpdateInterval.current = setInterval(() => {
      updatePrice(currentSymbol);
    }, 1000);

    return () => {
      if (priceUpdateInterval.current) {
        clearInterval(priceUpdateInterval.current);
      }
    };
  }, [currentSymbol]);

  // Read symbol from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbolParam = urlParams.get('symbol');
    
    if (symbolParam) {
      // Update trading view symbol for Bybit
      const tradingViewSymbol = `BYBIT:${symbolParam}USDT`;
      setTradingViewSymbol(tradingViewSymbol);
      setCurrentSymbol(`${symbolParam}USDT`);
      
      // Update selected pair
      setSelectedPair({
        symbol: symbolParam,
        name: getCryptoName(symbolParam),
        price: 0,
        change: 0
      });
      
      // Update crypto selection
      const cryptoId = getCryptoIdFromSymbol(symbolParam);
      setSelectedCrypto(cryptoId);
    }
  }, [location]);

  // Helper function to get crypto name from symbol
  const getCryptoName = (symbol: string): string => {
    const cryptoNames: { [key: string]: string } = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'DOT': 'Polkadot',
      'AVAX': 'Avalanche',
      'MATIC': 'Polygon',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'LTC': 'Litecoin',
      'ATOM': 'Cosmos',
      'NEAR': 'NEAR Protocol',
      'FTM': 'Fantom',
      'ALGO': 'Algorand'
    };
    return cryptoNames[symbol] || symbol;
  };

  // Helper function to get crypto ID from symbol
  const getCryptoIdFromSymbol = (symbol: string): string => {
    const symbolToIdMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'SOL': 'solana',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'MATIC': 'polygon',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'ATOM': 'cosmos',
      'NEAR': 'near',
      'FTM': 'fantom',
      'ALGO': 'algorand'
    };
    return symbolToIdMap[symbol] || 'bitcoin';
  };

  const timeframes = ['15m', '1h', '4h', '1D', 'More'];
  const tradingTabs = ['Spot', 'Futures'];
  const cryptoPairs = [
    { symbol: 'BTC', name: 'Bitcoin', price: 50000, change: 2.5 },
    { symbol: 'ETH', name: 'Ethereum', price: 3000, change: -1.0 },
    { symbol: 'LTC', name: 'Litecoin', price: 200, change: 0.5 },
  ];

  // Map crypto IDs to TradingView symbols
  const cryptoToTradingViewMap: { [key: string]: string } = {
    'bitcoin': 'BINANCE:BTCUSDT',
    'ethereum': 'BINANCE:ETHUSDT',
    'binancecoin': 'BINANCE:BNBUSDT',
    'solana': 'BINANCE:SOLUSDT',
    'ripple': 'BINANCE:XRPUSDT',
    'cardano': 'BINANCE:ADAUSDT',
    'avalanche-2': 'BINANCE:AVAXUSDT',
    'dogecoin': 'BINANCE:DOGEUSDT',
    'chainlink': 'BINANCE:LINKUSDT',
    'polygon': 'BINANCE:MATICUSDT'
  };

  const handleTradingTypeChange = (tab: string) => {
    hapticLight();
    setSelectedTradingType(tab);
  };

  const handleTabChange = (tab: string) => {
    hapticLight();
    setSelectedTab(tab);
  };

  const handleCryptoSymbolChange = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
    const tradingViewSymbol = cryptoToTradingViewMap[cryptoId] || 'BINANCE:BTCUSDT';
    setTradingViewSymbol(tradingViewSymbol);
  };

  const handlePairSelection = (cryptoId: string, symbol: string) => {
    setSelectedCrypto(cryptoId);
    setSelectedPair({
      symbol: symbol,
      name: getCryptoName(symbol),
      price: 0,
      change: 0
    });
    const tradingViewSymbol = cryptoToTradingViewMap[cryptoId] || `BINANCE:${symbol}USDT`;
    setTradingViewSymbol(tradingViewSymbol);
    setShowPairSelector(false);
  };

  const handleAlertsClick = () => {
    setShowAlerts(!showAlerts);
  };

  const handleToolsClick = () => {
    setShowTools(!showTools);
  };

  const handlePerpClick = () => {
    navigate('/mobile/futures');
  };

  const handleBuyClick = () => {
    setTradeMode('Buy');
    setSelectedTab('Trade');
  };

  const handleSellClick = () => {
    setTradeMode('Sell');
    setSelectedTab('Trade');
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    // Calculate amount based on current price
    setAmount(value * (selectedPair.price || 0));
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
    // Calculate quantity based on current price
    if (selectedPair.price > 0) {
      setQuantity(value / selectedPair.price);
    }
  };

    const handlePairSelect = (pair: any) => {
        setSelectedPair(pair);
        setShowPairSelector(false);
    };

  return (
    <MobileLayout>
      {/* Trading Tabs - Smaller font and padding */}
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

      {/* Chart/Trade Toggle - Smaller */}
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

      {/* Charts Tab Content - Shared for both Spot and Futures */}
      {selectedTab === 'Charts' && (
        <div className="flex-1 overflow-y-auto bg-gray-900">
          {/* Coin Header - Smaller and compact */}
          <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
            <div className="flex flex-col">
              <div 
                id="coin-symbol" 
                className="text-sm font-bold text-white cursor-pointer"
                onClick={() => document.getElementById('coin-menu')?.style.setProperty('display', 
                  document.getElementById('coin-menu')?.style.display === 'block' ? 'none' : 'block')}
              >
                {currentSymbol}
              </div>
              <div className="text-sm font-bold text-green-400">
                $<span id="coin-price">{currentPrice || '--'}</span>
              </div>
            </div>
            <div className="text-right text-xs leading-tight text-gray-300">
              <div>24h High: <span id="high" className="text-white">{currentTicker?.highPrice24h || '--'}</span></div>
              <div>24h Low: <span id="low" className="text-white">{currentTicker?.lowPrice24h || '--'}</span></div>
              <div>Vol: <span id="turnover" className="text-white">{currentTicker?.volume24h ? (parseFloat(currentTicker.volume24h) / 1000000).toFixed(1) : '--'}M</span></div>
            </div>
          </div>

          {/* Coin Menu */}
          <div 
            id="coin-menu" 
            className="absolute bg-gray-800 border border-gray-600 top-16 left-3 rounded-md z-50 max-h-60 overflow-y-auto hidden"
          ></div>

          {/* Chart Container - Clean without loading skeleton */}
          <div className="relative bg-gray-900" style={{ height: '70vh' }}>
            {/* Only show error state if chart fails to load */}
            {chartError && (
              <div className="absolute inset-0 bg-gray-900 z-20 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="mb-4">
                    <BarChart3 className="w-12 h-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Chart Unavailable</p>
                  <p className="text-sm mt-2">Unable to load chart data</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {/* TradingView Chart */}
            <div 
              id="chart" 
              className="w-full h-full"
            ></div>
            
            {/* Background watermark */}
            <div 
              className="absolute top-1/2 left-1/2 w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-10"
              style={{
                backgroundImage: "url('https://i.imgur.com/F9ljfzP.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            ></div>
            
            {/* TradingView Logo Cover */}
            <img 
              id="branding-cover"
              src="https://i.imgur.com/1yZtbuJ.jpeg" 
              alt="Nedaxer Logo"
              className="absolute"
              style={{
                bottom: '28px',
                left: '12px',
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                backgroundColor: '#0e0e0e',
                zIndex: 9999,
                pointerEvents: 'auto',
                boxShadow: '0 0 4px #000'
              }}
            />
          </div>

          {/* Extra scrollable content for testing */}
          <div className="h-96 p-4">
            <div className="text-gray-400 text-sm">
              Scrollable content area - scroll down to test the fixed buy/sell buttons
            </div>
          </div>
        </div>
      )}

      {/* Fixed Buy/Sell Panel - Positioned above bottom navigation */}
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
          
          {selectedTradingType === 'Spot' && (
            <div className="h-full p-4">
              {/* Trading Pair Info */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-lg font-bold">{selectedPair.symbol}/USDT</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-lg font-bold">
                      ${selectedPair.price?.toFixed(2) || '0.00'}
                    </span>
                    <span className={`text-sm ${selectedPair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Buy/Sell Toggle */}
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="flex">
                  <button 
                    className={`flex-1 py-3 font-medium transition-colors ${
                      tradeMode === 'Buy' 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setTradeMode('Buy')}
                  >
                    {t('buy')} {selectedPair.symbol}
                  </button>
                  <button 
                    className={`flex-1 py-3 font-medium transition-colors ${
                      tradeMode === 'Sell' 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setTradeMode('Sell')}
                  >
                    {t('sell')} {selectedPair.symbol}
                  </button>
                </div>
              </div>

              {/* Trading Form */}
              <div className="space-y-4">
                {/* Order Type */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex space-x-2 mb-4">
                    <button className="bg-gray-700 text-white px-4 py-2 rounded text-sm">{t('market')}</button>
                    <button className="text-gray-400 px-4 py-2 rounded text-sm hover:text-white">{t('limit')}</button>
                    <button className="text-gray-400 px-4 py-2 rounded text-sm hover:text-white">{t('stop')}</button>
                  </div>

                  {/* Quantity Input */}
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2">
                      {t('quantity')} ({tradeMode === 'Buy' ? 'USDT' : selectedPair.symbol})
                    </label>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleQuantityChange(Math.max(0, quantity - (tradeMode === 'Buy' ? 10 : 0.001)))}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={tradeMode === 'Buy' ? amount.toFixed(2) : quantity.toFixed(6)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (tradeMode === 'Buy') {
                            handleAmountChange(value);
                          } else {
                            handleQuantityChange(value);
                          }
                        }}
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0.00"
                      />
                      <button 
                        onClick={() => handleQuantityChange(quantity + (tradeMode === 'Buy' ? 10 : 0.001))}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['25%', '50%', '75%', '100%'].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => {
                          const multiplier = parseInt(percent) / 100;
                          if (tradeMode === 'Buy') {
                            handleAmountChange(1000 * multiplier); // Assuming $1000 available balance
                          } else {
                            handleQuantityChange(1 * multiplier); // Assuming 1 unit available
                          }
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm transition-colors"
                      >
                        {percent}
                      </button>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-800 rounded p-3 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white">${selectedPair.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="text-white">{quantity.toFixed(6)} {selectedPair.symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-white">${amount.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fee (0.1%):</span>
                      <span className="text-white">${(amount * 0.001).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button 
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all active:scale-95 ${
                      tradeMode === 'Buy' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {tradeMode} {selectedPair.symbol}
                  </button>
                </div>

                {/* Available Balance */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Available Balance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">USDT:</span>
                      <span className="text-white">1,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{selectedPair.symbol}:</span>
                      <span className="text-white">1.00000000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedTradingType === 'Futures' && (
            <div className="h-full p-4">
              {/* Trading Pair Info */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-lg font-bold">{selectedPair.symbol}/USDT</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-lg font-bold">
                      ${selectedPair.price?.toFixed(2) || '0.00'}
                    </span>
                    <span className={`text-sm ${selectedPair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Leverage: Up to 100x</span>
                  <span>Funding Rate: 0.01%</span>
                </div>
              </div>

              {/* Long/Short Toggle */}
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div className="flex">
                  <button 
                    className={`flex-1 py-3 font-medium transition-colors ${
                      tradeMode === 'Buy' 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setTradeMode('Buy')}
                  >
                    {t('long')} {selectedPair.symbol}
                  </button>
                  <button 
                    className={`flex-1 py-3 font-medium transition-colors ${
                      tradeMode === 'Sell' 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setTradeMode('Sell')}
                  >
                    {t('short')} {selectedPair.symbol}
                  </button>
                </div>
              </div>

              {/* Futures Trading Form */}
              <div className="space-y-4">
                {/* Leverage Selector */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <label className="block text-gray-400 text-sm mb-2">Leverage</label>
                  <div className="flex space-x-2 mb-4">
                    {['5x', '10x', '25x', '50x', '100x'].map((leverage) => (
                      <button
                        key={leverage}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        {leverage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Type and Size */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex space-x-2 mb-4">
                    <button className="bg-gray-700 text-white px-4 py-2 rounded text-sm">{t('market')}</button>
                    <button className="text-gray-400 px-4 py-2 rounded text-sm hover:text-white">{t('limit')}</button>
                    <button className="text-gray-400 px-4 py-2 rounded text-sm hover:text-white">{t('stop')}</button>
                  </div>

                  {/* Position Size Input */}
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2">
                      Position Size (USDT)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleAmountChange(Math.max(0, amount - 10))}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={amount.toFixed(2)}
                        onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0.00"
                      />
                      <button 
                        onClick={() => handleAmountChange(amount + 10)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['25%', '50%', '75%', '100%'].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => {
                          const multiplier = parseInt(percent) / 100;
                          handleAmountChange(1000 * multiplier); // Assuming $1000 available balance
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm transition-colors"
                      >
                        {percent}
                      </button>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-800 rounded p-3 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Entry Price:</span>
                      <span className="text-white">${selectedPair.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Position Size:</span>
                      <span className="text-white">${amount.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Leverage:</span>
                      <span className="text-white">10x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Margin Required:</span>
                      <span className="text-white">${(amount / 10).toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Trading Fee:</span>
                      <span className="text-white">${(amount * 0.0006).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button 
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all active:scale-95 ${
                      tradeMode === 'Buy' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {tradeMode === 'Buy' ? 'Open Long' : 'Open Short'} Position
                  </button>
                </div>

                {/* Margin and Positions Info */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Account Balance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available Margin:</span>
                      <span className="text-white">1,000.00 USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Used Margin:</span>
                      <span className="text-white">0.00 USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unrealized P&L:</span>
                      <span className="text-green-400">+0.00 USDT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Cryptocurrency Pair Selector Modal */}
      {showPairSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Trading Pair</h3>
              <button
                onClick={() => setShowPairSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cryptoPairs.map((pair) => (
                  <button
                    key={pair.symbol}
                    onClick={() => handlePairSelect(pair)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#0033a0] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {pair.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{pair.symbol}/USDT</div>
                          <div className="text-sm text-gray-500">{pair.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${pair.price?.toFixed(2) || '0.00'}</div>
                        <div className={`text-sm ${pair.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pair.change >= 0 ? '+' : ''}{pair.change?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-green-600">Buy {selectedPair.symbol}/USDT</h3>
              <button
                onClick={() => setShowBuyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span>${selectedPair.price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Fee (0.1%):</span>
                  <span>$0.00</span>
                </div>
              </div>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Place Buy Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-red-600">Sell {selectedPair.symbol}/USDT</h3>
              <button
                onClick={() => setShowSellModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({selectedPair.symbol})
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span>${selectedPair.price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Fee (0.1%):</span>
                  <span>$0.00</span>
                </div>
              </div>
              <button className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Place Sell Order
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}