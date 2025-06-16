import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DepositModal } from '@/components/deposit-modal';
import { CryptoSelection } from '@/pages/mobile/crypto-selection';
import { NetworkSelection } from '@/pages/mobile/network-selection';
import { AddressDisplay } from '@/pages/mobile/address-display';
import CurrencySelection from '@/pages/mobile/currency-selection';
import { ComingSoonModal } from '@/components/coming-soon-modal';
import { 
  Search, 
  Bell, 
  Headphones, 
  ChevronDown, 
  Eye, 
  EyeOff,
  Wallet,
  ArrowUp,
  ArrowDownUp,
  CreditCard,
  Gift,
  Users,
  MessageSquare,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  User,
  QrCode
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function MobileHome() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Exchange');
  const [currentView, setCurrentView] = useState('home'); // 'home', 'crypto-selection', 'network-selection', 'address-display', 'currency-selection'
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Load profile picture and currency from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('profilePicture');
    if (saved) {
      setProfilePicture(saved);
    }

    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Fetch real-time price data
  const { data: priceData } = useQuery({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch currency conversion rates
  const { data: conversionData } = useQuery({
    queryKey: ['conversion-rates'],
    queryFn: () => apiRequest('/api/market-data/conversion-rates'),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const conversionRates = conversionData?.data || {
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
    const rate = conversionRates[selectedCurrency] || 1;
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

  // Fetch notification count
  const { data: notificationData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => apiRequest('/api/users/notifications/count'),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

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

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCrypto('');
    setSelectedChain('');
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setCurrentView('home');
  };

  const quickActions = [
    { name: 'Nedaxer Earn', icon: Gift, color: 'text-yellow-500', href: '/mobile/earn' },
    { name: 'Invite Friends', icon: Users, color: 'text-green-500', href: '/mobile/invite-friends' }
  ];

  // Generate crypto pairs from real price data
  const cryptoPairs = React.useMemo(() => {
    if (!priceData || !Array.isArray(priceData)) {
      return [];
    }

    return priceData.slice(0, 4).map((crypto: any, index: number) => ({
      pair: `${crypto.symbol?.toUpperCase() || 'BTC'}/USDT`,
      price: crypto.current_price?.toLocaleString('en-US', { 
        minimumFractionDigits: crypto.current_price < 1 ? 6 : 2,
        maximumFractionDigits: crypto.current_price < 1 ? 6 : 2 
      }) || '0',
      change: `${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h?.toFixed(2) || '0.00'}%`,
      isPositive: crypto.price_change_percentage_24h > 0,
      favorite: index === 0
    }));
  }, [priceData]);

  const marketTabs = ['Favorites', 'Hot', 'New', 'Gainers', 'Losers', 'Turnover'];

  // Show different views based on current state
  if (currentView === 'crypto-selection') {
    return (
      <CryptoSelection
        onBack={handleBackToHome}
        onSelectCrypto={handleCryptoSelect}
        onComingSoon={(feature: string) => {
          setComingSoonFeature(feature);
          setComingSoonOpen(true);
        }}
      />
    );
  }

  if (currentView === 'network-selection') {
    return (
      <NetworkSelection
        selectedCrypto={selectedCrypto}
        onBack={() => setCurrentView('crypto-selection')}
        onSelectChain={handleChainSelect}
      />
    );
  }

  if (currentView === 'address-display') {
    return (
      <AddressDisplay
        selectedCrypto={selectedCrypto}
        selectedChain={selectedChain}
        onBack={() => setCurrentView('network-selection')}
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

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <Link href="/mobile/profile">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-300" />
              )}
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/mobile/chatbot">
            <Headphones className="w-6 h-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
          </Link>
          <Link href="/mobile/notifications">
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
              {notificationData?.data?.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">
                    {notificationData.data.unreadCount > 9 ? '9+' : notificationData.data.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="BDXN/USDT"
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button onClick={handleQRScan} className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
              <QrCode className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Total Assets</span>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <Eye className="w-4 h-4 text-gray-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <Button 
            onClick={handleDepositClick}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6"
          >
            Deposit
          </Button>
        </div>

        <div className="mb-2">
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

        {/* Promotional Banner */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-orange-500" />
              <span className="text-white">Apply Now!</span>
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="flex flex-col items-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-xs text-gray-300 text-center">{action.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Market Tabs */}
      <div className="px-4">
        <div className="flex space-x-4 mb-4 overflow-x-auto scrollbar-hide">
          {marketTabs.map((tab) => (
            <button 
              key={tab}
              className={`whitespace-nowrap pb-2 ${
                tab === 'Favorites' 
                  ? 'text-orange-500 border-b-2 border-orange-500' 
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex space-x-4 mb-4">
          <button className="text-orange-500 border-b-2 border-orange-500 pb-2 font-medium">
            Spot
          </button>
          <button className="text-gray-400 pb-2">
            Derivatives
          </button>
        </div>

        {/* Crypto Pairs List */}
        <div className="space-y-4">
          {cryptoPairs.map((crypto, index) => (
            <Link key={index} href="/mobile/trade">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {crypto.favorite && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                    <span className="text-white font-medium">{crypto.pair}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{crypto.price}</div>
                  <div className={`text-sm flex items-center space-x-1 ${
                    crypto.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {crypto.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{crypto.change}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSelectMethod={handlePaymentMethodSelect}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        feature={comingSoonFeature}
      />
    </MobileLayout>
  );
}