import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { useState } from 'react';

interface CryptoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCrypto: (crypto: string) => void;
}

const cryptoOptions = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: '/src/assets/crypto-logos/btc-logo.svg'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: '/src/assets/crypto-logos/eth-logo.svg'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logo: '/src/assets/crypto-logos/usdt-logo.svg'
  },
  {
    symbol: 'BEP-20',
    name: 'BNB',
    logo: '/src/assets/crypto-logos/bnb-logo.svg'
  }
];

export function CryptoSelectionModal({ isOpen, onClose, onSelectCrypto }: CryptoSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCryptos = cryptoOptions.filter(crypto => 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md mx-auto max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-lg font-semibold">Select Cryptocurrency</DialogTitle>
          </div>
          <button className="text-gray-400 hover:text-white">
            Cancel
          </button>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Crypto/Fiat Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button className="flex-1 bg-orange-500 text-white py-2 rounded-md text-sm font-medium">
              Crypto
            </button>
            <button className="flex-1 text-gray-400 py-2 text-sm">
              Fiat
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Please select your preferred pair"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Alphabet Navigation */}
          <div className="flex justify-end">
            <div className="text-xs text-gray-400 space-y-1">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
                <div key={letter} className="cursor-pointer hover:text-orange-500">
                  {letter}
                </div>
              ))}
            </div>
          </div>

          {/* Crypto List */}
          <div className="max-h-96 overflow-y-auto space-y-1">
            {filteredCryptos.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => onSelectCrypto(crypto.symbol)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                  <img 
                    src={crypto.logo} 
                    alt={crypto.symbol}
                    className="w-6 h-6"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-bold text-white">${crypto.symbol.charAt(0)}</span>`;
                    }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{crypto.symbol}</div>
                  <div className="text-gray-400 text-sm">{crypto.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}