import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Search, 
  DollarSign, 
  Trash2, 
  UserCheck, 
  Settings, 
  LogOut,
  User,
  Shield,
  Plus,
  AlertTriangle
} from "lucide-react";

interface AdminUser {
  _id: string;
  uid: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  isAdmin: boolean;
  balance: number;
}

export default function MobileAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Check admin authentication
  const { data: authUser, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Prevent mobile app animation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('skipMobileAnimation', 'true');
    }
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!authUser || !authUser.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive",
      });
      setLocation('/mobile/admin-login');
    }
  }, [authUser, authLoading, toast, setLocation]);

  // Search users
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["/api/admin/users/search", searchQuery],
    enabled: searchQuery.length > 0,
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      return await apiRequest("/api/admin/users/add-funds", {
        method: "POST",
        body: JSON.stringify({ userId, amount }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Funds Added Successfully",
        description: "User has been notified of the deposit",
        variant: "default",
      });
      setFundAmount("");
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Funds",
        description: error.message || "Failed to add funds",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "User account has been permanently deleted",
        variant: "default",
      });
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Account",
        description: error.message || "Failed to delete user account",
        variant: "destructive",
      });
    },
  });

  // Logout function
  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      toast({
        title: "Logged Out",
        description: "Admin session ended successfully",
        variant: "default",
      });
      setLocation('/mobile/admin-login');
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    }
  };

  const handleAddFunds = () => {
    if (!selectedUser || !fundAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a user and enter amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate({ userId: selectedUser._id, amount });
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (user.isAdmin) {
      toast({
        title: "Cannot Delete Admin",
        description: "Admin accounts cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authUser?.isAdmin) {
    return null; // Redirect handling is in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-orange-200">Platform Management Console</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="sm"
            className="border-orange-300 text-orange-300 hover:bg-orange-500 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>

        {/* Admin Info Card */}
        <Card className="bg-white/10 backdrop-blur border-orange-300/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{authUser.username}</p>
                <p className="text-sm text-orange-200">System Administrator • UID: {authUser.uid}</p>
              </div>
              <Badge className="bg-orange-500 text-white">ADMIN</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Search */}
      <Card className="mb-6 bg-white/10 backdrop-blur border-orange-300/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-white">
            <Search className="w-5 h-5 mr-2 text-orange-400" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by email, username, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/20 border-orange-300/30 text-white placeholder:text-orange-200"
            />
            
            {searchLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-orange-200">Searching users...</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-orange-200">{searchResults.length} user(s) found</p>
                {searchResults.map((user: AdminUser) => (
                  <div
                    key={user._id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedUser?._id === user._id
                        ? "bg-orange-500/30 border border-orange-400"
                        : "bg-white/10 border border-orange-300/20 hover:bg-white/20"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-sm text-orange-200">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "No name set"
                            } • UID: {user.uid}
                          </p>
                          <p className="text-sm text-orange-300">Balance: ${user.balance.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {user.isVerified && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {user.isAdmin && (
                          <Badge className="bg-red-500 text-white text-xs">ADMIN</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length > 0 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-8">
                <p className="text-orange-200">No users found matching your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fund Management */}
      {selectedUser && (
        <Card className="mb-6 bg-white/10 backdrop-blur border-orange-300/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-white">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" />
              Fund Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-400/30">
                <p className="font-medium text-white mb-1">Selected User: {selectedUser.username}</p>
                <p className="text-sm text-orange-200">Current Balance: ${selectedUser.balance.toFixed(2)}</p>
              </div>
              
              <div className="flex space-x-3">
                <Input
                  type="number"
                  placeholder="Amount (USD)"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="flex-1 bg-white/20 border-orange-300/30 text-white placeholder:text-orange-200"
                />
                <Button
                  onClick={handleAddFunds}
                  disabled={addFundsMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  {addFundsMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Funds
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      {selectedUser && (
        <Card className="bg-red-900/20 backdrop-blur border-red-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-300">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-sm text-red-200">
                  Permanently delete user account for <strong>{selectedUser.username}</strong>.
                  This action cannot be undone and will remove all user data.
                </p>
              </div>
              
              <Button
                onClick={() => handleDeleteUser(selectedUser)}
                disabled={deleteUserMutation.isPending || selectedUser.isAdmin}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {deleteUserMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting Account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User Account
                  </div>
                )}
              </Button>
              
              {selectedUser.isAdmin && (
                <p className="text-sm text-red-300 text-center">
                  Admin accounts cannot be deleted for security reasons
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}