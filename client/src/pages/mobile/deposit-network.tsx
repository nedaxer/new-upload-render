import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';
import { useLanguage } from '@/contexts/language-context';

const NETWORK_INFO = {
  'ERC20': {
    name: 'Ethereum (ERC20)',
    description: 'Ethereum blockchain network',
    fees: 'Higher fees, slower confirmation',
    minDeposit: '0.01',
    confirmations: '12'
  },
  'TRC20': {
    name: 'TRON (TRC20)', 
    description: 'TRON blockchain network',
    fees: 'Lower fees, faster confirmation',
    minDeposit: '1',
    confirmations: '6'
  },
  'BSC': {
    name: 'BNB Smart Chain (BSC)',
    description: 'Binance Smart Chain network',
    fees: 'Very low fees, fast confirmation',
    minDeposit: '0.01',
    confirmations: '3'
  },
  'Bitcoin': {
    name: 'Bitcoin Network',
    description: 'Bitcoin blockchain network',
    fees: 'Variable fees based on network',
    minDeposit: '0.0001',
    confirmations: '6'
  }
};

const CRYPTO_NETWORKS = {
  'tether': ['ERC20', 'TRC20', 'BSC'],
  'bitcoin': ['Bitcoin'],
  'ethereum': ['ERC20'],
  'binancecoin': ['BSC']
};

export default function MobileDepositNetwork() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const crypto = params.get('crypto') || '';
    setSelectedCrypto(crypto);
    setAvailableNetworks(CRYPTO_NETWORKS[crypto as keyof typeof CRYPTO_NETWORKS] || []);
  }, [searchParams]);

  const handleNetworkSelect = (network: string) => {
    navigate(`/mobile/deposit/address?crypto=${selectedCrypto}&network=${network}`);
  };

  const handleBack = () => {
    navigate('/mobile/deposit/crypto');
  };

  const getCryptoName = (cryptoId: string) => {
    const names = {
      'tether': 'USDT',
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'binancecoin': 'BNB'
    };
    return names[cryptoId as keyof typeof names] || cryptoId;
  };

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
        <button onClick={handleBack} className="p-2 hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold">Select Network</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Network for {getCryptoName(selectedCrypto)}</h2>
          <p className="text-gray-400">Select the blockchain network for your deposit</p>
        </div>

        {/* Network Options */}
        <div className="space-y-3">
          {availableNetworks.map((network) => {
            const networkInfo = NETWORK_INFO[network as keyof typeof NETWORK_INFO];
            return (
              <button
                key={network}
                onClick={() => handleNetworkSelect(network)}
                className="w-full p-4 rounded-xl border-2 border-[#1a1a40] hover:border-blue-500 hover:bg-[#1a1a40] text-left transition-all active:scale-98"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{networkInfo.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{networkInfo.description}</p>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Fees:</span>
                        <span>{networkInfo.fees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Deposit:</span>
                        <span>{networkInfo.minDeposit} {getCryptoName(selectedCrypto)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confirmations:</span>
                        <span>{networkInfo.confirmations}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 ml-4">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning */}
        <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Important Warning</h3>
              <p className="text-sm text-red-300">
                Make sure to select the correct network. Sending {getCryptoName(selectedCrypto)} to the wrong network 
                may result in permanent loss of funds.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-[#1a1a40] rounded-xl">
          <h3 className="font-semibold mb-2">Need Help Choosing?</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <strong>ERC20:</strong> Most compatible, higher fees</li>
            <li>• <strong>TRC20:</strong> Lower fees, good for large amounts</li>
            <li>• <strong>BSC:</strong> Fastest and cheapest option</li>
            <li>• <strong>Bitcoin:</strong> Original Bitcoin network</li>
          </ul>
        </div>
      </div>
    </div>
  );
}