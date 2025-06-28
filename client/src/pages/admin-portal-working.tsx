import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminPullToRefresh } from "@/components/admin-pull-to-refresh";
import { 
  Search, 
  DollarSign, 
  Trash2, 
  UserCheck, 
  LogOut,
  User,
  Shield,
  Plus,
  Minus,
  AlertTriangle,
  Mail,
  CreditCard,
  Users,
  Copy,
  CheckCircle,
  Clock,
  UserPlus,
  Activity,
  BarChart3,
  Calendar,
  Hash,
  Eye,
  EyeOff
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
  password?: string;
  createdAt?: Date;
}

export default function AdminPortalWorking() {
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [uidSearchQuery, setUidSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication on mount
  useEffect(() => {
    sessionStorage.setItem('skipSplashScreen', 'true');
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/users/all', { credentials: 'include' });
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('Admin not authenticated');
      }
    };
    
    checkAuth();
  }, []);

  // Admin login mutation
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

  // Get all users for admin with auto-refresh
  const { data: allUsers = [], refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users/all"],
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
      apiRequest(`/api/admin/add-funds`, {
        method: "POST",
        body: JSON.stringify({ userId, amount }),
      }),
    onSuccess: () => {
      toast({
        title: "Funds Added Successfully",
        description: `$${fundAmount} has been added to the user's account`,
        variant: "default",
      });
      setFundAmount("");
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

  // Remove funds mutation
  const removeFundsMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
      apiRequest(`/api/admin/remove-funds`, {
        method: "POST",
        body: JSON.stringify({ userId, amount }),
      }),
    onSuccess: () => {
      toast({
        title: "Funds Removed Successfully",
        description: `$${fundAmount} has been removed from the user's account`,
        variant: "default",
      });
      setFundAmount("");
      refetchUsers();
    },
    onError: (error: any) => {
      toast({
        title: "Error Removing Funds",
        description: error.message || "Failed to remove funds",
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
    setEmailSearchQuery("");
    setUidSearchQuery("");
    setSelectedUser(null);
    toast({
      title: "Logged Out",
      description: "Admin session ended",
      variant: "default",
    });
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
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

  const handleRemoveFunds = () => {
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

    removeFundsMutation.mutate({ userId: selectedUser._id, amount });
  };

  // Filter users based on search queries
  const filteredUsers = Array.isArray(allUsers) ? allUsers.filter((user: AdminUser) => {
    if (emailSearchQuery) {
      return user.email.toLowerCase().includes(emailSearchQuery.toLowerCase());
    }
    if (uidSearchQuery) {
      return user.uid.toLowerCase().includes(uidSearchQuery.toLowerCase());
    }
    return true;
  }) : [];

  // Admin dashboard refresh function
  const handleAdminRefresh = async () => {
    try {
      await refetchUsers();
      toast({
        title: "Data Refreshed",
        description: "Admin dashboard updated with latest data",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh admin data",
        variant: "destructive",
      });
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Admin Portal</CardTitle>
              <p className="text-blue-200 mt-2">Enhanced platform management</p>
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
    <AdminPullToRefresh onRefresh={handleAdminRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-2 sm:p-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Enhanced Admin Portal</h1>
                <p className="text-blue-200 text-sm sm:text-base">Advanced User Management & Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                {Array.isArray(allUsers) ? allUsers.length : 0} Total Users
              </Badge>
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
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/20">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="search" className="text-white data-[state=active]:bg-white/20">
              <Search className="w-4 h-4 mr-2" />
              Search Users
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* All Users List */}
              <div className="lg:col-span-2">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Users className="w-5 h-5 mr-2 text-green-400" />
                      All Users ({Array.isArray(allUsers) ? allUsers.length : 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Array.isArray(allUsers) && allUsers.map((user: AdminUser) => (
                        <div
                          key={user._id}
                          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedUser?._id === user._id
                              ? "bg-green-500/30 border border-green-400"
                              : "bg-white/10 border border-white/20 hover:bg-white/20"
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-white">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}` 
                                    : user.username
                                  }
                                </p>
                                <p className="text-sm text-blue-200">{user.email}</p>
                                <p className="text-sm text-green-400 font-medium">
                                  Balance: ${user.balance ? user.balance.toFixed(2) : '0.00'}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <p className="text-xs text-blue-400">UID: {user.uid}</p>
                                  <Badge variant={user.isVerified ? "default" : "secondary"} className="text-xs">
                                    {user.isVerified ? "Verified" : "Unverified"}
                                  </Badge>
                                  {user.isAdmin && (
                                    <Badge variant="destructive" className="text-xs">Admin</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Selected User Actions */}
              <div>
                {selectedUser ? (
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <User className="w-5 h-5 mr-2 text-yellow-400" />
                        Manage User
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                          <p className="font-medium text-white">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </p>
                          <p className="text-sm text-blue-200">{selectedUser.email}</p>
                          <p className="text-sm text-blue-400">UID: {selectedUser.uid}</p>
                          <p className="text-lg font-bold text-green-400 mt-2">
                            ${selectedUser.balance ? selectedUser.balance.toFixed(2) : '0.00'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-blue-200 mb-2 block">Fund Amount</label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleAddFunds}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={addFundsMutation.isPending}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                          <Button
                            onClick={handleRemoveFunds}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            disabled={removeFundsMutation.isPending}
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="text-center py-12">
                      <User className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-white text-lg mb-2">Select a User</p>
                      <p className="text-blue-200">Click on a user to manage their account</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email Search */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Mail className="w-5 h-5 mr-2 text-blue-400" />
                    Search by Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="Enter user email..."
                        value={emailSearchQuery}
                        onChange={(e) => {
                          setEmailSearchQuery(e.target.value);
                          setUidSearchQuery(""); // Clear other search
                        }}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      <p className="text-sm text-blue-200">
                        {filteredUsers.length} user(s) found
                      </p>
                      {filteredUsers.map((user: AdminUser) => (
                        <div
                          key={user._id}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedUser?._id === user._id
                              ? "bg-blue-500/30 border border-blue-400"
                              : "bg-white/10 border border-white/20 hover:bg-white/20"
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <p className="font-medium text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.username
                            }
                          </p>
                          <p className="text-sm text-blue-200">{user.email}</p>
                          <p className="text-sm text-green-400">
                            Balance: ${user.balance ? user.balance.toFixed(2) : '0.00'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* UID Search */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Hash className="w-5 h-5 mr-2 text-purple-400" />
                    Search by UID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="Enter user UID..."
                        value={uidSearchQuery}
                        onChange={(e) => {
                          setUidSearchQuery(e.target.value);
                          setEmailSearchQuery(""); // Clear other search
                        }}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 pl-10"
                      />
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      <p className="text-sm text-blue-200">
                        {filteredUsers.length} user(s) found
                      </p>
                      {filteredUsers.map((user: AdminUser) => (
                        <div
                          key={user._id}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedUser?._id === user._id
                              ? "bg-purple-500/30 border border-purple-400"
                              : "bg-white/10 border border-white/20 hover:bg-white/20"
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <p className="font-medium text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.username
                            }
                          </p>
                          <p className="text-sm text-blue-200">{user.email}</p>
                          <p className="text-sm text-purple-400">UID: {user.uid}</p>
                          <p className="text-sm text-green-400">
                            Balance: ${user.balance ? user.balance.toFixed(2) : '0.00'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPullToRefresh>
  );
}