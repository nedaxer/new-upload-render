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

  const isReceived = transfer.toUserId === (user as any)?._id;
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

      {/* Transfer Details Card */}
      <div className="px-4 pt-8">
        <Card className="bg-[#1a1a40] border-[#2a2a50] p-0">
          {/* Amount Section */}
          <div className="text-center py-8 px-6 border-b border-gray-600">
            <p className="text-gray-400 text-sm mb-2">Transfer Amount</p>
            <h2 className={`text-4xl font-bold mb-4 ${isReceived ? 'text-green-400' : 'text-red-400'}`}>
              {isReceived ? '+' : '-'}${transfer.amount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </h2>
            <div className="flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                transfer.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              <span className={`text-base font-medium ${isReceived ? 'text-green-400' : 'text-red-400'}`}>
                {isReceived ? 'Transfer Received' : 'Transfer Sent'}
              </span>
            </div>
          </div>

          {/* Transfer Information Grid */}
          <div className="p-6">
            <div className="divide-y divide-gray-600">
              {/* Row 1: Transfer Type and Status */}
              <div className="flex">
                <div className="flex-1 py-4 pr-2">
                  <p className="text-gray-400 text-sm mb-1">Transfer Type</p>
                  <p className="text-white text-sm font-medium">
                    {isReceived ? 'Incoming Transfer' : 'Outgoing Transfer'}
                  </p>
                </div>
                <div className="flex-1 py-4 pl-2">
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p className={`text-sm font-medium capitalize ${
                    transfer.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {transfer.status}
                  </p>
                </div>
              </div>

              {/* Row 2: Sender/Recipient and Currency */}
              <div className="flex">
                <div className="flex-1 py-4 pr-2">
                  <p className="text-gray-400 text-sm mb-1">{isReceived ? 'Sender' : 'Recipient'}</p>
                  <p className="text-blue-400 text-sm">{otherUser.name}</p>
                </div>
                <div className="flex-1 py-4 pl-2">
                  <p className="text-gray-400 text-sm mb-1">Currency</p>
                  <p className="text-white text-sm font-medium">{transfer.currency || 'USD'}</p>
                </div>
              </div>

              {/* Row 3: Transaction ID */}
              <div className="py-4">
                <p className="text-gray-400 text-sm mb-2">Transaction ID</p>
                <div className="flex items-center justify-between bg-gray-800 rounded p-3">
                  <span className="text-white text-xs font-mono break-all mr-2">
                    {generateLongTransactionId(transfer.transactionId)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white flex-shrink-0"
                    onClick={() => copyToClipboard(generateLongTransactionId(transfer.transactionId))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Row 4: Date and Reference */}
              <div className="flex">
                <div className="flex-1 py-4 pr-2">
                  <p className="text-gray-400 text-sm mb-1">Date & Time</p>
                  <p className="text-white text-sm">
                    {new Date(transfer.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(transfer.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex-1 py-4 pl-2">
                  <p className="text-gray-400 text-sm mb-1">Reference No.</p>
                  <div className="flex items-center">
                    <p className="text-blue-400 text-sm font-mono">
                      {transfer.transactionId.slice(-12)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 text-gray-400 hover:text-white ml-1"
                      onClick={() => copyToClipboard(transfer.transactionId.slice(-12))}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}