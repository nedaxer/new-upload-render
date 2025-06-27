import { Link, useParams } from 'wouter';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

      {/* Transaction Amount */}
      <div className="px-4 pt-4 pb-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-bold">
              {transaction.cryptoSymbol.charAt(0)}
            </span>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">
            +{transaction.cryptoAmount.toFixed(6)} {transaction.cryptoSymbol}
          </h2>
          <p className="text-gray-400 text-sm mb-2">
            ≈ ${transaction.usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-green-400 text-sm font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="px-4">
        <Card className="bg-[#1a1a40] border-[#2a2a50] p-4">
          <div className="space-y-3">
            {/* Transaction Info */}
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400 text-xs">Transaction ID</span>
              <span className="text-white text-xs font-mono">
                {transaction._id.slice(-8)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-xs">Network</span>
              <span className="text-blue-400 text-xs font-medium">
                {transaction.networkName}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-xs">Chain Type</span>
              <span className="text-white text-xs">
                {transaction.chainType}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-xs">Date & Time</span>
              <span className="text-white text-xs">
                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-xs">Price</span>
              <span className="text-white text-xs">
                ${transaction.cryptoPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Deposit Address */}
            <div className="py-2 border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs">Deposit Address</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(transaction.senderAddress)}
                >
                  {copied ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <span className="text-white text-xs font-mono break-all block">
                {transaction.senderAddress}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}