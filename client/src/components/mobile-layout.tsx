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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Desktop Layout - Hide on mobile */}
      <div className="hidden lg:block">
        <div className="flex">
          {/* Desktop Sidebar Navigation */}
          <div className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
            <div className="p-6">
              <h1 className="text-xl font-bold text-white mb-8">Nedaxer</h1>
              <nav className="space-y-4">
                <a href="/mobile/home" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <span>🏠</span>
                  <span>Home</span>
                </a>
                <a href="/mobile/markets" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <span>📊</span>
                  <span>Markets</span>
                </a>
                <a href="/mobile/trade" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <span>📈</span>
                  <span>Trade</span>
                </a>
                <a href="/mobile/earn" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <span>💰</span>
                  <span>Earn</span>
                </a>
                <a href="/mobile/assets" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <span>💎</span>
                  <span>Assets</span>
                </a>
              </nav>
            </div>
          </div>
          
          {/* Desktop Main Content */}
          <div className="flex-1">
            <div className={`max-w-6xl mx-auto ${className}`}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Hide on desktop */}
      <div className="lg:hidden">
        <div className={`${shouldHideBottomNav ? 'pb-4' : 'pb-20'} ${className}`}>
          {children}
        </div>
        {!shouldHideBottomNav && <BottomNavigation />}
      </div>
    </div>
  );
}