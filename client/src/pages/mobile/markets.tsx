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
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function MobileMarkets() {
  const [activeTab, setActiveTab] = useState('spot');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteCoins, setFavoriteCoins] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCoins');
    if (savedFavorites) {
      setFavoriteCoins(JSON.parse(savedFavorites));
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = (coinId: string) => {
    const newFavorites = favoriteCoins.includes(coinId)
      ? favoriteCoins.filter(id => id !== coinId)
      : [...favoriteCoins, coinId];
    
    setFavoriteCoins(newFavorites);
    localStorage.setItem('favoriteCoins', JSON.stringify(newFavorites));
  };

  // Fetch real-time cryptocurrency data
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market-data', 'cryptocurrencies'],
    queryFn: () => apiRequest('/api/market-data/cryptocurrencies?limit=20'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const spotMarkets = marketData?.data?.map((crypto: any) => ({
    pair: `${crypto.symbol.toUpperCase()}/USDT`,
    price: crypto.current_price.toLocaleString('en-US', { 
      minimumFractionDigits: crypto.current_price < 1 ? 6 : 2,
      maximumFractionDigits: crypto.current_price < 1 ? 6 : 2 
    }),
    change: `${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%`,
    isPositive: crypto.price_change_percentage_24h > 0,
    volume: `${(crypto.total_volume / 1000000000).toFixed(1)}B`,
    favorite: favoriteCoins.includes(crypto.id),
    coinId: crypto.id
  })) || [
    { 
      pair: 'BTC/USDT', 
      price: '105,224.9', 
      change: '-1.61%', 
      isPositive: false,
      volume: '25.6B',
      favorite: favoriteCoins.includes('bitcoin'),
      coinId: 'bitcoin'
    },
    { 
      pair: 'ETH/USDT', 
      price: '2,536.64', 
      change: '-5.79%', 
      isPositive: false,
      volume: '12.8B',
      favorite: favoriteCoins.includes('ethereum'),
      coinId: 'ethereum'
    },
    { 
      pair: 'BNB/USDT', 
      price: '602.50', 
      change: '+2.45%', 
      isPositive: true,
      volume: '892M',
      favorite: favoriteCoins.includes('binancecoin'),
      coinId: 'binancecoin'
    },
    { 
      pair: 'XRP/USDT', 
      price: '2.1847', 
      change: '+8.21%', 
      isPositive: true,
      volume: '4.2B',
      favorite: favoriteCoins.includes('ripple'),
      coinId: 'ripple'
    },
    { 
      pair: 'SOL/USDT', 
      price: '175.24', 
      change: '-2.98%', 
      isPositive: false,
      volume: '2.1B',
      favorite: favoriteCoins.includes('solana'),
      coinId: 'solana'
    },
    { 
      pair: 'ADA/USDT', 
      price: '0.8921', 
      change: '+5.67%', 
      isPositive: true,
      volume: '1.5B',
      favorite: favoriteCoins.includes('cardano'),
      coinId: 'cardano'
    }
  ];

  const filteredMarkets = spotMarkets.filter(market =>
    market.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        {isLoading ? (
          <p className="text-white">Loading market data...</p>
        ) : filteredMarkets.length === 0 ? (
          <p className="text-white">No markets found.</p>
        ) : (
          filteredMarkets.map((market, index) => (
            <Link key={index} href={`/mobile/trade/${market.pair.replace('/', '-')}`}>
              <div className="flex items-center justify-between py-3 bg-gray-800/50 rounded-lg px-3 hover:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(market.coinId);
                    }}
                    className="text-gray-400 hover:text-yellow-500"
                  >
                    <Star 
                      className={`w-4 h-4 ${market.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} 
                    />
                  </button>
                  <div>
                    <div className="text-white font-medium">{market.pair}</div>
                    <div className="text-gray-400 text-xs">
                      Vol {market.volume}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-white font-medium">{market.price}</div>
                  </div>

                  <div className={`text-right min-w-[60px] ${
                    market.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <div className="flex items-center justify-end space-x-1">
                      {market.isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="font-medium">{market.change}</span>
                    </div>
                  </div>

                  <div className="text-gray-400 text-sm min-w-[50px] text-right">
                    {market.volume}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </MobileLayout>
  );
}