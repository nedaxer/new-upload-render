import React, { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Shield,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi,
  MapPin,
  Monitor,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'device_change' | '2fa_enabled' | 'withdrawal';
  timestamp: Date;
  location: string;
  device: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'suspicious';
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: Date;
  isCurrent: boolean;
}

export default function MobileSecurity() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    withdrawalNotifications: true,
    deviceWhitelist: false,
    ipWhitelist: false
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<LoginSession[]>([]);

  // Real-time security monitoring
  useEffect(() => {
    // Simulate real-time security events
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        location: 'New York, US',
        device: 'iPhone 14 Pro',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        id: '2',
        type: 'withdrawal',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        location: 'New York, US',
        device: 'Chrome Browser',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        id: '3',
        type: 'login',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        location: 'Unknown Location',
        device: 'Unknown Device',
        ipAddress: '45.132.45.21',
        status: 'failed'
      }
    ];

    const mockSessions: LoginSession[] = [
      {
        id: '1',
        device: 'iPhone 14 Pro (Current)',
        location: 'New York, US',
        ipAddress: '192.168.1.100',
        lastActive: new Date(),
        isCurrent: true
      },
      {
        id: '2',
        device: 'Chrome on MacBook Pro',
        location: 'New York, US',
        ipAddress: '192.168.1.101',
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        isCurrent: false
      }
    ];

    setSecurityEvents(mockEvents);
    setActiveSessions(mockSessions);

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      // Update last active time for current session
      setActiveSessions(prev => prev.map(session => 
        session.isCurrent 
          ? { ...session, lastActive: new Date() }
          : session
      ));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error", 
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    // Simulate password change
    toast({
      title: "Success",
      description: "Password changed successfully",
    });

    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Add security event
    const newEvent: SecurityEvent = {
      id: Date.now().toString(),
      type: 'password_change',
      timestamp: new Date(),
      location: 'New York, US',
      device: 'iPhone 14 Pro',
      ipAddress: '192.168.1.100',
      status: 'success'
    };
    setSecurityEvents(prev => [newEvent, ...prev]);
  };

  const handleSecurityToggle = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));

    toast({
      title: "Security Setting Updated",
      description: `${setting} has been ${!securitySettings[setting] ? 'enabled' : 'disabled'}`,
    });
  };

  const terminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    toast({
      title: "Session Terminated",
      description: "Device session has been terminated successfully",
    });
  };

  const getEventIcon = (type: SecurityEvent['type'], status: SecurityEvent['status']) => {
    if (status === 'failed' || status === 'suspicious') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    
    switch (type) {
      case 'login':
        return <Smartphone className="w-5 h-5 text-green-500" />;
      case 'password_change':
        return <Lock className="w-5 h-5 text-blue-500" />;
      case '2fa_enabled':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <CheckCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatEventType = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return 'Login Attempt';
      case 'password_change':
        return 'Password Changed';
      case '2fa_enabled':
        return '2FA Enabled';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return 'Security Event';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <Link href="/mobile/profile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-white text-lg font-semibold">Security</h1>
        <div className="w-6 h-6" />
      </div>

      <div className="px-4 space-y-6">
        {/* Password Change Section */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-orange-500" />
            <h2 className="text-white text-lg font-semibold">Change Password</h2>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />

            <Button 
              onClick={handlePasswordChange}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Update Password
            </Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-orange-500" />
            <h2 className="text-white text-lg font-semibold">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-gray-400 text-sm">Add an extra layer of security</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={() => handleSecurityToggle('twoFactorEnabled')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Login Notifications</p>
                <p className="text-gray-400 text-sm">Get notified of new logins</p>
              </div>
              <Switch
                checked={securitySettings.loginNotifications}
                onCheckedChange={() => handleSecurityToggle('loginNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Withdrawal Notifications</p>
                <p className="text-gray-400 text-sm">Get notified of withdrawals</p>
              </div>
              <Switch
                checked={securitySettings.withdrawalNotifications}
                onCheckedChange={() => handleSecurityToggle('withdrawalNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Device Whitelist</p>
                <p className="text-gray-400 text-sm">Only allow trusted devices</p>
              </div>
              <Switch
                checked={securitySettings.deviceWhitelist}
                onCheckedChange={() => handleSecurityToggle('deviceWhitelist')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">IP Whitelist</p>
                <p className="text-gray-400 text-sm">Restrict access to specific IPs</p>
              </div>
              <Switch
                checked={securitySettings.ipWhitelist}
                onCheckedChange={() => handleSecurityToggle('ipWhitelist')}
              />
            </div>
          </div>
        </Card>

        {/* Active Sessions */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Monitor className="w-6 h-6 text-orange-500" />
            <h2 className="text-white text-lg font-semibold">Active Sessions</h2>
          </div>

          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <p className="text-white font-medium">{session.device}</p>
                      {session.isCurrent && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Wifi className="w-3 h-3" />
                        <span>{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(session.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      onClick={() => terminateSession(session.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Events Log */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-orange-500" />
            <h2 className="text-white text-lg font-semibold">Recent Security Events</h2>
          </div>

          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  {getEventIcon(event.type, event.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium">
                        {formatEventType(event.type)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.status === 'success' ? 'bg-green-500 text-white' :
                        event.status === 'failed' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Monitor className="w-3 h-3" />
                        <span>{event.device}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(event.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">IP: {event.ipAddress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            View All Events
          </Button>
        </Card>
      </div>
    </MobileLayout>
  );
}