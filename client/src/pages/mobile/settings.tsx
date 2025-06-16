import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ChevronRight, Camera, Copy, Check, Shield, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UserSettings {
  nickname?: string;
  language: string;
  currency: string;
  theme: string;
  screenLock: boolean;
}

export default function MobileSettings() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
    nickname: user?.username || '',
    language: 'English',
    currency: 'USD',
    theme: 'Dark Mode',
    screenLock: false
  });
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(settings.nickname || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate user ID for display
  const userId = user?.id ? `${user.id}75573582` : '475573582';

  // Fetch security settings for real-time status
  const { data: securityData } = useQuery({
    queryKey: ['security', 'settings', user?.id],
    queryFn: () => apiRequest('/api/user/security/settings'),
    enabled: !!user?.id,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Fetch KYC status
  const { data: kycData } = useQuery({
    queryKey: ['kyc', 'status', user?.id],
    queryFn: () => apiRequest('/api/users/kyc/status'),
    enabled: !!user?.id,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Fetch KYC status
  const { data: kycData } = useQuery({
    queryKey: ['kyc', 'status', user?.id],
    queryFn: () => apiRequest('/api/users/kyc/status'),
    enabled: !!user?.id,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Calculate security score based on enabled features
  const calculateSecurityScore = () => {
    if (!securityData?.data) return 0;
    const settings = securityData.data;
    let score = 0;
    if (settings.twoFactorEnabled) score += 30;
    if (settings.biometricEnabled) score += 20;
    if (settings.loginNotifications) score += 20;
    if (settings.screenLock) score += 15;
    if (settings.autoLogout && settings.autoLogout > 0) score += 15;
    return score;
  };

  const securityScore = calculateSecurityScore();
  const getSecurityLevel = () => {
    if (securityScore >= 80) return { level: 'High', color: 'text-green-500' };
    if (securityScore >= 50) return { level: 'Medium', color: 'text-yellow-500' };
    return { level: 'Low', color: 'text-red-500' };
  };

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    };

    const handleSecurityUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'settings'] });
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('securityUpdated', handleSecurityUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('securityUpdated', handleSecurityUpdate);
    };
  }, [queryClient]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { nickname?: string; profilePicture?: string }) => {
      const response = await fetch('/api/user/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Force a hard refresh of all user-related data
      queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      // Trigger global profile update event for synchronization
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);
    
    try {
      // Convert file to base64 for simple storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        updateProfileMutation.mutate({ profilePicture: base64 });
        setUploadingPhoto(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to read the image file. Please try again.",
          variant: "destructive"
        });
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingPhoto(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNicknameSave = () => {
    if (tempNickname.trim() && tempNickname !== settings.nickname) {
      updateProfileMutation.mutate({ nickname: tempNickname.trim() });
      setSettings(prev => ({ ...prev, nickname: tempNickname.trim() }));
    }
    setIsEditingNickname(false);
  };

  const handleThemeChange = (theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'Dark Mode') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
    
    toast({
      title: "Theme updated",
      description: `Switched to ${theme}`
    });
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "User ID copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy User ID",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/mobile')}
          className="text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="p-4 space-y-6">
        {/* Account Info Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Account Info</h2>
          
          {/* Profile Picture */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-300">Profile Picture</span>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePicture || ''} />
                <AvatarFallback className="bg-orange-500 text-white text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-gray-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handlePhotoUpload(file);
              }
            }}
            className="hidden"
          />

          {/* Email (Read-only) */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-300">Email</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">
                {user?.email || 'Not available'}
              </span>
            </div>
          </div>

          {/* Username/Nickname */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-300">Username</span>
            <div className="flex items-center gap-2">
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    className="w-32 h-8 bg-gray-800 border-gray-700 text-white text-sm"
                    maxLength={20}
                    placeholder="Enter username"
                  />
                  <Button
                    size="sm"
                    onClick={handleNicknameSave}
                    className="h-8 px-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-gray-400 text-sm">
                    {settings.nickname || user?.username || 'Not set'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTempNickname(settings.nickname || user?.username || '');
                      setIsEditingNickname(true);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* UID */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-300">UID</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{userId}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyUserId}
                className="text-gray-400 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Other Account Options */}
          <div className="space-y-0">
            <Button
              variant="ghost"
              onClick={() => setLocation('/mobile/kyc')}
              className="w-full justify-between py-3 h-auto text-gray-300 hover:bg-gray-800"
            >
              <span>Identity Verification</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  kycData?.verification?.status === 'verified' 
                    ? 'bg-green-600' 
                    : kycData?.verification?.status === 'processing'
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                }`}>
                  {kycData?.verification?.status === 'verified' 
                    ? 'Lv.1 Verified' 
                    : kycData?.verification?.status === 'processing'
                      ? 'Processing'
                      : 'Not Verified'
                  }
                </span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setLocation('/mobile/security')}
              className="w-full justify-between py-3 h-auto text-gray-300 hover:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span>Security</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${getSecurityLevel().level === 'High' ? 'bg-green-600' : getSecurityLevel().level === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                  {getSecurityLevel().level} ({securityScore}%)
                </span>
                {securityScore < 80 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          
          {/* Language */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-300">Language</span>
            <div className="flex items-center gap-2">
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="w-24 h-8 bg-transparent border-none text-gray-400 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Chinese">中文</SelectItem>
                  <SelectItem value="Japanese">日本語</SelectItem>
                  <SelectItem value="Korean">한국어</SelectItem>
                </SelectContent>
              </Select>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Currency Display */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-300">Currency Display</span>
            <div className="flex items-center gap-2">
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="w-16 h-8 bg-transparent border-none text-gray-400 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Color Theme */}
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-300">Color Theme</span>
            <div className="flex items-center gap-2">
              <Select
                value={settings.theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger className="w-24 h-8 bg-transparent border-none text-gray-400 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light Mode">Light</SelectItem>
                  <SelectItem value="Dark Mode">Dark</SelectItem>
                  <SelectItem value="Auto">Auto</SelectItem>
                </SelectContent>
              </Select>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Always on (no screen lock) */}
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-300">Always on (no screen lock)</span>
            <Switch
              checked={settings.screenLock}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, screenLock: checked }))}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}