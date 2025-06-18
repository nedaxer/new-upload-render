import { Link, useLocation } from 'wouter';
import { Home, BarChart3, TrendingUp, Newspaper, Wallet } from 'lucide-react';
import { hapticNavigation } from '@/lib/haptics';
import { useLanguage } from '@/contexts/language-context';

export function BottomNavigation() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { 
      nameKey: 'dashboard', 
      icon: Home, 
      path: '/mobile' 
    },
    { 
      nameKey: 'markets', 
      icon: BarChart3, 
      path: '/mobile/markets' 
    },
    { 
      nameKey: 'trade', 
      icon: TrendingUp, 
      path: '/mobile/trade' 
    },
    { 
      nameKey: 'notifications', 
      icon: Newspaper, 
      path: '/mobile/news' 
    },
    { 
      nameKey: 'assets', 
      icon: Wallet, 
      path: '/mobile/assets' 
    }
  ];

  const handleNavClick = (itemName: string) => {
    // Trigger haptic feedback for navigation
    hapticNavigation();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-2 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.path !== '/mobile' && location.startsWith(item.path));
          
          return (
            <Link key={item.nameKey} href={item.path}>
              <div 
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-orange-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => handleNavClick(item.nameKey)}
                onTouchStart={() => handleNavClick(item.nameKey)}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{t(item.nameKey)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}