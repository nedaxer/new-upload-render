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

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCoins');
    if (savedFavorites) {
      setFavoriteCoins(JSON.parse(savedFavorites));
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = (symbol: string) => {
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
  const filteredMarkets = processedMarkets.filter(market =>
    market.displayPair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort markets by volume (descending)
  const sortedMarkets = filteredMarkets.sort((a, b) => b.volumeValue - a.volumeValue);

  const handleCoinClick = (symbol: string) => {
    navigate(`/mobile/trade?symbol=${symbol}`);
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">Markets</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Market Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{sortedMarkets.length}</div>
            <div className="text-xs text-gray-400">Pairs</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-500">
              {sortedMarkets.filter(m => m.sentiment === 'Bullish').length}
            </div>
            <div className="text-xs text-gray-400">Bullish</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-500">
              {sortedMarkets.filter(m => m.sentiment === 'Bearish').length}
            </div>
            <div className="text-xs text-gray-400">Bearish</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search trading pairs (BTC, ETH, SOL...)"
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Last Update Info */}
      <div className="px-4 pb-2">
        <div className="text-xs text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh: 10s
        </div>
      </div>

      {/* Market List Header */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Pair / Sentiment</span>
          <div className="flex space-x-6">
            <span>Price</span>
            <span>24h Change</span>
          </div>
        </div>
      </div>



      {/* Market List */}
      <div className="px-4 space-y-1 pb-20">
        {isLoading && !marketData ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-400">Loading live market data...</p>
          </div>
        ) : sortedMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No markets found matching your search.</p>
          </div>
        ) : (
          sortedMarkets.slice(0, 50).map((market, index) => (
            <div 
              key={`${market.pair}-${index}`} 
              className="flex items-center justify-between py-3 bg-gray-800/50 rounded-lg px-3 hover:bg-gray-800 cursor-pointer transition-colors"
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
                  <div className="text-white font-medium">{market.displayPair}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`${getSentimentColor(market.sentiment)} text-xs py-0 px-1 h-4 flex items-center gap-1`}
                    >
                      {getSentimentIcon(market.sentiment)}
                      {market.sentiment}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white font-medium">${market.price}</div>
                  <div className="text-gray-400 text-xs">
                    Vol {market.volume}
                  </div>
                </div>

                <div className={`text-right min-w-[70px] ${
                  market.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  <div className="flex items-center justify-end space-x-1">
                    {market.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-medium text-sm">{market.change}</span>
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-green-400">H: ${market.high24h}</span>
                    <span className="text-red-400 ml-1">L: ${market.low24h}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Note */}
      {sortedMarkets.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-3">
          <div className="text-center text-xs text-gray-500">
            Showing {Math.min(sortedMarkets.length, 50)} of {sortedMarkets.length} trading pairs
            <br />
            Tap any coin to start trading • Data updates every 10 seconds
          </div>
        </div>
      )}
    </MobileLayout>
  );
}