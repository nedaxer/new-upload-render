import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Star,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function MobileMarkets() {
  const [selectedCategory, setSelectedCategory] = useState('Spot');
  const [selectedTab, setSelectedTab] = useState('Favorites');

  const categories = ['Spot', 'Futures', 'Options', 'Convert'];
  const tabs = ['Favorites', 'Hot', 'New', 'Gainers', 'Losers', 'Turnover'];

  const marketData = [
    { 
      pair: 'BTC/USDT', 
      price: '105,224.9', 
      change: '-1.61%', 
      volume: '2.8B',
      isPositive: false,
      favorite: true 
    },
    { 
      pair: 'ETH/USDT', 
      price: '2,536.64', 
      change: '-5.79%', 
      volume: '1.2B',
      isPositive: false,
      favorite: true 
    },
    { 
      pair: 'BNB/USDT', 
      price: '651.9', 
      change: '-0.91%', 
      volume: '428M',
      isPositive: false,
      favorite: false 
    },
    { 
      pair: 'SOL/USDT', 
      price: '238.45', 
      change: '+2.34%', 
      volume: '892M',
      isPositive: true,
      favorite: false 
    },
    { 
      pair: 'ADA/USDT', 
      price: '1.0239', 
      change: '-11.46%', 
      volume: '156M',
      isPositive: false,
      favorite: false 
    },
    { 
      pair: 'DOT/USDT', 
      price: '8.6437', 
      change: '-2.63%', 
      volume: '89M',
      isPositive: false,
      favorite: false 
    },
    { 
      pair: 'AVAX/USDT', 
      price: '42.18', 
      change: '+5.92%', 
      volume: '267M',
      isPositive: true,
      favorite: false 
    },
    { 
      pair: 'MATIC/USDT', 
      price: '0.5647', 
      change: '+1.23%', 
      volume: '198M',
      isPositive: true,
      favorite: false 
    }
  ];

  const filteredData = selectedTab === 'Favorites' 
    ? marketData.filter(item => item.favorite)
    : marketData;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">Markets</h1>
        <div className="flex items-center space-x-3">
          <Search className="w-6 h-6 text-gray-400" />
          <Filter className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search coins"
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pb-4">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {categories.map((category) => (
            <button 
              key={category}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Market Tabs */}
      <div className="px-4 pb-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button 
              key={tab}
              className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${
                selectedTab === tab 
                  ? 'text-orange-500 border-orange-500' 
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Market List Header */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Pair</span>
          <div className="flex space-x-8">
            <span>Price</span>
            <span>24h Change</span>
            <span>Volume</span>
          </div>
        </div>
      </div>

      {/* Market List */}
      <div className="px-4 space-y-1">
        {filteredData.map((crypto, index) => (
          <Link key={index} href={`/mobile/trade/${crypto.pair.replace('/', '-')}`}>
            <div className="flex items-center justify-between py-3 bg-gray-800/50 rounded-lg px-3 hover:bg-gray-800">
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-yellow-500">
                  <Star 
                    className={`w-4 h-4 ${crypto.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} 
                  />
                </button>
                <div>
                  <div className="text-white font-medium">{crypto.pair}</div>
                  <div className="text-gray-400 text-xs">
                    Vol {crypto.volume}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-white font-medium">{crypto.price}</div>
                </div>
                
                <div className={`text-right min-w-[60px] ${
                  crypto.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  <div className="flex items-center justify-end space-x-1">
                    {crypto.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-medium">{crypto.change}</span>
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm min-w-[50px] text-right">
                  {crypto.volume}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Market Stats */}
      <div className="px-4 py-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Market Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Total Market Cap</div>
              <div className="text-white font-bold">$3.2T</div>
              <div className="text-red-500 text-sm">-2.3%</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24h Volume</div>
              <div className="text-white font-bold">$89.2B</div>
              <div className="text-green-500 text-sm">+5.7%</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">BTC Dominance</div>
              <div className="text-white font-bold">42.1%</div>
              <div className="text-gray-400 text-sm">-0.5%</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Active Pairs</div>
              <div className="text-white font-bold">1,247</div>
              <div className="text-green-500 text-sm">+12</div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}