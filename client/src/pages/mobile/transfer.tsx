import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ChevronDown, HelpCircle, Copy, User, Loader2, X } from 'lucide-react';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'uid'>('uid');
  const [inputType, setInputType] = useState<'email' | 'uid'>('uid');

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

  // Auto-search for recipient when identifier changes
  useEffect(() => {
    const searchRecipient = async () => {
      const identifier = recipientIdentifier.trim();
      
      if (!identifier) {
        setRecipientInfo(null);
        return;
      }

      // Check if trying to send to self
      if (identifier === (user as any)?.email || identifier === (user as any)?.uid) {
        setRecipientInfo(null);
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
          setRecipientInfo(null);
        }
      } catch (error) {
        console.error('Search error:', error);
        setRecipientInfo(null);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchRecipient, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [recipientIdentifier, user]);

  const handleMethodSelection = (method: 'email' | 'uid') => {
    setSelectedMethod(method);
    setInputType(method);
    setShowDropdown(false);
    setRecipientIdentifier('');
    setRecipientInfo(null);
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
    <div className="h-screen bg-[#0a0a2e] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e] border-b border-gray-700">
        <Link href="/mobile/assets">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Send USD</h1>
        <div className="flex items-center space-x-3">
          <HelpCircle className="w-5 h-5 text-gray-400" />
          <Copy className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Send Method Selection - Now as simple label */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label className="text-white text-sm font-medium">Send Mode</Label>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="bg-[#1a1a40] border border-gray-600 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-white">{selectedMethod === 'email' ? 'Email' : 'Nedaxer ID'}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Recipient Input */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">
            {selectedMethod === 'email' ? 'Email' : 'Nedaxer ID'}
          </Label>
          <Input
            type="text"
            placeholder={inputType === 'email' ? 'Enter email address' : 'Enter Nedaxer ID'}
            value={recipientIdentifier}
            onChange={(e) => setRecipientIdentifier(e.target.value)}
            className="h-12 bg-[#1a1a40] border border-gray-600 text-white placeholder-gray-500"
          />
          {isSearching && (
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}
          <div className="text-xs text-gray-400">
            Please enter the correct {selectedMethod === 'email' ? 'Email' : 'Nedaxer ID'}
          </div>
        </div>

        {/* Transfer Amount */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Withdraw Amount</Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="11.398066"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="h-12 bg-[#1a1a40] border border-gray-600 text-white placeholder-gray-500 pr-20 text-lg"
              step="0.01"
              min="0"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Button
                onClick={setMaxAmount}
                className="bg-transparent hover:bg-gray-600 text-white text-sm px-2 py-1 h-6 border border-gray-500"
              >
                Max
              </Button>
              <span className="text-white text-sm">USD</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            ≈ ${withdrawAmount ? (parseFloat(withdrawAmount) * 1).toFixed(2) : '0.00'} USD
          </div>
          <div className="text-xs text-gray-400">
            Available: ${getUserUSDBalance().toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} USD
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Note (Optional)</Label>
          <Textarea
            placeholder="Add a note for the recipient"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-[#1a1a40] border border-gray-600 text-white placeholder-gray-500 resize-none h-16"
            maxLength={50}
          />
        </div>

        {/* Recipient Info */}
        {recipientInfo && (
          <Card className="bg-[#1a1a40] border-gray-600 p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white text-sm">
                  {recipientInfo.firstName} {recipientInfo.lastName}
                </div>
                <div className="text-xs text-gray-400">@{recipientInfo.username}</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Section - Send Mode Selection */}
      <div className="bg-white rounded-t-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-black text-lg font-semibold">Send Mode</h3>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => handleMethodSelection('email')}
            className="w-full p-3 text-left text-black hover:bg-gray-50 rounded-lg flex items-center justify-between"
          >
            <span className="font-medium">Email</span>
            {selectedMethod === 'email' && (
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => handleMethodSelection('uid')}
            className="w-full p-3 text-left text-black hover:bg-gray-50 rounded-lg flex items-center justify-between"
          >
            <span className="font-medium">Nedaxer ID</span>
            {selectedMethod === 'uid' && (
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
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
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 h-12 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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