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
          <div className="p-6 space-y-6">
            {/* Transfer Visual */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs text-gray-400 text-center">
                  {isReceived ? otherUser.name : 'You'}
                </span>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isReceived ? 'bg-green-500/20' : 'bg-orange-500/20'
                }`}>
                  {isReceived ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs text-gray-400 text-center">
                  {isReceived ? 'You' : otherUser.name}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center border-b border-gray-700 pb-6">
              <div className={`text-3xl font-bold ${isReceived ? 'text-green-500' : 'text-orange-500'}`}>
                {isReceived ? '+' : '-'}${transfer.amount.toFixed(2)}
              </div>
              <p className="text-gray-400 mt-2">
                {isReceived ? 'Received from' : 'Sent to'} {otherUser.name}
              </p>
            </div>

            {/* Transfer Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Status</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium capitalize">{transfer.status}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-white font-medium">${transfer.amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Currency</span>
                <span className="text-white font-medium">{transfer.currency}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{isReceived ? 'From' : 'To'}</span>
                <span className="text-white font-medium">{otherUser.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Date</span>
                <span className="text-white font-medium">
                  {new Date(transfer.createdAt).toLocaleDateString()} at{' '}
                  {new Date(transfer.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-gray-400 text-sm">Transaction ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-sm break-all max-w-32">
                    {transfer.transactionId}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transfer.transactionId)}
                    className="p-1 h-auto text-gray-400 hover:text-white"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {transfer.description && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm">Description</span>
                  <span className="text-white font-medium text-right max-w-48">
                    {transfer.description}
                  </span>
                </div>
              )}
            </div>

            {/* Transfer Type Badge */}
            <div className="pt-4 border-t border-gray-700">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isReceived 
                  ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                  : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
              }`}>
                {isReceived ? (
                  <>
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Transfer Received
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Transfer Sent
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}