import { Link, useParams } from 'wouter';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Crypto logos
const btcLogo = '/logos/btc-logo.svg';
const ethLogo = '/logos/eth-logo.svg';
const usdtLogo = '/logos/usdt-logo.svg';
const bnbLogo = '/logos/bnb-logo.svg';

const getCryptoLogo = (symbol: string): string | null => {
  switch (symbol.toLowerCase()) {
    case 'btc':
    case 'bitcoin':
      return btcLogo;
    case 'eth':
    case 'ethereum':
      return ethLogo;
    case 'usdt':
    case 'tether':
      return usdtLogo;
    case 'bnb':
      return bnbLogo;
    default:
      return null;
  }
};

const generateLongTransactionId = (shortId: string): string => {
  // Generate a long transaction ID that looks like a crypto address
  const prefix = "0x126975caaf44D603307a95E2d26";
  const suffix = "70F6Ef46e563C";
  return `${prefix}${shortId.slice(-8).toUpperCase()}${suffix}`;
};

export default function DepositDetails() {
  const { transactionId } = useParams();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch transaction details
  const { data: transactionResponse, isLoading, error } = useQuery({
    queryKey: [`/api/deposits/details/${transactionId}`],
    enabled: !!transactionId,
  });

  const transaction = transactionResponse?.data;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
        variant: "default",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a2e] text-white">
        <div className="flex items-center justify-between p-4">
          <Link href="/mobile/assets-history">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-semibold">Deposit Details</h1>
          <div className="w-6 h-6" />
        </div>
        
        <div className="px-4 pt-8">
          <Card className="bg-[#1a1a40] border-[#2a2a50] p-6 animate-pulse">
            <div className="text-center space-y-4">
              <div className="h-6 bg-gray-700 rounded w-32 mx-auto"></div>
              <div className="h-8 bg-gray-700 rounded w-48 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-24 mx-auto"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-[#0a0a2e] text-white">
        <div className="flex items-center justify-between p-4">
          <Link href="/mobile/assets-history">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-semibold">Deposit Details</h1>
          <div className="w-6 h-6" />
        </div>
        
        <div className="px-4 pt-8">
          <div className="text-center">
            <p className="text-gray-400">Transaction not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/mobile/assets-history">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">Deposit Details</h1>
        <div className="w-6 h-6" />
      </div>

      {/* Amount Section */}
      <div className="px-4 pt-12 pb-12">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">Amount</p>
          <h2 className="text-white text-3xl font-bold mb-6">
            +{transaction.cryptoAmount.toFixed(8)} {transaction.cryptoSymbol}
          </h2>
          <div className="flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-400 text-base font-medium">Succeeded</span>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="px-4 space-y-8">
        {/* Status Row */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-base">Status</span>
          <span className="text-white text-base">Succeeded</span>
        </div>

        {/* Transaction ID Row */}
        <div className="flex justify-between items-start">
          <span className="text-gray-400 text-base">Transaction ID</span>
          <div className="flex items-center ml-4">
            <span className="text-white text-base font-mono text-right break-all">
              {generateLongTransactionId(transaction._id)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white ml-2 flex-shrink-0"
              onClick={() => copyToClipboard(generateLongTransactionId(transaction._id))}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Time Row */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-base">Time</span>
          <span className="text-white text-base">
            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </span>
        </div>

        {/* Reference Number Row */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-base">Reference no.</span>
          <div className="flex items-center">
            <span className="text-white text-base font-mono">
              {transaction._id.slice(-10)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white ml-2"
              onClick={() => copyToClipboard(transaction._id.slice(-10))}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}