import { Link, useParams } from 'wouter';
import { ArrowLeft, Copy, CheckCircle, TrendingUp, Clock, Shield, Hash, Network } from 'lucide-react';
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
  
  // Detect navigation context for back button
  const getBackNavigationPath = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    
    if (from === 'notifications') {
      return '/mobile/assets-history?from=notifications';
    }
    
    return '/mobile/assets-history?from=assets';
  };
  
  const backPath = getBackNavigationPath();

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
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
          <Link href={backPath}>
            <div className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-lg font-semibold">Transaction Details</h1>
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
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
          <Link href={backPath}>
            <div className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-lg font-semibold">Transaction Details</h1>
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
      {/* Header with Context-Aware Back Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
        <Link href={backPath}>
          <div className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </div>
        </Link>
        <h1 className="text-lg font-semibold">Transaction Details</h1>
        <div className="w-6 h-6" />
      </div>

      {/* Transaction Summary Card */}
      <div className="px-4 pt-6">
        <Card className="bg-gradient-to-br from-[#1a1a40] to-[#1e1e44] border-[#2a2a50] p-6 shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-2">Deposit Amount</p>
            <h2 className="text-white text-3xl font-bold mb-2">
              +{transaction.cryptoAmount.toFixed(8)}
            </h2>
            <p className="text-orange-400 text-lg font-semibold mb-3">
              {transaction.cryptoSymbol}
            </p>
            <p className="text-gray-400 text-base mb-4">
              ≈ ${transaction.usdAmount.toFixed(2)} USD
            </p>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 text-sm font-medium">Transaction Completed</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Details */}
      <div className="px-4 pt-6 space-y-4">
        <h3 className="text-white text-lg font-semibold mb-4">Transaction Information</h3>
        
        {/* Details Cards */}
        <Card className="bg-[#1a1a40] border-[#2a2a50] p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 text-sm">Transaction Status</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-400 text-sm font-medium">Completed</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Network className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">Network</span>
              </div>
              <span className="text-white text-sm font-medium">
                {transaction.networkName}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 text-sm">Chain Type</span>
              </div>
              <span className="text-white text-sm font-medium">
                {transaction.chainType}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300 text-sm">Date & Time</span>
              </div>
              <span className="text-white text-sm">
                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Sender Address Card */}
        <Card className="bg-[#1a1a40] border-[#2a2a50] p-4">
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold">Sender Address</h4>
            <div className="flex items-center justify-between bg-[#0a0a2e] rounded-lg p-3">
              <span className="text-gray-300 text-xs font-mono break-all mr-3">
                {transaction.senderAddress}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.senderAddress)}
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 p-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Exchange Rate Card */}
        <Card className="bg-[#1a1a40] border-[#2a2a50] p-4">
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold">Exchange Rate at Time of Deposit</h4>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">1 {transaction.cryptoSymbol}</span>
              <span className="text-white text-sm font-medium">
                ${transaction.cryptoPrice.toFixed(2)} USD
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}