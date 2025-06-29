import React, { useState, useRef, useEffect } from 'react';
import MobileLayout from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  ChevronRight,
  Users,
  Shield,
  Settings,
  Bell,
  Info,
  Copy,
  Headphones,
  Camera,
  User
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';

export default function MobileProfile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { getBackgroundClass, getTextClass, getCardClass, getBorderClass } = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch KYC status from API
  const { data: kycStatus } = useQuery({
    queryKey: ['/api/verification/status'],
    enabled: !!user?.id,
  }) as { data?: { data?: { kycStatus?: string } } };

  // Use the actual UID from the database
  const userUID = user?.uid || 'N/A';

  // Orange verification badge component
  const VerificationBadge = () => (
    <img 
      src="/images/verified-badge.png" 
      alt="Verified" 
      className="w-5 h-5 ml-2"
    />
  );

  // Profile picture upload mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profilePicture?: string }) => {
      console.log('Updating profile with data:', { hasProfilePicture: !!data.profilePicture });
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const result = await response.json();
      console.log('Profile update response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Profile update successful:', data);
      
      // Update the user data in React Query cache immediately
      queryClient.setQueryData(['/api/auth/user'], (oldData: any) => {
        if (oldData?.user) {
          return {
            ...oldData,
            user: {
              ...oldData.user,
              profilePicture: data.user?.profilePicture || data.profilePicture
            }
          };
        }
        return oldData;
      });
      
      // Trigger global profile update event for synchronization
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      toast({
        title: t('profile_updated') || 'Profile Updated',
        description: t('picture_updated_success') || 'Profile picture updated successfully'
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: t('updateFailed') || 'Update Failed',
        description: error.message || t('picture_update_failed') || 'Failed to update profile picture',
        variant: "destructive"
      });
    }
  });

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected for upload:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });

      if (!file.type.startsWith('image/')) {
        toast({
          title: t('invalidFileType') || 'Invalid File Type',
          description: t('select_image_file') || 'Please select an image file',
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('fileTooLarge') || 'File Too Large',
          description: t('select_smaller_image') || 'Please select an image smaller than 5MB',
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        console.log('File converted to base64, length:', base64.length);
        updateProfileMutation.mutate({ profilePicture: base64 });
      };
      reader.onerror = () => {
        console.error('FileReader error');
        toast({
          title: t('uploadFailed') || 'Upload Failed',
          description: t('failed_to_read_image') || 'Failed to read image file',
          variant: "destructive"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [queryClient]);

  const menuItems = [
    {
      icon: Users,
      label: t('inviteFriends'),
      href: '/mobile/invite-friends',
      rightElement: <ChevronRight className="w-4 h-4 text-gray-400" />
    },
    {
      icon: Shield,
      label: t('identityVerification'),
      href: '/mobile/kyc-status',
      rightElement: (
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${
            (kycStatus as any)?.data?.kycStatus === 'verified' 
              ? 'text-green-500' 
              : (kycStatus as any)?.data?.kycStatus === 'pending'
                ? 'text-yellow-500'
                : 'text-red-500'
          }`}>
            {(kycStatus as any)?.data?.kycStatus === 'verified' 
              ? t('lv1_verified')
              : (kycStatus as any)?.data?.kycStatus === 'pending'
                ? t('processing')
                : t('not_verified')
            }
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      )
    },
    {
      icon: Settings,
      label: t('security'),
      href: '/mobile/security',
      rightElement: <ChevronRight className="w-4 h-4 text-gray-400" />
    },
    {
      icon: Bell,
      label: t('notificationCenter'),
      href: '/mobile/notifications',
      rightElement: <ChevronRight className="w-4 h-4 text-gray-400" />
    },
    {
      icon: Headphones,
      label: t('helpContact'),
      href: '/company/contact',
      rightElement: <ChevronRight className="w-4 h-4 text-gray-400" />
    },
    {
      icon: Info,
      label: t('aboutUs'),
      href: '/company/about',
      rightElement: <ChevronRight className="w-4 h-4 text-gray-400" />
    }
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Link href="/mobile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <div className="flex items-center space-x-3">
          <Link href="/mobile/chatbot">
            <Headphones className="w-6 h-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
          </Link>
          <Link href="/mobile/settings">
            <Settings className="w-6 h-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 pb-6">
        <div className="flex items-start space-x-4 mb-4">
          <div 
            className="relative w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-300" />
            )}
            <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
          />
          <div className="flex-1 pt-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-white text-lg font-semibold">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.username || 'User'}
              </h2>
              {(kycStatus as any)?.data?.kycStatus === 'verified' && <VerificationBadge />}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">
                UID: {userUID}
              </span>
              <Copy 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white"
                onClick={() => {
                  navigator.clipboard.writeText(userUID);
                  toast({
                    title: t('common.copied') || 'Copied',
                    description: t('profile.uidCopied') || 'UID copied to clipboard',
                  });
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">0</span>
            </div>
            <span className="text-white text-sm font-medium">Non-VIP</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-2">
            <Users className="w-5 h-5 text-orange-500" />
            <span className="text-white text-sm font-medium">Main Account</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-2">
            <Shield className={`w-5 h-5 ${(kycStatus as any)?.data?.kycStatus === 'verified' ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-white text-sm font-medium">
              {(kycStatus as any)?.data?.kycStatus === 'verified' ? 'Verified ID' : 'Not Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Card className="bg-gray-800 border-gray-700 p-3 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-orange-500" />
                  <span className="text-white text-sm font-medium">{item.label}</span>
                </div>
                {item.rightElement}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Account Actions */}
      <div className="px-4 py-4 space-y-3">
        <Button 
          variant="outline" 
          className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-sm py-2"
        >
          Switch/Create Account
        </Button>

        <Button 
          variant="destructive" 
          className="w-full bg-red-900 hover:bg-red-800 text-white text-sm py-2"
          onClick={async () => {
            try {
              // Auto-backup user data before logout
              if (user?.id) {
                await fetch('/api/user/backup', {
                  method: 'GET',
                  credentials: 'include'
                }).catch(err => console.log('Backup failed:', err));
              }
              
              // Clear all caches before logout
              queryClient.clear();
              
              // Perform logout
              await logoutMutation.mutateAsync();
              
              // Force redirect to login page after successful logout
              window.location.href = '/account/login';
              
            } catch (error) {
              console.error('Error during logout:', error);
              // Force logout and redirect even if there's an error
              queryClient.clear();
              window.location.href = '/account/login';
            }
          }}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Logging out...' : (t('logout') || 'Logout')}
        </Button>
      </div>

      {/* App Version */}
      <div className="px-4 pb-8">
        <div className="text-center text-gray-500 text-sm">
          Version 1.0.0
        </div>
      </div>
    </MobileLayout>
  );
}