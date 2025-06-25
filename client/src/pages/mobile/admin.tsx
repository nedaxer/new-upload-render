import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Search, DollarSign, Trash2, UserCheck, Settings, LogOut } from "lucide-react";

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

export default function AdminDashboard() {
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

  // Prevent mobile app animation by setting flag
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('skipMobileAnimation', 'true');
    }
  }, []);

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
        title: "Success",
        description: "Funds added successfully",
        variant: "default",
      });
      setFundAmount("");
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
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
        title: "Success",
        description: "User account deleted successfully",
        variant: "default",
      });
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
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
        description: "Admin session ended",
        variant: "default",
      });
      setLocation('/mobile/admin-login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      });
    }
  };

  const handleAddFunds = () => {
    if (!selectedUser || !fundAmount) {
      toast({
        title: "Error",
        description: "Please select a user and enter amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate({ userId: selectedUser._id, amount });
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (user.isAdmin) {
      toast({
        title: "Error",
        description: "Cannot delete admin accounts",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!authUser?.isAdmin) {
    return null; // Redirect handling is in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Manage users and platform operations</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Admin Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Logged in as: {authUser.username}</p>
                <p className="text-sm text-slate-600">Administrator • UID: {authUser.uid}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">ADMIN</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            User Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by email, username, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            
            {searchLoading && (
              <p className="text-slate-600 text-center">Searching users...</p>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">{searchResults.length} user(s) found</p>
                {searchResults.map((user: AdminUser) => (
                  <div
                    key={user._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?._id === user._id
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{user.username}</p>
                        <p className="text-sm text-slate-600">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : "No name set"
                          } • UID: {user.uid}
                        </p>
                        <p className="text-sm text-slate-600">Balance: ${user.balance.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.isVerified && (
                          <Badge variant="secondary">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {user.isAdmin && (
                          <Badge variant="destructive">ADMIN</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length > 0 && searchResults.length === 0 && !searchLoading && (
              <p className="text-slate-600 text-center">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fund Management */}
      {selectedUser && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Fund Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <p className="font-medium text-slate-900">Selected User: {selectedUser.username}</p>
                <p className="text-sm text-slate-600">Current Balance: ${selectedUser.balance.toFixed(2)}</p>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Amount to add (USD)"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddFunds}
                  disabled={addFundsMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addFundsMutation.isPending ? "Adding..." : "Add Funds"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Actions */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Permanently delete user account. This action cannot be undone.
                </p>
              </div>
              
              <Button
                onClick={() => handleDeleteUser(selectedUser)}
                disabled={deleteUserMutation.isPending || selectedUser.isAdmin}
                variant="destructive"
                className="w-full"
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User Account"}
              </Button>
              
              {selectedUser.isAdmin && (
                <p className="text-sm text-slate-600 text-center">
                  Admin accounts cannot be deleted
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}