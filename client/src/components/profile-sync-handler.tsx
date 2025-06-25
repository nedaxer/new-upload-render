import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileSyncHandlerProps {
  children: React.ReactNode;
}

/**
 * Global profile synchronization handler
 * Ensures profile data stays synced across all components and devices
 */
export const ProfileSyncHandler: React.FC<ProfileSyncHandlerProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Force refresh user data when component mounts to ensure latest profile picture
    const refreshUserData = async () => {
      try {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      } catch (error) {
        console.warn('Failed to refresh user data:', error);
      }
    };

    // Refresh immediately
    refreshUserData();

    // Set up periodic refresh every 30 seconds to catch profile updates from other devices
    const interval = setInterval(() => {
      refreshUserData();
    }, 30000);

    // Listen for storage events (when user updates profile on another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileUpdated') {
        refreshUserData();
      }
    };

    // Listen for custom profile update events
    const handleProfileUpdate = () => {
      refreshUserData();
      // Also sync to localStorage to notify other tabs
      localStorage.setItem('profileUpdated', Date.now().toString());
      localStorage.removeItem('profileUpdated'); // Trigger storage event
    };

    // Listen for focus events to refresh when user returns to tab
    const handleFocus = () => {
      refreshUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, queryClient]);

  return <>{children}</>;
};