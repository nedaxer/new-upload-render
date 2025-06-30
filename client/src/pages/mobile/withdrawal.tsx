import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';
import WithdrawalCryptoSelection from './withdrawal-crypto-selection';
import WithdrawalForm from './withdrawal-form';

interface CryptoOption {
  symbol: string;
  name: string;
  icon: string;
  networks: NetworkOption[];
}

interface NetworkOption {
  networkId: string;
  networkName: string;
  chainType: string;
  minWithdrawal: number;
}

const cryptoOptionsData: CryptoOption[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    networks: [
      {
        networkId: 'bitcoin',
        networkName: 'Bitcoin Network',
        chainType: 'Bitcoin',
        minWithdrawal: 0.00027
      }
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    networks: [
      {
        networkId: 'erc20',
        networkName: 'Ethereum (ERC20)',
        chainType: 'ERC20',
        minWithdrawal: 0.01
      }
    ]
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    icon: '₮',
    networks: [
      {
        networkId: 'erc20',
        networkName: 'Ethereum (ERC20)',
        chainType: 'ERC20',
        minWithdrawal: 10
      },
      {
        networkId: 'trc20',
        networkName: 'TRON (TRC20)',
        chainType: 'TRC20',
        minWithdrawal: 1
      },
      {
        networkId: 'bep20',
        networkName: 'BNB Smart Chain (BEP20)',
        chainType: 'BEP20',
        minWithdrawal: 1
      }
    ]
  }
];

type ViewType = 'crypto-selection' | 'withdrawal-form';

export default function MobileWithdrawal() {
  const [currentView, setCurrentView] = useState<ViewType>('crypto-selection');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);

  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    setCurrentView('withdrawal-form');
  };

  const handleBackToCryptoSelection = () => {
    setCurrentView('crypto-selection');
    setSelectedCrypto(null);
  };

  const handleBackToAssets = () => {
    // This will be handled by the Link component
  };

  // Convert crypto data for the selection component
  const cryptoSelectionData = cryptoOptionsData.map(crypto => ({
    symbol: crypto.symbol,
    name: crypto.name,
    icon: crypto.icon,
    networks: crypto.networks.map(n => n.networkName)
  }));

  if (currentView === 'crypto-selection') {
    return (
      <WithdrawalCryptoSelection
        onBack={handleBackToAssets}
        onSelectCrypto={(cryptoData) => {
          // Find the full crypto option from our data
          const fullCrypto = cryptoOptionsData.find(c => c.symbol === cryptoData.symbol);
          if (fullCrypto) {
            handleCryptoSelect(fullCrypto);
          }
        }}
      />
    );
  }

  if (currentView === 'withdrawal-form' && selectedCrypto) {
    return (
      <WithdrawalForm
        selectedCrypto={selectedCrypto}
        onBack={handleBackToCryptoSelection}
      />
    );
  }

  // Fallback - should not happen
  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#0a0a2e] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading...</h2>
          <Link href="/mobile/assets" className="text-orange-500 hover:text-orange-400">
            Back to Assets
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}