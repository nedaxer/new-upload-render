import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Shield, Lock, Smartphone, Eye, EyeOff, Key, AlertTriangle, Check, Clock, Globe } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  loginNotifications: boolean;
  screenLock: boolean;
  autoLogout: number; // minutes
  trustedDevices: string[];
  loginHistory: LoginAttempt[];
}

interface LoginAttempt {
  id: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  device: string;
  successful: boolean;
}

export default function SecurityPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    biometricEnabled: false,
    loginNotifications: true,
    screenLock: true,
    autoLogout: 30,
    trustedDevices: [],
    loginHistory: []
  });

  // Fetch security settings
  const { data: securityData, refetch: refetchSecurity } = useQuery({
    queryKey: ['security', 'settings', user?.id],
    queryFn: () => apiRequest('/api/user/security/settings'),
    enabled: !!user?.id,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Fetch login history
  const { data: loginHistory } = useQuery({
    queryKey: ['security', 'login-history', user?.id],
    queryFn: () => apiRequest('/api/user/security/login-history'),
    enabled: !!user?.id,
    refetchInterval: 60000, // Real-time updates every minute
  });

  // Update security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: async (settings: Partial<SecuritySettings>) => {
      const response = await fetch('/api/user/security/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update security settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'settings'] });
      refetchSecurity();
      toast({
        title: "Security Updated",
        description: "Your security settings have been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update security settings.",
        variant: "destructive"
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password.",
        variant: "destructive"
      });
    }
  });

  // Update settings from server data
  useEffect(() => {
    if (securityData?.data) {
      setSecuritySettings(prev => ({
        ...prev,
        ...securityData.data
      }));
    }
  }, [securityData]);

  // Real-time updates listener
  useEffect(() => {
    const handleSecurityUpdate = () => {
      refetchSecurity();
    };

    window.addEventListener('securityUpdated', handleSecurityUpdate);
    return () => {
      window.removeEventListener('securityUpdated', handleSecurityUpdate);
    };
  }, [refetchSecurity]);

  const handleSecurityToggle = (setting: keyof SecuritySettings, value: boolean | number) => {
    const updatedSettings = { ...securitySettings, [setting]: value };
    setSecuritySettings(updatedSettings);
    updateSecurityMutation.mutate({ [setting]: value });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const formatLastLogin = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/mobile/settings')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Security</h1>
        </div>
        <Shield className="w-5 h-5 text-orange-500" />
      </div>

      <div className="p-4 space-y-6">
        {/* Password Section */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold">Password</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="border-gray-700 text-gray-300 hover:text-white"
              >
                {isChangingPassword ? 'Cancel' : 'Change'}
              </Button>
            </div>

            {isChangingPassword && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
            
            <div className="space-y-4">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => handleSecurityToggle('twoFactorEnabled', checked)}
                />
              </div>

              {/* Biometric Authentication */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Biometric Login</p>
                    <p className="text-gray-400 text-sm">Use fingerprint or face recognition</p>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.biometricEnabled}
                  onCheckedChange={(checked) => handleSecurityToggle('biometricEnabled', checked)}
                />
              </div>

              {/* Login Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Login Notifications</p>
                    <p className="text-gray-400 text-sm">Get notified of new logins</p>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => handleSecurityToggle('loginNotifications', checked)}
                />
              </div>

              {/* Screen Lock */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Screen Lock</p>
                    <p className="text-gray-400 text-sm">Require authentication to unlock</p>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.screenLock}
                  onCheckedChange={(checked) => handleSecurityToggle('screenLock', checked)}
                />
              </div>

              {/* Auto Logout */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Auto Logout</p>
                    <p className="text-gray-400 text-sm">Automatically logout after inactivity</p>
                  </div>
                </div>
                <select
                  value={securitySettings.autoLogout}
                  onChange={(e) => handleSecurityToggle('autoLogout', parseInt(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Login History */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Login Activity</h2>
              <Globe className="w-5 h-5 text-orange-500" />
            </div>
            
            <div className="space-y-3">
              {loginHistory?.data?.slice(0, 5).map((login: LoginAttempt) => (
                <div key={login.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${login.successful ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{login.device}</p>
                      <p className="text-gray-400 text-xs">{login.location} • {login.ipAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">{formatLastLogin(login.timestamp.toString())}</p>
                    {login.successful ? (
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 ml-auto" />
                    )}
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No recent login activity</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Security Status */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Security Status</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Two-Factor Authentication</span>
                <div className={`flex items-center space-x-1 ${securitySettings.twoFactorEnabled ? 'text-green-500' : 'text-red-500'}`}>
                  {securitySettings.twoFactorEnabled ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span className="text-sm">{securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Biometric Login</span>
                <div className={`flex items-center space-x-1 ${securitySettings.biometricEnabled ? 'text-green-500' : 'text-gray-500'}`}>
                  {securitySettings.biometricEnabled ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span className="text-sm">{securitySettings.biometricEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Login Notifications</span>
                <div className={`flex items-center space-x-1 ${securitySettings.loginNotifications ? 'text-green-500' : 'text-red-500'}`}>
                  {securitySettings.loginNotifications ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span className="text-sm">{securitySettings.loginNotifications ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}