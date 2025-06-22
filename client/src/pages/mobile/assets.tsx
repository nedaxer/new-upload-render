import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DepositModal } from '@/components/deposit-modal';
import { CryptoSelection } from '@/pages/mobile/crypto-selection';
import { NetworkSelection } from '@/pages/mobile/network-selection';
import { AddressDisplay } from '@/pages/mobile/address-display';
import CurrencySelection from '@/pages/mobile/currency-selection';
import { ComingSoonModal } from '@/components/coming-soon-modal';
import { 
  Eye, 
  EyeOff,
  Wallet,
  ArrowUp,
  ArrowDown,
  ArrowDownUp,
  CreditCard,
  ChevronRight,
  ChevronDown,
  X,
  QrCode
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/language-context';
import advancedChartsVideo from '@/assets/advanced-charts-video.mp4';

export default function MobileAssets() {
  const { t } = useLanguage();
  const [showBalance, setShowBalance] = useState(true);
  const [showPromoCard, setShowPromoCard] = useState(true);
  const [currentView, setCurrentView] = useState('assets'); // 'assets', 'crypto-selection', 'network-selection', 'address-display', 'currency-selection'
  const [activeTab, setActiveTab] = useState('assets'); // Only 'assets' tab now
  
  // Fetch user USD balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/balances'],
    staleTime: 30000,
    retry: 1
  });
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Load currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Default conversion rates - can be enhanced with real API later
  const conversionRates = {
    'USD': 1,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110,
    'CAD': 1.25,
    'AUD': 1.35,
    'CHF': 0.92,
    'CNY': 6.45,
    'INR': 75,
    'KRW': 1200,
    'BRL': 5.2,
    'MXN': 20,
    'RUB': 75,
    'SGD': 1.35,
    'HKD': 7.8,
    'NOK': 8.5,
    'SEK': 8.7,
    'DKK': 6.3,
    'PLN': 3.9,
    'CZK': 22,
    'HUF': 295,
    'RON': 4.1,
    'BGN': 1.66,
    'TRY': 8.5,
    'ZAR': 14.5,
    'EGP': 15.7,
    'MAD': 9.1,
    'NGN': 411,
    'KES': 108,
    'UGX': 3550,
    'AED': 3.67,
    'SAR': 3.75,
    'QAR': 3.64,
    'KWD': 0.3,
    'BHD': 0.377,
    'OMR': 0.385,
    'ILS': 3.2,
    'PKR': 155,
    'BDT': 85,
    'VND': 23000,
    'THB': 32,
    'MYR': 4.1,
    'IDR': 14300,
    'PHP': 50,
    'TWD': 28,
    'MOP': 8.1,
    'NZD': 1.42
  };

  // Convert USD amounts to selected currency
  const convertToSelectedCurrency = (usdAmount: number): string => {
    const rate = (conversionRates as any)[selectedCurrency] || 1;
    const convertedAmount = usdAmount * rate;

    // Format based on currency
    if (['JPY', 'KRW', 'VND', 'IDR', 'UGX', 'MMK', 'KHR', 'LAK'].includes(selectedCurrency)) {
      return Math.round(convertedAmount).toLocaleString();
    } else {
      return convertedAmount.toFixed(2);
    }
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string): string => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
      'KRW': '₩',
      'RUB': '₽',
      'BRL': 'R$',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'TRY': '₺',
      'ZAR': 'R',
      'EGP': 'E£',
      'NGN': '₦',
      'KES': 'KSh',
      'AED': 'د.إ',
      'SAR': 'ر.س',
      'QAR': 'ر.ق',
      'KWD': 'د.ك',
      'BHD': '.د.ب',
      'OMR': 'ر.ع.',
      'ILS': '₪',
      'PKR': '₨',
      'BDT': '৳',
      'VND': '₫',
      'THB': '฿',
      'MYR': 'RM',
      'SGD': 'S$',
      'IDR': 'Rp',
      'PHP': '₱',
      'TWD': 'NT$',
      'HKD': 'HK$',
      'NZD': 'NZ$'
    };
    return symbols[currency] || currency;
  };

  const handleDepositClick = () => {
    setDepositModalOpen(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setDepositModalOpen(false);
    
    if (method === 'crypto') {
      setCurrentView('crypto-selection');
    } else if (method === 'buy-usd') {
      setComingSoonFeature('Buy with USD');
      setComingSoonOpen(true);
    } else if (method === 'p2p') {
      setComingSoonFeature('P2P Trading');
      setComingSoonOpen(true);
    }
  };

  const handleCryptoSelect = (crypto: string) => {
    setSelectedCrypto(crypto);
    setCurrentView('network-selection');
  };

  const handleChainSelect = (chain: string) => {
    setSelectedChain(chain);
    setCurrentView('address-display');
  };

  const handleBackFromCrypto = () => {
    setCurrentView('assets');
  };

  const handleBackFromNetwork = () => {
    setCurrentView('crypto-selection');
  };

  const handleBackFromAddress = () => {
    setCurrentView('network-selection');
  };

  const handleComingSoon = () => {
    setComingSoonFeature('Fiat Deposits');
    setComingSoonOpen(true);
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setCurrentView('assets');
  };

  const handleQRScan = () => {
    // Check if device has camera access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          // Create a simple QR scanner modal
          const scannerModal = document.createElement('div');
          scannerModal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
          scannerModal.innerHTML = `
            <div class="relative w-full max-w-sm mx-4">
              <video id="qr-video" class="w-full rounded-lg" autoplay></video>
              <div class="absolute inset-0 border-2 border-orange-500 rounded-lg pointer-events-none">
                <div class="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-orange-500"></div>
                <div class="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-orange-500"></div>
                <div class="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-orange-500"></div>
                <div class="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-orange-500"></div>
              </div>
              <button id="close-scanner" class="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center">×</button>
              <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                Point camera at QR code
              </div>
            </div>
          `;

          document.body.appendChild(scannerModal);
          const video = document.getElementById('qr-video') as HTMLVideoElement;
          const closeBtn = document.getElementById('close-scanner');

          video.srcObject = stream;

          closeBtn?.addEventListener('click', () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(scannerModal);
          });

          // Auto-close after 30 seconds
          setTimeout(() => {
            if (document.body.contains(scannerModal)) {
              stream.getTracks().forEach(track => track.stop());
              document.body.removeChild(scannerModal);
            }
          }, 30000);
        })
        .catch((error) => {
          alert('Camera access denied or not available');
          console.error('Camera error:', error);
        });
    } else {
      alert('QR scanner not supported on this device');
    }
  };

  // Render full-page components instead of assets page
  if (currentView === 'crypto-selection') {
    return (
      <CryptoSelection
        onBack={handleBackFromCrypto}
        onSelectCrypto={handleCryptoSelect}
        onComingSoon={handleComingSoon}
      />
    );
  }

  if (currentView === 'network-selection') {
    return (
      <NetworkSelection
        onBack={handleBackFromNetwork}
        selectedCrypto={selectedCrypto}
        onSelectChain={handleChainSelect}
      />
    );
  }

  if (currentView === 'address-display') {
    return (
      <AddressDisplay
        onBack={handleBackFromAddress}
        selectedCrypto={selectedCrypto}
        selectedChain={selectedChain}
      />
    );
  }

  if (currentView === 'currency-selection') {
    return (
      <CurrencySelection
        onSelectCurrency={handleCurrencySelect}
        currentCurrency={selectedCurrency}
      />
    );
  }

  // Default assets page view
  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">My Assets</h1>
        <button onClick={handleQRScan} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
          <QrCode className="w-4 h-4 text-gray-400" />
        </button>
      </div>



      {/* USD Balance Display */}
      <div className="px-4 pb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-gray-400 text-sm">Account Balance</span>
          <button onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? (
              <Eye className="w-4 h-4 text-gray-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">
              {showBalance ? (
                balanceData?.data?.usdBalance !== undefined
                  ? `$${balanceData.data.usdBalance.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}`
                  : '$0.00'
              ) : '****'}
            </span>
            <span className="text-gray-400 text-lg">USD</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>{balanceData?.data?.usdBalance === 0 ? 'Deposit crypto to start trading' : 'Available for trading'}</span>
          </div>
        </div>

        {/* Advanced Charts Video Background */}
        <div className="relative h-32 bg-gray-900 rounded-lg mb-4 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            style={{ filter: 'brightness(0.8) contrast(1.2)' }}
          >
            <source src={advancedChartsVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-gray-900/60" />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="text-white">
              <div className="text-sm font-medium opacity-90">Advanced Trading</div>
              <div className="text-xs text-gray-300">Live Market Analysis</div>
            </div>
            <div className="text-right">
              <div className="text-orange-500 text-lg font-bold">+2.4%</div>
              <div className="text-xs text-gray-300">24h Change</div>
            </div>
          </div>
        </div>

        
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-4 gap-4">
          <button onClick={handleDepositClick}>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                <Wallet className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Deposit</span>
            </div>
          </button>
          
          <Link href="/mobile/withdraw">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                <ArrowUp className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Withdraw</span>
            </div>
          </Link>
          
          <Link href="/mobile/transfer">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                <ArrowDownUp className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Transfer</span>
            </div>
          </Link>
          
          <Link href="/mobile/convert">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                <ArrowDownUp className="w-7 h-7 text-orange-500 transform rotate-45" />
              </div>
              <span className="text-xs text-gray-300 text-center">Convert</span>
            </div>
          </Link>
        </div>
      </div>

      {/* USD Fiat Balance Section */}
      <div className="px-4">
        <h3 className="text-white font-medium mb-6 text-sm">Account Overview</h3>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">$</span>
              </div>
              <div>
                <div className="text-white font-medium text-lg">USD Balance</div>
                <div className="text-gray-400 text-sm">Available for Trading</div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-white font-bold text-3xl mb-1">
              {showBalance ? (
                balanceData?.data?.usdBalance !== undefined
                  ? `$${balanceData.data.usdBalance.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}`
                  : '$0.00'
              ) : '••••••'}
            </div>
            <div className="text-gray-400 text-sm">Fiat Balance • Ready to Trade</div>
          </div>
          
          {balanceData?.data?.usdBalance === 0 && (
            <div className="mt-4 p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <p className="text-orange-300 text-sm text-center">
                Deposit cryptocurrency to receive USD balance for trading
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-3 gap-4">
          <Button 
            onClick={() => setCurrentView('crypto-selection')}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
          >
            <ArrowDown className="w-6 h-6" />
            <span className="text-sm">Deposit</span>
          </Button>
          
          <Button 
            onClick={handleComingSoon}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-sm">Withdraw</span>
          </Button>
          
          <Button 
            onClick={handleComingSoon}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
          >
            <ArrowDownUp className="w-6 h-6" />
            <span className="text-sm">Transfer</span>
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}