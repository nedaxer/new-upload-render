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
                    <stop offset="0%" stopColor="#131f37" />
                    <stop offset="100%" stopColor="#1a2332" />
                  </linearGradient>
                  <linearGradient id="moneroAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6600" />
                    <stop offset="100%" stopColor="#cc5500" />
                  </linearGradient>
                </defs>
                
                {/* Clean background */}
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="#1f2937" strokeWidth="20" opacity="0.3" />
                
                {/* Bitcoin segment (49.5%) - Authentic Orange */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#bitcoinAuth)"
                  strokeWidth="20"
                  strokeDasharray="217.8 222.2"
                  strokeDashoffset="0"
                  className="opacity-0 animate-[segmentDraw_1.5s_ease-out_0.5s_forwards]"
                  style={{ filter: 'drop-shadow(0 0 8px #f7931a60)' }}
                />
                
                {/* Ethereum segment (24.5%) - Authentic Blue */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#ethereumAuth)"
                  strokeWidth="20"
                  strokeDasharray="107.9 332.1"
                  strokeDashoffset="-217.8"
                  className="opacity-0 animate-[segmentDraw_1.5s_ease-out_1s_forwards]"
                  style={{ filter: 'drop-shadow(0 0 8px #627eea60)' }}
                />
                
                {/* Litecoin segment (4.7%) - Authentic Silver */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#litecoinAuth)"
                  strokeWidth="20"
                  strokeDasharray="20.7 419.3"
                  strokeDashoffset="-325.7"
                  className="opacity-0 animate-[segmentDraw_1.5s_ease-out_1.5s_forwards]"
                  style={{ filter: 'drop-shadow(0 0 8px #bfbbbb60)' }}
                />
                
                {/* IOTA segment (4.3%) - Authentic Dark Blue */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#iotaAuth)"
                  strokeWidth="20"
                  strokeDasharray="18.9 421.1"
                  strokeDashoffset="-346.4"
                  className="opacity-0 animate-[segmentDraw_1.5s_ease-out_2s_forwards]"
                  style={{ filter: 'drop-shadow(0 0 8px #131f3760)' }}
                />
                
                {/* Monero segment (3.1%) - Authentic Orange-Red */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#moneroAuth)"
                  strokeWidth="20"
                  strokeDasharray="13.7 426.3"
                  strokeDashoffset="-365.3"
                  className="opacity-0 animate-[segmentDraw_1.5s_ease-out_2.5s_forwards]"
                  style={{ filter: 'drop-shadow(0 0 8px #ff660060)' }}
                />
                
                {/* Others combined (15.9%) - Mixed Colors */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#8b949e"
                  strokeWidth="20"
                  strokeDasharray="61.3 378.7"
                  strokeDashoffset="-379"
                  className="opacity-0 animate-[segmentDraw_1.5s_ease-out_3s_forwards]"
                  style={{ filter: 'drop-shadow(0 0 8px #8b949e40)' }}
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 animate-[fadeIn_1s_ease-out_4s_forwards]">
                <div className="text-xl font-bold text-white">
                  {showBalance ? getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.51) : '****'}
                </div>
                <div className="text-xs text-gray-400">Total Value</div>
              </div>
            </div>
            
            {/* Enhanced connecting lines with authentic colors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
              {/* Bitcoin line - Authentic Orange */}
              <line 
                x1="243" y1="160" x2="300" y2="160" 
                stroke="#f7931a" 
                strokeWidth="3" 
                strokeDasharray="6,3"
                className="opacity-0 animate-[lineAppear_0.8s_ease-out_4.5s_forwards]"
                style={{ filter: 'drop-shadow(0 0 4px #f7931a80)' }}
              />
              
              {/* Ethereum line - Authentic Blue */}
              <line 
                x1="118" y1="242" x2="65" y2="295" 
                stroke="#627eea" 
                strokeWidth="3" 
                strokeDasharray="6,3"
                className="opacity-0 animate-[lineAppear_0.8s_ease-out_5s_forwards]"
                style={{ filter: 'drop-shadow(0 0 4px #627eea80)' }}
              />
              
              {/* Litecoin line - Authentic Silver */}
              <line 
                x1="77" y1="160" x2="20" y2="160" 
                stroke="#bfbbbb" 
                strokeWidth="3" 
                strokeDasharray="6,3"
                className="opacity-0 animate-[lineAppear_0.8s_ease-out_5.5s_forwards]"
                style={{ filter: 'drop-shadow(0 0 4px #bfbbbb80)' }}
              />
              
              {/* IOTA line - Authentic Dark Blue */}
              <line 
                x1="105" y1="105" x2="60" y2="60" 
                stroke="#131f37" 
                strokeWidth="3" 
                strokeDasharray="6,3"
                className="opacity-0 animate-[lineAppear_0.8s_ease-out_6s_forwards]"
                style={{ filter: 'drop-shadow(0 0 4px #131f3780)' }}
              />
              
              {/* Monero line - Authentic Orange-Red */}
              <line 
                x1="160" y1="77" x2="160" y2="20" 
                stroke="#ff6600" 
                strokeWidth="3" 
                strokeDasharray="6,3"
                className="opacity-0 animate-[lineAppear_0.8s_ease-out_6.5s_forwards]"
                style={{ filter: 'drop-shadow(0 0 4px #ff660080)' }}
              />
              
              {/* Others line - Mixed Gray */}
              <line 
                x1="225" y1="105" x2="280" y2="65" 
                stroke="#8b949e" 
                strokeWidth="3" 
                strokeDasharray="6,3"
                className="opacity-0 animate-[lineAppear_0.8s_ease-out_7s_forwards]"
                style={{ filter: 'drop-shadow(0 0 4px #8b949e80)' }}
              />
            </svg>
            
            {/* Crypto labels with authentic colors */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-right opacity-0 animate-[labelSlide_0.6s_ease-out_4.5s_forwards]">
              <div className="text-sm font-bold" style={{ color: '#f7931a' }}>Bitcoin</div>
              <div className="text-white text-xs">49.5%</div>
            </div>
            
            <div className="absolute left-4 bottom-4 opacity-0 animate-[labelSlide_0.6s_ease-out_5s_forwards]">
              <div className="text-sm font-bold" style={{ color: '#627eea' }}>Ethereum</div>
              <div className="text-white text-xs">24.5%</div>
            </div>
            
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 opacity-0 animate-[labelSlide_0.6s_ease-out_5.5s_forwards]">
              <div className="text-sm font-bold" style={{ color: '#bfbbbb' }}>Litecoin</div>
              <div className="text-white text-xs">4.7%</div>
            </div>
            
            <div className="absolute left-4 top-4 opacity-0 animate-[labelSlide_0.6s_ease-out_6s_forwards]">
              <div className="text-sm font-bold" style={{ color: '#131f37' }}>IOTA</div>
              <div className="text-white text-xs">4.3%</div>
            </div>
            
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-center opacity-0 animate-[labelSlide_0.6s_ease-out_6.5s_forwards]">
              <div className="text-sm font-bold" style={{ color: '#ff6600' }}>Monero</div>
              <div className="text-white text-xs">3.1%</div>
            </div>
            
            <div className="absolute right-4 top-4 text-right opacity-0 animate-[labelSlide_0.6s_ease-out_7s_forwards]">
              <div className="text-sm font-bold" style={{ color: '#8b949e' }}>Others</div>
              <div className="text-white text-xs">15.9%</div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">24h Change</div>
            <div className="text-green-500 text-lg font-bold">+2.4%</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Total Profit</div>
            <div className="text-orange-500 text-lg font-bold">
              {showBalance ? '+' + getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.12) : '+***'}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSelectMethod={handlePaymentMethodSelect}
      />

      <ComingSoonModal
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        feature={comingSoonFeature}
      />
    </MobileLayout>
  );
}