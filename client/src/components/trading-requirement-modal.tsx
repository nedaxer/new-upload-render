import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TradingRequirementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minimumRequired?: number;
  onMakeDeposit: () => void;
}

export function TradingRequirementModal({
  open,
  onOpenChange,
  minimumRequired = 500,
  onMakeDeposit
}: TradingRequirementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a40] border border-orange-500/30 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            Deposit Required to Trade
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-300 text-base leading-relaxed">
            You need to make a deposit of at least ${minimumRequired.toLocaleString()} before you can access our trading features.
          </p>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 space-y-2">
            <h4 className="text-orange-400 font-medium text-sm">What you'll get access to:</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Spot Trading</li>
              <li>• Futures Trading</li>
              <li>• Staking Features</li>
              <li>• Portfolio Management</li>
              <li>• Advanced Trading Tools</li>
            </ul>
          </div>
          
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
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onMakeDeposit();
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