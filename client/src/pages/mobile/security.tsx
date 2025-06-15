import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Shield,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Globe,
  Clock,
  MapPin,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function MobileSecurity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [withdrawalConfirmation, setWithdrawalConfirmation] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.100',
      browser: 'Safari 17.0',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: 2,
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.101',
      browser: 'Chrome 120.0',
      lastActive: '1 hour ago',
      current: false
    },
    {
      id: 3,
      device: 'iPad Air',
      location: 'Oakland, CA',
      ip: '10.0.1.50',
      browser: 'Safari 17.0',
      lastActive: '1 day ago',
      current: false
    }
  ]);

  const [loginHistory, setLoginHistory] = useState([
    {
      id: 1,
      timestamp: '2025-06-15 12:30:45',
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      timestamp: '2025-06-15 08:15:22',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.101',
      status: 'success'
    },
    {
      id: 3,
      timestamp: '2025-06-14 22:45:33',
      device: 'Unknown Device',
      location: 'New York, NY',
      ip: '203.0.113.1',
      status: 'failed'
    },
    {
      id: 4,
      timestamp: '2025-06-14 15:20:11',
      device: 'iPad Air',
      location: 'Oakland, CA',
      ip: '10.0.1.50',
      status: 'success'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update session last active times
      setSessions(prev => prev.map(session => ({
        ...session,
        lastActive: session.current ? 'Just now' : session.lastActive
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    // Simulate password change
    toast({
      title: "Success",
      description: "Password updated successfully",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleTerminateSession = (sessionId: number) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    toast({
      title: "Success",
      description: "Session terminated successfully",
    });
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: twoFactorEnabled 
        ? "Two-factor authentication has been disabled" 
        : "Two-factor authentication has been enabled",
    });
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <Link href="/mobile/profile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-white text-lg font-semibold">Security</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Security Overview */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-lg font-semibold">Security Status</h2>
            <Badge className="bg-green-500 text-white">Secure</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-300 text-sm">Password Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              {twoFactorEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              <span className="text-gray-300 text-sm">2FA {twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-300 text-sm">Email Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-300 text-sm">Secure Connection</span>
            </div>
          </div>
        </Card>

        {/* Password Change */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Change Password
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Current Password</Label>
              <div className="relative">
                <Input 
                  type={showCurrentPassword ? "text" : "password"}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-gray-300">New Password</Label>
              <div className="relative">
                <Input 
                  type={showNewPassword ? "text" : "password"}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Confirm New Password</Label>
              <Input 
                type="password"
                className="bg-gray-700 border-gray-600 text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handlePasswordChange}
            >
              Update Password
            </Button>
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Two-Factor Authentication
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Authenticator App</p>
              <p className="text-gray-400 text-sm">Use Google Authenticator or similar app</p>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={handleToggle2FA}
            />
          </div>
          {!twoFactorEnabled && (
            <Button 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleToggle2FA}
            >
              Setup 2FA
            </Button>
          )}
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white text-lg font-semibold mb-4">Security Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">Security alerts via email</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-gray-400 text-sm">Security alerts via SMS</p>
              </div>
              <Switch 
                checked={smsNotifications} 
                onCheckedChange={setSmsNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Login Alerts</p>
                <p className="text-gray-400 text-sm">Notify on new device logins</p>
              </div>
              <Switch 
                checked={loginAlerts} 
                onCheckedChange={setLoginAlerts}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Withdrawal Confirmation</p>
                <p className="text-gray-400 text-sm">Email confirmation for withdrawals</p>
              </div>
              <Switch 
                checked={withdrawalConfirmation} 
                onCheckedChange={setWithdrawalConfirmation}
              />
            </div>
          </div>
        </Card>

        {/* Active Sessions */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Active Sessions
            </h3>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-600 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-medium">{session.device}</span>
                      {session.current && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm space-y-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{session.browser} • {session.ip}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Last active: {session.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Login History */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Login Activity
          </h3>
          <div className="space-y-3">
            {loginHistory.map((login) => (
              <div key={login.id} className="border border-gray-600 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {login.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-white font-medium">{login.device}</span>
                      <Badge 
                        variant={login.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {login.status}
                      </Badge>
                    </div>
                    <div className="text-gray-400 text-sm space-y-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{login.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{login.location} • {login.ip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Actions */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center text-red-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            Emergency Actions
          </h3>
          <div className="space-y-3">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => {
                setSessions(prev => prev.filter(s => s.current));
                toast({
                  title: "Success",
                  description: "All other sessions terminated",
                });
              }}
            >
              Terminate All Other Sessions
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              Freeze Account Temporarily
            </Button>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}