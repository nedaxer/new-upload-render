import { ReactNode, useEffect } from 'react';
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
  
  // Force mobile viewport for mobile app routes
  useEffect(() => {
    // Set mobile viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    
    // Force mobile view with specific constraints
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    
    // Add CSS to force mobile layout regardless of screen size
    const style = document.getElementById('force-mobile-view') || document.createElement('style');
    style.id = 'force-mobile-view';
    style.textContent = `
      @media screen {
        body {
          max-width: 430px !important;
          margin: 0 auto !important;
          overflow-x: hidden !important;
        }
        
        /* Force mobile layout styling */
        [data-layout="mobile"] {
          max-width: 430px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* Hide desktop elements */
        @media (min-width: 431px) {
          body {
            background: #000 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            min-height: 100vh !important;
          }
          
          [data-layout="mobile"] {
            border-left: 1px solid #333 !important;
            border-right: 1px solid #333 !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.5) !important;
          }
        }
      }
    `;
    
    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
    
    // Force body styling for mobile
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    document.body.style.fontSize = '16px';
    document.body.style.lineHeight = '1.5';
    
    return () => {
      // Cleanup on unmount (though this component rarely unmounts)
      const mobileStyle = document.getElementById('force-mobile-view');
      if (mobileStyle) {
        mobileStyle.remove();
      }
    };
  }, []);
  
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