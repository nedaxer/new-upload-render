import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, User, AlertCircle, Check, Loader2, Mail, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientUID, setRecipientUID] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState('email');

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
    if (!walletData || !(walletData as any).data) return 0;
    
    // USD balance is directly in the data object
    return (walletData as any).data.usdBalance || 0;
  };

  // Search for recipient by email or UID
  const searchRecipient = async (searchType: 'email' | 'uid') => {
    const identifier = searchType === 'email' ? recipientEmail.trim() : recipientUID.trim();
    
    if (!identifier) {
      setSearchError(`Please enter a ${searchType === 'email' ? 'valid email address' : 'valid UID'}`);
      return;
    }

    // Basic validation
    if (searchType === 'email' && !identifier.includes('@')) {
      setSearchError('Please enter a valid email address');
      return;
    }

    if (searchType === 'uid' && identifier.length !== 10) {
      setSearchError('UID must be exactly 10 digits');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setRecipientInfo(null);

    try {
      console.log(`Searching for user by ${searchType}:`, identifier);
      
      const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();
      console.log('Search response:', data);

      if (data.success && data.data) {
        // Check if trying to send to self
        if (data.data._id === user?._id) {
          setSearchError('You cannot transfer funds to yourself');
          setRecipientInfo(null);
        } else {
          setRecipientInfo(data.data);
          setSearchError('');
        }
      } else {
        setSearchError('User not found. Please check the information and try again.');
        setRecipientInfo(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('User not found. Please check the information and try again.');
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
        description: `Successfully transferred $${parseFloat(amount).toFixed(2)} USD`,
      });
      
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      
      // Reset form
      setAmount('');
      setRecipientEmail('');
      setRecipientUID('');
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

      <div className="px-4 py-4 space-y-6">
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
        <div className="space-y-3">
          <Label className="text-gray-300 text-base">Amount to Transfer</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 h-12 text-lg bg-[#1a1a40] border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Recipient Selection with Tabs */}
        <div className="space-y-3">
          <Label className="text-gray-300 text-base">Transfer To</Label>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1a1a40] border border-gray-700">
              <TabsTrigger 
                value="email" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-400 flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger 
                value="uid" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-400 flex items-center space-x-2"
              >
                <Hash className="w-4 h-4" />
                <span>UID</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Recipient Email Address</Label>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchRecipient('email')}
                    className="flex-1 h-12 bg-[#1a1a40] border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
                  />
                  <Button
                    onClick={() => searchRecipient('email')}
                    disabled={isSearching || !recipientEmail.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 h-12"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="uid" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm">Recipient UID (10 digits)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter 10-digit UID"
                    value={recipientUID}
                    onChange={(e) => setRecipientUID(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchRecipient('uid')}
                    className="flex-1 h-12 bg-[#1a1a40] border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 font-mono"
                    maxLength={10}
                  />
                  <Button
                    onClick={() => searchRecipient('uid')}
                    disabled={isSearching || !recipientUID.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 h-12"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {searchError && (
            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
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