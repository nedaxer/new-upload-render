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
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileSpot from './spot';
import MobileFutures from './futures';
import MobileConvert from './convert';

export default function MobileTrade() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedTab, setSelectedTab] = useState('Charts');
  const [selectedTradingType, setSelectedTradingType] = useState('Spot');
  const [location, navigate] = useLocation();

  const timeframes = ['15m', '1h', '4h', '1D', 'More'];
  const tradingTabs = ['Convert', 'Spot', 'Futures', 'Margin'];

  const handleTradingTypeChange = (tab: string) => {
    setSelectedTradingType(tab);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
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
              <div className="flex items-center space-x-1">
                <span className="text-white text-lg font-bold">BNB/USDT</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">-0.91%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">0.00%</div>
              <Star className="w-5 h-5 text-gray-400" />
              <Edit3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-2xl font-bold">651.9</div>
              <div className="text-gray-400 text-sm">≈651.9 USD</div>
            </div>
            <div className="text-right text-sm">
              <div className="text-gray-400">24h High: <span className="text-white">659.5</span></div>
              <div className="text-gray-400">24h Low: <span className="text-white">638.7</span></div>
              <div className="text-gray-400">24h Turnover: <span className="text-white">9.06M</span></div>
            </div>
          </div>
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
          {/* Chart Area */}
          <div className="px-4 pb-4">
            <div className="bg-gray-900 rounded-lg p-4 h-64 relative">
              {/* Simplified candlestick chart representation */}
              <div className="absolute right-4 top-4 text-right">
                <div className="text-orange-500 text-sm">651.9</div>
                <div className="text-gray-400 text-xs">14:43</div>
              </div>

              {/* Chart grid lines */}
              <div className="absolute inset-4">
                <div className="h-full border-r border-gray-700"></div>
                <div className="absolute top-0 left-0 right-0 border-t border-gray-700"></div>
                <div className="absolute top-1/4 left-0 right-0 border-t border-gray-700/50"></div>
                <div className="absolute top-1/2 left-0 right-0 border-t border-gray-700/50"></div>
                <div className="absolute top-3/4 left-0 right-0 border-t border-gray-700/50"></div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700"></div>
              </div>

              {/* Price levels */}
              <div className="absolute right-0 top-4 text-xs text-gray-400">
                <div className="mb-8">660.0</div>
                <div className="mb-8">656.0</div>
                <div className="mb-8">652.0</div>
                <div className="mb-8">648.0</div>
                <div>644.0</div>
              </div>

              {/* Simplified candlesticks */}
              <div className="absolute bottom-16 left-8 right-8 flex items-end justify-between h-32">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className={`w-1 ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ height: `${Math.random() * 80 + 20}px` }}
                    ></div>
                  </div>
                ))}
              </div>

              {/* Time labels */}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-400">
                <span>10:30</span>
                <span>13:15</span>
                <span>16:00</span>
                <span>18:45</span>
                <span>21:30</span>
                <span>00:15</span>
              </div>
            </div>

            {/* Volume Chart */}
            <div className="bg-gray-900 rounded-lg p-4 h-16 mt-2">
              <div className="text-orange-500 text-xs mb-2">
                VOLUME: 0.160 MA5: 26.542 MA10: 33.513
              </div>
              <div className="flex items-end justify-between h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i}
                    className="bg-gray-600 w-1"
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="bg-gray-900 rounded-lg p-4 mt-2">
              <div className="text-orange-500 text-xs">
                MACD(12, 26, 9) DIF: 0.353 DEA: 0.406 MACD: -0.043
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-4">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Alerts</span>
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Tools</span>
              <BarChart3 className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Perp</span>
            </div>

            <div className="flex space-x-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold">
                Buy
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold">
                Sell
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