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
import { usePersistentChart } from '@/hooks/use-persistent-chart';

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
  const priceUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Use persistent chart hook
  const { initializeChart, showChart, hideChart, changeSymbol, getCurrentSymbol, isReady } = usePersistentChart();

  // Initialize persistent chart on component mount
  useEffect(() => {
    const initChart = async () => {
      setIsChartLoading(true);
      const success = await initializeChart(`BYBIT:${currentSymbol}`);
      setIsChartLoading(false);
      
      if (!success) {
        console.error('Failed to initialize persistent chart');
      }
    };
    
    initChart();
  }, [initializeChart]);

  // Show chart when Charts tab is active and chart is ready
  useEffect(() => {
    if (selectedTab === 'Charts' && chartContainerRef.current && isReady()) {
      showChart(chartContainerRef.current);
    }
  }, [selectedTab, showChart, isReady]);

  // Handle tab changes and chart visibility
  const handleTabChange = useCallback((tab: string) => {
    setSelectedTab(tab);
    hapticLight();
    
    if (tab === 'Charts') {
      // Show chart when Charts tab is selected
      if (chartContainerRef.current && isReady()) {
        showChart(chartContainerRef.current);
      }
    } else {
      // Hide chart when switching away from Charts tab
      hideChart();
    }
  }, [showChart, hideChart, isReady]);

  // Handle symbol change
  const handleSymbolChange = useCallback(async (newSymbol: string) => {
    const tradingViewSymbol = `BYBIT:${newSymbol}`;
    setCurrentSymbol(newSymbol);
    await changeSymbol(tradingViewSymbol);
  }, [changeSymbol]);

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
    
    // Update the persistent chart symbol
    handleSymbolChange(symbol + 'USDT');
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
    setAmount(value * (selectedPair.price || 0));
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
    if (selectedPair.price > 0) {
      setQuantity(value / selectedPair.price);
    }
  };

  const handlePairSelect = (pair: any) => {
    setSelectedPair(pair);
    setShowPairSelector(false);
  };

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
      setCurrentSymbol(symbolParam);
      handleSymbolChange(symbolParam);
    }
  }, [location, handleSymbolChange]);

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

      {/* Content Area */}
      <div className="flex-1">
        {selectedTab === 'Charts' ? (
          <div className="h-full flex flex-col">
            {/* Price Ticker */}
            <div className="bg-gray-900 p-2">
              <CryptoPriceTicker 
                symbol={currentSymbol}
                price={currentPrice}
                ticker={currentTicker}
              />
            </div>

            {/* Chart Container */}
            <div className="flex-1 bg-gray-900 mx-3 rounded-lg overflow-hidden relative">
              {isChartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading chart...</p>
                  </div>
                </div>
              ) : (
                <div 
                  id="chart" 
                  ref={chartContainerRef}
                  className="w-full h-full min-h-[400px]"
                  style={{ backgroundColor: '#111827' }}
                />
              )}
            </div>

            {/* Timeframe Selection */}
            <div className="bg-gray-900 p-2">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {timeframes.map((timeframe) => (
                  <button 
                    key={timeframe}
                    className={`whitespace-nowrap px-2 py-1 rounded text-xs ${
                      selectedTimeframe === timeframe 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-400'
                    }`}
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Controls */}
            <div className="bg-gray-900 p-2 flex justify-between items-center">
              <div className="flex space-x-2">
                <button 
                  className="p-1 bg-gray-800 rounded"
                  onClick={() => setShowPairSelector(true)}
                >
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  className="p-1 bg-gray-800 rounded"
                  onClick={handleAlertsClick}
                >
                  <Bell className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  className="p-1 bg-gray-800 rounded"
                  onClick={handleToolsClick}
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                  onClick={handleBuyClick}
                >
                  {t('buy')}
                </button>
                <button 
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                  onClick={handleSellClick}
                >
                  {t('sell')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {selectedTradingType === 'Spot' ? (
              <MobileSpot 
                selectedPair={selectedPair}
                tradeMode={tradeMode}
                quantity={quantity}
                amount={amount}
                onQuantityChange={handleQuantityChange}
                onAmountChange={handleAmountChange}
              />
            ) : (
              <MobileFutures 
                selectedPair={selectedPair}
                tradeMode={tradeMode}
                quantity={quantity}
                amount={amount}
                onQuantityChange={handleQuantityChange}
                onAmountChange={handleAmountChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Pair Selector Modal */}
      {showPairSelector && (
        <CryptoPairSelector 
          isOpen={showPairSelector}
          onClose={() => setShowPairSelector(false)}
          onSelect={handlePairSelection}
        />
      )}
    </MobileLayout>
  );
}