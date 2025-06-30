import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { BottomNavigation } from './bottom-navigation';
import { PWAInstallPrompt } from './pwa-install-prompt';
import { useTheme } from '@/contexts/theme-context';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  hideBottomNav?: boolean;
  hideNavigation?: boolean;
}

export default function MobileLayout({ children, className = '', hideBottomNav = false, hideNavigation = false }: MobileLayoutProps) {
  const [location] = useLocation();
  const { getBackgroundClass, getTextClass } = useTheme();
  
  // Hide bottom navigation for profile and settings pages or when explicitly requested
  const shouldHideBottomNav = hideBottomNav || hideNavigation ||
    location.includes('/profile') || 
    location.includes('/settings') ||
    location.includes('/kyc') || 
    location.includes('/security') || 
    location.includes('/notifications') || 
    location.includes('/notification-settings') ||
    location.includes('/invite-friends');

  return (
    <div className={`min-h-screen ${getBackgroundClass()} ${getTextClass()}`}>
      <div className={`${shouldHideBottomNav ? 'pb-4' : 'pb-16'} ${className}`} data-layout="mobile">
        {children}
      </div>
      {!shouldHideBottomNav && <BottomNavigation />}
      <PWAInstallPrompt />
    </div>
  );
}