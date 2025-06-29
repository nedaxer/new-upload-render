import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from './deposit-modal';

interface TradingRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TradingRequirementModal({ isOpen, onClose }: TradingRequirementModalProps) {
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const handleDepositClick = () => {
    onClose();
    setDepositModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#0a0a2e] border-[#2a2a50] text-white max-w-sm mx-auto">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-lg font-semibold text-white">
              Trading Access Required
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300 text-sm">
              To access trading features, you need to meet our minimum deposit requirement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-[#1a1a40] p-4 rounded-lg border border-[#2a2a50]">
              <div className="flex items-center space-x-3 mb-3">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-white">Minimum Deposit</span>
              </div>
              <div className="text-2xl font-bold text-orange-500 mb-1">$500.00</div>
              <p className="text-xs text-gray-400">Required to unlock trading features</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-300">Secure and regulated platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-300">Access to all trading pairs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              onClick={handleDepositClick}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              Make Deposit
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-[#1a1a40]"
            >
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DepositModal 
        isOpen={depositModalOpen} 
        onClose={() => setDepositModalOpen(false)}
        onSelectMethod={() => {}}
      />
    </>
  );
}