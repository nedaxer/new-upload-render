import { useState } from 'react';
import { Search, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface CryptoPair {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface CryptoPairSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPair: (cryptoId: string, symbol: string) => void;
  selectedPair?: string;
}

const FEATURED_CRYPTOCURRENCIES = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple (XRP)' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'the-open-network', symbol: 'TON', name: 'Toncoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon (MATIC)' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'tron', symbol: 'TRX', name: 'TRON' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar Lumens' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos Hub' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
];

export default function CryptoPairSelector({ isOpen, onClose, onSelectPair, selectedPair }: CryptoPairSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['bitcoin', 'ethereum', 'binancecoin']);

  const { data: cryptoData, isLoading } = useQuery<CryptoPair[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 10000,
    enabled: isOpen
  });

  const cryptoList = cryptoData || FEATURED_CRYPTOCURRENCIES.map(crypto => ({
    id: crypto.id,
    symbol: crypto.symbol,
    name: crypto.name,
    current_price: 0,
    price_change_percentage_24h: 0,
    image: ''
  }));

  const filteredCryptos = cryptoList.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteList = filteredCryptos.filter(crypto => favorites.includes(crypto.id));
  const otherList = filteredCryptos.filter(crypto => !favorites.includes(crypto.id));

  const toggleFavorite = (cryptoId: string) => {
    setFavorites(prev => 
      prev.includes(cryptoId) 
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  const handleSelect = (crypto: CryptoPair) => {
    onSelectPair(crypto.id, crypto.symbol);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Select Trading Pair</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {favoriteList.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Favorites</h4>
                <div className="space-y-1">
                  {favoriteList.map((crypto) => (
                    <div
                      key={crypto.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPair === crypto.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                      }`}
                      onClick={() => handleSelect(crypto)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {crypto.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{crypto.symbol}/USDT</div>
                          <div className="text-sm text-gray-400">{crypto.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          {crypto.current_price > 0 && (
                            <>
                              <div className="font-medium text-white">${crypto.current_price.toFixed(2)}</div>
                              <div className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(crypto.id);
                          }}
                          className="text-orange-400 hover:text-orange-300"
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {otherList.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">All Cryptocurrencies</h4>
                <div className="space-y-1">
                  {otherList.map((crypto) => (
                    <div
                      key={crypto.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPair === crypto.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                      }`}
                      onClick={() => handleSelect(crypto)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {crypto.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{crypto.symbol}/USDT</div>
                          <div className="text-sm text-gray-400">{crypto.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          {crypto.current_price > 0 && (
                            <>
                              <div className="font-medium text-white">${crypto.current_price.toFixed(2)}</div>
                              <div className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(crypto.id);
                          }}
                          className="text-gray-400 hover:text-orange-400"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}