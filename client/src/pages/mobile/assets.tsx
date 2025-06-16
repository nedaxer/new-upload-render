import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DepositModal } from '@/components/deposit-modal';
import { CryptoSelection } from '@/pages/mobile/crypto-selection';
import { NetworkSelection } from '@/pages/mobile/network-selection';
import { AddressDisplay } from '@/pages/mobile/address-display';
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
  X,
  QrCode
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function MobileAssets() {
  const [showBalance, setShowBalance] = useState(true);
  const [showPromoCard, setShowPromoCard] = useState(true);
  const [currentView, setCurrentView] = useState('assets'); // 'assets', 'crypto-selection', 'network-selection', 'address-display'
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'assets'
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [selectedChain, setSelectedChain] = useState('');

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
              {showBalance ? '0.51' : '****'}
            </span>
            <span className="text-gray-400">USD</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>≈ {showBalance ? '0.00000484' : '****'} BTC</span>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="h-20 bg-gray-800 rounded-lg mb-4 flex items-center justify-end pr-4">
          <div className="text-orange-500">
            <svg width="120" height="40" viewBox="0 0 120 40">
              <path 
                d="M10,30 Q30,10 50,20 T90,15 L110,25" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
              />
            </svg>
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

      {/* Account Tabs */}
      <div className="px-4 pb-4">
        <div className="flex space-x-6 border-b border-gray-700">
          <button 
            onClick={() => setActiveTab('account')}
            className={`pb-3 font-medium text-sm ${
              activeTab === 'account' 
                ? 'border-b-2 border-orange-500 text-orange-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Account
          </button>
          <button 
            onClick={() => setActiveTab('assets')}
            className={`pb-3 font-medium text-sm ${
              activeTab === 'assets' 
                ? 'border-b-2 border-orange-500 text-orange-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Assets
          </button>
        </div>
      </div>



      {/* Content based on active tab */}
      {activeTab === 'account' && (
        <>
          {/* Account Balance Cards */}
          <div className="px-4 space-y-3 pb-6">
            <Link href="/mobile/funding">
              <Card className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Funding</div>
                    <div className="text-white text-lg font-bold">
                      {showBalance ? '0.51' : '****'}USD
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>

            <Link href="/mobile/unified">
              <Card className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Unified Trading</div>
                    <div className="text-white text-lg font-bold">
                      {showBalance ? '0.00' : '****'}USD
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          </div>
        </>
      )}

      {activeTab === 'assets' && (
        <div className="px-4">
          <h3 className="text-white font-medium mb-4 text-sm">Most Popular</h3>
          
          {/* Bitcoin */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <img src="/logos/btc-logo.svg" alt="BTC" className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-white font-medium text-sm">BTC</div>
                <div className="text-gray-400 text-xs">Bitcoin</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium text-sm">
                {showBalance ? '0.00000484' : '****'}
              </div>
              <div className="text-gray-400 text-xs">
                ≈ ${showBalance ? '0.51' : '***'}
              </div>
            </div>
          </div>

          {/* USDT */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <img src="/logos/usdt-logo.svg" alt="USDT" className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-white font-medium text-sm">USDT</div>
                <div className="text-gray-400 text-xs">Tether</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium text-sm">
                {showBalance ? '0.00' : '****'}
              </div>
              <div className="text-gray-400 text-xs">
                ≈ ${showBalance ? '0.00' : '***'}
              </div>
            </div>
          </div>

          {/* ETH */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <img src="/logos/eth-logo.svg" alt="ETH" className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-white font-medium text-sm">ETH</div>
                <div className="text-gray-400 text-xs">Ethereum</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium text-sm">
                {showBalance ? '0.00' : '****'}
              </div>
              <div className="text-gray-400 text-xs">
                ≈ ${showBalance ? '0.00' : '***'}
              </div>
            </div>
          </div>

          {/* BNB */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <img src="/logos/bnb-logo.svg" alt="BNB" className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-white font-medium text-sm">BNB</div>
                <div className="text-gray-400 text-xs">BNB</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium text-sm">
                {showBalance ? '0.00' : '****'}
              </div>
              <div className="text-gray-400 text-xs">
                ≈ ${showBalance ? '0.00' : '***'}
              </div>
            </div>
          </div>
        </div>
      )}

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