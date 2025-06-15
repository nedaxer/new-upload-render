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
  const [favorites, setFavorites] = useState<string[]>(['bitcoin', 'ethereum', 'binancecoin']);

  const { data: cryptoData, isLoading } = useQuery<CryptoPair[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: isOpen
  });

  const filteredCryptos = FEATURED_CRYPTOCURRENCIES.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCryptoData = (cryptoId: string) => {
    return cryptoData?.find(crypto => crypto.id === cryptoId);
  };

  const toggleFavorite = (cryptoId: string) => {
    setFavorites(prev => 
      prev.includes(cryptoId) 
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
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
              {favorites.map(cryptoId => {
                const crypto = FEATURED_CRYPTOCURRENCIES.find(c => c.id === cryptoId);
                const liveData = getCryptoData(cryptoId);
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
                  const isFavorite = favorites.includes(crypto.id);

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