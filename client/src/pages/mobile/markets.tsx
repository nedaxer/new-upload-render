import { MobileLayout } from '@/components/mobile-layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Star,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function MobileMarkets() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('crypto-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fetch comprehensive cryptocurrency data (700+ coins)
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market-data', 'cryptocurrencies-extended'],
    queryFn: () => apiRequest('/api/market-data/cryptocurrencies?limit=800'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Add/remove favorites mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (coinId: string) => {
      // This is client-side only for now, you can extend to backend later
      return Promise.resolve(coinId);
    },
    onSuccess: (coinId: string) => {
      const newFavorites = favorites.includes(coinId)
        ? favorites.filter(id => id !== coinId)
        : [...favorites, coinId];
      
      setFavorites(newFavorites);
      localStorage.setItem('crypto-favorites', JSON.stringify(newFavorites));
      
      // Update query cache to refresh home page favorites
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const getDominanceIndicator = (changePercent: number) => {
    if (changePercent > 5) return { label: 'Strong Bull', color: 'text-green-600 bg-green-100' };
    if (changePercent > 2) return { label: 'Bull', color: 'text-green-500 bg-green-50' };
    if (changePercent > 0) return { label: 'Weak Bull', color: 'text-green-400 bg-green-25' };
    if (changePercent > -2) return { label: 'Weak Bear', color: 'text-red-400 bg-red-25' };
    if (changePercent > -5) return { label: 'Bear', color: 'text-red-500 bg-red-50' };
    return { label: 'Strong Bear', color: 'text-red-600 bg-red-100' };
  };

  const spotMarkets = marketData?.data?.map((crypto: any) => {
    const dominance = getDominanceIndicator(crypto.price_change_percentage_24h || 0);
    return {
      pair: `${crypto.symbol.toUpperCase()}/USDT`,
      price: crypto.current_price?.toLocaleString('en-US', { 
        minimumFractionDigits: crypto.current_price < 1 ? 6 : 2,
        maximumFractionDigits: crypto.current_price < 1 ? 6 : 2 
      }) || '0.00',
      change: `${(crypto.price_change_percentage_24h || 0) > 0 ? '+' : ''}${(crypto.price_change_percentage_24h || 0).toFixed(2)}%`,
      isPositive: (crypto.price_change_percentage_24h || 0) > 0,
      volume: crypto.total_volume ? `${(crypto.total_volume / 1000000000).toFixed(1)}B` : 'N/A',
      favorite: favorites.includes(crypto.id),
      coinId: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol.toUpperCase(),
      dominance,
      marketCap: crypto.market_cap ? `${(crypto.market_cap / 1000000000).toFixed(1)}B` : 'N/A',
      rank: crypto.market_cap_rank || 999
    };
  }) || [];

  const getFilteredMarkets = () => {
    let filtered = spotMarkets;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(market =>
        market.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 'favorites':
        filtered = filtered.filter(market => market.favorite);
        break;
      case 'gainers':
        filtered = filtered.filter(market => market.isPositive).sort((a, b) => 
          parseFloat(b.change) - parseFloat(a.change)
        );
        break;
      case 'losers':
        filtered = filtered.filter(market => !market.isPositive).sort((a, b) => 
          parseFloat(a.change) - parseFloat(b.change)
        );
        break;
      case 'volume':
        filtered = [...filtered].sort((a, b) => {
          const volA = parseFloat(a.volume.replace('B', '').replace('M', '')) * (a.volume.includes('B') ? 1000 : 1);
          const volB = parseFloat(b.volume.replace('B', '').replace('M', '')) * (b.volume.includes('B') ? 1000 : 1);
          return volB - volA;
        });
        break;
      case 'new':
        // Filter coins ranked below 100 as "newer" coins
        filtered = filtered.filter(market => market.rank > 100);
        break;
      default:
        // Sort by market cap rank for 'all'
        filtered = [...filtered].sort((a, b) => a.rank - b.rank);
    }

    return filtered;
  };

  const filteredMarkets = getFilteredMarkets();

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

      {/* Market Tabs */}
      <div className="px-4 pb-4">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'favorites', label: 'Favorites' },
            { id: 'gainers', label: 'Gainers' },
            { id: 'losers', label: 'Losers' },
            { id: 'volume', label: 'Volume' },
            { id: 'new', label: 'New' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search coins"
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Market List Header */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Coin</span>
          <div className="flex space-x-6">
            <span>Price</span>
            <span>Trend</span>
            <span>24h%</span>
          </div>
        </div>
      </div>

      {/* Market List */}
      <div className="px-4 space-y-1 max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-white">Loading market data...</div>
            <div className="text-gray-400 text-sm mt-2">Fetching 800+ cryptocurrencies</div>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white">No markets found.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredMarkets.map((market, index) => (
            <div key={market.coinId} className="flex items-center justify-between py-3 bg-gray-800/50 rounded-lg px-3 hover:bg-gray-800">
              <div className="flex items-center space-x-3 flex-1">
                <button 
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavoriteMutation.mutate(market.coinId);
                  }}
                >
                  <Star 
                    className={`w-4 h-4 ${market.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} 
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="text-white font-medium truncate">{market.symbol}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${market.dominance.color}`}>
                      {market.dominance.label}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs truncate">
                    {market.name} • #{market.rank}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-right">
                <div>
                  <div className="text-white font-medium text-sm">${market.price}</div>
                  <div className="text-gray-400 text-xs">MCap: {market.marketCap}</div>
                </div>

                <div className="text-center min-w-[50px]">
                  {market.isPositive ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  )}
                  <div className="text-xs text-gray-400">
                    {market.isPositive ? 'Bull' : 'Bear'}
                  </div>
                </div>

                <div className={`text-right min-w-[60px] ${
                  market.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  <div className="font-medium text-sm">{market.change}</div>
                  <div className="text-xs text-gray-400">24h</div>
                </div>
              </div>

              <Link href={`/mobile/trade/${market.pair.replace('/', '-')}`} className="ml-2">
                <Button size="sm" variant="outline" className="text-xs h-8 w-16">
                  Trade
                </Button>
              </Link>
            </div>
          ))
        )}
      </div>
    </MobileLayout>
  );
}