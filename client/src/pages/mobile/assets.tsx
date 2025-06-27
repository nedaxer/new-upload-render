import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DepositModal } from '@/components/deposit-modal';
import { CryptoSelection } from '@/pages/mobile/crypto-selection';
import { NetworkSelection } from '@/pages/mobile/network-selection';
import { AddressDisplay } from '@/pages/mobile/address-display';
import CurrencySelection from '@/pages/mobile/currency-selection';
import { ComingSoonModal } from '@/components/coming-soon-modal';
import { PullToRefresh } from '@/components/pull-to-refresh';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/hooks/use-auth';
import advancedChartsVideo from '@/assets/advanced-charts-video.mp4';

export default function MobileAssets() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { getBackgroundClass, getTextClass, getCardClass, getBorderClass } = useTheme();
  const queryClient = useQueryClient();
  const [showBalance, setShowBalance] = useState(true);
  const [showPromoCard, setShowPromoCard] = useState(true);
  const [currentView, setCurrentView] = useState('assets'); // 'assets', 'crypto-selection', 'network-selection', 'address-display', 'currency-selection'
  const [activeTab, setActiveTab] = useState('assets'); // Only 'assets' tab now
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

  // Fetch user wallet summary for real-time balance
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet/summary'],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data fresh for 25 seconds
    retry: 2,
  });

  // Fetch real-time price data for BTC conversion
  const { data: priceData, isLoading: priceLoading } = useQuery({
    queryKey: ['/api/crypto/realtime-prices'],
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data fresh for 25 seconds
    retry: 2,
  });

  // Fetch real-time currency conversion rates from internal API
  const { data: conversionData } = useQuery({
    queryKey: ['/api/market-data/conversion-rates'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/market-data/conversion-rates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        throw error;
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data fresh for 4 minutes
    retry: 2,
    retryDelay: 2000
  });

  // Use real exchange rates or fallback to static rates
  const conversionRates = conversionData?.data || {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.50,
    'CAD': 1.36,
    'AUD': 1.52,
    'CHF': 0.88,
    'CNY': 7.24,
    'INR': 83.25,
    'KRW': 1310,
    'BRL': 5.95,
    'MXN': 17.15,
    'RUB': 92.50,
    'SGD': 1.34,
    'HKD': 7.83,
    'NOK': 10.95,
    'SEK': 10.85,
    'DKK': 6.87,
    'PLN': 4.05,
    'CZK': 22.85,
    'HUF': 360,
    'RON': 4.58,
    'BGN': 1.80,
    'TRY': 29.45,
    'ZAR': 18.75,
    'EGP': 30.85,
    'MAD': 10.15,
    'NGN': 775,
    'KES': 155,
    'UGX': 3750,
    'AED': 3.67,
    'SAR': 3.75,
    'QAR': 3.64,
    'KWD': 0.31,
    'BHD': 0.377,
    'OMR': 0.385,
    'ILS': 3.65,
    'PKR': 278,
    'BDT': 119,
    'VND': 24350,
    'THB': 35.25,
    'MYR': 4.65,
    'IDR': 15850,
    'PHP': 55.75,
    'TWD': 31.85,
    'MOP': 8.08,
    'NZD': 1.68
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

  // Get currency symbol - returns empty string to show only numbers
  const getCurrencySymbol = (currency: string): string => {
    return '';
  };

  // Get BTC price for USD to BTC conversion
  const getBTCPrice = () => {
    if (!priceData?.data || !Array.isArray(priceData.data)) return 0;
    const btcTicker = priceData.data.find((ticker: any) => ticker.symbol === 'BTCUSDT');
    return btcTicker ? parseFloat(btcTicker.price) : 45000; // Fallback to 45k if not found
  };

  // Get user's USD balance
  const getUserUSDBalance = () => {
    return walletData?.data?.usdBalance || 0;
  };

  // Convert USD to BTC
  const convertUSDToBTC = (usdAmount: number) => {
    const btcPrice = getBTCPrice();
    if (btcPrice === 0) return 0;
    return usdAmount / btcPrice;
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

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/crypto/realtime-prices'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/balances'] })
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
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
      <PullToRefresh onRefresh={handleRefresh}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <h1 className="text-xl font-bold text-white">My Assets</h1>
        <button onClick={handleQRScan} className="w-8 h-8 bg-[#0b0b30] rounded-lg flex items-center justify-center">
          <QrCode className="w-4 h-4 text-gray-400" />
        </button>
      </div>



      {/* Total Assets */}
      <div className="px-4 pb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-gray-400 text-sm">Total Assets</span>
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
                user ? `${getCurrencySymbol(selectedCurrency)}${parseFloat(convertToSelectedCurrency(getUserUSDBalance())).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${getCurrencySymbol(selectedCurrency)}0.00`
              ) : '****'}
            </span>
            <button 
              onClick={() => setCurrentView('currency-selection')}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              <span>{selectedCurrency}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>≈ {showBalance ? 
              (user ? convertUSDToBTC(getUserUSDBalance()).toFixed(8) : '0.00000000') : 
              '********'
            } BTC</span>
          </div>
        </div>

        {/* Advanced Charts Video Background */}
        <div className="relative h-32 bg-blue-950 rounded-lg mb-4 overflow-hidden">
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
              <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center">
                <Wallet className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Deposit</span>
            </div>
          </button>
          
          <Link href="/mobile/withdraw">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center">
                <ArrowUp className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Withdraw</span>
            </div>
          </Link>
          
          <Link href="/mobile/transfer">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center">
                <ArrowDownUp className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Transfer</span>
            </div>
          </Link>
          
          <Link href="/mobile/assets-history">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">History</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Portfolio Circle Chart */}
      <div className="px-4">
        <h3 className="text-white font-medium mb-6 text-sm">Portfolio Distribution</h3>
        
        {/* Circular Portfolio Chart */}
        <div className="relative flex flex-col items-center mb-8">
          {/* Donut Chart Container */}
          <div className="relative w-80 h-80 mb-6">
            {/* Authentic Crypto Color Donut Chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                <defs>
                  {/* Authentic crypto gradients */}
                  <linearGradient id="bitcoinAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f7931a" />
                    <stop offset="100%" stopColor="#ff8c00" />
                  </linearGradient>
                  <linearGradient id="ethereumAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#627eea" />
                    <stop offset="100%" stopColor="#4169e1" />
                  </linearGradient>
                  <linearGradient id="litecoinAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#bfbbbb" />
                    <stop offset="100%" stopColor="#a6a6a6" />
                  </linearGradient>
                  <linearGradient id="iotaAuth" x1="0%" y1="0%" x2="100%" y2="100%">
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
                  {showBalance ? getCurrencySymbol(selectedCurrency) + parseFloat(convertToSelectedCurrency(0.51)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '****'}
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
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">24h Change</div>
            <div className="text-green-500 text-lg font-bold">+2.4%</div>
          </div>
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Total Profit</div>
            <div className="text-orange-500 text-lg font-bold">
              {showBalance ? '+' + getCurrencySymbol(selectedCurrency) + parseFloat(convertToSelectedCurrency(0.12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '+***'}
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
      </PullToRefresh>
    </MobileLayout>
  );
}