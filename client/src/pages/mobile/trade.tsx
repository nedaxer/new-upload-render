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
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileSpot from './spot';
import MobileFutures from './futures';
import MobileConvert from './convert';
import TradingViewWidget from '@/components/tradingview-widget';
import CryptoPriceTicker from '@/components/crypto-price-ticker';
import CryptoPairSelector from '@/components/crypto-pair-selector';

export default function MobileTrade() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedTab, setSelectedTab] = useState('Charts');
  const [selectedTradingType, setSelectedTradingType] = useState('Spot');
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [tradingViewSymbol, setTradingViewSymbol] = useState('BINANCE:BTCUSDT');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [location, navigate] = useLocation();

  const timeframes = ['15m', '1h', '4h', '1D', 'More'];
  const tradingTabs = ['Convert', 'Spot', 'Futures', 'Margin'];

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
    setSelectedTradingType(tab);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const handleCryptoSymbolChange = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
    const tradingViewSymbol = cryptoToTradingViewMap[cryptoId] || 'BINANCE:BTCUSDT';
    setTradingViewSymbol(tradingViewSymbol);
  };

  const handlePairSelection = (cryptoId: string, symbol: string) => {
    setSelectedCrypto(cryptoId);
    setSelectedPair(`${symbol}/USDT`);
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
    setShowBuyModal(true);
  };

  const handleSellClick = () => {
    setShowSellModal(true);
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
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart/Trade Toggle */}
      <div className="bg-gray-800 mx-4 mt-4 rounded-lg overflow-hidden">
        <div className="flex">
          <button 
            className={`flex-1 py-3 font-medium ${
              selectedTab === 'Charts' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('Charts')}
          >
            Charts
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${
              selectedTab === 'Trade' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('Trade')}
          >
            Trade
          </button>
        </div>
      </div>

      {/* Notification Banner - Only show for Spot Charts */}
      {selectedTab === 'Charts' && selectedTradingType === 'Spot' && (
        <div className="mx-4 mt-2 bg-red-900/20 border border-red-500/30 rounded p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span className="text-red-400 text-sm">[Vietnam] NXPC Bash: Deposit & Trade to Share 12,000 NXPC Rewards</span>
          </div>
          <button className="text-red-400">×</button>
        </div>
      )}

      {/* Trading Pair Header - Only show for Spot Charts */}
      {selectedTab === 'Charts' && selectedTradingType === 'Spot' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPairSelector(true)}
                className="flex items-center space-x-1 hover:bg-gray-800 rounded px-2 py-1 transition-colors"
              >
                <span className="text-white text-lg font-bold">{selectedPair}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">-0.91%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">0.00%</div>
              <Star className="w-5 h-5 text-gray-400" />
              <Edit3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <CryptoPriceTicker 
            selectedSymbol={selectedCrypto}
            onSymbolChange={handleCryptoSymbolChange}
          />
        </div>
      )}

      {/* Time Frame Selection - Only show for Spot Charts */}
      {selectedTab === 'Charts' && selectedTradingType === 'Spot' && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <span className="text-gray-400 text-sm">Time</span>
              <div className="flex space-x-3">
                {timeframes.map((time) => (
                  <button 
                    key={time}
                    className={`text-sm ${
                      selectedTimeframe === time 
                        ? 'text-orange-500' 
                        : 'text-gray-400'
                    }`}
                    onClick={() => setSelectedTimeframe(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">Depth</span>
              <Edit3 className="w-4 h-4 text-gray-400" />
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="text-orange-500 text-sm mb-4">
            BOLL(20, 2) MID: 652.1 654.9 649.3
          </div>
        </div>
      )}

      {/* Trading Interface Content */}
      {selectedTab === 'Charts' && selectedTradingType === 'Spot' && (
        <>
          {/* TradingView Chart Area */}
          <div className="px-4 pb-4">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <TradingViewWidget
                symbol={tradingViewSymbol}
                width="100%"
                height="400"
                theme="dark"
                locale="en"
                toolbar_bg="#1a1a1a"
                enable_publishing={false}
                allow_symbol_change={true}
                autosize={false}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-4">
            <div className="flex items-center space-x-6 mb-4">
              <button 
                onClick={handleAlertsClick}
                className={`flex items-center space-x-1 transition-colors ${
                  showAlerts ? 'text-orange-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="text-sm">Alerts</span>
              </button>
              
              <button 
                onClick={handleToolsClick}
                className={`flex items-center space-x-1 transition-colors ${
                  showTools ? 'text-orange-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">Tools</span>
              </button>
              
              <button 
                onClick={handlePerpClick}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">Perp</span>
              </button>
            </div>

            {/* Alerts Panel */}
            {showAlerts && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-white font-medium mb-3">Price Alerts</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">No active alerts</span>
                    <Button size="sm" variant="outline" className="text-orange-500 border-orange-500">
                      Create Alert
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tools Panel */}
            {showTools && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-white font-medium mb-3">Trading Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors">
                    <div className="text-white font-medium text-sm">Order Book</div>
                    <div className="text-gray-400 text-xs">View market depth</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors">
                    <div className="text-white font-medium text-sm">Recent Trades</div>
                    <div className="text-gray-400 text-xs">Latest transactions</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors">
                    <div className="text-white font-medium text-sm">Calculator</div>
                    <div className="text-gray-400 text-xs">P&L calculator</div>
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors">
                    <div className="text-white font-medium text-sm">Analysis</div>
                    <div className="text-gray-400 text-xs">Technical analysis</div>
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={handleBuyClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold transition-all active:scale-95"
              >
                Buy {selectedPair.split('/')[0]}
              </Button>
              <Button 
                onClick={handleSellClick}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold transition-all active:scale-95"
              >
                Sell {selectedPair.split('/')[0]}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Charts for other trading types */}
      {selectedTab === 'Charts' && selectedTradingType === 'Convert' && (
        <div className="h-full">
          <MobileConvert />
        </div>
      )}

      {selectedTab === 'Charts' && selectedTradingType === 'Futures' && (
        <div className="h-full">
          <MobileFutures />
        </div>
      )}

      {selectedTab === 'Charts' && selectedTradingType === 'Margin' && (
        <div className="h-full">
          <MobileSpot />
        </div>
      )}

      {/* Trade Tab Content */}
      {selectedTab === 'Trade' && (
        <div className="flex-1 overflow-hidden">
          {selectedTradingType === 'Convert' && (
            <div className="h-full">
              <MobileConvert />
            </div>
          )}
          {selectedTradingType === 'Spot' && (
            <div className="h-full">
              <MobileSpot />
            </div>
          )}
          {selectedTradingType === 'Futures' && (
            <div className="h-full">
              <MobileFutures />
            </div>
          )}
          {selectedTradingType === 'Margin' && (
            <div className="h-full">
              <MobileSpot />
            </div>
          )}
        </div>
      )}
    </MobileLayout>
  );
}