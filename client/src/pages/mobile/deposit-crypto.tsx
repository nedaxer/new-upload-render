import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/language-context';
import { Input } from '@/components/ui/input';

const SUPPORTED_CRYPTOS = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    networks: ['Bitcoin']
  },
  {
    id: 'ethereum',
    symbol: 'ETH', 
    name: 'Ethereum',
    icon: 'Ξ',
    networks: ['ERC20']
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    icon: '₮',
    networks: ['ERC20', 'TRC20', 'BSC']
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    icon: 'B',
    networks: ['BSC']
  },
  {
    id: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    icon: 'Ł',
    networks: ['Litecoin']
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    icon: 'X',
    networks: ['XRP Ledger']
  }
];

export default function MobileDepositCrypto() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCryptos = SUPPORTED_CRYPTOS.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCryptoSelect = (crypto: typeof SUPPORTED_CRYPTOS[0]) => {
    if (crypto.networks.length === 1) {
      // Direct to address if only one network
      navigate(`/mobile/deposit/address?crypto=${crypto.id}&network=${crypto.networks[0]}`);
    } else {
      // Show network selection
      navigate(`/mobile/deposit/network?crypto=${crypto.id}`);
    }
  };

  const handleBack = () => {
    navigate('/mobile/deposit');
  };

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
        <button onClick={handleBack} className="p-2 hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold">Select Cryptocurrency</h1>
        <div className="w-10"></div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1a1a40] border-[#2a2a50] text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Cryptocurrency List */}
      <div className="px-4 space-y-2">
        {filteredCryptos.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => handleCryptoSelect(crypto)}
            className="w-full p-4 rounded-xl border-2 border-[#1a1a40] hover:border-blue-500 hover:bg-[#1a1a40] text-left transition-all active:scale-98"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                {crypto.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{crypto.name}</h3>
                  <span className="text-sm bg-[#2a2a50] text-gray-300 px-2 py-1 rounded">
                    {crypto.symbol}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Networks: {crypto.networks.join(', ')}
                </p>
              </div>
              <div className="text-gray-400">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
            </div>
          </button>
        ))}

        {filteredCryptos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cryptocurrencies found</p>
            <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 mt-8">
        <div className="bg-[#1a1a40] rounded-xl p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            💡 Deposit Information
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Minimum deposit varies by cryptocurrency</li>
            <li>• Deposits require network confirmations</li>
            <li>• Processing time: 10-60 minutes typically</li>
            <li>• Double-check the network before sending</li>
          </ul>
        </div>
      </div>
    </div>
  );
}