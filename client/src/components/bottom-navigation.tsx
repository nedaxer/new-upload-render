import { Home, TrendingUp, Layers, User, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from '@/lib/i18n';

export function BottomNavigation() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { href: '/mobile', label: t('nav.home'), icon: Home },
    { href: '/mobile/markets', label: t('nav.markets'), icon: TrendingUp },
    { href: '/mobile/trade', label: t('nav.trade'), icon: Layers },
    { href: '/mobile/assets', label: t('nav.assets'), icon: User },
    { href: '/mobile/chatbot', label: t('nav.help'), icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-2 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== '/mobile' && location.startsWith(item.href));

          return (
            <Link key={item.label} href={item.href}>
              <div className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-orange-500' 
                  : 'text-gray-400 hover:text-white'
              }`}>
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}