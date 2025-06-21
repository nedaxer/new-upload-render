import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface DepositDetail {
  id: number;
  quantity: number;
  cryptoSymbol: string;
  status: string;
  depositAccount: string;
  fundingAccount: string;
  chainType: string;
  time: string;
  depositAddress: string;
  transactionHash: string;
}

export default function DepositDetailsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Extract transaction ID from URL
  const pathParts = window.location.pathname.split('/');
  const transactionId = pathParts[pathParts.length - 1];

  // Mock deposit details based on the uploaded image
  const depositDetails: DepositDetail = {
    id: parseInt(transactionId) || 1,
    quantity: 0.00399334,
    cryptoSymbol: 'BNB',
    status: 'Succeeded',
    depositAccount: 'Spot Wallet',
    fundingAccount: 'Funding Account',
    chainType: 'BSC (BEP20)',
    time: '2025-06-15 03:57:28',
    depositAddress: '0x632b2c9287041d24cbd121054c077622194a50',
    transactionHash: '0x2deb52edc7d370d5367f53a4b851dd9462cd17f1dfba4cb65914dffd080c0b81'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${label} copied to clipboard`,
        variant: "default",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/mobile/asset-history')}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Deposit Details</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Quantity Section */}
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm mb-2">Quantity</div>
          <div className="text-white text-4xl font-bold mb-4">
            {depositDetails.quantity.toFixed(8)} {depositDetails.cryptoSymbol}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-medium">{depositDetails.status}</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          {/* Deposit Account */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-400">Deposit Account</span>
            <span className="text-white">{depositDetails.depositAccount}</span>
          </div>

          {/* Funding Account */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-400">Funding Account</span>
            <span className="text-white">{depositDetails.fundingAccount}</span>
          </div>

          {/* Chain Type */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-400">Chain Type</span>
            <span className="text-white font-medium">{depositDetails.chainType}</span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-400">Time</span>
            <span className="text-white">{depositDetails.time}</span>
          </div>

          {/* Deposit Address */}
          <div className="py-3 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Deposit Address</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(depositDetails.depositAddress, 'Deposit address')}
                className="text-gray-400 hover:text-white p-1"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-white font-mono text-sm break-all">
              {depositDetails.depositAddress}
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Transaction Hash</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(depositDetails.transactionHash, 'Transaction hash')}
                className="text-gray-400 hover:text-white p-1"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-white font-mono text-sm break-all">
              {depositDetails.transactionHash}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <Card className="bg-gray-900 border-gray-800 p-4 mt-6">
          <div className="text-center text-gray-400 text-sm">
            <div className="mb-2">Transaction successfully processed</div>
            <div>Funds have been credited to your {depositDetails.depositAccount}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}