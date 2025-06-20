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
// Removed persistent chart manager import
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
  const priceUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Simple persistent chart state
  const [isChartReady, setIsChartReady] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartError, setChartError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple persistent chart with global caching
  const createPersistentChart = useCallback((symbol: string) => {
    if (!window.TradingView) {
      console.log('TradingView not loaded yet');
      return;
    }

    // Use global cache to prevent recreation
    if (!window.tradingViewChartLoaded) {
      console.log('Creating persistent chart for:', symbol);
      
      try {
        const widget = new window.TradingView.widget({
          container_id: "trading-chart-container",
          autosize: true,
          symbol: symbol,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          hide_top_toolbar: true,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          enable_publishing: false,
          withdateranges: false,
          calendar: false,
          onChartReady: () => {
            console.log('Persistent chart ready');
            setIsChartLoading(false);
            setIsChartReady(true);
            window.tradingViewChartLoaded = true;
          }
        });
        
        (window as any).globalTradingViewWidget = widget;
        
      } catch (error) {
        console.error('Chart creation failed:', error);
        setChartError(true);
        setIsChartLoading(false);
      }
    } else {
      console.log('Chart already loaded, skipping creation');
      setIsChartLoading(false);
      setIsChartReady(true);
    }
  }, []);

  // Handle symbol changes with persistent chart
  const handleSymbolChange = useCallback((symbol: string) => {
    setCurrentSymbol(symbol);
    if (window.TradingView) {
      createPersistentChart(`BYBIT:${symbol}`);
    }
    updatePrice(symbol);
  }, [createPersistentChart]);

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
          // Use persistent chart system
          handleSymbolChange(symbol);
          menu.style.display = "none";
        };
        menu.appendChild(div);
      });
    }
  }, [handleSymbolChange]);

  // Initialize TradingView script and chart
  useEffect(() => {
    const initializeChart = () => {
      // Check if TradingView is already loaded
      if (window.TradingView) {
        createPersistentChart('BYBIT:BTCUSDT');
        initializeCoinMenu();
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          createPersistentChart('BYBIT:BTCUSDT');
          initializeCoinMenu();
        });
        return;
      }

      // Load TradingView script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        createPersistentChart('BYBIT:BTCUSDT');
        initializeCoinMenu();
      };
      
      script.onerror = () => {
        console.error('Failed to load TradingView script');
        setChartError(true);
        setIsChartLoading(false);
      };

      document.head.appendChild(script);
    };

    initializeChart();
  }, [createPersistentChart, initializeCoinMenu]);

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
      const fullSymbol = `${symbolParam}USDT`;
      handleSymbolChange(fullSymbol);
      
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
  }, [location, handleSymbolChange]);

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
    const fullSymbol = `${symbol}USDT`;
    handleSymbolChange(fullSymbol);
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
            {/* Show loading state when chart is initializing */}
            {isChartLoading && (
              <div className="absolute inset-0 bg-gray-900 z-20 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="mb-4">
                    <BarChart3 className="w-12 h-12 mx-auto opacity-50 animate-pulse" />
                  </div>
                  <p className="text-lg font-medium">Loading Chart...</p>
                  <p className="text-sm mt-2">Initializing TradingView</p>
                </div>
              </div>
            )}
            
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
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {/* TradingView Chart Container */}
            <div 
              id="trading-chart-container"
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