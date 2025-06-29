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
import { apiRequest } from "@/lib/queryClient";
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

export default function UnifiedAdminPortal() {
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [uidSearchQuery, setUidSearchQuery] = useState("");
  const [generalSearchQuery, setGeneralSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [showUsersList, setShowUsersList] = useState(false);
  const [showKycPanel, setShowKycPanel] = useState(true);
  const [copiedId, setCopiedId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Force desktop view for admin portal
  useEffect(() => {
    sessionStorage.setItem('skipSplashScreen', 'true');
    
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=1200, initial-scale=1.0');
    } else {
      const metaViewport = document.createElement('meta');
      metaViewport.name = 'viewport';
      metaViewport.content = 'width=1200, initial-scale=1.0';
      document.head.appendChild(metaViewport);
    }

    document.body.style.minWidth = '1200px';
    document.body.style.overflow = 'auto';

    return () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
      document.body.style.minWidth = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Check admin authentication on mount
  useEffect(() => {
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
        description: "Welcome to the unified admin portal",
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

  // Get all users for admin overview with auto-refresh
  const { data: allUsers = [], refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users/all"],
    queryFn: async () => {
      const response = await fetch('/api/admin/users/all', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.data || [];
    },
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Get user analytics
  const { data: analyticsData, refetch: refetchAnalytics } = useQuery<{ success: boolean; analytics: UserAnalytics }>({
    queryKey: ["/api/admin/users/analytics"],
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  // Search users by email
  const { data: emailSearchResults = [], isLoading: emailSearchLoading } = useQuery({
    queryKey: ["/api/admin/users/search/email", emailSearchQuery],
    queryFn: async () => {
      if (!emailSearchQuery.trim()) return [];
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(emailSearchQuery)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data || [];
    },
    enabled: emailSearchQuery.length > 0 && isAuthenticated,
    refetchInterval: 3000,
  });

  // Search users by UID
  const { data: uidSearchResults = [], isLoading: uidSearchLoading } = useQuery({
    queryKey: ["/api/admin/users/search/uid", uidSearchQuery],
    queryFn: async () => {
      if (!uidSearchQuery.trim()) return [];
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(uidSearchQuery)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data || [];
    },
    enabled: uidSearchQuery.length > 0 && isAuthenticated,
    refetchInterval: 3000,
  });

  // General search users
  const { data: generalSearchResults = [], isLoading: generalSearchLoading, refetch: refetchGeneralSearch } = useQuery({
    queryKey: ["/api/admin/users/search", generalSearchQuery],
    queryFn: async () => {
      if (!generalSearchQuery.trim()) return [];
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(generalSearchQuery)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data || [];
    },
    enabled: generalSearchQuery.length > 0 && isAuthenticated,
    refetchInterval: 2000,
  });

  // Get pending KYC verifications
  const { data: pendingKyc = [], refetch: refetchKyc } = useQuery({
    queryKey: ["/api/admin/pending-kyc"],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-kyc', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pending KYC');
      const data = await response.json();
      return data.data || [];
    },
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/admin/users/add-funds", { userId, amount });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds Added",
        description: "User balance updated successfully",
        variant: "default",
      });
      setFundAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
      refetchGeneralSearch();
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
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/admin/users/remove-funds", { userId, amount });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds Removed",
        description: "User balance updated successfully",
        variant: "default",
      });
      setFundAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
      refetchGeneralSearch();
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
      refetchGeneralSearch();
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

  // KYC Approval mutation
  const approveKycMutation = useMutation({
    mutationFn: async ({ userId, status, reason }: { userId: string; status: 'verified' | 'rejected'; reason?: string }) => {
      const response = await apiRequest("POST", "/api/admin/approve-kyc", { userId, status, reason });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.status === 'verified' ? "KYC Approved" : "KYC Rejected",
        description: `User verification ${variables.status} successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-kyc"] });
      refetchKyc();
    },
    onError: (error: any) => {
      toast({
        title: "Error Processing KYC",
        description: error.message || "Failed to process KYC verification",
        variant: "destructive",
      });
    },
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

  const handleAdminLogin = (e: React.FormEvent) => {
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
    setGeneralSearchQuery("");
    setEmailSearchQuery("");
    setUidSearchQuery("");
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

    if (amount > selectedUser.balance) {
      toast({
        title: "Insufficient Balance",
        description: "Cannot remove more than current balance",
        variant: "destructive",
      });
      return;
    }

    removeFundsMutation.mutate({ userId: selectedUser._id, amount });
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

  // Admin dashboard refresh function
  const handleAdminRefresh = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/search"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-kyc"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/analytics"] }),
        refetchUsers(),
        refetchKyc(),
        refetchAnalytics(),
        generalSearchQuery.length > 0 && refetchGeneralSearch()
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">Unified Admin Portal</CardTitle>
            <p className="text-blue-200">Complete platform management system</p>
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={adminLoginMutation.isPending}
              >
                {adminLoginMutation.isPending ? "Authenticating..." : "Access Admin Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard
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
                <h1 className="text-2xl font-bold text-white">Unified Admin Portal</h1>
                <p className="text-blue-200">Complete Platform Management</p>
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
                Users ({Array.isArray(allUsers) ? allUsers.length : 0})
              </Button>
              <Button 
                onClick={() => setShowKycPanel(!showKycPanel)}
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                KYC ({(pendingKyc as any)?.length || 0})
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

          {/* Analytics Overview */}
          {analyticsData?.analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    <div className="flex items-center">
                      <Wifi className="w-8 h-8 text-green-400" />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-200 text-sm">Active 24h</p>
                      <p className="text-white text-2xl font-bold">{analyticsData.analytics.activeUsers24h}</p>
                    </div>
                    <Activity className="w-8 h-8 text-yellow-400" />
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
                      {Array.isArray(allUsers) ? allUsers.length : 0} Total Users
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
                  {Array.isArray(allUsers) && allUsers.slice(0, 12).map((user: AdminUser) => (
                    <div
                      key={user._id}
                      className="p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            {user.profilePicture ? (
                              <AvatarImage src={user.profilePicture} alt={user.username} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                {user.firstName?.[0] || user.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              <p className="text-sm font-medium text-white truncate">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user.username
                                }
                              </p>
                              {user.isOnline && (
                                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
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
                {Array.isArray(allUsers) && allUsers.length > 12 && (
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

          {/* KYC Management Panel */}
          {showKycPanel && (
            <Card className="mb-4 bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-orange-400" />
                    KYC Verifications
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-200">
                      {(pendingKyc as any)?.length || 0} Pending
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-orange-400">Live</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(pendingKyc as any)?.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg font-medium">No Pending Verifications</p>
                    <p className="text-gray-400 text-sm">All KYC submissions have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(pendingKyc as any)?.map((verification: any) => (
                      <div
                        key={verification._id}
                        className="p-4 bg-white/10 rounded-lg border border-white/20"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {verification.firstName && verification.lastName 
                                  ? `${verification.firstName} ${verification.lastName}` 
                                  : verification.username
                                }
                              </p>
                              <p className="text-blue-200 text-sm">{verification.email}</p>
                              <p className="text-gray-400 text-xs">UID: {verification.uid}</p>
                            </div>
                          </div>
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                            Pending Review
                          </Badge>
                        </div>
                        
                        {verification.kycData && (
                          <div className="mb-4 space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Document Type:</span>
                                <span className="text-white ml-2">{verification.kycData.documentType || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Source of Income:</span>
                                <span className="text-white ml-2">{verification.kycData.sourceOfIncome || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Annual Income:</span>
                                <span className="text-white ml-2">{verification.kycData.annualIncome || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Investment Experience:</span>
                                <span className="text-white ml-2">{verification.kycData.investmentExperience || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 pt-3 border-t border-white/10">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                            onClick={() => approveKycMutation.mutate({ userId: verification._id, status: 'verified' })}
                            disabled={approveKycMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-300 hover:bg-red-500/20 flex-1"
                            onClick={() => {
                              const reason = prompt("Enter rejection reason (optional):");
                              approveKycMutation.mutate({ userId: verification._id, status: 'rejected', reason: reason || undefined });
                            }}
                            disabled={approveKycMutation.isPending}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:bg-white/20">
              <DollarSign className="w-4 h-4 mr-2" />
              Deposits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Top Active Users */}
            {analyticsData?.analytics?.topActiveUsers && (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
                    Most Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.analytics.topActiveUsers.map((user, index) => (
                      <div key={user.email} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-blue-200 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <p className="text-white text-sm">{Math.round(user.onlineTime / 60)}h</p>
                            {user.isOnline ? (
                              <Wifi className="w-4 h-4 text-green-400" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">
                            {new Date(user.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* Enhanced User Search */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-400" />
                  Advanced User Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Search by Email</label>
                    <div className="relative">
                      <Input
                        placeholder="Enter email address..."
                        value={emailSearchQuery}
                        onChange={(e) => setEmailSearchQuery(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                      {emailSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    {emailSearchResults.length > 0 && (
                      <p className="text-xs text-blue-200">{emailSearchResults.length} user(s) found</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Search by UID</label>
                    <div className="relative">
                      <Input
                        placeholder="Enter user ID..."
                        value={uidSearchQuery}
                        onChange={(e) => setUidSearchQuery(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                      />
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                      {uidSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    {uidSearchResults.length > 0 && (
                      <p className="text-xs text-blue-200">{uidSearchResults.length} user(s) found</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">General Search</label>
                    <div className="relative">
                      <Input
                        placeholder="Search by name, email, username, or UID..."
                        value={generalSearchQuery}
                        onChange={(e) => setGeneralSearchQuery(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                      {generalSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    {generalSearchResults.length > 0 && (
                      <p className="text-xs text-blue-200">{generalSearchResults.length} user(s) found</p>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {(emailSearchResults.length > 0 || uidSearchResults.length > 0 || generalSearchResults.length > 0) && (
                  <div className="space-y-3 mt-6">
                    <h3 className="text-white font-medium">Search Results</h3>
                    {[...emailSearchResults, ...uidSearchResults, ...generalSearchResults]
                      .filter((user, index, self) => self.findIndex(u => u._id === user._id) === index)
                      .map((user: AdminUser) => (
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
                              <Avatar className="w-10 h-10">
                                {user.profilePicture ? (
                                  <AvatarImage src={user.profilePicture} alt={user.username} />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                    {user.firstName?.[0] || user.username[0]?.toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-white">
                                    {user.firstName && user.lastName 
                                      ? `${user.firstName} ${user.lastName}` 
                                      : user.username
                                    }
                                  </p>
                                  {user.isOnline && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  )}
                                  {user.isVerified && (
                                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                  {user.isAdmin && (
                                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs">
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-blue-200 flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {user.email}
                                </p>
                                <p className="text-sm text-blue-300 flex items-center">
                                  <CreditCard className="w-3 h-3 mr-1" />
                                  Balance: ${user.balance.toFixed(2)}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
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
                                  {user.lastActivity && (
                                    <p className="text-xs text-gray-400">
                                      Last: {new Date(user.lastActivity).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected User Management */}
            {selectedUser && (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-green-400" />
                      Managing: {selectedUser.firstName && selectedUser.lastName 
                        ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                        : selectedUser.username}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fund Management */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Fund Management</h3>
                      <div className="space-y-3">
                        <Input
                          type="number"
                          placeholder="Enter amount"
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
                            <Plus className="w-4 h-4 mr-1" />
                            Add Funds
                          </Button>
                          <Button
                            onClick={handleRemoveFunds}
                            disabled={removeFundsMutation.isPending || !fundAmount}
                            variant="outline"
                            className="border-red-500/30 text-red-300 hover:bg-red-500/20 flex-1"
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* User Actions */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">User Actions</h3>
                      <div className="space-y-3">
                        <Button
                          onClick={() => getUserPasswordMutation.mutate(selectedUser._id)}
                          disabled={getUserPasswordMutation.isPending}
                          variant="outline"
                          className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                          View Password
                        </Button>
                        
                        {showPassword && userPassword && (
                          <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <p className="text-blue-200 text-sm">User Password:</p>
                            <p className="text-white font-mono break-all">{userPassword}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(userPassword);
                                toast({ title: "Password Copied", description: "User password copied to clipboard" });
                              }}
                              className="mt-2 text-blue-300 hover:text-white"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Password
                            </Button>
                          </div>
                        )}

                        <Button
                          onClick={() => handleDeleteUser(selectedUser)}
                          disabled={deleteUserMutation.isPending || selectedUser.isAdmin}
                          variant="outline"
                          className="w-full border-red-500/30 text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white font-medium mb-3">User Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white ml-2">{selectedUser.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">UID:</span>
                        <span className="text-white ml-2">{selectedUser.uid}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Balance:</span>
                        <span className="text-green-400 ml-2">${selectedUser.balance.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-2 ${selectedUser.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                          {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      {selectedUser.onlineTime && (
                        <div>
                          <span className="text-gray-400">Online Time:</span>
                          <span className="text-white ml-2">{Math.round(selectedUser.onlineTime / 60)}h</span>
                        </div>
                      )}
                      {selectedUser.lastActivity && (
                        <div>
                          <span className="text-gray-400">Last Activity:</span>
                          <span className="text-white ml-2">{new Date(selectedUser.lastActivity).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deposits" className="space-y-6">
            {selectedUser ? (
              <AdminDepositCreator 
                userId={selectedUser._id} 
                username={selectedUser.username}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/users/all"] });
                  refetchUsers();
                }}
              />
            ) : (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-8 text-center">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-medium mb-2">Create Deposit Transaction</h3>
                  <p className="text-gray-300 mb-4">Select a user from the User Management tab to create a deposit transaction.</p>
                  <Button
                    onClick={() => setActiveTab("users")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Go to User Management
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminPullToRefresh>
  );
}