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
import advancedChartsVideo from '@/assets/advanced-charts-video.mp4';

export default function MobileAssets() {
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
              {showBalance ? convertToSelectedCurrency(0.51) : '****'}
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
            <span>≈ {showBalance ? '0.00000484' : '****'} BTC</span>
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
                <ArrowUp className="w-7 h-7 text-blue-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Withdraw</span>
            </div>
          </Link>
          
          <Link href="/mobile/transfer">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                <ArrowDownUp className="w-7 h-7 text-green-500" />
              </div>
              <span className="text-xs text-gray-300 text-center">Transfer</span>
            </div>
          </Link>
          
          <Link href="/mobile/convert">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                <ArrowDownUp className="w-7 h-7 text-purple-500 transform rotate-45" />
              </div>
              <span className="text-xs text-gray-300 text-center">Convert</span>
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
            {/* Animated SVG Donut Chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                <defs>
                  {/* Gradients for better visual appeal */}
                  <linearGradient id="bitcoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="ethereumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6b7280" />
                    <stop offset="100%" stopColor="#4b5563" />
                  </linearGradient>
                  <linearGradient id="litecoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                
                {/* Background circle */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#374151" strokeWidth="20" opacity="0.3" />
                
                {/* Bitcoin segment (49.5%) - from 0° to 178° */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#bitcoinGrad)"
                  strokeWidth="20"
                  strokeDasharray="217.5 222.5"
                  strokeDashoffset="0"
                  className="animate-[drawSegment_2s_ease-out_0.2s_both]"
                  style={{ filter: 'drop-shadow(0 0 8px #f59e0b50)' }}
                />
                
                {/* Ethereum segment (24.5%) - from 178° to 266° */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#ethereumGrad)"
                  strokeWidth="20"
                  strokeDasharray="107.8 332.2"
                  strokeDashoffset="-217.5"
                  className="animate-[drawSegment_2s_ease-out_0.6s_both]"
                  style={{ filter: 'drop-shadow(0 0 8px #6b728050)' }}
                />
                
                {/* Litecoin segment (4.7%) - from 266° to 283° */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#litecoinGrad)"
                  strokeWidth="20"
                  strokeDasharray="20.7 419.3"
                  strokeDashoffset="-325.3"
                  className="animate-[drawSegment_2s_ease-out_1.0s_both]"
                  style={{ filter: 'drop-shadow(0 0 8px #10b98150)' }}
                />
                
                {/* IOTA segment (4.3%) - from 283° to 298° */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="20"
                  strokeDasharray="18.9 421.1"
                  strokeDashoffset="-346"
                  className="animate-[drawSegment_2s_ease-out_1.4s_both]"
                  style={{ filter: 'drop-shadow(0 0 8px #a855f750)' }}
                />
                
                {/* Monero segment (3.1%) - from 298° to 309° */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray="13.6 426.4"
                  strokeDashoffset="-364.9"
                  className="animate-[drawSegment_2s_ease-out_1.8s_both]"
                  style={{ filter: 'drop-shadow(0 0 8px #ef444450)' }}
                />
                
                {/* Binance segment (2.1%) - from 309° to 317° */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="20"
                  strokeDasharray="9.2 430.8"
                  strokeDashoffset="-378.5"
                  className="animate-[drawSegment_2s_ease-out_2.2s_both]"
                  style={{ filter: 'drop-shadow(0 0 8px #eab30850)' }}
                />
                
                {/* Cardano and others combined (8.8%) - from 317° to 360° */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="20"
                  strokeDasharray="38.7 401.3"
                  strokeDashoffset="-387.7"
                  className="animate-[drawSegment_2s_ease-out_2.6s_both]"
                  style={{ filter: 'drop-shadow(0 0 8px #9ca3af50)' }}
                />
              </svg>
              
              {/* Center content with animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-[fadeInScale_1s_ease-out_3s_both]">
                <div className="text-xl font-bold text-white">
                  {showBalance ? getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.51) : '****'}
                </div>
                <div className="text-xs text-gray-400">Total Value</div>
              </div>
            </div>
            
            {/* Connecting lines with proper mathematical positioning */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
              {/* Bitcoin line - Right side (89° midpoint of 0-178°) */}
              <line 
                x1="240" y1="160" x2="290" y2="160" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeDasharray="4,2"
                className="animate-[drawLine_0.6s_ease-out_3.2s_both]"
              />
              
              {/* Ethereum line - Bottom left (222° midpoint of 178-266°) */}
              <line 
                x1="125" y1="235" x2="75" y2="285" 
                stroke="#6b7280" 
                strokeWidth="2" 
                strokeDasharray="4,2"
                className="animate-[drawLine_0.6s_ease-out_3.4s_both]"
              />
              
              {/* Litecoin line - Left side (274.5° midpoint of 266-283°) */}
              <line 
                x1="80" y1="160" x2="30" y2="160" 
                stroke="#10b981" 
                strokeWidth="2" 
                strokeDasharray="4,2"
                className="animate-[drawLine_0.6s_ease-out_3.6s_both]"
              />
              
              {/* IOTA line - Top left (290.5° midpoint of 283-298°) */}
              <line 
                x1="110" y1="110" x2="70" y2="70" 
                stroke="#a855f7" 
                strokeWidth="2" 
                strokeDasharray="4,2"
                className="animate-[drawLine_0.6s_ease-out_3.8s_both]"
              />
              
              {/* Monero line - Top (303.5° midpoint of 298-309°) */}
              <line 
                x1="160" y1="80" x2="160" y2="30" 
                stroke="#ef4444" 
                strokeWidth="2" 
                strokeDasharray="4,2"
                className="animate-[drawLine_0.6s_ease-out_4.0s_both]"
              />
              
              {/* Binance line - Top right (313° midpoint of 309-317°) */}
              <line 
                x1="210" y1="110" x2="250" y2="70" 
                stroke="#eab308" 
                strokeWidth="2" 
                strokeDasharray="4,2"
                className="animate-[drawLine_0.6s_ease-out_4.2s_both]"
              />
              
              {/* Others line - Right top (338.5° midpoint of 317-360°) */}
              <line 
                x1="240" y1="125" x2="290" y2="100" 
                stroke="#9ca3af" 
                strokeWidth="2" 
                strokeDasharray="4,2"
                className="animate-[drawLine_0.6s_ease-out_4.4s_both]"
              />
            </svg>
            
            {/* Labels positioned using mathematical angles */}
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-right animate-[slideInRight_0.5s_ease-out_3.2s_both]">
              <div className="text-orange-400 text-sm font-bold">Bitcoin</div>
              <div className="text-white text-xs opacity-90">49.5%</div>
            </div>
            
            <div className="absolute left-5 bottom-5 animate-[slideInUp_0.5s_ease-out_3.4s_both]">
              <div className="text-gray-300 text-sm font-bold">Ethereum</div>
              <div className="text-white text-xs opacity-90">24.5%</div>
            </div>
            
            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 animate-[slideInLeft_0.5s_ease-out_3.6s_both]">
              <div className="text-green-400 text-sm font-bold">Litecoin</div>
              <div className="text-white text-xs opacity-90">4.7%</div>
            </div>
            
            <div className="absolute left-5 top-5 animate-[slideInDown_0.5s_ease-out_3.8s_both]">
              <div className="text-purple-400 text-sm font-bold">IOTA</div>
              <div className="text-white text-xs opacity-90">4.3%</div>
            </div>
            
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-center animate-[slideInDown_0.5s_ease-out_4.0s_both]">
              <div className="text-red-400 text-sm font-bold">Monero</div>
              <div className="text-white text-xs opacity-90">3.1%</div>
            </div>
            
            <div className="absolute right-5 top-5 text-right animate-[slideInDown_0.5s_ease-out_4.2s_both]">
              <div className="text-yellow-400 text-sm font-bold">Binance</div>
              <div className="text-white text-xs opacity-90">2.1%</div>
            </div>
            
            <div className="absolute right-1 top-1/3 text-right animate-[slideInRight_0.5s_ease-out_4.4s_both]">
              <div className="text-gray-400 text-sm font-bold">Others</div>
              <div className="text-white text-xs opacity-90">11.8%</div>
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