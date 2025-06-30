import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';

interface CryptoOption {
  symbol: string;
  name: string;
  icon: string;
  networks: string[];
}

const cryptoOptions: CryptoOption[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    networks: ['Bitcoin Network']
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    networks: ['Ethereum (ERC20)']
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    icon: '₮',
    networks: ['Ethereum (ERC20)', 'TRON (TRC20)', 'BNB Smart Chain (BEP20)']
  }
];

interface WithdrawalCryptoSelectionProps {
  onBack?: () => void;
  onSelectCrypto: (crypto: CryptoOption) => void;
}

export default function WithdrawalCryptoSelection({ onBack, onSelectCrypto }: WithdrawalCryptoSelectionProps) {
  const [activeTab, setActiveTab] = useState('crypto');

  const handleCryptoSelect = (crypto: CryptoOption) => {
    onSelectCrypto(crypto);
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e] border-b border-[#1a1a40]">
        {onBack ? (
          <button onClick={handleBackClick} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <Link href="/mobile/assets">
            <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
          </Link>
        )}
        <h2 className="text-base font-semibold text-white">Select Cryptocurrency</h2>
        <div className="w-6 h-6" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a1a40] bg-[#0a0a2e]">
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors text-sm ${
            activeTab === 'crypto'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          On-Chain
        </button>
        <button
          className="flex-1 py-3 px-4 text-center font-medium text-gray-400 hover:text-white transition-colors text-sm opacity-50 cursor-not-allowed"
          disabled
        >
          Internal Transfer
        </button>
      </div>

      {/* Crypto List */}
      <div className="flex-1 bg-[#0a0a2e] p-4">
        <div className="space-y-3">
          {cryptoOptions.map((crypto) => (
            <button
              key={crypto.symbol}
              onClick={() => handleCryptoSelect(crypto)}
              className="w-full bg-[#1a1a40] hover:bg-[#2a2a50] rounded-lg p-4 transition-colors border border-[#2a2a50]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{crypto.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-base">{crypto.symbol}</span>
                    <span className="text-gray-400 text-sm">{crypto.name}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    {crypto.networks.length} network{crypto.networks.length > 1 ? 's' : ''} available
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Notice */}
        <div className="mt-6 p-4 bg-[#1a1a40] border border-[#2a2a50] rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-blue-400 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-blue-400 text-sm font-medium">Important</p>
              <p className="text-gray-400 text-xs mt-1">
                Make sure you have the correct wallet address before proceeding. Cryptocurrency transactions cannot be reversed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}