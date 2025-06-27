import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, User, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getCurrencySymbol, formatCurrency } from '@/lib/utils';

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
  
  const [amount, setAmount] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [searchError, setSearchError] = useState('');

  // Load currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Fetch user balance
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet/summary'],
    enabled: !!user,
  });

  const getUserUSDBalance = () => {
    if (!walletData?.data) return 0;
    
    // USD balance is directly in the data object
    return walletData.data.usdBalance || 0;
  };

  // Search for recipient
  const searchRecipient = async () => {
    if (!recipientIdentifier.trim()) {
      setSearchError('Please enter an email or UID');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setRecipientInfo(null);

    try {
      const response = await apiRequest(`/api/users/search`, {
        method: 'POST',
        body: JSON.stringify({ identifier: recipientIdentifier.trim() }),
      });

      if (response.success && response.data) {
        // Check if trying to send to self
        if (response.data._id === user?._id) {
          setSearchError('You cannot transfer funds to yourself');
          setRecipientInfo(null);
        } else {
          setRecipientInfo(response.data);
          setSearchError('');
        }
      } else {
        setSearchError('User not found');
        setRecipientInfo(null);
      }
    } catch (error) {
      setSearchError('User not found');
      setRecipientInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (transferData: { recipientId: string; amount: number }) => {
      return apiRequest('/api/wallet/transfer', {
        method: 'POST',
        body: JSON.stringify(transferData),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Transfer Successful',
        description: `Successfully transferred $${parseFloat(amount).toFixed(2)} USD`,
      });
      
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      
      // Reset form
      setAmount('');
      setRecipientIdentifier('');
      setRecipientInfo(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Failed to transfer funds',
        variant: 'destructive',
      });
    },
  });

  const handleTransfer = () => {
    if (!recipientInfo) {
      toast({
        title: 'Error',
        description: 'Please search for a recipient first',
        variant: 'destructive',
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    
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

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Link href="/mobile/assets">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">Transfer USD</h1>
        <div className="w-6 h-6" />
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-[#1a1a40] border-gray-800">
          <div className="p-4">
            <div className="text-sm text-gray-400 mb-1">Available Balance</div>
            <div className="text-2xl font-bold text-white">
              ${getUserUSDBalance().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          </div>
        </Card>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label className="text-gray-400">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 bg-[#1a1a40] border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Recipient Search */}
        <div className="space-y-2">
          <Label className="text-gray-400">Recipient (Email or UID)</Label>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter email or UID"
              value={recipientIdentifier}
              onChange={(e) => setRecipientIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchRecipient()}
              className="flex-1 bg-[#1a1a40] border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
            />
            <Button
              onClick={searchRecipient}
              disabled={isSearching}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
          {searchError && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Recipient Info */}
        {recipientInfo && (
          <Card className="bg-[#1a1a40] border-gray-700">
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {recipientInfo.firstName} {recipientInfo.lastName}
                  </div>
                  <div className="text-sm text-gray-400">@{recipientInfo.username}</div>
                </div>
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div className="pt-2 border-t border-gray-700 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-gray-300">{recipientInfo.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">UID:</span>
                  <span className="text-gray-300 font-mono">{recipientInfo.uid}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Transfer Summary */}
        {recipientInfo && amount && parseFloat(amount) > 0 && (
          <Card className="bg-[#1a1a40] border-gray-700">
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-white">Transfer Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-semibold">
                    ${parseFloat(amount).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">To:</span>
                  <span className="text-white">
                    {recipientInfo.firstName} {recipientInfo.lastName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fee:</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Debit:</span>
                    <span className="text-white font-bold text-lg">
                      ${parseFloat(amount).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Transfer Button */}
        <Button
          onClick={handleTransfer}
          disabled={
            !recipientInfo || 
            !amount || 
            parseFloat(amount) <= 0 || 
            parseFloat(amount) > getUserUSDBalance() ||
            transferMutation.isPending
          }
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 disabled:opacity-50"
        >
          {transferMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Transfer...</span>
            </div>
          ) : (
            'Transfer USD'
          )}
        </Button>

        {/* Security Notice */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <div className="flex space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-400 mb-1">Security Notice</h4>
              <p className="text-xs text-gray-300">
                Please verify the recipient's details before transferring. 
                Transfers are instant and cannot be reversed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}