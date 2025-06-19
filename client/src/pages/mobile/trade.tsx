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
import { useState, useEffect, useRef } from 'react';
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
  const chartWidget = useRef<any>(null);
  const priceUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Chart functions
  const loadChart = (symbol: string) => {
    if (chartWidget.current) {
      chartWidget.current.remove();
    }
    
    if (typeof window !== 'undefined' && (window as any).TradingView) {
      chartWidget.current = new (window as any).TradingView.widget({
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
        overrides: {
          // Background colors to match site theme - remove all transparency
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
          
          // Axis styling
          "scalesProperties.backgroundColor": "#111827",
          "scalesProperties.lineColor": "#374151", 
          "scalesProperties.textColor": "#9CA3AF",
          "paneProperties.leftAxisProperties.showSeriesLastValue": false,
          "paneProperties.rightAxisProperties.showSeriesLastValue": false,
          "scalesProperties.showLeftScale": false,
          "scalesProperties.showRightScale": true,
          
          // Remove any white overlays or backgrounds
          "mainSeriesProperties.style": 1,
          "mainSeriesProperties.candleStyle.upColor": "#10B981",
          "mainSeriesProperties.candleStyle.downColor": "#EF4444",
          "mainSeriesProperties.candleStyle.drawWick": true,
          "mainSeriesProperties.candleStyle.drawBorder": false,
          "mainSeriesProperties.candleStyle.wickUpColor": "#10B981",
          "mainSeriesProperties.candleStyle.wickDownColor": "#EF4444",
          
          // Volume styling - remove transparency
          "volumePaneSize": "small",
          "volume.volume.color.0": "#EF4444",
          "volume.volume.color.1": "#10B981",
          "volume.volume.transparency": 0,
          
          // Remove all legends and overlays
          "paneProperties.legendProperties.showLegend": false,
          "paneProperties.legendProperties.showStudyArguments": false,
          "paneProperties.legendProperties.showStudyTitles": false,
          "paneProperties.legendProperties.showStudyValues": false,
          "paneProperties.legendProperties.showSeriesTitle": false,
          
          // Remove watermarks and branding overlays
          "paneProperties.topMargin": 0,
          "paneProperties.bottomMargin": 0,
          "paneProperties.leftMargin": 0,
          "paneProperties.rightMargin": 0,
        },
        disabled_features: [
          "header_symbol_search",
          "timeframes_toolbar", 
          "use_localstorage_for_settings",
          "volume_force_overlay",
          "left_toolbar",
          "legend_context_menu",
          "display_market_status",
          "go_to_date",
          "header_compare",
          "header_chart_type",
          "header_resolutions",
          "header_screenshot",
          "header_fullscreen_button",
          "header_settings",
          "header_indicators",
          "context_menus",
          "control_bar",
          "edit_buttons_in_legend",
          "main_series_scale_menu",
          "chart_property_page_legend",
          "chart_property_page_trading",
          "border_around_the_chart",
          "chart_crosshair_menu",
          "snapshot_trading_drawings",
          "show_logo_on_all_charts",
          "remove_library_container_border",
          "chart_hide_close_button",
          "header_saveload",
          "header_undo_redo",
          "show_chart_property_page",
          "popup_hints"
        ]
      });
    }
  };

  const updatePrice = async (symbol: string) => {
    try {
      const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`);
      const data = await res.json();
      
      if (data.result && data.result.list && data.result.list[0]) {
        const tickerData = data.result.list[0];
        const price = parseFloat(tickerData.lastPrice).toFixed(2);
        const high = parseFloat(tickerData.highPrice24h).toFixed(2);
        const low = parseFloat(tickerData.lowPrice24h).toFixed(2);
        const turnover = (parseFloat(tickerData.turnover24h) / 1e6).toFixed(2);

        const coinSymbolEl = document.getElementById("coin-symbol");
        const coinPriceEl = document.getElementById("coin-price");
        const coinPriceUsdEl = document.getElementById("coin-price-usd");
        const highEl = document.getElementById("high");
        const lowEl = document.getElementById("low");
        const turnoverEl = document.getElementById("turnover");

        if (coinSymbolEl) coinSymbolEl.textContent = symbol.replace("USDT", "/USDT");
        if (coinPriceEl) coinPriceEl.textContent = price;
        if (coinPriceUsdEl) coinPriceUsdEl.textContent = price;
        if (highEl) highEl.textContent = high;
        if (lowEl) lowEl.textContent = low;
        if (turnoverEl) turnoverEl.textContent = turnover + "M";
      }
    } catch (e) {
      console.error("Price fetch error:", e);
    }
  };

  const initializeCoinMenu = () => {
    const coinList = ["BTCUSDT", "ETHUSDT", "XRPUSDT", "TRXUSDT", "SOLUSDT"];
    const menu = document.getElementById("coin-menu");
    
    if (menu) {
      menu.innerHTML = '';
      coinList.forEach(symbol => {
        const div = document.createElement("div");
        div.className = "p-2 cursor-pointer text-white hover:bg-gray-700";
        div.textContent = symbol.replace("USDT", "/USDT");
        div.onclick = () => {
          setCurrentSymbol(symbol);
          loadChart(`BYBIT:${symbol}`);
          updatePrice(symbol);
          menu.style.display = "none";
        };
        menu.appendChild(div);
      });
    }
  };

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // Initialize chart when script loads
      loadChart('BYBIT:BTCUSDT');
      initializeCoinMenu();
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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
      {/* Trading Tabs */}
      <div className="bg-gray-900 px-4 py-2">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tradingTabs.map((tab) => (
            <button 
              key={tab}
              className={`whitespace-nowrap px-3 py-2 rounded text-sm ${
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
      <div className="bg-gray-800 mx-4 rounded-lg overflow-hidden">
        <div className="flex">
          <button 
            className={`flex-1 py-2 text-sm font-medium ${
              selectedTab === 'Charts' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('Charts')}
          >
            {t('charts')}
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium ${
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
      {selectedTab === 'Charts' && selectedTradingType === 'Spot' && (
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Coin Header - Positioned under chart/trade tabs */}
          <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div 
                id="coin-symbol" 
                className="text-lg font-bold text-white cursor-pointer"
                onClick={() => document.getElementById('coin-menu')?.style.setProperty('display', 
                  document.getElementById('coin-menu')?.style.display === 'block' ? 'none' : 'block')}
              >
                BTC/USDT
              </div>
              <div className="text-lg font-bold text-green-400">
                $<span id="coin-price">--</span>
              </div>
            </div>
            <div className="text-right text-xs leading-relaxed text-gray-300">
              <div>24h High: <span id="high" className="text-white">--</span></div>
              <div>24h Low: <span id="low" className="text-white">--</span></div>
              <div>Vol: <span id="turnover" className="text-white">--</span>M</div>
            </div>
          </div>

          {/* Coin Menu */}
          <div 
            id="coin-menu" 
            className="absolute bg-gray-800 border border-gray-600 top-20 left-3 rounded-md z-50 max-h-60 overflow-y-auto hidden"
          ></div>

          {/* Chart Container - Improved display */}
          <div className="flex-1 relative bg-gray-900 mb-16">
            <div 
              id="chart" 
              className="w-full h-full"
              style={{
                minHeight: '400px',
                height: 'calc(100vh - 280px)'
              }}
            ></div>
            <div 
              className="absolute top-1/2 left-1/2 w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-10"
              style={{
                backgroundImage: "url('https://i.imgur.com/F9ljfzP.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            ></div>
            <div 
              className="absolute bottom-3 left-3 w-12 h-12 rounded-lg bg-gray-900 z-50 pointer-events-auto shadow-lg"
              style={{
                backgroundImage: "url('https://i.imgur.com/1yZtbuJ.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
          </div>

          {/* Buy/Sell Panel - Within trade page only */}
          <div className="bg-gray-800 border-t border-gray-700 p-3">
            <div className="flex gap-2">
              <button 
                onClick={handleBuyClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded text-sm font-medium transition-colors"
              >
                Buy {currentSymbol.replace('USDT', '')}
              </button>
              <button 
                onClick={handleSellClick}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded text-sm font-medium transition-colors"
              >
                Sell {currentSymbol.replace('USDT', '')}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'Charts' && selectedTradingType === 'Futures' && (
        <div className="h-full">
          <MobileFutures />
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
            <div className="h-full">
              <MobileFutures />
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