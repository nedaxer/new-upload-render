import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, X } from 'lucide-react';
import { useState } from 'react';

interface ChainSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedCrypto: string;
  onSelectChain: (chain: string) => void;
}

const chainOptions = {
  'USDT': [
    { chain: 'ERC20', name: 'Ethereum', completions: '60 confirmations', isRecommended: false },
    { chain: 'TRC20', name: 'TRON', completions: '19 confirmations', isRecommended: false },
    { chain: 'BSC(BEP-20)', name: 'BNB Smart Chain', completions: '15 confirmations', isRecommended: true }
  ],
  'BTC': [
    { chain: 'BTC', name: 'Bitcoin', completions: '2 confirmations', isRecommended: true }
  ],
  'ETH': [
    { chain: 'ETH', name: 'Ethereum', completions: '12 confirmations', isRecommended: true },
    { chain: 'ETH(BEP-20)', name: 'BNB Smart Chain', completions: '15 confirmations', isRecommended: false }
  ],
  'BEP-20': [
    { chain: 'BEP-20', name: 'BNB Smart Chain', completions: '15 confirmations', isRecommended: true }
  ]
};

export function ChainSelectionModal({ isOpen, onClose, onBack, selectedCrypto, onSelectChain }: ChainSelectionModalProps) {
  const chains = chainOptions[selectedCrypto as keyof typeof chainOptions] || [];

  const getCryptoIcon = (crypto: string) => {
    switch (crypto) {
      case 'USDT':
        return '/src/assets/crypto-logos/usdt-logo.svg';
      case 'BTC':
        return '/src/assets/crypto-logos/btc-logo.svg';
      case 'ETH':
        return '/src/assets/crypto-logos/eth-logo.svg';
      case 'BEP-20':
        return '/src/assets/crypto-logos/bnb-logo.svg';
      default:
        return '/src/assets/crypto-logos/btc-logo.svg';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
                <img 
                  src={getCryptoIcon(selectedCrypto)} 
                  alt={selectedCrypto}
                  className="w-4 h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-bold text-white">${selectedCrypto.charAt(0)}</span>`;
                  }}
                />
              </div>
              <DialogTitle className="text-lg font-semibold">{selectedCrypto}-Deposit</DialogTitle>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        
        <div className="space-y-4">
          <h3 className="text-white font-medium text-lg">Choose a Chain Type</h3>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-gray-300 text-sm">
                Make sure that the chain type you make deposits to is the one you make withdrawals from.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {chains.map((chain, index) => (
              <button
                key={index}
                onClick={() => onSelectChain(chain.chain)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <img 
                      src={getCryptoIcon(selectedCrypto)} 
                      alt={chain.chain}
                      className="w-6 h-6"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-bold text-white">${chain.chain.charAt(0)}</span>`;
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{chain.chain}</span>
                      {chain.isRecommended && (
                        <span className="bg-orange-600 text-orange-100 text-xs px-2 py-1 rounded">
                          Recently Used
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">Deposit Completion: {chain.completions}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}