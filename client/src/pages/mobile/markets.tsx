import { MobileLayout } from '@/components/mobile-layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { hapticLight } from '@/lib/haptics';

interface BybitTicker {
  symbol: string;
  lastPrice: string;
  price24hPcnt: string;
  volume24h: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

interface BybitResponse {
  success: boolean;
  data: BybitTicker[];
  timestamp: number;
}

// Helper functions - defined outside component to avoid initialization issues
const formatPrice = (price: number) => {
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }
  return price.toFixed(8);
};

const formatVolume = (volume: number) => {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`;
  }
  if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`;
  }
  if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(2)}K`;
  }
  return `$${volume.toFixed(2)}`;
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'Bullish':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Bearish':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'Bullish':
      return <TrendingUp className="h-3 w-3" />;
    case 'Bearish':
      return <TrendingDown className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

export default function MobileMarkets() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteCoins, setFavoriteCoins] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('Hot');
  const [activeMarketType, setActiveMarketType] = useState('Spot');

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCoins');
    if (savedFavorites) {
      setFavoriteCoins(JSON.parse(savedFavorites));
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = (symbol: string) => {
    hapticLight();
    const newFavorites = favoriteCoins.includes(symbol)
      ? favoriteCoins.filter(id => id !== symbol)
      : [...favoriteCoins, symbol];
    
    setFavoriteCoins(newFavorites);
    localStorage.setItem('favoriteCoins', JSON.stringify(newFavorites));
  };

  // Fetch live market data from Bybit API (10-second auto-refresh)
  const { data: marketData, isLoading, refetch, error } = useQuery({
    queryKey: ['/api/bybit/tickers'],
    queryFn: async (): Promise<BybitResponse> => {
      const response = await fetch('/api/bybit/tickers');
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }
      const data = await response.json();
      setLastUpdate(new Date());
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    retry: 3,
  });

  // Process market data from Bybit API
  const processedMarkets = marketData?.data?.map((ticker: BybitTicker) => {
    const baseSymbol = ticker.symbol.replace('USDT', '').replace('USDC', '').replace('USD', '');
    const price = parseFloat(ticker.lastPrice);
    const change = parseFloat(ticker.price24hPcnt);
    const volume = parseFloat(ticker.turnover24h);
    
    return {
      symbol: baseSymbol,
      pair: ticker.symbol,
      displayPair: `${baseSymbol}/USDT`,
      price: formatPrice(price),
      priceValue: price,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
      changeValue: change,
      isPositive: change >= 0,
      volume: formatVolume(volume),
      volumeValue: volume,
      high24h: formatPrice(parseFloat(ticker.highPrice24h)),
      low24h: formatPrice(parseFloat(ticker.lowPrice24h)),
      sentiment: ticker.sentiment,
      favorite: favoriteCoins.includes(ticker.symbol)
    };
  }) || [];

  // Filter markets based on search query
  const searchFilteredMarkets = processedMarkets.filter(market =>
    market.displayPair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter markets based on active tab
  const getFilteredMarkets = () => {
    let filtered = searchFilteredMarkets;
    
    switch (activeTab) {
      case 'Favorites':
        filtered = filtered.filter(market => market.favorite);
        break;
      case 'Gainers':
        // Filter for positive price changes and sort by highest gains - SHOW ALL
        filtered = filtered.filter(market => market.changeValue > 0)
                          .sort((a, b) => b.changeValue - a.changeValue);
        console.log(`Gainers found: ${filtered.length} out of ${searchFilteredMarkets.length} total markets`);
        break;
      case 'Losers':
        // Filter for negative price changes and sort by biggest losses - SHOW ALL
        filtered = filtered.filter(market => market.changeValue < 0)
                          .sort((a, b) => a.changeValue - b.changeValue);
        break;
      case 'Hot':
        // Sort by volume for hot markets - top 50
        filtered = filtered.sort((a, b) => b.volumeValue - a.volumeValue).slice(0, 50);
        break;
      case 'New':
        // Sort by price change for new/trending - top 30
        filtered = filtered.sort((a, b) => Math.abs(b.changeValue) - Math.abs(a.changeValue)).slice(0, 30);
        break;
      case 'Turnover':
        // Sort by volume for turnover - top 50
        filtered = filtered.sort((a, b) => b.volumeValue - a.volumeValue).slice(0, 50);
        break;
      case 'Opportunities':
        // Sort by highest price changes (both positive and negative) - top 40
        filtered = filtered.sort((a, b) => Math.abs(b.changeValue) - Math.abs(a.changeValue)).slice(0, 40);
        break;
      default:
        filtered = filtered.sort((a, b) => b.volumeValue - a.volumeValue);
    }
    
    return filtered;
  };

  const sortedMarkets = getFilteredMarkets();

  const handleCoinClick = (symbol: string) => {
    hapticLight();
    navigate(`/mobile/trade?symbol=${symbol}`);
  };

  return (
    <MobileLayout>
      {/* Search Bar */}
      <div className="p-4 bg-gray-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="BDXN/USDT"
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Top Tabs */}
      <div className="px-4 pb-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {['Favorites', 'Hot', 'New', 'Gainers', 'Losers', 'Turnover', 'Opportunities'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                hapticLight();
                setActiveTab(tab);
              }}
              onTouchStart={() => hapticLight()}
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'text-white border-b-2 border-yellow-500 pb-2' 
                  : 'text-gray-400 hover:text-white pb-2'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Market Type Tabs */}
      <div className="px-4 pb-4">
        <div className="flex space-x-6">
          {['Spot', 'Derivatives'].map((type) => (
            <button
              key={type}
              onClick={() => {
                hapticLight();
                setActiveMarketType(type);
              }}
              onTouchStart={() => hapticLight()}
              className={`text-sm font-medium transition-colors ${
                activeMarketType === type 
                  ? 'text-white border-b-2 border-yellow-500 pb-2' 
                  : 'text-gray-400 hover:text-white pb-2'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Market Statistics */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>
            {activeTab}: {sortedMarkets.length} pairs
            {activeTab === 'Gainers' && ` (${processedMarkets.filter(m => m.changeValue > 0).length} total gainers)`}
            {activeTab === 'Losers' && ` (${processedMarkets.filter(m => m.changeValue < 0).length} total losers)`}
          </span>
          <span className="text-xs">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Market List Header */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Trading Pairs</span>
          <div className="flex space-x-8">
            <span>Price</span>
            <span>24H Change</span>
          </div>
        </div>
      </div>



      {/* Market List */}
      <div className="px-4 space-y-0 pb-20">
        {isLoading && !marketData ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-400">Loading live market data...</p>
          </div>
        ) : sortedMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No markets found.</p>
          </div>
        ) : (
          sortedMarkets.map((market, index) => (
            <div 
              key={`${market.pair}-${index}`} 
              className="flex items-center justify-between py-4 border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer transition-colors"
              onClick={() => handleCoinClick(market.symbol)}
            >
              <div className="flex items-center space-x-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(market.pair);
                  }}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  <Star 
                    className={`w-4 h-4 ${market.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} 
                  />
                </button>
                <div>
                  <div className="text-white font-medium text-base">{market.displayPair}</div>
                  <div className="text-gray-400 text-sm mt-1">
                    {market.volume}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-white font-medium">{market.price}</div>
                  <div className="text-gray-400 text-sm">
                    {market.price} USD
                  </div>
                </div>

                <div className={`text-right min-w-[80px] px-2 py-1 rounded ${
                  market.isPositive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  <div className="font-medium text-sm">{market.change}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </MobileLayout>
  );
}