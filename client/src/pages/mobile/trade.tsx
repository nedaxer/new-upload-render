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
import { usePersistentChart } from '@/components/persistent-chart-manager';

export default function MobileTrade() {
  const { t } = useLanguage();
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedTab, setSelectedTab] = useState('Charts');
  const [selectedTradingType, setSelectedTradingType] = useState('Spot');
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
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

  // Chart state with persistent chart manager
  const [currentSymbol, setCurrentSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [currentTicker, setCurrentTicker] = useState<any>(null);
  const [isTradingViewLoaded, setIsTradingViewLoaded] = useState(false);
  const [chartError, setChartError] = useState(false);
  const priceUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const tradingViewScript = useRef<HTMLScriptElement | null>(null);
  
  // Use persistent chart manager
  const { showChart, hideChart, changeSymbol, getStoredSymbol } = usePersistentChart();

  // Load TradingView script once
  const loadTradingViewScript = useCallback(() => {
    if (window.TradingView || tradingViewScript.current) {
      setIsTradingViewLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log('TradingView script loaded');
      setIsTradingViewLoaded(true);
      setChartError(false);
    };

    script.onerror = () => {
      console.error('Failed to load TradingView script');
      setChartError(true);
    };

    document.head.appendChild(script);
    tradingViewScript.current = script;
  }, []);

  // Initialize chart when TradingView is loaded and tab is Charts
  const initializeChart = useCallback(() => {
    if (!isTradingViewLoaded || selectedTab !== 'Charts') return;
    
    const storedSymbol = getStoredSymbol();
    const symbol = `BYBIT:${currentSymbol}`;
    showChart('persistent-chart-container', storedSymbol || symbol);
  }, [isTradingViewLoaded, selectedTab, currentSymbol, showChart, getStoredSymbol]);

  // Handle symbol changes
  const handleSymbolChange = useCallback((newSymbol: string) => {
    setCurrentSymbol(newSymbol);
    if (selectedTab === 'Charts' && isTradingViewLoaded) {
      const tradingViewSymbol = `BYBIT:${newSymbol}`;
      changeSymbol(tradingViewSymbol);
    }
  }, [selectedTab, isTradingViewLoaded, changeSymbol]);

  // Update price data
  const updatePrice = async (symbol: string) => {
    try {
      const response = await fetch('/api/bybit/tickers');
      if (response.ok) {
        const tickers = await response.json();
        const ticker = tickers.find((t: any) => t.symbol === symbol);
        if (ticker) {
          setCurrentPrice(ticker.lastPrice);
          setCurrentTicker(ticker);
        }
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
    }
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

  // Initialize coin menu (simplified)
  const initializeCoinMenu = useCallback(() => {
    const coinMenu = document.getElementById('coin-menu');
    if (!coinMenu) return;

    const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LINK', 'UNI'];
    coinMenu.innerHTML = coins.map(coin => 
      `<div class="p-2 hover:bg-gray-700 cursor-pointer text-white" data-symbol="${coin}USDT">${coin}/USDT</div>`
    ).join('');

    coinMenu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const symbol = target.getAttribute('data-symbol');
      if (symbol) {
        handleSymbolChange(symbol);
        coinMenu.classList.add('hidden');
      }
    });
  }, [handleSymbolChange]);

  // Effects
  useEffect(() => {
    loadTradingViewScript();
    initializeCoinMenu();
  }, [loadTradingViewScript, initializeCoinMenu]);

  useEffect(() => {
    initializeChart();
  }, [initializeChart]);

  useEffect(() => {
    if (selectedTab === 'Charts') {
      initializeChart();
    } else {
      hideChart();
    }
  }, [selectedTab, initializeChart, hideChart]);

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
      handleSymbolChange(symbolParam);
    }
  }, [handleSymbolChange]);

  const handleTabSelect = (tab: string) => {
    hapticLight();
    setSelectedTab(tab);
  };

  const handleTimeframeSelect = (timeframe: string) => {
    hapticLight();
    setSelectedTimeframe(timeframe);
  };

  const handleTradingTypeSelect = (type: string) => {
    hapticLight();
    setSelectedTradingType(type);
  };

  const handleCryptoPairSelect = (pair: any) => {
    hapticLight();
    setSelectedPair(pair);
    const cryptoId = getCryptoIdFromSymbol(pair.symbol);
    const tradingViewSymbol = cryptoToTradingViewMap[cryptoId] || 'BINANCE:BTCUSDT';
    handleSymbolChange(`${pair.symbol}USDT`);
    setShowPairSelector(false);
  };

  const handleBuy = () => {
    hapticMedium();
    setTradeMode('Buy');
    setShowBuyModal(true);
  };

  const handleSell = () => {
    hapticMedium();
    setTradeMode('Sell');
    setShowSellModal(true);
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice >= 1) {
      return numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return numPrice.toFixed(6);
    }
  };

  const formatPriceChange = (change: string): string => {
    const numChange = parseFloat(change);
    return `${numChange >= 0 ? '+' : ''}${(numChange * 100).toFixed(2)}%`;
  };

  return (
    <MobileLayout>
      <div className="bg-gray-900 min-h-screen text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setShowPairSelector(true)}
            >
              <span className="text-lg font-bold">{selectedPair.symbol}/USDT</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Bell 
              className="w-5 h-5 text-gray-400 cursor-pointer" 
              onClick={() => setShowAlerts(!showAlerts)}
            />
            <MessageSquare className="w-5 h-5 text-gray-400 cursor-pointer" />
            <Settings className="w-5 h-5 text-gray-400 cursor-pointer" />
          </div>
        </div>

        {/* Price Display */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                ${currentPrice ? formatPrice(currentPrice) : '0.00'}
              </div>
              {currentTicker && (
                <div className={`text-sm ${parseFloat(currentTicker.price24hPcnt) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPriceChange(currentTicker.price24hPcnt)}
                </div>
              )}
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>24h High: ${currentTicker?.highPrice24h || '0.00'}</div>
              <div>24h Low: ${currentTicker?.lowPrice24h || '0.00'}</div>
              <div>24h Vol: {currentTicker?.volume24h || '0'}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          {['Charts', 'Orderbook', 'Recent trades'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabSelect(tab)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'Charts' && (
          <div className="relative">
            {/* Timeframe Selector */}
            <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
              <div className="flex space-x-2">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => handleTimeframeSelect(timeframe)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      selectedTimeframe === timeframe
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-white">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-white"
                  onClick={() => setShowTools(!showTools)}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative bg-gray-900" style={{ height: '70vh' }}>
              {/* Show loading state when chart is initializing */}
              {!isTradingViewLoaded && (
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

              {/* Show error state if chart fails to load */}
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
                        setChartError(false);
                        loadTradingViewScript();
                      }}
                      className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Persistent Chart Container */}
              <div 
                id="persistent-chart-container" 
                className="w-full h-full"
                data-chart-symbol={currentSymbol}
              />
            </div>

            {/* Coin Menu */}
            <div 
              id="coin-menu" 
              className="absolute bg-gray-800 border border-gray-600 top-16 left-3 rounded-md z-50 max-h-60 overflow-y-auto hidden"
            />
          </div>
        )}

        {selectedTab === 'Orderbook' && (
          <div className="p-4">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Orderbook data will be displayed here</p>
            </div>
          </div>
        )}

        {selectedTab === 'Recent trades' && (
          <div className="p-4">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Recent trades will be displayed here</p>
            </div>
          </div>
        )}

        {/* Trading Type Selector */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          {tradingTabs.map((type) => (
            <button
              key={type}
              onClick={() => handleTradingTypeSelect(type)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedTradingType === type
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Trading Interface */}
        {selectedTradingType === 'Spot' && <MobileSpot />}
        {selectedTradingType === 'Futures' && <MobileFutures />}

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={handleBuy}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Buy {selectedPair.symbol}
            </button>
            <button
              onClick={handleSell}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Sell {selectedPair.symbol}
            </button>
          </div>
        </div>

        {/* Crypto Pair Selector Modal */}
        <CryptoPairSelector
          isOpen={showPairSelector}
          onClose={() => setShowPairSelector(false)}
          onSelectPair={(cryptoId: string, symbol: string) => {
            hapticLight();
            const pair = { symbol: symbol, name: cryptoId, price: 0, change: 0 };
            setSelectedPair(pair);
            const mappedCryptoId = getCryptoIdFromSymbol(symbol);
            const tradingViewSymbol = cryptoToTradingViewMap[mappedCryptoId] || 'BINANCE:BTCUSDT';
            handleSymbolChange(`${symbol}USDT`);
            setShowPairSelector(false);
          }}
          selectedPair={selectedPair.symbol}
        />
      </div>
    </MobileLayout>
  );
}