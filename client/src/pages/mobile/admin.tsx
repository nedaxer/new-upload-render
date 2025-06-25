import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, DollarSign, Trash2, User, Shield, Copy, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface UserSearchResult {
  _id: string;
  uid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  balance?: number;
}

export default function MobileAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Check if current user is admin
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Search users mutation
  const searchUsersMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
    },
    onSuccess: (data) => {
      setSearchResults(data.users || []);
      setIsSearching(false);
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Failed to search users. Please try again.",
        variant: "destructive",
      });
      setIsSearching(false);
    },
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      return await apiRequest('/api/admin/users/add-funds', {
        method: 'POST',
        body: JSON.stringify({ userId, amount }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Funds Added Successfully",
        description: `Added $${depositAmount} to user's account`,
        variant: "default",
      });
      setDepositAmount('');
      setSelectedUser(null);
      // Refresh search results
      if (searchQuery) {
        searchUsersMutation.mutate(searchQuery);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Funds",
        description: "Unable to add funds to user account.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User account has been permanently deleted.",
        variant: "default",
      });
      // Refresh search results
      if (searchQuery) {
        searchUsersMutation.mutate(searchQuery);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete User",
        description: "Unable to delete user account.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter an email or UID to search.",
        variant: "destructive",
      });
      return;
    }
    setIsSearching(true);
    searchUsersMutation.mutate(searchQuery.trim());
  };

  const handleAddFunds = () => {
    if (!selectedUser || !depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    addFundsMutation.mutate({
      userId: selectedUser._id,
      amount: parseFloat(depositAmount),
    });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
      variant: "default",
    });
  };

  // Check if user is admin
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 text-center">
          You don't have permission to access this admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">Manage users and platform operations</p>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter email or UID to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || searchUsersMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Search Results</h3>
              {searchResults.map((user) => (
                <Card key={user._id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{user.username}</span>
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          {user.isAdmin && (
                            <Badge variant="destructive" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>Email:</span>
                            <span className="font-mono">{user.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(user.email)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>UID:</span>
                            <span className="font-mono">{user.uid}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(user.uid)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div>
                            <span>Name: {user.firstName} {user.lastName}</span>
                          </div>
                          <div>
                            <span>Balance: ${user.balance?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {/* Add Funds Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Funds
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Virtual USD Funds</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>User: {selectedUser?.username}</Label>
                                <p className="text-sm text-gray-600">
                                  Current Balance: ${selectedUser?.balance?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="amount">Amount to Add (USD)</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={depositAmount}
                                  onChange={(e) => setDepositAmount(e.target.value)}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <Button
                                onClick={handleAddFunds}
                                disabled={addFundsMutation.isPending}
                                className="w-full bg-green-500 hover:bg-green-600"
                              >
                                {addFundsMutation.isPending ? 'Adding...' : 'Add Funds'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Delete User Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={user.isAdmin}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete {user.username}'s account? 
                                This action cannot be undone and will remove all user data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user._id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchUsersMutation.isError && (
            <div className="text-center py-8 text-gray-500">
              <p>No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">$0</div>
            <p className="text-sm text-gray-600">Total Platform Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-sm text-gray-600">Active Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Nedaxer Admin Panel - Secure Access Only</p>
      </div>
    </div>
  );
}