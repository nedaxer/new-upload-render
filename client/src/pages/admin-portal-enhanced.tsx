import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminPullToRefresh } from "@/components/admin-pull-to-refresh";
import AdminDepositCreator from "@/components/admin-deposit-creator";
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
  Eye,
  EyeOff,
  Activity,
  TrendingUp,
  Hash,
  BarChart3,
  Wifi,
  WifiOff
} from "lucide-react";

interface AdminUser {
  _id: string;
  uid: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  isVerified: boolean;
  isAdmin: boolean;
  balance: number;
  lastActivity?: string;
  onlineTime?: number;
  isOnline?: boolean;
  sessionStart?: string;
  createdAt?: string;
}

interface UserAnalytics {
  totalUsers: number;
  onlineUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  topActiveUsers: Array<{
    username: string;
    email: string;
    onlineTime: number;
    lastActivity: string;
    isOnline: boolean;
  }>;
}

export default function AdminPortalEnhanced() {
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [uidSearchQuery, setUidSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [showUsersList, setShowUsersList] = useState(false);
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
        description: "Welcome to the enhanced admin portal",
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
  const { data: emailSearchResults = [], isLoading: emailSearchLoading } = useQuery({
    queryKey: ["/api/admin/users/search/email", emailSearchQuery],
    enabled: emailSearchQuery.length > 0 && isAuthenticated,
    refetchInterval: emailSearchQuery.length > 0 ? 3000 : false,
  });

  // Search users by UID
  const { data: uidSearchResults = [], isLoading: uidSearchLoading } = useQuery({
    queryKey: ["/api/admin/users/search/uid", uidSearchQuery],
    enabled: uidSearchQuery.length > 0 && isAuthenticated,
    refetchInterval: uidSearchQuery.length > 0 ? 3000 : false,
  });

  // Get all users for admin overview with auto-refresh
  const { data: allUsers = [], refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users/all"],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get user analytics
  const { data: analyticsData, refetch: refetchAnalytics } = useQuery<{ success: boolean; analytics: UserAnalytics }>({
    queryKey: ["/api/admin/users/analytics"],
    enabled: isAuthenticated,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Get user password
  const getUserPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user password');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUserPassword(data.password);
      setShowPassword(true);
      toast({
        title: "Password Retrieved",
        description: "User password has been fetched successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get user password",
        variant: "destructive",
      });
    },
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const response = await fetch("/api/admin/users/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
        credentials: 'include'
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add funds");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
      setFundAmount("");
      toast({
        title: "Funds Added",
        description: data.message,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove funds mutation
  const removeFundsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const response = await fetch("/api/admin/users/remove-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
        credentials: 'include'
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to remove funds");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
      setFundAmount("");
      toast({
        title: "Funds Removed",
        description: data.message,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Removing Funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
      setSelectedUser(null);
      toast({
        title: "User Deleted",
        description: "User account has been permanently deleted",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate(adminCredentials);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedUser(null);
    sessionStorage.removeItem('skipSplashScreen');
    window.location.href = '/';
  };

  const handleCopyId = (id: string, type: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`,
      variant: "default",
    });
  };

  const handleAddFunds = () => {
    if (!selectedUser || !fundAmount) return;
    
    const amount = parseFloat(fundAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    addFundsMutation.mutate({ userId: selectedUser._id, amount });
  };

  const handleRemoveFunds = () => {
    if (!selectedUser || !fundAmount) return;
    
    const amount = parseFloat(fundAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    removeFundsMutation.mutate({ userId: selectedUser._id, amount });
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (confirm(`Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const formatOnlineTime = (minutes: number = 0) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Admin dashboard refresh function
  const handleAdminRefresh = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search/email"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search/uid"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/analytics"] }),
        refetchUsers(),
        refetchAnalytics()
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">Enhanced Admin Portal</CardTitle>
            <p className="text-blue-200">Advanced user management system</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Admin email"
                value={adminCredentials.email}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                required
              />
              <Input
                type="password"
                placeholder="Admin password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={adminLoginMutation.isPending}
              >
                {adminLoginMutation.isPending ? "Authenticating..." : "Access Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminPullToRefresh onRefresh={handleAdminRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-3">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Enhanced Admin Portal</h1>
                <p className="text-blue-200">Advanced Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowUsersList(!showUsersList)}
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <Users className="w-4 h-4 mr-1" />
                Users ({(allUsers as any)?.length || 0})
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          {analyticsData?.success && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Total Users</p>
                      <p className="text-white text-2xl font-bold">{analyticsData.analytics.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Online Now</p>
                      <p className="text-white text-2xl font-bold">{analyticsData.analytics.onlineUsers}</p>
                    </div>
                    <Wifi className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm">Active 24h</p>
                      <p className="text-white text-2xl font-bold">{analyticsData.analytics.activeUsers24h}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Active 7d</p>
                      <p className="text-white text-2xl font-bold">{analyticsData.analytics.activeUsers7d}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Enhanced Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Activity Analytics
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-green-600">
              <Activity className="w-4 h-4 mr-2" />
              Live Monitoring
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Enhanced Search Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email Search */}
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-400" />
                    Search by Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Enter user email..."
                      value={emailSearchQuery}
                      onChange={(e) => setEmailSearchQuery(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                  
                  {emailSearchLoading && (
                    <div className="mt-3 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                    </div>
                  )}
                  
                  {emailSearchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-blue-200">{emailSearchResults.length} user(s) found</p>
                      {emailSearchResults.map((user: AdminUser) => (
                        <div
                          key={user._id}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedUser?._id === user._id
                              ? "bg-blue-500/30 border border-blue-400"
                              : "bg-white/10 border border-white/20 hover:bg-white/20"
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback className="bg-blue-500 text-white text-xs">
                                {user.username?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">{user.username}</p>
                              <p className="text-xs text-blue-200">{user.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 text-sm font-mono">${user.balance?.toFixed(2) || '0.00'}</p>
                              {user.isOnline && <Badge className="bg-green-500 text-xs">Online</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* UID Search */}
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-purple-400" />
                    Search by UID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Enter user UID..."
                      value={uidSearchQuery}
                      onChange={(e) => setUidSearchQuery(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                  
                  {uidSearchLoading && (
                    <div className="mt-3 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                    </div>
                  )}
                  
                  {uidSearchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-purple-200">{uidSearchResults.length} user(s) found</p>
                      {uidSearchResults.map((user: AdminUser) => (
                        <div
                          key={user._id}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedUser?._id === user._id
                              ? "bg-purple-500/30 border border-purple-400"
                              : "bg-white/10 border border-white/20 hover:bg-white/20"
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback className="bg-purple-500 text-white text-xs">
                                {user.username?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">{user.username}</p>
                              <p className="text-xs text-purple-200 font-mono">UID: {user.uid}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 text-sm font-mono">${user.balance?.toFixed(2) || '0.00'}</p>
                              {user.isOnline && <Badge className="bg-green-500 text-xs">Online</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced User Details Panel */}
            {selectedUser && (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedUser.profilePicture} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {selectedUser.username?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                        <p className="text-blue-200">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedUser.isOnline ? (
                        <Badge className="bg-green-500">
                          <Wifi className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <WifiOff className="w-3 h-3 mr-1" />
                          Offline
                        </Badge>
                      )}
                      {selectedUser.isVerified && (
                        <Badge className="bg-blue-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {selectedUser.isAdmin && (
                        <Badge className="bg-purple-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">User ID</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-mono">{selectedUser._id.substring(0, 8)}...</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyId(selectedUser._id, "User ID")}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400">UID</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-mono">{selectedUser.uid}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyId(selectedUser.uid, "UID")}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400">Balance</p>
                          <p className="text-green-400 font-mono text-lg">${selectedUser.balance?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Online Time</p>
                          <p className="text-blue-400">{formatOnlineTime(selectedUser.onlineTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Last Activity</p>
                          <p className="text-orange-400">{formatLastActivity(selectedUser.lastActivity)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Member Since</p>
                          <p className="text-purple-400">{new Date(selectedUser.createdAt || '').toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Password Section */}
                      <div className="border-t border-white/20 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-400">User Password</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => getUserPasswordMutation.mutate(selectedUser._id)}
                            disabled={getUserPasswordMutation.isPending}
                            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                          >
                            {getUserPasswordMutation.isPending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400 mr-2"></div>
                            ) : (
                              <Eye className="w-4 h-4 mr-1" />
                            )}
                            View Password
                          </Button>
                        </div>
                        {showPassword && userPassword && (
                          <div className="flex items-center space-x-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                            <p className="text-white font-mono flex-1">
                              {showPassword ? userPassword : '••••••••••••'}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                              className="h-6 w-6 p-0"
                            >
                              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyId(userPassword, "Password")}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                      {/* Fund Management */}
                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                          Fund Management
                        </h4>
                        <div className="space-y-3">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter amount..."
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleAddFunds}
                              disabled={addFundsMutation.isPending || !fundAmount}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                            >
                              {addFundsMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <Plus className="w-4 h-4 mr-1" />
                              )}
                              Add Funds
                            </Button>
                            <Button
                              onClick={handleRemoveFunds}
                              disabled={removeFundsMutation.isPending || !fundAmount}
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/20 flex-1"
                            >
                              {removeFundsMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                              ) : (
                                <Minus className="w-4 h-4 mr-1" />
                              )}
                              Remove Funds
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Deposit Transaction History */}
                      <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-400/30">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-yellow-400" />
                          Deposit Transaction History
                        </h4>
                        <p className="text-yellow-200 text-sm mb-3">Create crypto deposit with transaction history and user notification</p>
                        <AdminDepositCreator 
                          userId={selectedUser._id} 
                          username={selectedUser.username}
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search/email"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search/uid"] });
                          }}
                        />
                      </div>

                      {/* Danger Zone */}
                      <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                          Danger Zone
                        </h4>
                        <Button
                          onClick={() => handleDeleteUser(selectedUser)}
                          disabled={deleteUserMutation.isPending}
                          variant="outline"
                          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          {deleteUserMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Delete User Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsData?.success && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Active Users Chart */}
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                      Top Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.analytics.topActiveUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${index < 3 ? 'bg-yellow-500' : 'bg-gray-500'} text-xs`}>
                              #{index + 1}
                            </Badge>
                            <div>
                              <p className="text-white font-medium">{user.username}</p>
                              <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-400 font-mono">{formatOnlineTime(user.onlineTime)}</p>
                            <p className="text-gray-400 text-xs">{formatLastActivity(user.lastActivity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Wifi className="w-4 h-4 text-green-400" />
                          <span className="text-white">Currently Online</span>
                        </div>
                        <span className="text-green-400 font-bold">{analyticsData.analytics.onlineUsers}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-orange-400" />
                          <span className="text-white">Active Last 24h</span>
                        </div>
                        <span className="text-orange-400 font-bold">{analyticsData.analytics.activeUsers24h}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                          <span className="text-white">Active Last 7d</span>
                        </div>
                        <span className="text-purple-400 font-bold">{analyticsData.analytics.activeUsers7d}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-white">Total Users</span>
                        </div>
                        <span className="text-blue-400 font-bold">{analyticsData.analytics.totalUsers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {showUsersList && (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    Live User Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(allUsers as AdminUser[]).map((user) => (
                      <div
                        key={user._id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                          user.isOnline 
                            ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20" 
                            : "bg-white/10 border-white/20 hover:bg-white/20"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback className="bg-blue-500 text-white">
                              {user.username?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-white">{user.username}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                          {user.isOnline ? (
                            <Badge className="bg-green-500">
                              <Wifi className="w-3 h-3 mr-1" />
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <WifiOff className="w-3 h-3 mr-1" />
                              Offline
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Balance:</span>
                            <span className="text-green-400 font-mono">${user.balance?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Online Time:</span>
                            <span className="text-blue-400">{formatOnlineTime(user.onlineTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Activity:</span>
                            <span className="text-orange-400">{formatLastActivity(user.lastActivity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminPullToRefresh>
  );
}