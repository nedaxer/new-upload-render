import { Link, useLocation } from 'wouter';
import { Home, BarChart3, TrendingUp, Gift, Wallet } from 'lucide-react';

const navItems = [
  { 
    name: 'Home', 
    icon: Home, 
    path: '/mobile' 
  },
  { 
    name: 'Markets', 
    icon: BarChart3, 
    path: '/mobile/markets' 
  },
  { 
    name: 'Trade', 
    icon: TrendingUp, 
    path: '/mobile/trade' 
  },
  { 
    name: 'Earn', 
    icon: Gift, 
    path: '/mobile/earn' 
  },
  { 
    name: 'Assets', 
    icon: Wallet, 
    path: '/mobile/assets' 
  }
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-2 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.path !== '/mobile' && location.startsWith(item.path));
          
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-orange-500' 
                  : 'text-gray-400 hover:text-white'
              }`}>
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}