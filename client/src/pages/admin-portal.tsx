import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  DollarSign, 
  Trash2, 
  UserCheck, 
  LogOut,
  User,
  Shield,
  Plus,
  AlertTriangle,
  Mail,
  CreditCard,
  Users,
  Copy,
  CheckCircle,
  Clock,
  UserPlus
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

export default function AdminPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [showUsersList, setShowUsersList] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Disable splash screen for admin portal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('skipSplashScreen', 'true');
    }
  }, []);

  // Admin authentication
  const adminLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      return data;
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin portal",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Search users with real-time updates
  const { data: searchResults = [], isLoading: searchLoading, refetch: refetchSearch } = useQuery({
    queryKey: ["/api/admin/users/search", searchQuery],
    enabled: searchQuery.length > 0 && isAuthenticated,
    refetchInterval: searchQuery.length > 0 ? 2000 : false, // Refetch every 2 seconds when searching
  });

  // Get all users for admin header with auto-refresh
  const { data: allUsers = [], refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users/all"],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Copy user ID function
  const copyUserId = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedId(uid);
    toast({
      title: "Copied!",
      description: `User ID ${uid} copied to clipboard`,
      variant: "default",
    });
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/admin/users/add-funds", { userId, amount });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds Added Successfully",
        description: `$${fundAmount} added to user account`,
        variant: "default",
      });
      setFundAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
      refetchSearch();
      refetchUsers();
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
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "User account permanently deleted from MongoDB",
        variant: "default",
      });
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
      refetchSearch();
      refetchUsers();
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Account",
        description: error.message || "Failed to delete user account",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCredentials.email || !adminCredentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    adminLoginMutation.mutate(adminCredentials);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminCredentials({ email: "", password: "" });
    setSearchQuery("");
    setSelectedUser(null);
    toast({
      title: "Logged Out",
      description: "Admin session ended",
      variant: "default",
    });
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

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Admin Portal</CardTitle>
              <p className="text-blue-200 mt-2">Secure platform management</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Admin Email</label>
                <Input
                  type="email"
                  value={adminCredentials.email}
                  onChange={(e) => setAdminCredentials({...adminCredentials, email: e.target.value})}
                  placeholder="Enter admin email"
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                  disabled={adminLoginMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <Input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                  placeholder="Enter admin password"
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                  disabled={adminLoginMutation.isPending}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                disabled={adminLoginMutation.isPending}
              >
                {adminLoginMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  "Access Admin Portal"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-blue-200">Platform Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowUsersList(!showUsersList)}
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/20"
            >
              <Users className="w-4 h-4 mr-1" />
              Users ({allUsers.length})
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Users Overview Panel */}
        {showUsersList && (
          <Card className="mb-4 bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Users Overview
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                    {allUsers.length} Total Users
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allUsers.slice(0, 12).map((user: AdminUser) => (
                  <div
                    key={user._id}
                    className="p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.username
                            }
                          </p>
                          <p className="text-xs text-blue-200 truncate">
                            {user.email}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-green-400 font-medium">${user.balance.toFixed(2)}</p>
                            <p className="text-xs text-blue-400">UID: {user.uid}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-blue-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyUserId(user.uid);
                        }}
                      >
                        {copiedId === user.uid ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {allUsers.length > 12 && (
                <div className="text-center mt-4">
                  <p className="text-blue-200 text-sm">
                    Showing first 12 users • {allUsers.length - 12} more available
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-blue-300 hover:text-white"
                    onClick={() => setShowUsersList(false)}
                  >
                    Use search below to find specific users
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Search */}
      <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Search className="w-5 h-5 mr-2 text-blue-400" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search by name, email, username, or UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {searchLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-blue-200">Searching users...</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-blue-200">{searchResults.length} user(s) found</p>
                {searchResults.map((user: AdminUser) => (
                  <div
                    key={user._id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedUser?._id === user._id
                        ? "bg-blue-500/30 border border-blue-400"
                        : "bg-white/10 border border-white/20 hover:bg-white/20"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.username
                            }
                          </p>
                          <p className="text-sm text-blue-200 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </p>
                          <p className="text-sm text-blue-300 flex items-center">
                            <CreditCard className="w-3 h-3 mr-1" />
                            Balance: ${user.balance.toFixed(2)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-blue-400">UID: {user.uid}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-blue-300 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyUserId(user.uid);
                              }}
                            >
                              {copiedId === user.uid ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
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
                <p className="text-blue-200">No users found matching your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fund Management */}
      {selectedUser && (
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" />
              Fund Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <p className="font-medium text-white mb-1">Selected User: {selectedUser.username}</p>
                <p className="text-sm text-blue-200">Current Balance: ${selectedUser.balance.toFixed(2)}</p>
              </div>
              
              <div className="flex space-x-3">
                <Input
                  type="number"
                  placeholder="Amount (USD)"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-blue-200"
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

      {/* Account Deletion */}
      {selectedUser && (
        <Card className="bg-red-900/20 backdrop-blur-lg border-red-400/30">
          <CardHeader>
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