import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CryptoPair {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  isFavorite?: boolean;
}

interface PairSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPair: (pair: string) => void;
  currentPair?: string;
  cryptoData?: CryptoPair[];
  favorites?: string[];
  onToggleFavorite?: (symbol: string) => void;
}

export const PairSelectionModal: React.FC<PairSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPair,
  currentPair,
  cryptoData = [],
  favorites = [],
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // Filter pairs based on search query
  const filteredPairs = useMemo(() => {
    let pairs = cryptoData;
    
    // Filter by tab
    if (activeTab === 'favorites') {
      pairs = pairs.filter(pair => favorites.includes(pair.symbol));
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      pairs = pairs.filter(pair => 
        pair.symbol.toLowerCase().includes(query) ||
        pair.name.toLowerCase().includes(query)
      );
    }
    
    return pairs;
  }, [cryptoData, searchQuery, activeTab, favorites]);

  const clearSearch = () => setSearchQuery('');

  const handlePairSelect = (symbol: string) => {
    onSelectPair(symbol);
    onClose();
  };

  const handleToggleFavorite = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(symbol);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999999999] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 max-h-[80vh] bg-[#0a0a2e] border border-gray-600 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-semibold text-white">Select Trading Pair</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-600">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search pairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-[#1a1a40] border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Pairs ({cryptoData.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-4 h-4" />
              <span>Favorites ({favorites.length})</span>
            </div>
          </button>
        </div>

        {/* Pairs List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredPairs.length > 0 ? (
            <div className="divide-y divide-gray-600">
              {filteredPairs.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => handlePairSelect(pair.symbol)}
                  className={`w-full p-4 text-left hover:bg-[#1a1a40] transition-colors ${
                    currentPair === pair.symbol ? 'bg-orange-500/10 border-r-2 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="text-white font-medium">{pair.symbol}</div>
                        <button
                          onClick={(e) => handleToggleFavorite(e, pair.symbol)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              favorites.includes(pair.symbol)
                                ? 'text-orange-500 fill-current'
                                : 'text-gray-400 hover:text-orange-500'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-gray-400 text-sm">{pair.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono">
                        ${pair.price?.toFixed(2) || '0.00'}
                      </div>
                      <div className={`text-sm flex items-center justify-end space-x-1 ${
                        (pair.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(pair.change || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {(pair.change || 0) >= 0 ? '+' : ''}
                          {(pair.change || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="text-gray-400 text-sm">
                {searchQuery ? 'No pairs found' : activeTab === 'favorites' ? 'No favorites yet' : 'No pairs available'}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {searchQuery ? 'Try a different search term' : activeTab === 'favorites' ? 'Add some pairs to favorites' : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};