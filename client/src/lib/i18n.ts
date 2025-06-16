
// Internationalization system for real-time language switching
import { useState, useEffect } from 'react';

// Comprehensive list of world languages
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文简体' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文繁體' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa' },
];

// Translation keys and their default English values
export const translations = {
  // Navigation & Common
  'nav.home': 'Home',
  'nav.markets': 'Markets',
  'nav.trade': 'Trade',
  'nav.assets': 'Assets',
  'nav.settings': 'Settings',
  'nav.profile': 'Profile',
  'nav.security': 'Security',
  'nav.kyc': 'KYC',
  'nav.notifications': 'Notifications',
  'nav.help': 'Help',
  'nav.logout': 'Logout',
  'nav.login': 'Login',
  'nav.register': 'Register',

  // Common Actions
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.download': 'Download',
  'common.upload': 'Upload',
  'common.submit': 'Submit',
  'common.retry': 'Retry',

  // Settings Page
  'settings.title': 'Settings',
  'settings.account.info': 'Account Info',
  'settings.profile.picture': 'Profile Picture',
  'settings.email': 'Email',
  'settings.username': 'Username',
  'settings.uid': 'UID',
  'settings.identity.verification': 'Identity Verification',
  'settings.security': 'Security',
  'settings.language': 'Language',
  'settings.currency.display': 'Currency Display',
  'settings.color.theme': 'Color Theme',
  'settings.screen.lock': 'Always on (no screen lock)',
  'settings.not.available': 'Not available',
  'settings.not.set': 'Not set',
  'settings.enter.username': 'Enter username',

  // Security Levels
  'security.high': 'High',
  'security.medium': 'Medium',
  'security.low': 'Low',

  // KYC Status
  'kyc.verified': 'Lv.1 Verified',
  'kyc.processing': 'Processing',
  'kyc.not.verified': 'Not Verified',

  // Themes
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.auto': 'Auto',

  // Trading
  'trade.buy': 'Buy',
  'trade.sell': 'Sell',
  'trade.spot': 'Spot',
  'trade.futures': 'Futures',
  'trade.price': 'Price',
  'trade.amount': 'Amount',
  'trade.total': 'Total',
  'trade.balance': 'Balance',
  'trade.available': 'Available',
  'trade.order.book': 'Order Book',
  'trade.recent.trades': 'Recent Trades',
  'trade.my.orders': 'My Orders',

  // Markets
  'markets.cryptocurrencies': 'Cryptocurrencies',
  'markets.volume': 'Volume',
  'markets.change': 'Change',
  'markets.high': 'High',
  'markets.low': 'Low',

  // Wallet/Assets
  'wallet.total.balance': 'Total Balance',
  'wallet.available.balance': 'Available Balance',
  'wallet.deposit': 'Deposit',
  'wallet.withdraw': 'Withdraw',
  'wallet.transfer': 'Transfer',
  'wallet.history': 'History',

  // Notifications
  'notifications.title': 'Notifications',
  'notifications.mark.read': 'Mark as Read',
  'notifications.clear.all': 'Clear All',
  'notifications.no.new': 'No new notifications',

  // Profile
  'profile.personal.info': 'Personal Information',
  'profile.first.name': 'First Name',
  'profile.last.name': 'Last Name',
  'profile.phone': 'Phone Number',
  'profile.date.birth': 'Date of Birth',
  'profile.address': 'Address',
  'profile.city': 'City',
  'profile.country': 'Country',

  // Messages & Toasts
  'message.profile.updated': 'Profile updated',
  'message.profile.update.success': 'Your profile has been updated successfully.',
  'message.update.failed': 'Update failed',
  'message.update.failed.desc': 'Failed to update profile. Please try again.',
  'message.theme.updated': 'Theme updated',
  'message.theme.switched': 'Switched to',
  'message.copy.failed': 'Copy failed',
  'message.copy.failed.desc': 'Failed to copy User ID',
  'message.invalid.file': 'Invalid file type',
  'message.invalid.file.desc': 'Please select an image file.',
  'message.file.too.large': 'File too large',
  'message.file.too.large.desc': 'Please select an image smaller than 5MB.',
  'message.upload.failed': 'Upload failed',
  'message.upload.failed.desc': 'Failed to upload profile picture. Please try again.',

  // Days of week
  'days.monday': 'Monday',
  'days.tuesday': 'Tuesday',
  'days.wednesday': 'Wednesday',
  'days.thursday': 'Thursday',
  'days.friday': 'Friday',
  'days.saturday': 'Saturday',
  'days.sunday': 'Sunday',

  // Months
  'months.january': 'January',
  'months.february': 'February',
  'months.march': 'March',
  'months.april': 'April',
  'months.may': 'May',
  'months.june': 'June',
  'months.july': 'July',
  'months.august': 'August',
  'months.september': 'September',
  'months.october': 'October',
  'months.november': 'November',
  'months.december': 'December',
};

// Store translations for different languages
const translationCache: Record<string, Record<string, string>> = {
  en: translations
};

// Language context
let currentLanguage = 'en';
let languageChangeListeners: Array<() => void> = [];

export const getCurrentLanguage = () => currentLanguage;

export const setLanguage = async (languageCode: string) => {
  if (languageCode === currentLanguage) return;
  
  currentLanguage = languageCode;
  localStorage.setItem('selectedLanguage', languageCode);
  
  // Load translations for the new language if not cached
  if (!translationCache[languageCode] && languageCode !== 'en') {
    await loadTranslations(languageCode);
  }
  
  // Notify all listeners about language change
  languageChangeListeners.forEach(listener => listener());
};

// Load translations for a specific language (simulate API call)
const loadTranslations = async (languageCode: string) => {
  // In a real app, this would fetch from an API or load translation files
  // For demo purposes, we'll simulate translations by modifying some key phrases
  const simulatedTranslations: Record<string, Record<string, string>> = {
    'es': {
      ...translations,
      'nav.home': 'Inicio',
      'nav.markets': 'Mercados',
      'nav.trade': 'Comercio',
      'nav.assets': 'Activos',
      'nav.settings': 'Configuración',
      'nav.profile': 'Perfil',
      'nav.security': 'Seguridad',
      'settings.title': 'Configuración',
      'settings.account.info': 'Información de la Cuenta',
      'settings.language': 'Idioma',
      'settings.currency.display': 'Visualización de Moneda',
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.loading': 'Cargando...',
    },
    'fr': {
      ...translations,
      'nav.home': 'Accueil',
      'nav.markets': 'Marchés',
      'nav.trade': 'Commerce',
      'nav.assets': 'Actifs',
      'nav.settings': 'Paramètres',
      'nav.profile': 'Profil',
      'nav.security': 'Sécurité',
      'settings.title': 'Paramètres',
      'settings.account.info': 'Informations du Compte',
      'settings.language': 'Langue',
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.loading': 'Chargement...',
    },
    'de': {
      ...translations,
      'nav.home': 'Startseite',
      'nav.markets': 'Märkte',
      'nav.trade': 'Handel',
      'nav.assets': 'Vermögen',
      'nav.settings': 'Einstellungen',
      'nav.profile': 'Profil',
      'nav.security': 'Sicherheit',
      'settings.title': 'Einstellungen',
      'settings.account.info': 'Kontoinformationen',
      'settings.language': 'Sprache',
      'common.save': 'Speichern',
      'common.cancel': 'Abbrechen',
      'common.loading': 'Laden...',
    },
    'ja': {
      ...translations,
      'nav.home': 'ホーム',
      'nav.markets': 'マーケット',
      'nav.trade': '取引',
      'nav.assets': '資産',
      'nav.settings': '設定',
      'nav.profile': 'プロフィール',
      'nav.security': 'セキュリティ',
      'settings.title': '設定',
      'settings.account.info': 'アカウント情報',
      'settings.language': '言語',
      'common.save': '保存',
      'common.cancel': 'キャンセル',
      'common.loading': '読み込み中...',
    },
    'zh-CN': {
      ...translations,
      'nav.home': '首页',
      'nav.markets': '市场',
      'nav.trade': '交易',
      'nav.assets': '资产',
      'nav.settings': '设置',
      'nav.profile': '个人资料',
      'nav.security': '安全',
      'settings.title': '设置',
      'settings.account.info': '账户信息',
      'settings.language': '语言',
      'common.save': '保存',
      'common.cancel': '取消',
      'common.loading': '加载中...',
    }
  };
  
  translationCache[languageCode] = simulatedTranslations[languageCode] || translations;
};

// Translation function
export const t = (key: string, fallback?: string): string => {
  const currentTranslations = translationCache[currentLanguage] || translations;
  return currentTranslations[key] || fallback || key;
};

// Hook for using translations in components
export const useTranslation = () => {
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    const listener = () => forceUpdate(prev => prev + 1);
    languageChangeListeners.push(listener);
    
    // Load saved language on mount
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      setLanguage(savedLanguage);
    }
    
    return () => {
      languageChangeListeners = languageChangeListeners.filter(l => l !== listener);
    };
  }, []);
  
  return {
    t,
    currentLanguage,
    setLanguage,
    languages
  };
};

// Initialize with saved language
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  }
}
