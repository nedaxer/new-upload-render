import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, DollarSign, Trash2, Plus, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  createdAt: string;
  balance: number;
}

interface AdminTransaction {
  id: number;
  targetUserId: number;
  type: string;
  cryptoSymbol: string;
  network: string;
  usdAmount: number;
  cryptoAmount: number;
  sendAddress: string;
  status: string;
  createdAt: string;
  targetUserUsername: string;
  targetUserEmail: string;
}

const cryptoOptions = [
  { symbol: 'BTC', name: 'Bitcoin', networks: ['BTC'] },
  { symbol: 'ETH', name: 'Ethereum', networks: ['ERC20'] },
  { symbol: 'BNB', name: 'BNB', networks: ['BEP20', 'BSC'] },
  { symbol: 'USDT', name: 'Tether', networks: ['ERC20', 'BEP20', 'TRC20'] },
  { symbol: 'USDC', name: 'USD Coin', networks: ['ERC20', 'BEP20'] },
];

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'users' | 'funds' | 'transactions'>('users');
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  
  const [addFundsForm, setAddFundsForm] = useState({
    userId: '',
    cryptoSymbol: '',
    network: '',
    usdAmount: '',
    sendAddress: ''
  });

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need admin privileges to access this page</p>
          <Button onClick={() => setLocation('/mobile/home')} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    retry: false,
  });

  // Fetch admin transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    retry: false,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Deletion Scheduled",
        description: "User will be deleted in 1 minute",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async (data: typeof addFundsForm) => {
      const response = await fetch('/api/admin/add-funds', {
        method: 'POST',
        body: JSON.stringify({
          userId: parseInt(data.userId),
          cryptoSymbol: data.cryptoSymbol,
          network: data.network,
          usdAmount: parseFloat(data.usdAmount),
          sendAddress: data.sendAddress
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add funds');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds Added Successfully",
        description: "User will receive notification immediately",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      setShowAddFundsModal(false);
      setAddFundsForm({ userId: '', cryptoSymbol: '', network: '', usdAmount: '', sendAddress: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (userId: number) => {
    setShowDeleteConfirm(userId);
    setDeleteCountdown(60);
    
    const interval = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          deleteUserMutation.mutate(userId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
    setDeleteCountdown(0);
  };

  const handleAddFunds = () => {
    if (!addFundsForm.userId || !addFundsForm.cryptoSymbol || !addFundsForm.network || !addFundsForm.usdAmount || !addFundsForm.sendAddress) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate(addFundsForm);
  };

  const selectedUser = (usersData as any)?.users?.find((u: User) => u.id.toString() === addFundsForm.userId);
  const selectedCrypto = cryptoOptions.find(c => c.symbol === addFundsForm.cryptoSymbol);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/mobile/home')}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
          <Shield className="w-6 h-6 text-orange-500" />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'users'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'funds'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Add Funds
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'transactions'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            History
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">User Management</h2>
              <div className="text-sm text-gray-400">
                {(usersData as any)?.users?.length || 0} users
              </div>
            </div>

            {usersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {(usersData as any)?.users?.map((user: User) => (
                  <Card key={user.id} className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.username}</span>
                          <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                            ID: {user.id}
                          </span>
                          {user.isVerified && (
                            <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-sm text-orange-500 font-medium mt-1">
                          Balance: ${user.balance.toFixed(2)}
                        </div>
                      </div>
                      
                      {user.id !== user.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Funds Tab */}
        {activeTab === 'funds' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Funds to User</h2>
              <Button
                onClick={() => setShowAddFundsModal(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </div>

            <Card className="bg-gray-900 border-gray-800 p-4">
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Fund Management</h3>
                <p className="text-gray-400 mb-4">
                  Add virtual funds to user accounts for demo trading
                </p>
                <Button
                  onClick={() => setShowAddFundsModal(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Get Started
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transaction History</h2>
              <div className="text-sm text-gray-400">
                {(transactionsData as any)?.transactions?.length || 0} transactions
              </div>
            </div>

            {transactionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {(transactionsData as any)?.transactions?.map((tx: AdminTransaction) => (
                  <Card key={tx.id} className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {tx.cryptoAmount?.toFixed(8)} {tx.cryptoSymbol}
                          </span>
                          <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                            {tx.network}
                          </span>
                          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                            {tx.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          To: {tx.targetUserUsername} ({tx.targetUserEmail})
                        </div>
                        <div className="text-sm text-orange-500">
                          ${tx.usdAmount ? tx.usdAmount.toFixed(2) : '0.00'} USD
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(!(transactionsData as any)?.transactions || (transactionsData as any).transactions.length === 0) && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No transactions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      <Dialog open={showAddFundsModal} onOpenChange={setShowAddFundsModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Funds to User</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* User Selection */}
            <div>
              <Label>Select User (UID)</Label>
              <Select 
                value={addFundsForm.userId} 
                onValueChange={(value) => setAddFundsForm({ ...addFundsForm, userId: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select user by UID" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {(usersData as any)?.users?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.id} - {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser && (
                <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm">
                    <div><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Current Balance:</strong> ${selectedUser.balance ? selectedUser.balance.toFixed(2) : '0.00'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Crypto Selection */}
            <div>
              <Label>Cryptocurrency</Label>
              <Select 
                value={addFundsForm.cryptoSymbol} 
                onValueChange={(value) => setAddFundsForm({ ...addFundsForm, cryptoSymbol: value, network: '' })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {cryptoOptions.map((crypto) => (
                    <SelectItem key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol} - {crypto.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Network Selection */}
            {selectedCrypto && (
              <div>
                <Label>Network</Label>
                <Select 
                  value={addFundsForm.network} 
                  onValueChange={(value) => setAddFundsForm({ ...addFundsForm, network: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {selectedCrypto.networks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* USD Amount */}
            <div>
              <Label>USD Amount</Label>
              <Input
                type="number"
                value={addFundsForm.usdAmount}
                onChange={(e) => setAddFundsForm({ ...addFundsForm, usdAmount: e.target.value })}
                className="bg-gray-800 border-gray-700"
                placeholder="Enter USD amount"
              />
            </div>

            {/* Send Address */}
            <div>
              <Label>Send Address (Virtual)</Label>
              <Input
                value={addFundsForm.sendAddress}
                onChange={(e) => setAddFundsForm({ ...addFundsForm, sendAddress: e.target.value })}
                className="bg-gray-800 border-gray-700"
                placeholder="Enter virtual send address"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddFundsModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFunds}
                disabled={addFundsMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {addFundsMutation.isPending ? 'Sending...' : 'Send Funds'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Dialog open={true} onOpenChange={() => cancelDelete()}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Delete User Confirmation</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                User will be permanently deleted in:
              </p>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-500">
                  {deleteCountdown}s
                </div>
              </div>
              <Button
                onClick={cancelDelete}
                variant="outline"
                className="w-full"
              >
                Cancel Deletion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}