import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Search, Users, Shield, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
  allFeaturesDisabled?: boolean;
}

export default function MinimalAdminPortal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with no limit
  const { data: allUsers, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users/all'],
  });

  // Analytics data
  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ['/api/admin/users/analytics'],
  });

  const handleAdminRefresh = async () => {
    try {
      await Promise.all([refetchUsers(), refetchAnalytics()]);
      toast({
        title: "Data Refreshed",
        description: "All admin data has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed", 
        description: "Failed to refresh admin data.",
        variant: "destructive",
      });
    }
  };

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/logout', 'POST'),
    onSuccess: () => {
      window.location.href = '/admin-login';
    },
    onError: (error) => {
      console.error('Logout error:', error);
    }
  });

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-2">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col items-start justify-between mb-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Portal</h1>
              <p className="text-blue-200 text-xs">Platform Management</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={handleAdminRefresh}
              variant="outline" 
              size="sm"
              className="border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs px-2 py-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh Data
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs px-2 py-1"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {Array.isArray(allUsers) ? allUsers.length : 0}
              </div>
              <div className="text-xs text-blue-200">Total Users</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {(analyticsData as any)?.analytics?.onlineUsers || 0}
              </div>
              <div className="text-xs text-green-200">Online Now</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center">
            <Users className="w-4 h-4 mr-2" />
            All Users ({Array.isArray(allUsers) ? allUsers.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {usersLoading ? (
            <div className="text-white text-center py-4">Loading users...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Array.isArray(allUsers) && allUsers.map((user: AdminUser) => (
                <div key={user._id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="text-xs bg-blue-600">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white text-xs font-medium">
                        {user.username}
                      </div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-xs">
                      ${user.balance?.toFixed(2) || '0.00'}
                    </div>
                    {user.isVerified && (
                      <Badge className="bg-green-600/20 text-green-400 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}