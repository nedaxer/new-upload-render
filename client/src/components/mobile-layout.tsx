import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { BottomNavigation } from './bottom-navigation';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  hideBottomNav?: boolean;
}

export function MobileLayout({ children, className = '', hideBottomNav = false }: MobileLayoutProps) {
  const [location] = useLocation();

  // Hide bottom navigation for profile and settings pages
  const shouldHideBottomNav = hideBottomNav || 
    location.includes('/profile') || 
    location.includes('/settings') ||
    location.includes('/kyc') || 
    location.includes('/security') || 
    location.includes('/notifications') || 
    location.includes('/notification-settings') ||
    location.includes('/invite-friends');

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      {!shouldHideBottomNav && <BottomNavigation />}
    </div>
  );
}