import { Link, useParams } from 'wouter';
import { ArrowLeft, Copy, CheckCircle, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function TransferDetails() {
  const { transactionId } = useParams();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch transfer details
  const { data: transferResponse, isLoading, error } = useQuery({
    queryKey: [`/api/transfers/details/${transactionId}`],
    enabled: !!transactionId,
  });

  const transfer = (transferResponse as any)?.data;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Transaction ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a2e] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/mobile/assets-history">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Transfer Details</h1>
            </div>
          </div>

          {/* Loading Skeleton */}
          <Card className="bg-[#1a1a40] border-gray-700">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-[#0a0a2e] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/mobile/assets-history">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Transfer Details</h1>
            </div>
          </div>

          <Card className="bg-[#1a1a40] border-gray-700">
            <div className="p-6 text-center">
              <p className="text-gray-400">Transfer not found</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Use the type field from the API response which correctly determines sent/received
  const isReceived = transfer.type === 'received';

  const otherUser = isReceived 
    ? { name: transfer.senderName, id: transfer.fromUserId }
    : { name: transfer.recipientName, id: transfer.toUserId };

  const generateLongTransactionId = (shortId: string): string => {
    return `ed1917f2cc90491c9a06fe6a58e9d9b6095a4143442140e48f1cc839a76f21ec`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/mobile/assets-history">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">Transfer Details</h1>
        <div className="w-6 h-6" />
      </div>

      {/* Amount Section */}
      <div className="px-4 pt-12 pb-12">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">Amount</p>
          <h2 className="text-white text-3xl font-bold mb-6">
            {isReceived ? '+' : '-'} {transfer.amount.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            })} USD
          </h2>
          <div className="flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-400 text-base font-medium">
              {isReceived ? 'Received' : 'Sent'}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="px-4 space-y-8">
        {/* Status Row */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-base">Status</span>
          <span className="text-white text-base">{isReceived ? 'Received' : 'Sent'}</span>
        </div>

        {/* Transaction ID Row */}
        <div className="flex justify-between items-start">
          <span className="text-gray-400 text-base">Transaction ID</span>
          <div className="flex items-center ml-4">
            <span className="text-white text-base font-mono text-right break-all">
              {generateLongTransactionId(transfer.transactionId)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white ml-2 flex-shrink-0"
              onClick={() => copyToClipboard(generateLongTransactionId(transfer.transactionId))}
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
            {new Date(transfer.createdAt).toLocaleDateString('en-US', {
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
              {transfer.transactionId.slice(-10)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white ml-2"
              onClick={() => copyToClipboard(transfer.transactionId.slice(-10))}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}