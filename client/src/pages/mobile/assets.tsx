import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DepositModal } from '@/components/deposit-modal';
import { CryptoSelectionModal } from '@/components/crypto-selection-modal';
import { ChainSelectionModal } from '@/components/chain-selection-modal';
import { AddressDisplay } from '@/components/address-display';
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
  X
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function MobileAssets() {
  const [showBalance, setShowBalance] = useState(true);
  const [showPromoCard, setShowPromoCard] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [cryptoSelectionOpen, setCryptoSelectionOpen] = useState(false);
  const [chainSelectionOpen, setChainSelectionOpen] = useState(false);
  const [addressDisplayOpen, setAddressDisplayOpen] = useState(false);
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
      setCryptoSelectionOpen(true);
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
    setCryptoSelectionOpen(false);
    setChainSelectionOpen(true);
  };

  const handleChainSelect = (chain: string) => {
    setSelectedChain(chain);
    setChainSelectionOpen(false);
    setAddressDisplayOpen(true);
  };

  const handleBackFromChain = () => {
    setChainSelectionOpen(false);
    setCryptoSelectionOpen(true);
  };

  const handleBackFromAddress = () => {
    setAddressDisplayOpen(false);
    setChainSelectionOpen(true);
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">My Assets</h1>
        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 grid grid-cols-2 gap-px">
            <div className="bg-gray-400 rounded-sm"></div>
            <div className="bg-gray-400 rounded-sm"></div>
            <div className="bg-gray-400 rounded-sm"></div>
            <div className="bg-gray-400 rounded-sm"></div>
          </div>
        </div>
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
          <button className="pb-3 border-b-2 border-orange-500 text-orange-500 font-medium">
            Account
          </button>
          <button className="pb-3 text-gray-400">
            Asset
          </button>
        </div>
      </div>

      {/* Account Balance Cards */}
      <div className="px-4 space-y-3 pb-6">
        <Link href="/mobile/funding">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Funding</div>
                <div className="text-white text-lg font-bold">
                  {showBalance ? '0.51' : '****'} 
                  <span className="text-sm font-normal ml-1">USD</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </Link>

        <Link href="/mobile/unified-trading">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Unified Trading</div>
                <div className="text-white text-lg font-bold">
                  {showBalance ? '0.00' : '****'} 
                  <span className="text-sm font-normal ml-1">USD</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Asset List */}
      <div className="px-4">
        <h3 className="text-white font-medium mb-4">Assets</h3>
        
        {/* Bitcoin */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </div>
            <div>
              <div className="text-white font-medium">BTC</div>
              <div className="text-gray-400 text-sm">Bitcoin</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-medium">
              {showBalance ? '0.00000484' : '****'}
            </div>
            <div className="text-gray-400 text-sm">
              ≈ ${showBalance ? '0.51' : '***'}
            </div>
          </div>
        </div>

        {/* USDT */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">₮</span>
            </div>
            <div>
              <div className="text-white font-medium">USDT</div>
              <div className="text-gray-400 text-sm">Tether</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-medium">
              {showBalance ? '0.00' : '****'}
            </div>
            <div className="text-gray-400 text-sm">
              ≈ ${showBalance ? '0.00' : '***'}
            </div>
          </div>
        </div>

        {/* ETH */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">Ξ</span>
            </div>
            <div>
              <div className="text-white font-medium">ETH</div>
              <div className="text-gray-400 text-sm">Ethereum</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-medium">
              {showBalance ? '0.00' : '****'}
            </div>
            <div className="text-gray-400 text-sm">
              ≈ ${showBalance ? '0.00' : '***'}
            </div>
          </div>
        </div>
      </div>

      {/* Conditional rendering for different screens */}
      {addressDisplayOpen ? (
        <AddressDisplay
          onBack={handleBackFromAddress}
          selectedCrypto={selectedCrypto}
          selectedChain={selectedChain}
        />
      ) : (
        <>
          {/* Deposit Flow Modals */}
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            onSelectMethod={handlePaymentMethodSelect}
          />

          <CryptoSelectionModal
            isOpen={cryptoSelectionOpen}
            onClose={() => setCryptoSelectionOpen(false)}
            onSelectCrypto={handleCryptoSelect}
          />

          <ChainSelectionModal
            isOpen={chainSelectionOpen}
            onClose={() => setChainSelectionOpen(false)}
            onBack={handleBackFromChain}
            selectedCrypto={selectedCrypto}
            onSelectChain={handleChainSelect}
          />

          <ComingSoonModal
            isOpen={comingSoonOpen}
            onClose={() => setComingSoonOpen(false)}
            feature={comingSoonFeature}
          />
        </>
      )}
    </MobileLayout>
  );
}