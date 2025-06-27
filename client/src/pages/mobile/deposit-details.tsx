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
      <div className="px-4 pt-8 pb-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Quantity</p>
          <h2 className="text-white text-2xl font-bold mb-3">
            {transaction.cryptoAmount.toFixed(8)} {transaction.cryptoSymbol}
          </h2>
          <div className="flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-green-400 text-sm font-medium">Succeeded</span>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="px-4 space-y-6">
        {/* Deposit Account Row */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Deposit Account</span>
          <span className="text-white text-sm">Funding Account</span>
        </div>

        {/* Chain Type Row */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Chain Type</span>
          <span className="text-white text-sm font-medium">
            {transaction.chainType} ({transaction.chainType === 'BEP-20' ? 'BEP20' : transaction.chainType})
          </span>
        </div>

        {/* Time Row */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Time</span>
          <span className="text-white text-sm">
            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>

        {/* Deposit Address Row */}
        <div className="flex justify-between items-start">
          <span className="text-gray-400 text-sm">Deposit Address</span>
          <div className="flex items-start space-x-2 max-w-[60%]">
            <span className="text-white text-sm break-all text-right">
              {transaction.senderAddress}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-gray-400 hover:text-white flex-shrink-0"
              onClick={() => copyToClipboard(transaction.senderAddress)}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* USD Amount Row (Additional Info) */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <span className="text-gray-400 text-sm">USD Value</span>
          <span className="text-green-400 text-sm font-medium">
            ${transaction.usdAmount.toFixed(2)}
          </span>
        </div>

        {/* Network Row (Additional Info) */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Network</span>
          <span className="text-blue-400 text-sm">
            {transaction.networkName}
          </span>
        </div>

        {/* Crypto Price Row (Additional Info) */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Price at Transaction</span>
          <span className="text-white text-sm">
            ${transaction.cryptoPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}