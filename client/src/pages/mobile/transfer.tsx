import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ChevronDown, HelpCircle, Copy, User, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface RecipientInfo {
  _id: string;
  uid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

export default function Transfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [note, setNote] = useState('');
  const [sendMode, setSendMode] = useState('Email / Phone number / ID');

  // Fetch user balance
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet/summary'],
    enabled: !!user,
  });

  const getUserUSDBalance = () => {
    if (!walletData || !(walletData as any).data) return 0;
    
    // USD balance is directly in the data object
    return (walletData as any).data.usdBalance || 0;
  };

  // Search for recipient
  const searchRecipient = async () => {
    const identifier = recipientIdentifier.trim();
    
    if (!identifier) {
      toast({
        title: 'Error',
        description: 'Please enter email, phone number or ID',
        variant: 'destructive',
      });
      return;
    }

    // Check if trying to send to self
    if (identifier === (user as any)?.email || identifier === (user as any)?.uid) {
      toast({
        title: 'Error',
        description: 'You cannot transfer funds to yourself',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    setRecipientInfo(null);

    try {
      const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setRecipientInfo(data.data);
      } else {
        toast({
          title: 'User not found',
          description: 'Please check the information and try again',
          variant: 'destructive',
        });
        setRecipientInfo(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Please try again',
        variant: 'destructive',
      });
      setRecipientInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (transferData: { recipientId: string; amount: number }) => {
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData),
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Transfer failed');
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Transfer Successful',
        description: `Successfully transferred $${parseFloat(withdrawAmount).toFixed(2)} USD`,
      });
      
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      
      // Reset form
      setWithdrawAmount('');
      setRecipientIdentifier('');
      setRecipientInfo(null);
      setNote('');
    },
    onError: (error: any) => {
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Failed to transfer funds',
        variant: 'destructive',
      });
    },
  });

  const handleSend = () => {
    if (!recipientInfo) {
      toast({
        title: 'Error',
        description: 'Please search for a recipient first',
        variant: 'destructive',
      });
      return;
    }

    const transferAmount = parseFloat(withdrawAmount);
    
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (transferAmount > getUserUSDBalance()) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough funds',
        variant: 'destructive',
      });
      return;
    }

    transferMutation.mutate({
      recipientId: recipientInfo._id,
      amount: transferAmount,
    });
  };

  const setMaxAmount = () => {
    setWithdrawAmount(getUserUSDBalance().toString());
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <Link href="/mobile/assets">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-lg font-semibold text-black">Send TRX</h1>
        <div className="flex items-center space-x-3">
          <HelpCircle className="w-5 h-5 text-gray-600" />
          <Copy className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Send Mode */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-3">
            <Label className="text-black text-base font-semibold">Send Mode</Label>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          
          <Select value={sendMode} onValueChange={setSendMode}>
            <SelectTrigger className="w-full h-12 bg-gray-100 border-0 text-black">
              <SelectValue />
              <ChevronDown className="w-4 h-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Email / Phone number / ID">Email / Phone number / ID</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Recipient Input */}
          <div className="flex space-x-2 mt-3">
            <Input
              type="text"
              placeholder="Enter email, phone or ID"
              value={recipientIdentifier}
              onChange={(e) => setRecipientIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchRecipient()}
              className="flex-1 h-12 bg-gray-100 border-0 text-black placeholder-gray-500"
            />
            <Button
              onClick={searchRecipient}
              disabled={isSearching || !recipientIdentifier.trim()}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 h-12 font-medium"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </div>

        {/* Recipient Info */}
        {recipientInfo && (
          <Card className="bg-green-50 border-green-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-black">
                  {recipientInfo.firstName} {recipientInfo.lastName}
                </div>
                <div className="text-sm text-gray-600">@{recipientInfo.username}</div>
                <div className="text-xs text-gray-500">{recipientInfo.email}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Withdraw Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label className="text-black text-base font-semibold">Withdraw Amount</Label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="h-12 bg-gray-100 border-0 text-black placeholder-gray-500 pr-16"
              step="0.01"
              min="0"
            />
            <Button
              onClick={setMaxAmount}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-black text-sm px-3 py-1 h-8"
            >
              Max
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Available: ${getUserUSDBalance().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label className="text-black text-base font-semibold">Note (Optional)</Label>
          <Textarea
            placeholder="Add a note for the recipient"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-gray-100 border-0 text-black placeholder-gray-500 resize-none"
            rows={3}
            maxLength={50}
          />
          <div className="text-right text-xs text-gray-500">
            {note.length}/50
          </div>
        </div>

        {/* Info Text */}
        <div className="text-xs text-gray-600 leading-relaxed">
          • Send to a Binance account via phone number, email, Pay ID or
          Binance ID. Instant arrival with no fees. Refunds are not supported.{' '}
          <span className="text-yellow-600 underline">Learn more</span>
        </div>

        {/* Total Amount */}
        <div className="flex justify-between items-center py-4">
          <span className="text-black text-lg font-semibold">Total Amount</span>
          <span className="text-black text-2xl font-bold">
            {withdrawAmount ? parseFloat(withdrawAmount).toFixed(2) : '0.00'}
          </span>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={
            !recipientInfo || 
            !withdrawAmount || 
            parseFloat(withdrawAmount) <= 0 || 
            parseFloat(withdrawAmount) > getUserUSDBalance() ||
            transferMutation.isPending
          }
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {transferMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </div>
  );
}