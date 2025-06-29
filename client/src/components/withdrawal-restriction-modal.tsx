import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

interface WithdrawalRestrictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minimumRequired: number;
  totalDeposited: number;
  shortfall: number;
}

export function WithdrawalRestrictionModal({
  open,
  onOpenChange,
  minimumRequired,
  totalDeposited,
  shortfall
}: WithdrawalRestrictionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a40] border border-orange-500/30 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            Withdrawal Restricted
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-300 text-base leading-relaxed">
            You need to make a first deposit of ${minimumRequired.toLocaleString()}
          </p>
          
          <p className="text-xs text-gray-500">
            This requirement helps protect your account and ensures compliance with financial regulations.
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-gray-600 text-white hover:bg-gray-700"
          >
            Understood
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              // Navigate to deposit (parent component should handle this)
              window.location.href = '#deposit';
            }}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Make Deposit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}