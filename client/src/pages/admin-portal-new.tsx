import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AdminPullToRefresh } from "@/components/admin-pull-to-refresh";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
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

interface UserActivity {
  _id: string;
  userId: string;
  activityType: 'login' | 'logout' | 'page_view' | 'trade' | 'deposit' | 'withdrawal' | 'transfer';
  details: {
    page?: string;
    ip?: string;
    userAgent?: string;
    amount?: number;
    currency?: string;
    description?: string;
  };
  timestamp: Date;
}

interface UserSession {
  _id: string;
  userId: string;
  sessionId: string;
  loginTime: Date;
  logoutTime?: Date;
  lastActivity: Date;
  duration: number;
  ip: string;
  userAgent: string;
  isActive: boolean;
}

export default function AdminPortalNew() {
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [uidSearchQuery, setUidSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [copiedId, setCopiedId] = useState("");
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

  // Search users by email
  const { data: emailSearchResults = { users: [] }, isLoading: emailSearchLoading } = useQuery({
    queryKey: ["/api/admin/search/email", { q: emailSearchQuery }],
    enabled: emailSearchQuery.length >= 1 && isAuthenticated,
    refetchInterval: false,
  });

  // Search users by UID
  const { data: uidSearchResults = { users: [] }, isLoading: uidSearchLoading } = useQuery({
    queryKey: ["/api/admin/search/uid", { q: uidSearchQuery }],
    enabled: uidSearchQuery.length >= 1 && isAuthenticated,
    refetchInterval: false,
  });

  // Get all users for admin header with auto-refresh
  const { data: allUsers = [], refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users/all"],
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Get user activity for selected user
  const { data: userActivity } = useQuery({
    queryKey: ["/api/admin/activity", selectedUser?._id],
    enabled: !!selectedUser && isAuthenticated,
    refetchInterval: 5000,
  });

  // Get user sessions and online time for selected user
  const { data: userSessions } = useQuery({
    queryKey: ["/api/admin/sessions", selectedUser?._id],
    enabled: !!selectedUser && isAuthenticated,
    refetchInterval: 10000,
  });

  // Get overall activity stats
  const { data: activityStats } = useQuery({
    queryKey: ["/api/admin/activity-stats"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/search/email"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/search/uid"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/search/email"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/search/uid"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
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

  const copyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(""), 2000);
    toast({
      title: "Copied",
      description: "User ID copied to clipboard",
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

  // Admin dashboard refresh function
  const handleAdminRefresh = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/search/email"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/search/uid"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/activity-stats"] }),
        refetchUsers()
      ]);
      
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

  // Admin dashboard with enhanced features
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

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="search" className="text-white data-[state=active]:bg-white/20">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-white data-[state=active]:bg-white/20">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-white data-[state=active]:bg-white/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              <Users className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
          </TabsList>

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
                        onChange={(e) => setEmailSearchQuery(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                      {emailSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {emailSearchQuery.length > 0 ? (
                        <>
                          <p className="text-sm text-blue-200">
                            {emailSearchResults.users?.length || 0} user(s) found
                          </p>
                          {emailSearchResults.users?.map((user: AdminUser) => (
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
                                  <p className="text-sm text-blue-200">{user.email}</p>
                                  <p className="text-sm text-green-400 font-medium">
                                    Balance: ${user.balance.toFixed(2)}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-xs text-blue-400">UID: {user.uid}</p>
                                    {user.password && (
                                      <div className="flex items-center space-x-1">
                                        <p className="text-xs text-yellow-400">
                                          Password: {showPassword[user._id] ? user.password : '••••••••'}
                                        </p>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-4 w-4 p-0 text-yellow-300 hover:text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            togglePasswordVisibility(user._id);
                                          }}
                                        >
                                          {showPassword[user._id] ? (
                                            <EyeOff className="w-3 h-3" />
                                          ) : (
                                            <Eye className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                        onChange={(e) => setUidSearchQuery(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 pl-10"
                      />
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
                      {uidSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    {uidSearchQuery.length >= 2 && (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-200">
                          {uidSearchResults.users?.length || 0} user(s) found
                        </p>
                        {uidSearchResults.users?.map((user: AdminUser) => (
                          <div
                            key={user._id}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedUser?._id === user._id
                                ? "bg-purple-500/30 border border-purple-400"
                                : "bg-white/10 border border-white/20 hover:bg-white/20"
                            }`}
                            onClick={() => setSelectedUser(user)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
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
                                    Balance: ${user.balance.toFixed(2)}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-xs text-purple-400">UID: {user.uid}</p>
                                    {user.password && (
                                      <div className="flex items-center space-x-1">
                                        <p className="text-xs text-yellow-400">
                                          Password: {showPassword[user._id] ? user.password : '••••••••'}
                                        </p>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-4 w-4 p-0 text-yellow-300 hover:text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            togglePasswordVisibility(user._id);
                                          }}
                                        >
                                          {showPassword[user._id] ? (
                                            <EyeOff className="w-3 h-3" />
                                          ) : (
                                            <Eye className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected User Actions */}
            {selectedUser && (
              <Card className="mt-6 bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <User className="w-5 h-5 mr-2 text-green-400" />
                    Manage User: {selectedUser.firstName} {selectedUser.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-200 mb-2">Current Balance</p>
                      <p className="text-2xl font-bold text-green-400">${selectedUser.balance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200 mb-2">Fund Amount</p>
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
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            {selectedUser ? (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Activity className="w-5 h-5 mr-2 text-orange-400" />
                    User Activity: {selectedUser.firstName} {selectedUser.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userActivity?.data?.activities?.length > 0 ? (
                      userActivity.data.activities.slice(0, 10).map((activity: UserActivity) => (
                        <div key={activity._id} className="p-3 bg-white/10 rounded-lg border border-white/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="text-orange-300 border-orange-400">
                                {activity.activityType}
                              </Badge>
                              <div>
                                <p className="text-white text-sm">{activity.details.description || 'No description'}</p>
                                <p className="text-blue-200 text-xs">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {activity.details.amount && (
                              <p className="text-green-400 font-medium">
                                ${activity.details.amount}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-200 text-center py-8">No activity data available for this user</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="text-center py-12">
                  <Activity className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Select a User</p>
                  <p className="text-blue-200">Please select a user from the search tab to view their activity</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="sessions" className="mt-6">
            {selectedUser ? (
              <div className="space-y-6">
                {/* Online Time Chart */}
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                      Online Time Chart: {selectedUser.firstName} {selectedUser.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {userSessions?.data?.dailyStats?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userSessions.data.dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="duration" 
                              stroke="#8B5CF6" 
                              strokeWidth={2}
                              dot={{ fill: '#8B5CF6' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-blue-200">No session data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Session Details */}
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Clock className="w-5 h-5 mr-2 text-green-400" />
                      Session Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {userSessions?.data?.totalOnlineTime || 0}
                        </p>
                        <p className="text-blue-200 text-sm">Total Minutes Online</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">
                          {userSessions?.data?.sessions?.length || 0}
                        </p>
                        <p className="text-blue-200 text-sm">Total Sessions</p>
                      </div>
                      <div className="text-center">
                        <Badge 
                          variant={userSessions?.data?.isCurrentlyOnline ? "default" : "secondary"}
                          className={userSessions?.data?.isCurrentlyOnline ? "bg-green-600" : "bg-gray-600"}
                        >
                          {userSessions?.data?.isCurrentlyOnline ? "Online" : "Offline"}
                        </Badge>
                        <p className="text-blue-200 text-sm mt-1">Current Status</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Recent Sessions</h4>
                      {userSessions?.data?.sessions?.slice(0, 5).map((session: UserSession) => (
                        <div key={session._id} className="p-3 bg-white/10 rounded-lg border border-white/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm">
                                {new Date(session.loginTime).toLocaleString()}
                              </p>
                              <p className="text-blue-200 text-xs">
                                Duration: {Math.round(session.duration / 60)} minutes
                              </p>
                            </div>
                            <Badge 
                              variant={session.isActive ? "default" : "secondary"}
                              className={session.isActive ? "bg-green-600" : "bg-gray-600"}
                            >
                              {session.isActive ? "Active" : "Ended"}
                            </Badge>
                          </div>
                        </div>
                      )) || (
                        <p className="text-blue-200 text-center py-4">No session data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Select a User</p>
                  <p className="text-blue-200">Please select a user from the search tab to view their analytics</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {activityStats?.data?.totalActivities || 0}
                    </p>
                    <p className="text-blue-200 text-sm">Total Activities</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {activityStats?.data?.activeUsers || 0}
                    </p>
                    <p className="text-blue-200 text-sm">Active Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      {activityStats?.data?.activitiesLast24h || 0}
                    </p>
                    <p className="text-blue-200 text-sm">Activities (24h)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">
                      {activityStats?.data?.sessionsLast24h || 0}
                    </p>
                    <p className="text-blue-200 text-sm">Sessions (24h)</p>
                  </div>
                </div>

                {/* Activity Breakdown Chart */}
                {activityStats?.data?.activityBreakdown?.length > 0 && (
                  <div className="h-64">
                    <h4 className="text-white font-medium mb-4">Activity Breakdown (Last 7 Days)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityStats.data.activityBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="_id" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPullToRefresh>
  );
}