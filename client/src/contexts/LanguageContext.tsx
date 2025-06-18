import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getLanguageByCode } from '@/data/languages';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basic translations for common UI elements
const translations: Record<string, Record<string, string>> = {
  'en': {
    'settings': 'Settings',
    'language': 'Language',
    'theme': 'Color Theme',
    'currency': 'Currency Display',
    'security': 'Security',
    'profile': 'Profile',
    'account': 'Account Info',
    'notifications': 'Notifications',
    'back': 'Back',
    'save': 'Save',
    'cancel': 'Cancel',
    'search': 'Search',
    'select_language': 'Select Language',
    'light_mode': 'Light',
    'dark_mode': 'Dark',
    'auto_mode': 'Auto',
    'assets': 'Assets',
    'trade': 'Trade',
    'markets': 'Markets',
    'earn': 'Earn',
    'home': 'Home'
  },
  'zh-CN': {
    'settings': '设置',
    'language': '语言',
    'theme': '主题颜色',
    'currency': '货币显示',
    'security': '安全',
    'profile': '个人资料',
    'account': '账户信息',
    'notifications': '通知',
    'back': '返回',
    'save': '保存',
    'cancel': '取消',
    'search': '搜索',
    'select_language': '选择语言',
    'light_mode': '浅色',
    'dark_mode': '深色',
    'auto_mode': '自动',
    'assets': '资产',
    'trade': '交易',
    'markets': '市场',
    'earn': '赚取',
    'home': '首页'
  },
  'es': {
    'settings': 'Configuración',
    'language': 'Idioma',
    'theme': 'Tema de Color',
    'currency': 'Mostrar Moneda',
    'security': 'Seguridad',
    'profile': 'Perfil',
    'account': 'Información de Cuenta',
    'notifications': 'Notificaciones',
    'back': 'Atrás',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'search': 'Buscar',
    'select_language': 'Seleccionar Idioma',
    'light_mode': 'Claro',
    'dark_mode': 'Oscuro',
    'auto_mode': 'Auto',
    'assets': 'Activos',
    'trade': 'Comercio',
    'markets': 'Mercados',
    'earn': 'Ganar',
    'home': 'Inicio'
  },
  'fr': {
    'settings': 'Paramètres',
    'language': 'Langue',
    'theme': 'Thème de Couleur',
    'currency': 'Affichage Devise',
    'security': 'Sécurité',
    'profile': 'Profil',
    'account': 'Infos Compte',
    'notifications': 'Notifications',
    'back': 'Retour',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'search': 'Rechercher',
    'select_language': 'Sélectionner Langue',
    'light_mode': 'Clair',
    'dark_mode': 'Sombre',
    'auto_mode': 'Auto',
    'assets': 'Actifs',
    'trade': 'Commerce',
    'markets': 'Marchés',
    'earn': 'Gagner',
    'home': 'Accueil'
  },
  'de': {
    'settings': 'Einstellungen',
    'language': 'Sprache',
    'theme': 'Farbthema',
    'currency': 'Währungsanzeige',
    'security': 'Sicherheit',
    'profile': 'Profil',
    'account': 'Kontoinformationen',
    'notifications': 'Benachrichtigungen',
    'back': 'Zurück',
    'save': 'Speichern',
    'cancel': 'Abbrechen',
    'search': 'Suchen',
    'select_language': 'Sprache Auswählen',
    'light_mode': 'Hell',
    'dark_mode': 'Dunkel',
    'auto_mode': 'Auto',
    'assets': 'Vermögen',
    'trade': 'Handel',
    'markets': 'Märkte',
    'earn': 'Verdienen',
    'home': 'Startseite'
  },
  'ja': {
    'settings': '設定',
    'language': '言語',
    'theme': 'カラーテーマ',
    'currency': '通貨表示',
    'security': 'セキュリティ',
    'profile': 'プロフィール',
    'account': 'アカウント情報',
    'notifications': '通知',
    'back': '戻る',
    'save': '保存',
    'cancel': 'キャンセル',
    'search': '検索',
    'select_language': '言語を選択',
    'light_mode': 'ライト',
    'dark_mode': 'ダーク',
    'auto_mode': '自動',
    'assets': '資産',
    'trade': '取引',
    'markets': '市場',
    'earn': '獲得',
    'home': 'ホーム'
  },
  'ko': {
    'settings': '설정',
    'language': '언어',
    'theme': '색상 테마',
    'currency': '통화 표시',
    'security': '보안',
    'profile': '프로필',
    'account': '계정 정보',
    'notifications': '알림',
    'back': '뒤로',
    'save': '저장',
    'cancel': '취소',
    'search': '검색',
    'select_language': '언어 선택',
    'light_mode': '밝음',
    'dark_mode': '어둠',
    'auto_mode': '자동',
    'assets': '자산',
    'trade': '거래',
    'markets': '시장',
    'earn': '적립',
    'home': '홈'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  });

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguageCode = localStorage.getItem('selectedLanguageCode');
    const savedLanguageName = localStorage.getItem('selectedLanguage');
    
    if (savedLanguageCode) {
      const language = getLanguageByCode(savedLanguageCode);
      if (language) {
        setCurrentLanguage(language);
      }
    } else if (savedLanguageName) {
      // Fallback to old system
      const languageMap: Record<string, string> = {
        'English': 'en',
        'Chinese': 'zh-CN',
        '中文': 'zh-CN',
        'Japanese': 'ja',
        '日本語': 'ja',
        'Korean': 'ko',
        '한국어': 'ko'
      };
      
      const code = languageMap[savedLanguageName] || 'en';
      const language = getLanguageByCode(code);
      if (language) {
        setCurrentLanguage(language);
        localStorage.setItem('selectedLanguageCode', code);
      }
    }
  }, []);

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language.name);
    localStorage.setItem('selectedLanguageCode', language.code);
    
    // Update document language
    document.documentElement.lang = language.code;
    
    // Trigger a custom event for components to update
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  };

  const t = (key: string): string => {
    const languageTranslations = translations[currentLanguage.code] || translations['en'];
    return languageTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}