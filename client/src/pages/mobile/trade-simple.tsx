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
import { PersistentTradingViewChart } from '@/components/persistent-tradingview-chart';



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
  const [currentSymbol, setCurrentSymbol] = useState('BYBIT:BTCUSDT');

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
          <PersistentTradingViewChart 
            symbol={currentSymbol}
            interval="15"
            theme="dark"
            onReady={() => console.log('Chart ready')}
          />
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