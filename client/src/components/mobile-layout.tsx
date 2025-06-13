import { ReactNode } from 'react';
import { BottomNavigation } from './bottom-navigation';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = '' }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className={`pb-20 ${className}`}>
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}