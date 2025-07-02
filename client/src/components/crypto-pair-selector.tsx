import { useState, useEffect } from 'react';
import { Search, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

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
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos' },
  { id: 'lido-dao', symbol: 'LDO', name: 'Lido DAO' },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera' },
  { id: 'thorchain', symbol: 'RUNE', name: 'THORChain' },
  { id: 'maker', symbol: 'MKR', name: 'Maker' },
  { id: 'elrond-erd-2', symbol: 'EGLD', name: 'MultiversX (Elrond)' },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave' },
  { id: 'the-graph', symbol: 'GRT', name: 'The Graph' },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland' },
  { id: 'stacks', symbol: 'STX', name: 'Stacks' },
  { id: 'quant-network', symbol: 'QNT', name: 'Quant' },
  { id: 'immutable-x', symbol: 'IMX', name: 'Immutable' },
  { id: 'fantom', symbol: 'FTM', name: 'Fantom' },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
  { id: 'kava', symbol: 'KAVA', name: 'Kava' },
  { id: 'xdc-network', symbol: 'XDC', name: 'XDC Network' },
  { id: 'celestia', symbol: 'TIA', name: 'Celestia' },
  { id: 'dydx-chain', symbol: 'DYDX', name: 'dYdX' },
  { id: 'synthetix-network-token', symbol: 'SNX', name: 'Synthetix' },
  { id: 'curve-dao-token', symbol: 'CRV', name: 'Curve DAO' },
  { id: 'chiliz', symbol: 'CHZ', name: 'Chiliz' },
  { id: 'enjincoin', symbol: 'ENJ', name: 'Enjin Coin' },
  { id: 'zilliqa', symbol: 'ZIL', name: 'Zilliqa' },
  { id: 'basic-attention-token', symbol: 'BAT', name: 'Basic Attention Token' }
];

export default function CryptoPairSelector({ isOpen, onClose, onSelectPair, selectedPair }: CryptoPairSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cryptoData, isLoading } = useQuery<CryptoPair[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: isOpen
  });

  // Fetch user favorites
  const { data: userFavorites } = useQuery<string[]>({
    queryKey: ['/api/user/favorites'],
    enabled: !!user && isOpen,
    retry: false
  });

  // Update favorites when user favorites data changes
  useEffect(() => {
    if (userFavorites) {
      setFavorites(userFavorites);
    }
  }, [userFavorites]);

  // Mutation for adding/removing favorites
  const favoritesMutation = useMutation({
    mutationFn: async ({ action, cryptoPairSymbol, cryptoId }: { 
      action: 'add' | 'remove'; 
      cryptoPairSymbol: string; 
      cryptoId?: string; 
    }) => {
      if (action === 'add' && cryptoId) {
        await apiRequest('/api/user/favorites', 'POST', { cryptoPairSymbol, cryptoId });
      } else if (action === 'remove') {
        await apiRequest(`/api/user/favorites/${cryptoPairSymbol}`, 'DELETE');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    }
  });

  const filteredCryptos = FEATURED_CRYPTOCURRENCIES.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCryptoData = (cryptoId: string) => {
    return cryptoData?.find(crypto => crypto.id === cryptoId);
  };

  const toggleFavorite = (cryptoId: string, cryptoPairSymbol: string) => {
    if (!user) return; // Only logged-in users can manage favorites
    
    const isFavorite = favorites.includes(cryptoPairSymbol);
    
    if (isFavorite) {
      favoritesMutation.mutate({ action: 'remove', cryptoPairSymbol });
    } else {
      favoritesMutation.mutate({ action: 'add', cryptoPairSymbol, cryptoId });
    }
  };

  const handleSelectPair = (cryptoId: string, symbol: string) => {
    onSelectPair(cryptoId, symbol);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-gray-900 w-full h-[80vh] rounded-t-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white text-lg font-semibold">Select Trading Pair</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && !searchTerm && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-gray-400 text-sm mb-3">Favorites</h3>
            <div className="space-y-2">
              {favorites.map(cryptoPairSymbol => {
                const crypto = FEATURED_CRYPTOCURRENCIES.find(c => `${c.symbol.toUpperCase()}USDT` === cryptoPairSymbol);
                const liveData = crypto ? getCryptoData(crypto.id) : null;
                if (!crypto) return null;

                return (
                  <div
                    key={cryptoId}
                    onClick={() => handleSelectPair(cryptoId, crypto.symbol)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPair === `${crypto.symbol}/USDT` ? 'bg-orange-500/20' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(cryptoId);
                        }}
                        className="text-yellow-500"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      {liveData?.image && (
                        <img src={liveData.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                      )}
                      <div>
                        <div className="text-white font-medium">{crypto.symbol}/USDT</div>
                        <div className="text-gray-400 text-sm">{crypto.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {liveData ? (
                        <>
                          <div className="text-white font-medium">
                            ${liveData.current_price?.toFixed(liveData.current_price < 1 ? 6 : 2)}
                          </div>
                          <div className={`text-sm ${
                            liveData.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {liveData.price_change_percentage_24h >= 0 ? '+' : ''}
                            {liveData.price_change_percentage_24h?.toFixed(2)}%
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400 text-sm">Loading...</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Cryptocurrencies */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-gray-400 text-sm mb-3">
              {searchTerm ? 'Search Results' : 'All Trading Pairs'}
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-3 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCryptos.map(crypto => {
                  const liveData = getCryptoData(crypto.id);
                  const cryptoPairSymbol = `${crypto.symbol.toUpperCase()}USDT`;
                  const isFavorite = favorites.includes(cryptoPairSymbol);

                  return (
                    <div
                      key={crypto.id}
                      onClick={() => handleSelectPair(crypto.id, crypto.symbol)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPair === `${crypto.symbol}/USDT` ? 'bg-orange-500/20' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(crypto.id);
                          }}
                          className={`${isFavorite ? 'text-yellow-500' : 'text-gray-600'} hover:text-yellow-500`}
                        >
                          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        {liveData?.image && (
                          <img src={liveData.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <div className="text-white font-medium">{crypto.symbol}/USDT</div>
                          <div className="text-gray-400 text-sm">{crypto.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {liveData ? (
                          <>
                            <div className="text-white font-medium">
                              ${liveData.current_price?.toFixed(liveData.current_price < 1 ? 6 : 2)}
                            </div>
                            <div className={`text-sm ${
                              liveData.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {liveData.price_change_percentage_24h >= 0 ? '+' : ''}
                              {liveData.price_change_percentage_24h?.toFixed(2)}%
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-sm">Loading...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { X } from 'lucide-react';

interface CryptoPair {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface CryptoPairSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  pairs: CryptoPair[];
  onSelect: (pair: CryptoPair) => void;
}

export const CryptoPairSelector: React.FC<CryptoPairSelectorProps> = ({
  isOpen,
  onClose,
  pairs,
  onSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Select Trading Pair</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pairs.map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => onSelect(pair)}
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
                    <div className="font-medium">${pair.price.toFixed(2)}</div>
                    <div className={`text-sm ${pair.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
