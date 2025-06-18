import React, { useState, useRef, useEffect } from 'react';
import { MobileLayout } from '@/components/mobile-layout';
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

export default function MobileProfile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch KYC status from API
  const { data: kycStatus } = useQuery({
    queryKey: ['/api/users/kyc/status'],
    enabled: !!user?.id,
    select: (data: any) => data?.data || { isVerified: false, status: 'not_verified' }
  });

  // Generate a realistic UID based on user ID with mixed numbers
  const generateUID = () => {
    if (!user?.id) return '072661763';
    // Create a mixed number UID based on user ID
    const baseId = user.id.toString();
    const mixedNumbers = [0, 7, 2, 6, 6, 1, 7, 6, 3];
    let result = '';

    for (let i = 0; i < 9; i++) {
      if (i < baseId.length) {
        // Mix the user ID digits with the predefined pattern
        const userDigit = parseInt(baseId[i % baseId.length]);
        const mixedDigit = (userDigit + mixedNumbers[i]) % 10;
        result += mixedDigit.toString();
      } else {
        result += mixedNumbers[i].toString();
      }
    }

    return result;
  };

  // Blue verification tick component
  const VerificationTick = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="#1DA1F2" 
      className="ml-1"
    >
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.265-.177-.37-.538-.207-.82.163-.281.52-.374.82-.207l1.875 1.25 3.75-5.625c.16-.24.48-.325.75-.207.31.118.375.522.257.76z"/>
    </svg>
  );

  // Profile picture upload mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profilePicture?: string }) => {
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
        title: t('profile.updated'),
        description: t('profile.pictureUpdatedSuccess')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.updateFailed'),
        description: error.message || t('profile.pictureUpdateFailed'),
        variant: "destructive"
      });
    }
  });

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.invalidFileType'),
          description: t('profile.selectImageFile'),
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('common.fileTooLarge'),
          description: t('profile.selectSmallerImage'),
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        updateProfileMutation.mutate({ profilePicture: base64 });
      };
      reader.onerror = () => {
        toast({
          title: t('common.uploadFailed'),
          description: t('profile.failedToReadImage'),
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
      label: t('profile.inviteFriends'),
      href: '/mobile/invite-friends',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Shield,
      label: t('profile.identityVerification'),
      href: '/mobile/kyc',
      rightElement: (
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${
            kycStatus?.isVerified 
              ? 'text-green-500' 
              : kycStatus?.status === 'processing'
                ? 'text-yellow-500'
                : 'text-red-500'
          }`}>
            {kycStatus?.isVerified 
              ? t('profile.lv1Verified')
              : kycStatus?.status === 'processing'
                ? t('profile.processing')
                : t('profile.notVerified')
            }
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      )
    },
    {
      icon: Settings,
      label: t('profile.security'),
      href: '/mobile/security',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Bell,
      label: t('profile.notificationCenter'),
      href: '/mobile/notifications',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Headphones,
      label: t('profile.helpContact'),
      href: '/company/contact',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Info,
      label: t('profile.aboutUs'),
      href: '/company/about',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    }
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
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
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="relative w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-300" />
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
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-white text-xl font-bold">
                {user?.username || 'User'}
              </h2>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">
                {t('profile.mainAccount')}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 text-sm">
                  UID: {generateUID()}
                </span>
                {kycStatus?.isVerified && <VerificationTick />}
              </div>
              <Copy 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white"
                onClick={() => {
                  navigator.clipboard.writeText(generateUID());
                  toast({
                    title: t('common.copied'),
                    description: t('profile.uidCopied'),
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-1">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Card className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <item.icon className="w-6 h-6 text-orange-500" />
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                {item.rightElement}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Account Actions */}
      <div className="px-4 py-6 space-y-3">
        <Button 
          variant="outline" 
          className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          {t('profile.switchCreateAccount')}
        </Button>

        <Button 
          variant="destructive" 
          className="w-full bg-red-900 hover:bg-red-800 text-white"
          onClick={() => logoutMutation.mutate()}
        >
          {t('auth.logout')}
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