
import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';

const btcLogo = '/logos/btc-logo.svg';
const ethLogo = '/logos/eth-logo.svg';
const usdtLogo = '/logos/usdt-logo.svg';
const bnbLogo = '/logos/bnb-logo.svg';

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
    icon: btcLogo,
    networks: ['Bitcoin Network']
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: ethLogo,
    networks: ['Ethereum (ERC20)']
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    icon: usdtLogo,
    networks: ['Ethereum (ERC20)', 'TRON (TRC20)', 'BNB Smart Chain (BEP20)']
  }
];

interface WithdrawalCryptoSelectionProps {
  onBack?: () => void;
  onSelectCrypto: (crypto: CryptoOption) => void;
}

export default function WithdrawalCryptoSelection({ onBack, onSelectCrypto }: WithdrawalCryptoSelectionProps) {

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

      {/* Crypto Withdrawal Header */}
      <div className="border-b border-[#1a1a40] bg-[#0a0a2e] px-4 py-3">
        <h2 className="text-center font-medium text-orange-500 text-sm">
          Select Crypto Gateway
        </h2>
        <p className="text-center text-xs text-gray-400 mt-1">
          Choose cryptocurrency for USD withdrawal
        </p>
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
                <img
                  src={crypto.icon}
                  alt={crypto.symbol}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    // Fallback to text icon if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center';
                    fallback.innerHTML = `<span class="text-white font-bold text-lg">${crypto.symbol.charAt(0)}</span>`;
                    target.parentElement?.replaceChild(fallback, target);
                  }}
                />
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