import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CreditCard, ArrowDownUp, Wallet } from 'lucide-react';
import { useState } from 'react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: string) => void;
}

export function DepositModal({ isOpen, onClose, onSelectMethod }: DepositModalProps) {
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
      <DialogContent className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 text-white rounded-t-2xl z-50 max-h-[80vh] overflow-y-auto transform translate-y-0">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Select Payment Method</DialogTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {/* Buy Crypto with Fiat */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Buy Crypto with Fiat</h3>
            
            {/* Buy with USD */}
            <button 
              onClick={() => onSelectMethod('buy-usd')}
              className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 mb-3 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">Buy with USD</span>
                    <span className="bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Visa, Mastercard and JCB are supported</p>
                </div>
              </div>
            </button>

            {/* P2P Trading */}
            <button 
              onClick={() => onSelectMethod('p2p')}
              className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <ArrowDownUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-white font-medium">P2P Trading</span>
                  <p className="text-gray-400 text-sm">Bank of Georgia, Wise, Zelle and more</p>
                </div>
              </div>
            </button>
          </div>

          {/* Deposit with Crypto */}
          <div>
            <h3 className="text-white font-medium mb-3">Deposit with Crypto</h3>
            
            <button 
              onClick={() => onSelectMethod('crypto')}
              className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-white font-medium">Deposit Crypto</span>
                  <p className="text-gray-400 text-sm">Already have crypto? Deposit directly</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}